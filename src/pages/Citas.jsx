import { useState, useRef, useMemo } from 'react'
import { motion, useInView } from 'framer-motion'
import { Calendar, Clock, User, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react'
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
    <motion.section ref={ref} className={className} initial="hidden" animate={inView ? 'visible' : 'hidden'} variants={stagger}>
      {children}
    </motion.section>
  )
}

const DAYS_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const MONTHS_ES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

const APPOINTMENT_TYPES = [
  { id: 'primera', name: 'Primera Consulta', description: 'Evaluación inicial completa', duration_minutes: 45, color: '#b89a5a' },
  { id: 'manchas', name: 'Consulta de Manchas', description: 'Tratamiento de manchas y melasma', duration_minutes: 30, color: '#9a7d3f' },
  { id: 'blefaroplastia', name: 'Blefaroplastia No Quirúrgica', description: 'Rejuvenecimiento de mirada', duration_minutes: 60, color: '#d4b97a' },
  { id: 'control', name: 'Control / Seguimiento', description: 'Seguimiento de tratamiento', duration_minutes: 20, color: '#666666' },
  { id: 'limpieza', name: 'Limpieza Facial Profunda', description: 'Hydrafacial o Diamond Glow', duration_minutes: 45, color: '#4a90d9' },
  { id: 'botox', name: 'Aplicación de Botox', description: 'Toxina botulínica para arrugas', duration_minutes: 30, color: '#e74c3c' },
  { id: 'relleno', name: 'Relleno con Ácido Hialurónico', description: 'Fillers y bioestimulación', duration_minutes: 45, color: '#9b59b6' },
  { id: 'morpheus', name: 'Morpheus8 / Radiofrecuencia', description: 'Microneedling con radiofrecuencia', duration_minutes: 60, color: '#f39c12' },
]

const DOCTORS = [
  { id: 'dra-gissel', full_name: 'Dra. Gissel Castellanos', specialty: 'Dermatología Estética' },
]

function getToday() {
  const t = new Date()
  t.setHours(0, 0, 0, 0)
  return t
}

function formatDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function generateSlotsForRange(startDate, daysCount) {
  const slots = []
  const base = new Date(startDate)
  base.setHours(0, 0, 0, 0)

  for (let d = 0; d < daysCount; d++) {
    const date = new Date(base)
    date.setDate(date.getDate() + d)
    const dayOfWeek = date.getDay()

    if (dayOfWeek === 0) continue

    const hours = dayOfWeek === 6 ? [9, 10, 11] : [9, 10, 11, 14, 15, 16, 17]

    for (const hour of hours) {
      const slotDate = new Date(date)
      slotDate.setHours(hour, 0, 0, 0)

      slots.push({
        datetime: slotDate.toISOString(),
        dateKey: formatDateKey(date),
        time: `${String(hour).padStart(2, '0')}:00`,
        hour,
      })
    }
  }
  return slots
}

const calStyles = {
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px',
  },
  navBtn: {
    background: 'none', border: '1px solid rgba(26,26,26,0.15)', borderRadius: '8px',
    width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', transition: 'all 0.2s', color: '#1a1a1a',
  },
  navBtnHover: {
    background: 'rgba(184,154,90,0.1)', borderColor: 'var(--color-accent)',
  },
  monthTitle: {
    fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 500, color: '#1a1a1a', margin: 0,
  },
  dayHeader: {
    textAlign: 'center', color: '#999', fontSize: '12px', fontWeight: 600, padding: '8px 0',
    textTransform: 'uppercase', letterSpacing: '0.5px',
  },
  dayCell: {
    position: 'relative', padding: '10px 6px', borderRadius: '8px', border: 'none',
    fontSize: '14px', fontWeight: 500, transition: 'all 0.2s', cursor: 'default',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
  },
  dayCellAvailable: {
    cursor: 'pointer', background: 'rgba(184,154,90,0.06)',
  },
  dayCellSelected: {
    background: 'var(--color-accent)', color: '#fff',
  },
  dayCellToday: {
    border: '2px solid var(--color-accent)',
  },
  dayCellPast: {
    color: '#ccc',
  },
  dot: {
    width: '5px', height: '5px', borderRadius: '50%', background: 'var(--color-accent)',
  },
  dotSelected: {
    background: '#fff',
  },
}

