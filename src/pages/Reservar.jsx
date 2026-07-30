import { useState, useEffect, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { supabase } from '../lib/supabase.js'
import { Calendar, Clock, User, Phone, Mail, CheckCircle, Loader, ChevronLeft, ChevronRight } from 'lucide-react'
import SEO from '../components/SEO.jsx'

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }
}

const stagger = {
  visible: { transition: { staggerChildren: 0.15 } }
}

function AnimatedSection({ children, className = '' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.section
      ref={ref}
      className={className}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={stagger}
    >
      {children}
    </motion.section>
  )
}

const steps = ['Tipo de Cita', 'Seleccionar Doctor', 'Fecha y Hora', 'Tus Datos', 'Confirmación']

export default function Reservar() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const [appointmentTypes, setAppointmentTypes] = useState([])
  const [doctors, setDoctors] = useState([])
  const [availableSlots, setAvailableSlots] = useState([])

  const [formData, setFormData] = useState({
    type_id: '',
    doctor_id: '',
    scheduled_at: '',
    full_name: '',
    phone: '',
    email: '',
    notes: '',
  })

  useEffect(() => {
    fetchAppointmentTypes()
  }, [])

  useEffect(() => {
    if (formData.type_id) {
      fetchDoctors()
    }
  }, [formData.type_id])

  useEffect(() => {
    if (formData.doctor_id && formData.type_id) {
      fetchAvailableSlots()
    }
  }, [formData.doctor_id, formData.type_id])

  async function fetchAppointmentTypes() {
    const { data, error } = await supabase
      .from('appointment_types')
      .select('*')
      .eq('is_active', true)
      .order('name')

    if (!error) {
      setAppointmentTypes(data || [])
    }
    setLoading(false)
  }

  async function fetchDoctors() {
    const { data, error } = await supabase
      .from('doctors')
      .select('*, profiles!doctors_id_fkey(full_name)')
      .eq('is_active', true)

    if (!error) {
      setDoctors(data || [])
    }
  }

  async function fetchAvailableSlots() {
    const today = new Date()
    const nextWeek = new Date(today)
    nextWeek.setDate(nextWeek.getDate() + 14)

    const { data: availability } = await supabase
      .from('availability')
      .select('*')
      .eq('doctor_id', formData.doctor_id)
      .eq('is_active', true)

    const { data: existingAppointments } = await supabase
      .from('appointments')
      .select('scheduled_at, duration_minutes')
      .eq('doctor_id', formData.doctor_id)
      .not('status', 'in', '(cancelled)')

    const { data: blockedTimes } = await supabase
      .from('blocked_times')
      .select('*')
      .eq('doctor_id', formData.doctor_id)

    const type = appointmentTypes.find(t => t.id === formData.type_id)
    const duration = type?.duration_minutes || 30

    const slots = []
    const dayMap = { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6 }

    for (let d = 0; d < 14; d++) {
      const date = new Date(today)
      date.setDate(date.getDate() + d)
      const dayOfWeek = date.getDay()

      const dayAvailability = availability?.filter(a => a.day_of_week === dayOfWeek) || []

      for (const avail of dayAvailability) {
        const [startHour, startMin] = avail.start_time.split(':').map(Number)
        const [endHour, endMin] = avail.end_time.split(':').map(Number)

        let currentMinutes = startHour * 60 + startMin
        const endMinutes = endHour * 60 + endMin

        while (currentMinutes + duration <= endMinutes) {
          const slotDate = new Date(date)
          slotDate.setHours(Math.floor(currentMinutes / 60), currentMinutes % 60, 0, 0)

          if (slotDate <= new Date()) {
            currentMinutes += 30
            continue
          }

          const slotEnd = new Date(slotDate.getTime() + duration * 60000)

          const isBlocked = blockedTimes?.some(bt => {
            const btStart = new Date(bt.start_at)
            const btEnd = new Date(bt.end_at)
            return (slotDate < btEnd && slotEnd > btStart)
          })

          const isOccupied = existingAppointments?.some(apt => {
            const aptStart = new Date(apt.scheduled_at)
            const aptEnd = new Date(aptStart.getTime() + (apt.duration_minutes || 30) * 60000)
            return (slotDate < aptEnd && slotEnd > aptStart)
          })

          if (!isBlocked && !isOccupied) {
            slots.push({
              datetime: slotDate.toISOString(),
              display: slotDate.toLocaleString('es-MX', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              }),
              date: slotDate.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' }),
              time: slotDate.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
            })
          }

          currentMinutes += 30
        }
      }
    }

    setAvailableSlots(slots)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    const qrCode = `APT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    const array = new Uint8Array(16)
    crypto.getRandomValues(array)
    const tempPassword = Array.from(array, b => b.toString(16).padStart(2, '0')).join('').slice(0, 16) + '!A'

    const { data: patientData, error: patientError } = await supabase.auth.signUp({
      email: formData.email,
      password: tempPassword,
      options: {
        data: {
          full_name: formData.full_name,
          phone: formData.phone,
          role: 'patient',
        },
      },
    })

    let patientId = patientData?.user?.id

    if (patientError) {
      if (patientError.message?.includes('already registered')) {
        setError('Ya existe una cuenta con este email. Inicia sesión para agendar.')
        setSubmitting(false)
        return
      }
      setError('Error al crear la cuenta. Por favor intenta de nuevo.')
      setSubmitting(false)
      return
    }

    const { error: aptError } = await supabase.from('appointments').insert({
      patient_id: patientId || null,
      doctor_id: formData.doctor_id || null,
      type_id: formData.type_id,
      scheduled_at: formData.scheduled_at,
      duration_minutes: appointmentTypes.find(t => t.id === formData.type_id)?.duration_minutes || 30,
      chief_complaint: formData.notes,
      qr_code: qrCode,
      status: 'scheduled',
      location: 'Torre EXERTIA',
    })

    if (aptError) {
      setError('Error al agendar la cita. Por favor intenta de nuevo.')
      setSubmitting(false)
      return
    }

    setSuccess(true)
    setSubmitting(false)
  }

  const selectedType = appointmentTypes.find(t => t.id === formData.type_id)
  const selectedDoctor = doctors.find(d => d.id === formData.doctor_id)
  const selectedSlot = availableSlots.find(s => s.datetime === formData.scheduled_at)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg)' }}>
        <Loader className="w-8 h-8 animate-spin" style={{ color: 'var(--color-accent)' }} />
      </div>
    )
  }

  if (success) {
    return (
      <>
        <SEO
          title="Cita Agendada | Bouclier Clinique"
          description="Tu cita ha sido agendada exitosamente."
          canonical="https://bouclier-clinique.com/reservar"
        />
        <section className="page-hero">
          <div className="page-hero__overlay" style={{ background: 'linear-gradient(135deg, rgba(26,26,26,0.85), rgba(26,26,26,0.95))' }} />
          <motion.div
            className="page-hero__content"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div style={{ textAlign: 'center', maxWidth: '500px' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(34,197,94,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <CheckCircle className="w-10 h-10" style={{ color: '#22c55e' }} />
              </div>
              <h1 className="page-hero__title" style={{ fontSize: '36px' }}>¡Cita Agendada!</h1>
              <p className="page-hero__subtitle" style={{ marginBottom: '32px' }}>
                Hemos recibido tu solicitud de cita. Te contactaremos pronto para confirmar los detalles.
              </p>
              <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '24px', textAlign: 'left' }}>
                <p style={{ color: 'var(--color-accent)', fontWeight: 600, marginBottom: '12px' }}>Resumen:</p>
                <p style={{ color: '#ccc', fontSize: '14px', marginBottom: '8px' }}>Tipo: {selectedType?.name}</p>
                {selectedDoctor && (
                  <p style={{ color: '#ccc', fontSize: '14px', marginBottom: '8px' }}>
                    Doctor: {selectedDoctor.profiles?.full_name}
                  </p>
                )}
                {selectedSlot && (
                  <p style={{ color: '#ccc', fontSize: '14px' }}>Fecha: {selectedSlot.display}</p>
                )}
              </div>
            </div>
          </motion.div>
        </section>
      </>
    )
  }

  return (
    <>
      <SEO
        title="Reservar Cita | Bouclier Clinique"
        description="Reserva tu cita en Bouclier Clinique. Selecciona el tipo de consulta, el doctor y el horario disponible."
        canonical="https://bouclier-clinique.com/reservar"
      />

      {/* Hero */}
      <section className="page-hero">
        <div className="page-hero__overlay" style={{ background: 'linear-gradient(135deg, rgba(26,26,26,0.85), rgba(26,26,26,0.95))' }} />
        <motion.div
          className="page-hero__content"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <p className="section-label" style={{ color: 'var(--color-accent)' }}>Reservar</p>
          <h1 className="page-hero__title">Agenda tu Cita en Línea</h1>
          <p className="page-hero__subtitle">
            Selecciona el tipo de consulta, el doctor y el horario que mejor se adapte a ti.
          </p>
        </motion.div>
      </section>

      {/* Progress Steps */}
      <section className="section" style={{ paddingTop: '40px', paddingBottom: '0' }}>
        <div className="section__inner">
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {steps.map((s, i) => (
              <div
                key={s}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  borderRadius: '999px',
                  background: i + 1 <= step ? 'var(--color-accent)' : 'rgba(255,255,255,0.05)',
                  color: i + 1 <= step ? '#1a1a1a' : '#888',
                  fontSize: '13px',
                  fontWeight: 600,
                  transition: 'all 0.3s',
                }}
              >
                <span style={{
                  width: '24px', height: '24px', borderRadius: '50%',
                  background: i + 1 < step ? '#22c55e' : i + 1 === step ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px',
                }}>
                  {i + 1 < step ? '✓' : i + 1}
                </span>
                <span className="step-label">{s}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form Steps */}
      <AnimatedSection className="section">
        <div className="section__inner" style={{ maxWidth: '700px', margin: '0 auto' }}>
          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: '12px', padding: '16px', marginBottom: '24px', color: '#ef4444', fontSize: '14px',
            }}>
              {error}
            </div>
          )}

          {/* Step 1: Appointment Type */}
          {step === 1 && (
            <motion.div variants={fadeUp}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 500, marginBottom: '24px' }}>
                Selecciona el Tipo de Cita
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                {appointmentTypes.map(type => (
                  <button
                    key={type.id}
                    onClick={() => {
                      setFormData(prev => ({ ...prev, type_id: type.id }))
                      setStep(2)
                    }}
                    style={{
                      textAlign: 'left', padding: '20px', borderRadius: '12px', border: '2px solid',
                      borderColor: formData.type_id === type.id ? 'var(--color-accent)' : 'rgba(255,255,255,0.1)',
                      background: formData.type_id === type.id ? 'rgba(184,154,90,0.1)' : 'rgba(255,255,255,0.03)',
                      cursor: 'pointer', transition: 'all 0.3s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: type.color || 'var(--color-accent)' }} />
                      <span style={{ fontWeight: 600, color: '#fff', fontSize: '16px' }}>{type.name}</span>
                    </div>
                    {type.description && (
                      <p style={{ color: '#999', fontSize: '13px', margin: 0 }}>{type.description}</p>
                    )}
                    <div style={{ display: 'flex', gap: '16px', marginTop: '12px', fontSize: '12px', color: '#888' }}>
                      <span>{type.duration_minutes} min</span>
                      {type.price && <span>${type.price} MXN</span>}
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 2: Doctor */}
          {step === 2 && (
            <motion.div variants={fadeUp}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 500, marginBottom: '24px' }}>
                Selecciona el Doctor
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                {doctors.map(doctor => (
                  <button
                    key={doctor.id}
                    onClick={() => {
                      setFormData(prev => ({ ...prev, doctor_id: doctor.id }))
                      setStep(3)
                    }}
                    style={{
                      textAlign: 'left', padding: '20px', borderRadius: '12px', border: '2px solid',
                      borderColor: formData.doctor_id === doctor.id ? 'var(--color-accent)' : 'rgba(255,255,255,0.1)',
                      background: formData.doctor_id === doctor.id ? 'rgba(184,154,90,0.1)' : 'rgba(255,255,255,0.03)',
                      cursor: 'pointer', transition: 'all 0.3s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '48px', height: '48px', borderRadius: '50%',
                        background: 'rgba(184,154,90,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <User className="w-6 h-6" style={{ color: 'var(--color-accent)' }} />
                      </div>
                      <div>
                        <p style={{ fontWeight: 600, color: '#fff', margin: 0 }}>{doctor.profiles?.full_name}</p>
                        <p style={{ color: '#999', fontSize: '13px', margin: 0 }}>{doctor.specialty || 'Estética Médica'}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              <button onClick={() => setStep(1)} style={{ marginTop: '24px', background: 'none', border: '1px solid rgba(255,255,255,0.2)', color: '#ccc', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}>← Anterior</button>
            </motion.div>
          )}

          {/* Step 3: Date & Time */}
          {step === 3 && (
            <motion.div variants={fadeUp}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 500, marginBottom: '24px' }}>
                Selecciona Fecha y Hora
              </h2>
              {availableSlots.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px', color: '#888' }}>
                  <Calendar className="w-12 h-12 mx-auto mb-4" style={{ opacity: 0.3 }} />
                  <p>No hay horarios disponibles para esta selección.</p>
                  <p style={{ fontSize: '13px', marginTop: '8px' }}>Intenta con otro doctor o tipo de cita.</p>
                </div>
              ) : (
                <>
                  {(() => {
                    const grouped = {}
                    availableSlots.forEach(slot => {
                      if (!grouped[slot.date]) grouped[slot.date] = []
                      grouped[slot.date].push(slot)
                    })
                    return Object.entries(grouped).slice(0, 7).map(([date, slots]) => (
                      <div key={date} style={{ marginBottom: '24px' }}>
                        <p style={{ color: 'var(--color-accent)', fontWeight: 600, marginBottom: '12px', textTransform: 'capitalize' }}>
                          {date}
                        </p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {slots.map(slot => (
                            <button
                              key={slot.datetime}
                              onClick={() => setFormData(prev => ({ ...prev, scheduled_at: slot.datetime }))}
                              style={{
                                padding: '10px 16px', borderRadius: '8px', border: '1px solid',
                                borderColor: formData.scheduled_at === slot.datetime ? 'var(--color-accent)' : 'rgba(255,255,255,0.1)',
                                background: formData.scheduled_at === slot.datetime ? 'var(--color-accent)' : 'rgba(255,255,255,0.03)',
                                color: formData.scheduled_at === slot.datetime ? '#1a1a1a' : '#fff',
                                cursor: 'pointer', fontSize: '14px', fontWeight: 500, transition: 'all 0.2s',
                              }}
                            >
                              {slot.time}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))
                  })()}
                </>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px' }}>
                <button onClick={() => setStep(2)} className="btn-outline">Anterior</button>
                <button
                  onClick={() => setStep(4)}
                  disabled={!formData.scheduled_at}
                  className="btn-gold"
                  style={{ opacity: !formData.scheduled_at ? 0.5 : 1, cursor: !formData.scheduled_at ? 'not-allowed' : 'pointer' }}
                >
                  Siguiente
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Personal Data */}
          {step === 4 && (
            <motion.div variants={fadeUp}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 500, marginBottom: '24px' }}>
                Tus Datos
              </h2>
              <form onSubmit={(e) => { e.preventDefault(); setStep(5) }} className="form" style={{ maxWidth: '100%' }}>
                <div className="form__group">
                  <label className="form__label">Nombre Completo *</label>
                  <input
                    type="text"
                    className="form__input"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    placeholder="Tu nombre completo"
                    required
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div className="form__group">
                    <label className="form__label">Teléfono *</label>
                    <input
                      type="tel"
                      className="form__input"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+52 229 123 4567"
                      required
                    />
                  </div>
                  <div className="form__group">
                    <label className="form__label">Email *</label>
                    <input
                      type="email"
                      className="form__input"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="tu@email.com"
                      required
                    />
                  </div>
                </div>
                <div className="form__group">
                  <label className="form__label">Motivo de Consulta</label>
                  <textarea
                    className="form__input"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Describe brevemente el motivo de tu consulta..."
                    rows={3}
                    style={{ resize: 'vertical' }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px' }}>
                  <button type="button" onClick={() => setStep(3)} className="btn-outline">Anterior</button>
                  <button type="submit" className="btn-gold">Revisar Reservación</button>
                </div>
              </form>
            </motion.div>
          )}

          {/* Step 5: Confirmation */}
          {step === 5 && (
            <motion.div variants={fadeUp}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 500, marginBottom: '24px' }}>
                Confirma tu Reservación
              </h2>
              <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
                <div style={{ display: 'grid', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px' }}>
                    <span style={{ color: '#888' }}>Tipo de Cita</span>
                    <span style={{ color: '#fff', fontWeight: 500 }}>{selectedType?.name}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px' }}>
                    <span style={{ color: '#888' }}>Doctor</span>
                    <span style={{ color: '#fff', fontWeight: 500 }}>{selectedDoctor?.profiles?.full_name}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px' }}>
                    <span style={{ color: '#888' }}>Fecha y Hora</span>
                    <span style={{ color: '#fff', fontWeight: 500 }}>{selectedSlot?.display}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px' }}>
                    <span style={{ color: '#888' }}>Paciente</span>
                    <span style={{ color: '#fff', fontWeight: 500 }}>{formData.full_name}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#888' }}>Contacto</span>
                    <span style={{ color: '#fff', fontWeight: 500 }}>{formData.phone}</span>
                  </div>
                </div>
              </div>

              <div style={{ background: 'rgba(184,154,90,0.08)', borderRadius: '12px', padding: '16px', marginBottom: '24px' }}>
                <p style={{ color: '#ccc', fontSize: '13px', margin: 0 }}>
                  Al confirmar, se creará tu cita y recibirás un código QR para hacer check-in el día de tu consulta.
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button onClick={() => setStep(4)} className="btn-outline">Anterior</button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="btn-gold"
                  style={{ opacity: submitting ? 0.5 : 1 }}
                >
                  {submitting ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Loader className="w-4 h-4 animate-spin" /> Procesando...
                    </span>
                  ) : (
                    'Confirmar Reservación'
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </AnimatedSection>
    </>
  )
}
