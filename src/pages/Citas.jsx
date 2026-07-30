import { useState, useEffect, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { supabase } from '../lib/supabase.js'
import { Calendar, Clock, User, Phone, Mail, CheckCircle, Loader, ChevronLeft, ChevronRight, MapPin } from 'lucide-react'
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

const DAYS_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const MONTHS_ES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

export default function Citas() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const [appointmentTypes, setAppointmentTypes] = useState([])
  const [doctors, setDoctors] = useState([])
  const [availableSlots, setAvailableSlots] = useState([])
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)

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
    fetchInitialData()
  }, [])

  useEffect(() => {
    if (formData.doctor_id && formData.type_id) {
      fetchAvailableSlots()
    }
  }, [formData.doctor_id, formData.type_id])

  async function fetchInitialData() {
    const [typesRes, doctorsRes] = await Promise.all([
      supabase.from('appointment_types').select('*').eq('is_active', true).order('name'),
      supabase.from('doctors').select('*, profiles!doctors_id_fkey(full_name)').eq('is_active', true),
    ])
    setAppointmentTypes(typesRes.data || [])
    setDoctors(doctorsRes.data || [])
    setLoading(false)
  }

  async function fetchAvailableSlots() {
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
    const today = new Date()

    for (let d = 0; d < 30; d++) {
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
            const dateKey = slotDate.toISOString().split('T')[0]
            slots.push({
              datetime: slotDate.toISOString(),
              dateKey,
              time: slotDate.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
              hour: Math.floor(currentMinutes / 60),
              minute: currentMinutes % 60,
            })
          }

          currentMinutes += 30
        }
      }
    }

    setAvailableSlots(slots)
  }

  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    return { firstDay, daysInMonth }
  }

  const hasSlotsOnDate = (dateKey) => {
    return availableSlots.some(s => s.dateKey === dateKey)
  }

  const getSlotsForDate = (dateKey) => {
    return availableSlots.filter(s => s.dateKey === dateKey).sort((a, b) => a.hour - b.hour)
  }

  const handleDateClick = (day) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    const dateKey = date.toISOString().split('T')[0]
    if (hasSlotsOnDate(dateKey)) {
      setSelectedDate(dateKey)
    }
  }

  const handleTimeClick = (slot) => {
    setFormData(prev => ({ ...prev, scheduled_at: slot.datetime }))
    setStep(3)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    const qrCode = `APT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    const { data: patientData, error: patientError } = await supabase.auth.signUp({
      email: formData.email,
      password: 'Temp' + Math.random().toString(36).substr(2, 8) + '!',
      options: { data: { full_name: formData.full_name, phone: formData.phone, role: 'patient' } },
    })

    let patientId = patientData?.user?.id
    if (patientError) {
      const { data: existingUser } = await supabase.from('profiles').select('id').eq('full_name', formData.full_name).single()
      if (existingUser) patientId = existingUser.id
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
      setError('Error al agendar. Por favor intenta de nuevo.')
      setSubmitting(false)
      return
    }

    setSuccess(true)
    setSubmitting(false)
  }

  const selectedType = appointmentTypes.find(t => t.id === formData.type_id)
  const selectedDoctor = doctors.find(d => d.id === formData.doctor_id)
  const selectedSlotData = availableSlots.find(s => s.datetime === formData.scheduled_at)

  if (loading) {
    return (
      <div className="page-hero">
        <div className="page-hero__overlay" style={{ background: 'linear-gradient(135deg, rgba(26,26,26,0.85), rgba(26,26,26,0.95))' }} />
        <div className="page-hero__content" style={{ textAlign: 'center' }}>
          <Loader className="w-8 h-8 animate-spin" style={{ color: 'var(--color-accent)', margin: '0 auto' }} />
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <>
        <SEO title="Cita Agendada | Bouclier Clinique" description="Tu cita ha sido agendada." canonical="https://bouclier-clinique.com/citas" />
        <section className="page-hero">
          <div className="page-hero__overlay" style={{ background: 'linear-gradient(135deg, rgba(26,26,26,0.85), rgba(26,26,26,0.95))' }} />
          <motion.div className="page-hero__content" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <div style={{ textAlign: 'center', maxWidth: '500px', margin: '0 auto' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(34,197,94,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <CheckCircle className="w-10 h-10" style={{ color: '#22c55e' }} />
              </div>
              <h1 className="page-hero__title" style={{ fontSize: '36px' }}>¡Cita Agendada!</h1>
              <p className="page-hero__subtitle" style={{ marginBottom: '32px' }}>
                Te contactaremos pronto para confirmar. Revisa tu correo para los detalles.
              </p>
              <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '24px', textAlign: 'left' }}>
                <p style={{ color: 'var(--color-accent)', fontWeight: 600, marginBottom: '12px' }}>Resumen:</p>
                <p style={{ color: '#ccc', fontSize: '14px', marginBottom: '8px' }}>Tipo: {selectedType?.name}</p>
                {selectedDoctor && <p style={{ color: '#ccc', fontSize: '14px', marginBottom: '8px' }}>Doctor: {selectedDoctor.profiles?.full_name}</p>}
                {selectedSlotData && <p style={{ color: '#ccc', fontSize: '14px' }}>Fecha: {new Date(formData.scheduled_at).toLocaleString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}</p>}
              </div>
            </div>
          </motion.div>
        </section>
      </>
    )
  }

  const { firstDay, daysInMonth } = getDaysInMonth(currentMonth)

  return (
    <>
      <SEO title="Agendar Cita | Bouclier Clinique" description="Agenda tu cita en Bouclier Clinique. Selecciona tipo, doctor, fecha y hora." canonical="https://bouclier-clinique.com/citas" />

      {/* Hero */}
      <section className="page-hero">
        <div className="page-hero__overlay" style={{ background: 'linear-gradient(135deg, rgba(26,26,26,0.85), rgba(26,26,26,0.95))' }} />
        <motion.div className="page-hero__content" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}>
          <p className="section-label" style={{ color: 'var(--color-accent)' }}>Citas</p>
          <h1 className="page-hero__title">Agenda tu Cita</h1>
          <p className="page-hero__subtitle">Selecciona el tipo, doctor y horario disponible en nuestro calendario.</p>
        </motion.div>
      </section>

      {/* Steps */}
      <section className="section" style={{ paddingTop: '32px', paddingBottom: 0 }}>
        <div className="section__inner">
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {[1, 2, 3, 4].map(s => (
              <div key={s} style={{
                display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '999px',
                background: s <= step ? 'var(--color-accent)' : 'rgba(255,255,255,0.05)',
                color: s <= step ? '#1a1a1a' : '#888', fontSize: '13px', fontWeight: 600, transition: 'all 0.3s',
              }}>
                <span style={{
                  width: '24px', height: '24px', borderRadius: '50%',
                  background: s < step ? '#22c55e' : s === step ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px',
                }}>
                  {s < step ? '✓' : s}
                </span>
                {['Tipo', 'Doctor', 'Fecha', 'Datos'][s - 1]}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Content */}
      <AnimatedSection className="section">
        <div className="section__inner" style={{ maxWidth: '800px', margin: '0 auto' }}>
          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '12px', padding: '16px', marginBottom: '24px', color: '#ef4444', fontSize: '14px' }}>
              {error}
            </div>
          )}

          {/* Step 1: Type */}
          {step === 1 && (
            <motion.div variants={fadeUp}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 500, marginBottom: '24px' }}>1. Tipo de Cita</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px' }}>
                {appointmentTypes.map(type => (
                  <button key={type.id} onClick={() => { setFormData(prev => ({ ...prev, type_id: type.id })); setStep(2) }}
                    style={{
                      textAlign: 'left', padding: '16px', borderRadius: '12px', border: '2px solid',
                      borderColor: formData.type_id === type.id ? 'var(--color-accent)' : 'rgba(255,255,255,0.1)',
                      background: formData.type_id === type.id ? 'rgba(184,154,90,0.1)' : 'rgba(255,255,255,0.03)',
                      cursor: 'pointer', transition: 'all 0.3s',
                    }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: type.color || 'var(--color-accent)' }} />
                      <span style={{ fontWeight: 600, color: '#fff', fontSize: '15px' }}>{type.name}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#888' }}>
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
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 500, marginBottom: '24px' }}>2. Selecciona Doctor</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px' }}>
                {doctors.map(doctor => (
                  <button key={doctor.id} onClick={() => { setFormData(prev => ({ ...prev, doctor_id: doctor.id })); setStep(2.5) }}
                    style={{
                      textAlign: 'left', padding: '16px', borderRadius: '12px', border: '2px solid',
                      borderColor: formData.doctor_id === doctor.id ? 'var(--color-accent)' : 'rgba(255,255,255,0.1)',
                      background: formData.doctor_id === doctor.id ? 'rgba(184,154,90,0.1)' : 'rgba(255,255,255,0.03)',
                      cursor: 'pointer', transition: 'all 0.3s',
                    }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(184,154,90,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <User className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
                      </div>
                      <div>
                        <p style={{ fontWeight: 600, color: '#fff', margin: 0, fontSize: '15px' }}>{doctor.profiles?.full_name}</p>
                        <p style={{ color: '#888', fontSize: '12px', margin: 0 }}>{doctor.specialty || 'Estética Médica'}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              <button onClick={() => setStep(1)} style={{ marginTop: '24px', background: 'none', border: '1px solid rgba(255,255,255,0.2)', color: '#ccc', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}>← Anterior</button>
            </motion.div>
          )}

          {/* Step 2.5: Calendar */}
          {step === 2.5 && (
            <motion.div variants={fadeUp}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 500, marginBottom: '24px' }}>3. Selecciona Fecha y Hora</h2>

              {/* Calendar */}
              <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
                {/* Month Navigation */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '8px' }}>
                    <ChevronLeft size={20} />
                  </button>
                  <h3 style={{ color: '#fff', fontSize: '18px', fontWeight: 600, margin: 0 }}>
                    {MONTHS_ES[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                  </h3>
                  <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '8px' }}>
                    <ChevronRight size={20} />
                  </button>
                </div>

                {/* Day Headers */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '8px' }}>
                  {DAYS_ES.map(day => (
                    <div key={day} style={{ textAlign: 'center', color: '#888', fontSize: '12px', fontWeight: 600, padding: '8px 0' }}>
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Days */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
                  {Array.from({ length: firstDay }).map((_, i) => (
                    <div key={`empty-${i}`} />
                  ))}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1
                    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
                    const dateKey = date.toISOString().split('T')[0]
                    const hasSlots = hasSlotsOnDate(dateKey)
                    const isSelected = selectedDate === dateKey
                    const isToday = date.toISOString().split('T')[0] === new Date().toISOString().split('T')[0]
                    const isPast = date < new Date(new Date().setHours(0, 0, 0, 0))

                    return (
                      <button key={day} onClick={() => hasSlots && handleDateClick(day)}
                        disabled={!hasSlots || isPast}
                        style={{
                          padding: '12px 8px', borderRadius: '8px', border: 'none', fontSize: '14px', fontWeight: 500,
                          background: isSelected ? 'var(--color-accent)' : isToday ? 'rgba(184,154,90,0.15)' : 'transparent',
                          color: isSelected ? '#1a1a1a' : isPast ? '#555' : hasSlots ? '#fff' : '#444',
                          cursor: hasSlots && !isPast ? 'pointer' : 'default',
                          transition: 'all 0.2s',
                          position: 'relative',
                        }}>
                        {day}
                        {hasSlots && !isPast && (
                          <div style={{ position: 'absolute', bottom: '4px', left: '50%', transform: 'translateX(-50%)', width: '4px', height: '4px', borderRadius: '50%', background: isSelected ? '#1a1a1a' : 'var(--color-accent)' }} />
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Time Slots */}
              {selectedDate && (
                <div>
                  <h3 style={{ color: '#fff', fontSize: '16px', marginBottom: '12px' }}>
                    Horarios disponibles - {new Date(selectedDate + 'T12:00:00').toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {getSlotsForDate(selectedDate).map(slot => (
                      <button key={slot.datetime} onClick={() => handleTimeClick(slot)}
                        style={{
                          padding: '10px 16px', borderRadius: '8px', border: '1px solid',
                          borderColor: formData.scheduled_at === slot.datetime ? 'var(--color-accent)' : 'rgba(255,255,255,0.1)',
                          background: formData.scheduled_at === slot.datetime ? 'var(--color-accent)' : 'rgba(255,255,255,0.03)',
                          color: formData.scheduled_at === slot.datetime ? '#1a1a1a' : '#fff',
                          cursor: 'pointer', fontSize: '14px', fontWeight: 500, transition: 'all 0.2s',
                        }}>
                        {slot.time}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button onClick={() => setStep(2)} style={{ marginTop: '24px', background: 'none', border: '1px solid rgba(255,255,255,0.2)', color: '#ccc', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}>← Anterior</button>
            </motion.div>
          )}

          {/* Step 3: Patient Data */}
          {step === 3 && (
            <motion.div variants={fadeUp}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 500, marginBottom: '24px' }}>4. Tus Datos</h2>
              <form onSubmit={(e) => { e.preventDefault(); setStep(4) }} style={{ maxWidth: '100%' }}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', color: '#999', fontSize: '14px', marginBottom: '8px' }}>Nombre Completo *</label>
                  <input type="text" value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    style={{ width: '100%', padding: '14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '15px', boxSizing: 'border-box' }}
                    placeholder="Tu nombre completo" required />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ display: 'block', color: '#999', fontSize: '14px', marginBottom: '8px' }}>Teléfono *</label>
                    <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      style={{ width: '100%', padding: '14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '15px', boxSizing: 'border-box' }}
                      placeholder="+52 229 123 4567" required />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#999', fontSize: '14px', marginBottom: '8px' }}>Email *</label>
                    <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      style={{ width: '100%', padding: '14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '15px', boxSizing: 'border-box' }}
                      placeholder="tu@email.com" required />
                  </div>
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', color: '#999', fontSize: '14px', marginBottom: '8px' }}>Motivo de Consulta</label>
                  <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    style={{ width: '100%', padding: '14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '15px', minHeight: '80px', resize: 'vertical', boxSizing: 'border-box' }}
                    placeholder="Describe brevemente tu consulta..." />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
                  <button type="button" onClick={() => setStep(2.5)} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.2)', color: '#ccc', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer' }}>← Anterior</button>
                  <button type="submit" className="btn-primary" style={{ padding: '12px 32px' }}>Revisar →</button>
                </div>
              </form>
            </motion.div>
          )}

          {/* Step 4: Confirm */}
          {step === 4 && (
            <motion.div variants={fadeUp}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 500, marginBottom: '24px' }}>Confirma tu Cita</h2>
              <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
                {[
                  ['Tipo', selectedType?.name],
                  ['Doctor', selectedDoctor?.profiles?.full_name],
                  ['Fecha', selectedSlotData ? new Date(formData.scheduled_at).toLocaleString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }) : ''],
                  ['Paciente', formData.full_name],
                  ['Contacto', `${formData.phone} · ${formData.email}`],
                ].map(([label, value]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '12px 0' }}>
                    <span style={{ color: '#888' }}>{label}</span>
                    <span style={{ color: '#fff', fontWeight: 500, textTransform: 'capitalize' }}>{value}</span>
                  </div>
                ))}
              </div>
              <div style={{ background: 'rgba(184,154,90,0.08)', borderRadius: '12px', padding: '16px', marginBottom: '24px' }}>
                <p style={{ color: '#ccc', fontSize: '13px', margin: 0 }}>Recibirás un código QR para hacer check-in el día de tu consulta.</p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button onClick={() => setStep(3)} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.2)', color: '#ccc', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer' }}>← Anterior</button>
                <button onClick={handleSubmit} disabled={submitting} className="btn-primary" style={{ padding: '12px 32px', opacity: submitting ? 0.5 : 1 }}>
                  {submitting ? 'Procesando...' : 'Confirmar Cita'}
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </AnimatedSection>
    </>
  )
}
