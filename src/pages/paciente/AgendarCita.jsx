import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { usePatientAuth } from '../../contexts/PatientAuthContext';
import { supabase } from '../../lib/supabase';

const DAYS_ES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

export default function AgendarCita() {
  const { user, profile } = usePatientAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [types, setTypes] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [blockedTimes, setBlockedTimes] = useState([]);
  const [existingAppointments, setExistingAppointments] = useState([]);

  const [selectedType, setSelectedType] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const [typesRes, doctorsRes] = await Promise.all([
      supabase.from('appointment_types').select('*').eq('is_active', true).order('name'),
      supabase.from('doctors').select('id, profiles!doctors_id_fkey(full_name)').eq('is_active', true),
    ]);
    setTypes(typesRes.data || []);
    setDoctors(doctorsRes.data || []);
  }

  async function fetchAvailabilityAndBlocks(doctorId) {
    const [availRes, blockRes, apptRes] = await Promise.all([
      supabase.from('availability').select('*').eq('doctor_id', doctorId).eq('is_active', true),
      supabase.from('blocked_times').select('*').eq('doctor_id', doctorId),
      supabase.from('appointments')
        .select('scheduled_at, duration_minutes')
        .eq('doctor_id', doctorId)
        .in('status', ['scheduled', 'confirmed']),
    ]);
    setAvailability(availRes.data || []);
    setBlockedTimes(blockRes.data || []);
    setExistingAppointments(apptRes.data || []);
  }

  function getAvailableSlots(date) {
    if (!date || !selectedDoctor || !selectedType) return [];
    const d = new Date(date);
    const dayOfWeek = d.getDay();
    const dayAvail = availability.filter(a => a.day_of_week === dayOfWeek);
    if (dayAvail.length === 0) return [];

    const duration = selectedType.duration_minutes || 30;
    const slots = [];

    for (const block of dayAvail) {
      const [startH, startM] = block.start_time.split(':').map(Number);
      const [endH, endM] = block.end_time.split(':').map(Number);
      let current = startH * 60 + startM;
      const end = endH * 60 + endM;

      while (current + duration <= end) {
        const h = Math.floor(current / 60);
        const m = current % 60;
        const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        const dateTime = new Date(date);
        dateTime.setHours(h, m, 0, 0);

        const isBlocked = blockedTimes.some(bt => {
          const btDate = new Date(bt.start_time);
          return btDate.getTime() <= dateTime.getTime() && new Date(bt.end_time).getTime() > dateTime.getTime();
        });

        const isOccupied = existingAppointments.some(appt => {
          const apptStart = new Date(appt.scheduled_at);
          const apptEnd = new Date(apptStart.getTime() + (appt.duration_minutes || 30) * 60000);
          return dateTime.getTime() < apptEnd.getTime() && dateTime.getTime() + duration * 60000 > apptStart.getTime();
        });

        if (!isBlocked && !isOccupied) {
          slots.push(timeStr);
        }
        current += 30;
      }
    }
    return slots;
  }

  function getAvailableDates() {
    const dates = [];
    const today = new Date();
    for (let i = 1; i <= 30; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dayOfWeek = d.getDay();
      if (availability.some(a => a.day_of_week === dayOfWeek)) {
        dates.push(d);
      }
    }
    return dates;
  }

  async function handleConfirm() {
    if (!selectedType || !selectedDoctor || !selectedDate || !selectedTime) return;
    setLoading(true);
    setError('');

    try {
      const [h, m] = selectedTime.split(':').map(Number);
      const scheduledAt = new Date(selectedDate);
      scheduledAt.setHours(h, m, 0, 0);

      const doctorId = selectedDoctor.id || selectedDoctor;
      const patientId = user.id;

      const { data, error: insertErr } = await supabase.from('appointments').insert({
        patient_id: patientId,
        doctor_id: doctorId,
        appointment_type_id: selectedType.id,
        scheduled_at: scheduledAt.toISOString(),
        duration_minutes: selectedType.duration_minutes || 30,
        status: 'scheduled',
        location: 'Torre EXERTIA, Boca del Río, Veracruz',
        notes: notes || null,
      }).select().single();

      if (insertErr) throw insertErr;
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Error al agendar la cita');
    } finally {
      setLoading(false);
    }
  }

  function formatDate(d) {
    return d.toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' });
  }

  if (success) {
    return (
      <div className="portal-dashboard">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ textAlign: 'center', padding: '80px 20px' }}
        >
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%',
            background: 'rgba(39,174,96,0.15)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px'
          }}>
            <span style={{ fontSize: '40px' }}>✓</span>
          </div>
          <h2 style={{ color: '#fff', fontSize: '28px', fontFamily: 'var(--font-display)', marginBottom: '12px' }}>
            Cita Agendada
          </h2>
          <p style={{ color: '#999', fontSize: '16px', marginBottom: '8px' }}>
            {selectedType?.name} · {formatDate(selectedDate)} a las {selectedTime}
          </p>
          <p style={{ color: '#666', fontSize: '14px', marginBottom: '32px' }}>
            Recibirás una confirmación por correo electrónico.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button onClick={() => navigate('/paciente/dashboard')} className="portal-btn portal-btn--primary">
              Volver al Inicio
            </button>
            <button onClick={() => { setSuccess(false); setStep(1); setSelectedType(null); setSelectedDoctor(null); setSelectedDate(null); setSelectedTime(null); }} className="portal-btn portal-btn--secondary">
              Agendar Otra Cita
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="portal-dashboard">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="portal-welcome">
          <h1 className="portal-welcome__title">Agendar Cita</h1>
          <p className="portal-welcome__subtitle">Selecciona el tipo de cita, fecha y hora que mejor se ajuste a ti.</p>
        </div>

        {/* Progress */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', justifyContent: 'center' }}>
          {[1, 2, 3, 4].map(s => (
            <div key={s} style={{
              width: step >= s ? '40px' : '12px', height: '4px', borderRadius: '2px',
              background: step >= s ? 'var(--color-accent)' : 'rgba(255,255,255,0.1)',
              transition: 'all 0.3s ease'
            }} />
          ))}
        </div>

        {error && (
          <div style={{
            background: 'rgba(231,76,60,0.1)', border: '1px solid rgba(231,76,60,0.3)',
            borderRadius: '12px', padding: '16px', marginBottom: '24px', color: '#e74c3c', fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        {/* Step 1: Appointment Type */}
        {step === 1 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 style={{ color: '#fff', fontSize: '20px', marginBottom: '20px', fontFamily: 'var(--font-display)' }}>
              ¿Qué tipo de cita necesitas?
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
              {types.map(t => (
                <button key={t.id} onClick={() => { setSelectedType(t); setStep(2); }}
                  style={{
                    background: selectedType?.id === t.id ? 'rgba(184,154,90,0.15)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${selectedType?.id === t.id ? 'var(--color-accent)' : 'rgba(255,255,255,0.06)'}`,
                    borderRadius: '12px', padding: '20px', textAlign: 'left', cursor: 'pointer',
                    transition: 'all 0.2s ease', width: '100%'
                  }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: t.color }} />
                    <span style={{ color: '#fff', fontSize: '16px', fontWeight: 600 }}>{t.name}</span>
                  </div>
                  <span style={{ color: '#666', fontSize: '13px' }}>{t.duration_minutes} minutos</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Step 2: Doctor */}
        {step === 2 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer', marginBottom: '16px', fontSize: '14px' }}>
              ← Volver
            </button>
            <h2 style={{ color: '#fff', fontSize: '20px', marginBottom: '20px', fontFamily: 'var(--font-display)' }}>
              Selecciona el doctor
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {doctors.map(d => (
                <button key={d.id} onClick={async () => {
                  setSelectedDoctor(d);
                  await fetchAvailabilityAndBlocks(d.id);
                  setStep(3);
                }}
                  style={{
                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '12px', padding: '20px', textAlign: 'left', cursor: 'pointer',
                    transition: 'all 0.2s ease', width: '100%', display: 'flex', alignItems: 'center', gap: '16px'
                  }}>
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '50%',
                    background: 'rgba(184,154,90,0.15)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 700, color: 'var(--color-accent)'
                  }}>
                    {(d.profiles?.full_name || 'D')[0]}
                  </div>
                  <div>
                    <div style={{ color: '#fff', fontSize: '16px', fontWeight: 600 }}>{d.profiles?.full_name || 'Doctor'}</div>
                    <div style={{ color: '#666', fontSize: '13px' }}>Especialista Bouclier</div>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Step 3: Date */}
        {step === 3 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <button onClick={() => setStep(2)} style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer', marginBottom: '16px', fontSize: '14px' }}>
              ← Volver
            </button>
            <h2 style={{ color: '#fff', fontSize: '20px', marginBottom: '20px', fontFamily: 'var(--font-display)' }}>
              Selecciona el día
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px' }}>
              {getAvailableDates().map((d, i) => {
                const isSelected = selectedDate && d.toDateString() === selectedDate.toDateString();
                return (
                  <button key={i} onClick={() => { setSelectedDate(d); setSelectedTime(null); setStep(4); }}
                    style={{
                      background: isSelected ? 'rgba(184,154,90,0.15)' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${isSelected ? 'var(--color-accent)' : 'rgba(255,255,255,0.06)'}`,
                      borderRadius: '10px', padding: '14px', textAlign: 'center', cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}>
                    <div style={{ color: '#999', fontSize: '12px', marginBottom: '4px' }}>{DAYS_ES[d.getDay()]}</div>
                    <div style={{ color: '#fff', fontSize: '18px', fontWeight: 600 }}>{d.getDate()}</div>
                    <div style={{ color: '#666', fontSize: '12px' }}>{d.toLocaleDateString('es-MX', { month: 'short' })}</div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Step 4: Time + Confirm */}
        {step === 4 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <button onClick={() => setStep(3)} style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer', marginBottom: '16px', fontSize: '14px' }}>
              ← Volver
            </button>
            <h2 style={{ color: '#fff', fontSize: '20px', marginBottom: '8px', fontFamily: 'var(--font-display)' }}>
              Horarios disponibles
            </h2>
            <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>
              {formatDate(selectedDate)} · {selectedType?.name}
            </p>

            {(() => {
              const slots = getAvailableSlots(selectedDate);
              if (slots.length === 0) return (
                <div style={{ color: '#999', fontSize: '14px', padding: '40px', textAlign: 'center' }}>
                  No hay horarios disponibles para este día. Intenta con otra fecha.
                </div>
              );
              return (
                <>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
                    {slots.map(time => (
                      <button key={time} onClick={() => setSelectedTime(time)}
                        style={{
                          background: selectedTime === time ? 'var(--color-accent)' : 'rgba(255,255,255,0.03)',
                          color: selectedTime === time ? '#1a1a1a' : '#fff',
                          border: `1px solid ${selectedTime === time ? 'var(--color-accent)' : 'rgba(255,255,255,0.06)'}`,
                          borderRadius: '8px', padding: '10px 18px', cursor: 'pointer',
                          fontSize: '14px', fontWeight: 600, transition: 'all 0.2s ease'
                        }}>
                        {time}
                      </button>
                    ))}
                  </div>

                  {selectedTime && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      style={{
                        background: 'rgba(255,255,255,0.03)', borderRadius: '16px', padding: '24px',
                        border: '1px solid rgba(255,255,255,0.06)'
                      }}>
                      <h3 style={{ color: '#fff', fontSize: '16px', marginBottom: '16px', fontFamily: 'var(--font-display)' }}>
                        Resumen de tu cita
                      </h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px', fontSize: '14px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#999' }}>Tipo</span>
                          <span style={{ color: '#fff' }}>{selectedType?.name}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#999' }}>Doctor</span>
                          <span style={{ color: '#fff' }}>{selectedDoctor?.profiles?.full_name}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#999' }}>Fecha</span>
                          <span style={{ color: '#fff' }}>{formatDate(selectedDate)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#999' }}>Hora</span>
                          <span style={{ color: '#fff' }}>{selectedTime}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#999' }}>Duración</span>
                          <span style={{ color: '#fff' }}>{selectedType?.duration_minutes} min</span>
                        </div>
                      </div>

                      <div style={{ marginBottom: '16px' }}>
                        <label style={{ color: '#999', fontSize: '13px', display: 'block', marginBottom: '6px' }}>Notas (opcional)</label>
                        <textarea value={notes} onChange={e => setNotes(e.target.value)}
                          placeholder="¿Algo que debamos saber?"
                          style={{
                            width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '8px', padding: '12px', color: '#fff', fontSize: '14px', resize: 'vertical', minHeight: '60px'
                          }} />
                      </div>

                      <button onClick={handleConfirm} disabled={loading}
                        className="portal-btn portal-btn--primary"
                        style={{ width: '100%', padding: '14px', fontSize: '16px' }}>
                        {loading ? 'Agendando...' : 'Confirmar Cita'}
                      </button>
                    </motion.div>
                  )}
                </>
              );
            })()}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