function CalendarWidget({ currentMonth, setCurrentMonth, selectedDate, setSelectedDate, slots }) {
  const [hoveredNav, setHoveredNav] = useState(null)
  const today = getToday()
  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()
  const firstDayOfWeek = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const isPrevDisabled = year === today.getFullYear() && month <= today.getMonth()

  const handlePrev = () => {
    if (!isPrevDisabled) {
      setCurrentMonth(new Date(year, month - 1))
    }
  }

  const handleNext = () => {
    setCurrentMonth(new Date(year, month + 1))
  }

  return (
    <div>
      <div style={calStyles.header}>
        <button
          onClick={handlePrev}
          disabled={isPrevDisabled}
          onMouseEnter={() => setHoveredNav('prev')}
          onMouseLeave={() => setHoveredNav(null)}
          style={{
            ...calStyles.navBtn,
            opacity: isPrevDisabled ? 0.3 : 1,
            ...(hoveredNav === 'prev' && !isPrevDisabled ? calStyles.navBtnHover : {}),
          }}
        >
          <ChevronLeft size={18} />
        </button>
        <h3 style={calStyles.monthTitle}>{MONTHS_ES[month]} {year}</h3>
        <button
          onClick={handleNext}
          onMouseEnter={() => setHoveredNav('next')}
          onMouseLeave={() => setHoveredNav(null)}
          style={{
            ...calStyles.navBtn,
            ...(hoveredNav === 'next' ? calStyles.navBtnHover : {}),
          }}
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', marginBottom: '4px' }}>
        {DAYS_ES.map(day => (
          <div key={day} style={calStyles.dayHeader}>{day}</div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
        {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`empty-${i}`} />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1
          const date = new Date(year, month, day)
          const dateKey = formatDateKey(date)
          const isPast = date < today
          const isToday = formatDateKey(date) === formatDateKey(today)
          const isSelected = selectedDate === dateKey
          const hasSlots = slots.some(s => s.dateKey === dateKey)

          let cellStyle = { ...calStyles.dayCell }
          if (isPast) {
            cellStyle = { ...cellStyle, ...calStyles.dayCellPast }
          } else if (isSelected) {
            cellStyle = { ...cellStyle, ...calStyles.dayCellSelected }
          } else if (hasSlots) {
            cellStyle = { ...cellStyle, ...calStyles.dayCellAvailable }
          }
          if (isToday && !isSelected) {
            cellStyle = { ...cellStyle, ...calStyles.dayCellToday }
          }

          return (
            <button
              key={day}
              onClick={() => { if (hasSlots && !isPast) setSelectedDate(dateKey) }}
              disabled={isPast || !hasSlots}
              style={cellStyle}
            >
              <span>{day}</span>
              {hasSlots && !isPast && (
                <div style={{ ...calStyles.dot, ...(isSelected ? calStyles.dotSelected : {}) }} />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function Citas() {
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [selectedType, setSelectedType] = useState(null)
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)
  const [formData, setFormData] = useState({ full_name: '', phone: '', email: '', notes: '' })

  const today = getToday()
  const maxDate = new Date(today)
  maxDate.setMonth(maxDate.getMonth() + 3)

  const slots = useMemo(() => {
    return generateSlotsForRange(today, 92)
  }, [])

  const getSlotsForDate = (dateKey) => slots.filter(s => s.dateKey === dateKey).sort((a, b) => a.hour - b.hour)

  const handleDateSelect = (dateKey) => {
    setSelectedDate(dateKey)
    setSelectedSlot(null)
  }

  const handleSubmit = () => {
    setSubmitting(true)
    setTimeout(() => { setSuccess(true); setSubmitting(false) }, 1500)
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
              <p className="page-hero__subtitle" style={{ marginBottom: '32px' }}>Te contactaremos pronto para confirmar. Revisa tu correo.</p>
              <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '24px', textAlign: 'left' }}>
                <p style={{ color: 'var(--color-accent)', fontWeight: 600, marginBottom: '12px' }}>Resumen:</p>
                <p style={{ color: '#ccc', fontSize: '14px', marginBottom: '8px' }}>Tipo: {selectedType?.name}</p>
                <p style={{ color: '#ccc', fontSize: '14px', marginBottom: '8px' }}>Doctor: {selectedDoctor?.full_name}</p>
                <p style={{ color: '#ccc', fontSize: '14px' }}>Fecha: {selectedSlot ? new Date(selectedSlot.datetime).toLocaleString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }) : ''}</p>
              </div>
            </div>
          </motion.div>
        </section>
      </>
    )
  }

  return (
    <>
      <SEO title="Agendar Cita | Bouclier Clinique" description="Agenda tu cita en Bouclier Clinique." canonical="https://bouclier-clinique.com/citas" />

      <section className="page-hero">
        <div className="page-hero__overlay" style={{ background: 'linear-gradient(135deg, rgba(26,26,26,0.85), rgba(26,26,26,0.95))' }} />
        <motion.div className="page-hero__content" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}>
          <p className="section-label" style={{ color: 'var(--color-accent)' }}>Citas</p>
          <h1 className="page-hero__title">Agenda tu Cita</h1>
          <p className="page-hero__subtitle">Selecciona el tipo, doctor y horario disponible.</p>
        </motion.div>
      </section>

      <section className="section" style={{ paddingTop: '32px', paddingBottom: 0 }}>
        <div className="section__inner">
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {[1, 2, 3, 4].map(s => (
              <div key={s} style={{
                display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '999px',
                background: s <= step ? 'var(--color-accent)' : 'rgba(26,26,26,0.05)',
                color: s <= step ? '#1a1a1a' : '#999', fontSize: '13px', fontWeight: 600, transition: 'all 0.3s',
              }}>
                <span style={{
                  width: '24px', height: '24px', borderRadius: '50%',
                  background: s < step ? '#22c55e' : s === step ? 'rgba(0,0,0,0.15)' : 'rgba(0,0,0,0.08)',
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

      <AnimatedSection className="section">
        <div className="section__inner" style={{ maxWidth: '800px', margin: '0 auto' }}>

          {step === 1 && (
            <motion.div variants={fadeUp}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 500, color: '#1a1a1a', marginBottom: '24px' }}>1. Tipo de Cita</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px' }}>
                {APPOINTMENT_TYPES.map(type => (
                  <button key={type.id} onClick={() => { setSelectedType(type); setStep(2) }}
                    style={{
                      textAlign: 'left', padding: '16px', borderRadius: '12px', border: '2px solid rgba(26,26,26,0.1)',
                      background: '#fff', cursor: 'pointer', transition: 'all 0.3s', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                    }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: type.color }} />
                      <span style={{ fontWeight: 600, color: '#1a1a1a', fontSize: '15px' }}>{type.name}</span>
                    </div>
                    <p style={{ color: '#888', fontSize: '12px', margin: 0 }}>{type.description}</p>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div variants={fadeUp}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 500, color: '#1a1a1a', marginBottom: '24px' }}>2. Selecciona Doctor</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px' }}>
                {DOCTORS.map(doctor => (
                  <button key={doctor.id} onClick={() => { setSelectedDoctor(doctor); setStep(3) }}
                    style={{
                      textAlign: 'left', padding: '16px', borderRadius: '12px', border: '2px solid rgba(26,26,26,0.1)',
                      background: '#fff', cursor: 'pointer', transition: 'all 0.3s', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                    }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(184,154,90,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <User className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
                      </div>
                      <div>
                        <p style={{ fontWeight: 600, color: '#1a1a1a', margin: 0, fontSize: '15px' }}>{doctor.full_name}</p>
                        <p style={{ color: '#888', fontSize: '12px', margin: 0 }}>{doctor.specialty}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              <button onClick={() => setStep(1)} style={{ marginTop: '24px', background: 'none', border: '1px solid rgba(26,26,26,0.15)', color: '#666', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}>← Anterior</button>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div variants={fadeUp}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 500, color: '#1a1a1a', marginBottom: '24px' }}>3. Selecciona Fecha y Hora</h2>

              <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', marginBottom: '24px', border: '1px solid rgba(26,26,26,0.08)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <CalendarWidget
                  currentMonth={currentMonth}
                  setCurrentMonth={setCurrentMonth}
                  selectedDate={selectedDate}
                  setSelectedDate={handleDateSelect}
                  slots={slots}
                />
              </div>

              {selectedDate && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                  <h3 style={{ color: '#1a1a1a', fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 500, marginBottom: '16px' }}>
                    Horarios disponibles — {new Date(selectedDate + 'T12:00:00').toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '10px' }}>
                    {getSlotsForDate(selectedDate).map(slot => {
                      const isSelected = selectedSlot?.datetime === slot.datetime
                      return (
                        <button key={slot.datetime} onClick={() => { setSelectedSlot(slot); setStep(4) }}
                          style={{
                            padding: '14px 12px', borderRadius: '10px', border: isSelected ? '2px solid var(--color-accent)' : '1px solid rgba(26,26,26,0.1)',
                            background: isSelected ? 'var(--color-accent)' : '#fff', color: isSelected ? '#fff' : '#1a1a1a',
                            cursor: 'pointer', fontSize: '15px', fontWeight: 600, transition: 'all 0.2s',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                          }}>
                          {slot.time}
                        </button>
                      )
                    })}
                  </div>
                </motion.div>
              )}

              <button onClick={() => setStep(2)} style={{ marginTop: '24px', background: 'none', border: '1px solid rgba(26,26,26,0.15)', color: '#666', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}>← Anterior</button>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div variants={fadeUp}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 500, color: '#1a1a1a', marginBottom: '24px' }}>4. Tus Datos</h2>

              <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', marginBottom: '24px', border: '1px solid rgba(26,26,26,0.08)' }}>
                <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>
                  <span style={{ color: 'var(--color-accent)', fontWeight: 600 }}>{selectedType?.name}</span>{' '}
                  · {selectedDoctor?.full_name} ·{' '}
                  {selectedSlot ? new Date(selectedSlot.datetime).toLocaleString('es-MX', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}
                </p>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleSubmit() }}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', color: '#666', fontSize: '14px', marginBottom: '6px', fontWeight: 500 }}>Nombre Completo *</label>
                  <input type="text" value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    style={{ width: '100%', padding: '14px', background: '#fff', border: '1px solid rgba(26,26,26,0.12)', borderRadius: '10px', color: '#1a1a1a', fontSize: '15px', boxSizing: 'border-box', outline: 'none' }}
                    placeholder="Tu nombre completo" required />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', color: '#666', fontSize: '14px', marginBottom: '6px', fontWeight: 500 }}>Teléfono *</label>
                    <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      style={{ width: '100%', padding: '14px', background: '#fff', border: '1px solid rgba(26,26,26,0.12)', borderRadius: '10px', color: '#1a1a1a', fontSize: '15px', boxSizing: 'border-box', outline: 'none' }}
                      placeholder="+52 229 123 4567" required />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#666', fontSize: '14px', marginBottom: '6px', fontWeight: 500 }}>Email *</label>
                    <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      style={{ width: '100%', padding: '14px', background: '#fff', border: '1px solid rgba(26,26,26,0.12)', borderRadius: '10px', color: '#1a1a1a', fontSize: '15px', boxSizing: 'border-box', outline: 'none' }}
                      placeholder="tu@email.com" required />
                  </div>
                </div>
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', color: '#666', fontSize: '14px', marginBottom: '6px', fontWeight: 500 }}>Motivo de Consulta</label>
                  <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    style={{ width: '100%', padding: '14px', background: '#fff', border: '1px solid rgba(26,26,26,0.12)', borderRadius: '10px', color: '#1a1a1a', fontSize: '15px', minHeight: '80px', resize: 'vertical', boxSizing: 'border-box', outline: 'none' }}
                    placeholder="Describe brevemente tu consulta..." />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <button type="button" onClick={() => setStep(3)} style={{ background: 'none', border: '1px solid rgba(26,26,26,0.15)', color: '#666', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}>← Anterior</button>
                  <button type="submit" disabled={submitting} className="btn-primary" style={{ padding: '14px 36px', opacity: submitting ? 0.5 : 1, fontSize: '15px' }}>
                    {submitting ? 'Agendando...' : 'Agendar Cita'}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </div>
      </AnimatedSection>
    </>
  )
}
