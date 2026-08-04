import { useEffect, useMemo, useState } from 'react'
import { Check, ChevronLeft } from 'lucide-react'
import { bookingApi } from '../services/bookingApi.js'
import { SITE_CONTENT } from '../data/siteContent.js'
import StripeDepositStep from './StripeDepositStep.jsx'

const STEP_LABELS = ['Tratamiento', 'Especialista', 'Horario', 'Datos', 'Pago']

function formatMoney(minor, currency = 'mxn') {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: currency.toUpperCase() }).format(minor / 100)
}

function formatSlot(startsAt) {
  const date = new Date(startsAt)
  return new Intl.DateTimeFormat('es-MX', {
    timeZone: 'America/Mexico_City',
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date)
}

export default function BookingFlow({ api = bookingApi, PaymentComponent = StripeDepositStep, initialPatient }) {
  const [options, setOptions] = useState(null)
  const [step, setStep] = useState(0)
  const [selectedType, setSelectedType] = useState(null)
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [patient, setPatient] = useState(initialPatient || { fullName: '', email: '', phone: '' })
  const [payment, setPayment] = useState(null)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let active = true
    api.getOptions()
      .then((data) => { if (active) setOptions(data) })
      .catch((loadError) => { if (active) setError(loadError) })
    return () => { active = false }
  }, [api])

  const slots = useMemo(() => options?.slots?.filter((slot) => slot.doctorId === selectedDoctor?.id) || [], [options, selectedDoctor])

  async function startPayment(event) {
    event.preventDefault()
    if (submitting) return
    setSubmitting(true)
    setError(null)
    try {
      const hold = await api.createHold({
        appointmentTypeId: selectedType.id,
        doctorId: selectedDoctor.id,
        startsAt: selectedSlot.startsAt,
        patient,
      })
      const session = await api.createCheckoutSession({ holdId: hold.holdId })
      setPayment({ ...hold, ...session })
      setStep(4)
    } catch (submitError) {
      setError(submitError)
    } finally {
      setSubmitting(false)
    }
  }

  function backToSlots() {
    setError(null)
    setSelectedSlot(null)
    setStep(2)
    api.getOptions().then(setOptions).catch(setError)
  }

  if (!options && !error) return <div className="booking-flow__loading" aria-label="Cargando disponibilidad" />

  return (
    <div className="booking-flow">
      <ol className="booking-flow__progress" aria-label="Progreso de reserva">
        {STEP_LABELS.map((label, index) => (
          <li key={label} className={index === step ? 'is-current' : index < step ? 'is-complete' : ''}>
            <span>{index < step ? <Check aria-hidden="true" size={14} /> : index + 1}</span>{label}
          </li>
        ))}
      </ol>

      {error && (
        <div className="booking-flow__error" role="alert">
          <p>{error.message || 'No pudimos cargar la reserva.'}</p>
          {error.code === 'slot_conflict' && <button type="button" onClick={backToSlots}>Elegir otro horario</button>}
          {!options && <a href={SITE_CONTENT.phone.whatsappUrl}>Agendar por WhatsApp</a>}
        </div>
      )}

      {options && step === 0 && (
        <section className="booking-flow__step">
          <p className="editorial-kicker">01 · Tratamiento</p>
          <h2>¿Qué quieres valorar?</h2>
          <div className="booking-flow__choices">
            {options.appointmentTypes.map((type) => (
              <button key={type.id} type="button" onClick={() => { setSelectedType(type); setStep(1) }}>
                <strong>{type.name}</strong><span>{type.description}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {options && step === 1 && (
        <section className="booking-flow__step">
          <button className="booking-flow__back" type="button" onClick={() => setStep(0)}><ChevronLeft aria-hidden="true" size={17} />Anterior</button>
          <p className="editorial-kicker">02 · Especialista</p>
          <h2>Elige especialista.</h2>
          <div className="booking-flow__choices">
            {options.doctors.map((doctor) => (
              <button key={doctor.id} type="button" onClick={() => { setSelectedDoctor(doctor); setStep(2) }}>
                <strong>{doctor.name}</strong><span>{doctor.specialty}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {options && step === 2 && (
        <section className="booking-flow__step">
          <button className="booking-flow__back" type="button" onClick={() => setStep(1)}><ChevronLeft aria-hidden="true" size={17} />Anterior</button>
          <p className="editorial-kicker">03 · Horario</p>
          <h2>Selecciona fecha y hora.</h2>
          {slots.length ? (
            <div className="booking-flow__slots">
              {slots.map((slot) => (
                <button key={slot.startsAt} type="button" onClick={() => { setSelectedSlot(slot); setStep(3) }}>{formatSlot(slot.startsAt)}</button>
              ))}
            </div>
          ) : <p className="booking-flow__empty">No hay horarios disponibles en este periodo.</p>}
        </section>
      )}

      {options && step === 3 && (
        <section className="booking-flow__step">
          <button className="booking-flow__back" type="button" onClick={() => setStep(2)}><ChevronLeft aria-hidden="true" size={17} />Anterior</button>
          <p className="editorial-kicker">04 · Tus datos</p>
          <h2>Confirma tu valoración.</h2>
          <div className="booking-flow__summary"><strong>{selectedType.name}</strong><span>{selectedDoctor.name}</span><span>{formatSlot(selectedSlot.startsAt)}</span></div>
          <form className="booking-flow__form" onSubmit={startPayment}>
            <label>Nombre completo<input required value={patient.fullName} onChange={(event) => setPatient({ ...patient, fullName: event.target.value })} autoComplete="name" /></label>
            <label>Correo<input required type="email" value={patient.email} onChange={(event) => setPatient({ ...patient, email: event.target.value })} autoComplete="email" /></label>
            <label>Teléfono<input required type="tel" value={patient.phone} onChange={(event) => setPatient({ ...patient, phone: event.target.value })} autoComplete="tel" /></label>
            <button className="btn-primary" type="submit" disabled={submitting}>{submitting ? 'Reservando…' : 'Continuar al pago'}</button>
          </form>
          <p className="booking-flow__disclaimer">El anticipo es el 30% del precio de la cita. El servidor calcula el importe y Stripe procesa el pago de forma segura.</p>
        </section>
      )}

      {payment && step === 4 && (
        <section className="booking-flow__step booking-flow__payment">
          <p className="editorial-kicker">05 · Pago seguro</p>
          <h2>Confirma tu cita.</h2>
          <div className="booking-flow__amounts">
            <p><span>Precio de la cita</span><strong>{formatMoney(payment.totalMxnMinor, payment.currency)}</strong></p>
            <p><span>Anticipo 30%</span><strong>{formatMoney(payment.depositMxnMinor, payment.currency)}</strong></p>
          </div>
          <PaymentComponent clientSecret={payment.clientSecret} />
        </section>
      )}
    </div>
  )
}
