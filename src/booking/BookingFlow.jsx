import { useEffect, useMemo, useState } from 'react'
import { Check, ChevronLeft, CreditCard, MessageCircle } from 'lucide-react'
import { bookingApi } from '../services/bookingApi.js'
import { SITE_CONTENT } from '../data/siteContent.js'
import { TREATMENTS, getTreatmentBySlug } from '../data/treatments.js'
import BookingCalendar from './BookingCalendar.jsx'
import BookingSummary from './BookingSummary.jsx'
import StripeDepositStep from './StripeDepositStep.jsx'
import {
  fallbackSlots,
  formatBookingDate,
  formatBookingTime,
  initialMonth,
  monthKey,
} from './bookingCalendar.js'

const STEP_LABELS = ['Tratamiento', 'Especialista', 'Fecha y hora', 'Tus datos', 'Pago']
const FALLBACK_DOCTORS = [{ id: 'bouclier-gissel', name: SITE_CONTENT.doctor.name, specialty: SITE_CONTENT.doctor.title }]
const SYSTEM_NOW = () => new Date()

function localVariants(treatment) {
  const active = treatment.variants.filter(({ active, priceMxnMinor }) => active && priceMxnMinor > 0)
  if (active.length) return active.map((variant) => ({ ...variant, apiAvailable: false }))
  return [{
    id: treatment.variants[0]?.id || `quote-${treatment.slug}`,
    name: treatment.variants[0]?.name === 'Default Title' ? 'Valoración personalizada' : treatment.variants[0]?.name || 'Valoración personalizada',
    priceMxnMinor: 0,
    active: false,
    apiAvailable: false,
  }]
}

const LOCAL_TYPES = TREATMENTS.map((treatment) => ({
  id: treatment.slug,
  appointmentTypeId: treatment.slug,
  slug: treatment.slug,
  name: treatment.name,
  description: treatment.summary,
  durationMinutes: treatment.durationMinutes,
  variants: localVariants(treatment),
  apiAvailable: false,
}))

function comparable(value) {
  return value?.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
}

function mergeAppointmentTypes(apiTypes = []) {
  const matchedApiIds = new Set()
  const local = LOCAL_TYPES.map((type) => {
    const apiType = apiTypes.find((candidate) => candidate.slug === type.slug || comparable(candidate.name) === comparable(type.name))
    if (!apiType) return type
    matchedApiIds.add(apiType.id)
    const apiVariants = apiType.variants || []
    const variants = type.variants.map((variant) => {
      const match = apiVariants.find((candidate) => String(candidate.id) === String(variant.id) || comparable(candidate.name) === comparable(variant.name))
      return match ? { ...variant, ...match, apiAvailable: true } : variant
    })
    for (const apiVariant of apiVariants) {
      if (!variants.some(({ id }) => String(id) === String(apiVariant.id))) variants.push({ ...apiVariant, apiAvailable: true })
    }
    return {
      ...type,
      ...apiType,
      slug: type.slug,
      appointmentTypeId: apiType.id,
      durationMinutes: apiType.durationMinutes || type.durationMinutes,
      variants,
      apiAvailable: true,
    }
  })
  return [
    ...local,
    ...apiTypes.filter(({ id }) => !matchedApiIds.has(id)).map((type) => ({
      ...type,
      slug: type.slug || String(type.id),
      appointmentTypeId: type.id,
      variants: (type.variants || []).map((variant) => ({ ...variant, apiAvailable: true })),
      apiAvailable: true,
    })),
  ]
}

function initialSelection() {
  if (typeof window === 'undefined') return { treatment: null, variant: null }
  const query = new URLSearchParams(window.location.search)
  const treatment = getTreatmentBySlug(query.get('tratamiento'))
  if (!treatment) return { treatment: null, variant: null }
  const type = LOCAL_TYPES.find(({ slug }) => slug === treatment.slug)
  const variantId = query.get('variante')
  const variant = type.variants.find(({ id }) => String(id) === variantId) || type.variants[0]
  return { treatment: type, variant }
}

function formatMoney(minor, currency = 'mxn') {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: currency.toUpperCase() }).format(minor / 100)
}

function whatsappUrl({ treatment, variant, doctor, slot, patient }) {
  const details = [
    'Hola, quiero solicitar esta cita en Bouclier:',
    `Tratamiento: ${treatment?.name || 'Por confirmar'}`,
    `Variante: ${variant?.name || 'Por confirmar'}`,
    `Especialista: ${doctor?.name || 'Por confirmar'}`,
    `Fecha: ${slot ? formatBookingDate(new Date(slot.startsAt)) : 'Por confirmar'}`,
    `Hora: ${slot ? formatBookingTime(new Date(slot.startsAt)) : 'Por confirmar'}`,
    `Paciente: ${patient.fullName || 'Por confirmar'}`,
    `Teléfono: ${patient.phone || 'Por confirmar'}`,
    `Correo: ${patient.email || 'Por confirmar'}`,
  ].join('\n')
  return `https://api.whatsapp.com/send?phone=${SITE_CONTENT.phone.e164.replace(/\D/g, '')}&text=${encodeURIComponent(details)}`
}

export default function BookingFlow({ api = bookingApi, PaymentComponent = StripeDepositStep, initialPatient, now = SYSTEM_NOW }) {
  const seeded = useMemo(initialSelection, [])
  const [appointmentTypes, setAppointmentTypes] = useState(LOCAL_TYPES)
  const [doctors, setDoctors] = useState(FALLBACK_DOCTORS)
  const [paymentsEnabled, setPaymentsEnabled] = useState(false)
  const [apiUnavailable, setApiUnavailable] = useState(false)
  const [step, setStep] = useState(0)
  const [selectedType, setSelectedType] = useState(seeded.treatment)
  const [selectedVariant, setSelectedVariant] = useState(seeded.variant)
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [selectedDay, setSelectedDay] = useState(null)
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [month, setMonth] = useState(() => initialMonth(now()))
  const [slots, setSlots] = useState([])
  const [patient, setPatient] = useState(initialPatient || { fullName: '', email: '', phone: '' })
  const [payment, setPayment] = useState(null)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const canPayOnline = Boolean(paymentsEnabled && !apiUnavailable && selectedType?.apiAvailable && selectedVariant?.apiAvailable)

  useEffect(() => {
    let active = true
    api.getOptions()
      .then((data) => {
        if (!active) return
        const merged = mergeAppointmentTypes(data.appointmentTypes)
        setAppointmentTypes(merged)
        setDoctors(data.doctors?.length ? data.doctors : FALLBACK_DOCTORS)
        setPaymentsEnabled(Boolean(data.paymentsEnabled))
      })
      .catch((loadError) => {
        if (!active) return
        setApiUnavailable(true)
        setError(loadError)
      })
    return () => { active = false }
  }, [api])

  useEffect(() => {
    if (!selectedType) return
    const updated = appointmentTypes.find(({ slug }) => slug === selectedType.slug)
    if (!updated || updated === selectedType) return
    setSelectedType(updated)
    setSelectedVariant((variant) => updated.variants.find(({ id }) => String(id) === String(variant?.id)) || updated.variants[0])
  }, [appointmentTypes, selectedType])

  useEffect(() => {
    if (step !== 2 || !selectedType || !selectedVariant || !selectedDoctor) return undefined
    let active = true
    const applyFallback = () => setSlots(fallbackSlots(month, now(), selectedType.durationMinutes))
    if (apiUnavailable || !selectedType.apiAvailable || !selectedVariant.apiAvailable) {
      applyFallback()
      return undefined
    }
    setSlots([])
    api.getAvailability({
      doctorId: selectedDoctor.id,
      appointmentTypeId: selectedType.appointmentTypeId,
      variantId: selectedVariant.id,
      month: monthKey(month),
    }).then((data) => {
      if (active) setSlots(data.slots || [])
    }).catch((availabilityError) => {
      if (!active) return
      setApiUnavailable(true)
      setPaymentsEnabled(false)
      setError(availabilityError)
      applyFallback()
    })
    return () => { active = false }
  }, [api, apiUnavailable, month, now, selectedDoctor, selectedType, selectedVariant, step])

  function chooseTreatment(type) {
    setSelectedType(type)
    setSelectedVariant(type.variants[0] || null)
    setSelectedDoctor(null)
    setSelectedDay(null)
    setSelectedSlot(null)
  }

  function changeMonth(nextMonth) {
    setMonth(nextMonth)
    setSelectedDay(null)
    setSelectedSlot(null)
  }

  function chooseDay(day) {
    setSelectedDay(day)
    setSelectedSlot(null)
  }

  async function finishDetails(event) {
    event.preventDefault()
    if (submitting) return
    if (!canPayOnline) {
      setStep(4)
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const hold = await api.createHold({
        appointmentTypeId: selectedType.appointmentTypeId,
        variantId: selectedVariant.id,
        doctorId: selectedDoctor.id,
        startsAt: selectedSlot.startsAt,
        patient,
      })
      const session = await api.createCheckoutSession({ holdId: hold.holdId })
      setPayment({ ...hold, ...session })
      setStep(4)
    } catch (submitError) {
      if (submitError.code === 'api_unavailable') {
        setApiUnavailable(true)
        setPaymentsEnabled(false)
        setStep(4)
      }
      setError(submitError)
    } finally {
      setSubmitting(false)
    }
  }

  function backToSlots() {
    setError(null)
    setSelectedDay(null)
    setSelectedSlot(null)
    setStep(2)
  }

  const whatsapp = whatsappUrl({ treatment: selectedType, variant: selectedVariant, doctor: selectedDoctor, slot: selectedSlot, patient })

  return (
    <div className="booking-flow">
      <ol className="booking-flow__progress" aria-label="Progreso de reserva">
        {STEP_LABELS.map((label, index) => (
          <li key={label} className={index === step ? 'is-current' : index < step ? 'is-complete' : ''}>
            <span>{index < step ? <Check aria-hidden="true" size={14} /> : `0${index + 1}`}</span><b>{label}</b>
          </li>
        ))}
      </ol>

      {error && (
        <div className="booking-flow__error" role="alert">
          <p>{error.code === 'api_unavailable'
            ? 'La agenda en línea está temporalmente sin conexión. Puedes elegir servicio, especialista, fecha y hora y enviarnos la solicitud por WhatsApp.'
            : error.message || 'No pudimos conectar con la agenda. Puedes continuar y reservar por WhatsApp.'}</p>
          {error.code === 'slot_conflict' && <button type="button" onClick={backToSlots}>Elegir otro horario</button>}
        </div>
      )}

      {step === 0 && (
        <section className="booking-flow__step">
          <p className="editorial-kicker">01 · Tratamiento</p>
          <h2>¿Qué quieres valorar?</h2>
          <div className="booking-flow__choices booking-flow__choices--treatments">
            {appointmentTypes.map((type) => (
              <button key={type.slug} type="button" aria-pressed={selectedType?.slug === type.slug} onClick={() => chooseTreatment(type)}>
                <strong>{type.name}</strong><span>{type.description}</span>
              </button>
            ))}
          </div>
          {selectedType && (
            <fieldset className="booking-flow__variants">
              <legend>Selecciona una variante</legend>
              {selectedType.variants.map((variant) => (
                <label key={variant.id}>
                  <input type="radio" name="booking-variant" checked={selectedVariant?.id === variant.id} onChange={() => setSelectedVariant(variant)} />
                  <span><strong>{variant.name}</strong>{variant.priceMxnMinor > 0 ? formatMoney(variant.priceMxnMinor) : 'Cotizar en valoración'}</span>
                </label>
              ))}
            </fieldset>
          )}
          <button className="btn-primary" type="button" disabled={!selectedType || !selectedVariant} onClick={() => setStep(1)}>Continuar con el especialista</button>
        </section>
      )}

      {step === 1 && (
        <section className="booking-flow__step">
          <button className="booking-flow__back" type="button" onClick={() => setStep(0)}><ChevronLeft aria-hidden="true" size={17} />Anterior</button>
          <p className="editorial-kicker">02 · Especialista</p>
          <h2>Elige especialista.</h2>
          <div className="booking-flow__choices">
            {doctors.map((doctor) => (
              <button key={doctor.id} type="button" onClick={() => { setSelectedDoctor(doctor); setStep(2) }}>
                <strong>{doctor.name}</strong><span>{doctor.specialty}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {step === 2 && (
        <section className="booking-flow__step booking-flow__step--wide">
          <button className="booking-flow__back" type="button" onClick={() => setStep(1)}><ChevronLeft aria-hidden="true" size={17} />Anterior</button>
          <div className="booking-flow__step-heading"><div><p className="editorial-kicker">03 · Fecha y hora</p><h1>Selecciona fecha y hora</h1><p>Elige el día y horario que mejor se adapte a ti.</p></div></div>
          <div className="booking-flow__calendar-layout">
            <BookingCalendar
              month={month}
              now={now()}
              slots={slots}
              selectedDay={selectedDay}
              selectedSlot={selectedSlot}
              onMonthChange={changeMonth}
              onDayChange={chooseDay}
              onSlotChange={setSelectedSlot}
            />
            <div>
              <BookingSummary treatment={selectedType} variant={selectedVariant} doctor={selectedDoctor} slot={selectedSlot} />
              <button className="btn-primary booking-flow__continue" type="button" disabled={!selectedSlot} onClick={() => setStep(3)}>Continuar con mis datos</button>
            </div>
          </div>
        </section>
      )}

      {step === 3 && (
        <section className="booking-flow__step">
          <button className="booking-flow__back" type="button" onClick={() => setStep(2)}><ChevronLeft aria-hidden="true" size={17} />Anterior</button>
          <p className="editorial-kicker">04 · Tus datos</p>
          <h2>Confirma tu valoración.</h2>
          <BookingSummary treatment={selectedType} variant={selectedVariant} doctor={selectedDoctor} slot={selectedSlot} />
          <form className="booking-flow__form" onSubmit={finishDetails}>
            <label>Nombre completo<input required value={patient.fullName} onChange={(event) => setPatient({ ...patient, fullName: event.target.value })} autoComplete="name" /></label>
            <label>Correo<input required type="email" value={patient.email} onChange={(event) => setPatient({ ...patient, email: event.target.value })} autoComplete="email" /></label>
            <label>Teléfono<input required type="tel" value={patient.phone} onChange={(event) => setPatient({ ...patient, phone: event.target.value })} autoComplete="tel" /></label>
            <button className="btn-primary" type="submit" disabled={submitting}>{submitting ? 'Reservando…' : canPayOnline ? 'Continuar al pago' : 'Continuar a confirmación'}</button>
          </form>
        </section>
      )}

      {step === 4 && (
        <section className="booking-flow__step booking-flow__payment">
          <p className="editorial-kicker">05 · Pago</p>
          {payment && canPayOnline ? (
            <>
              <h2>Confirma tu cita.</h2>
              <div className="booking-flow__amounts">
                <p><span>Precio de la cita</span><strong>{formatMoney(payment.totalMxnMinor, payment.currency)}</strong></p>
                <p><span>Anticipo 30%</span><strong>{formatMoney(payment.depositMxnMinor, payment.currency)}</strong></p>
              </div>
              <PaymentComponent clientSecret={payment.clientSecret} />
            </>
          ) : (
            <div className="booking-flow__offline-payment">
              <CreditCard aria-hidden="true" />
              <h2>Pago online próximamente</h2>
              <p>Conservamos tu selección. Envíala por WhatsApp para que el equipo confirme disponibilidad y seguimiento.</p>
              <a className="btn-primary" href={whatsapp} target="_blank" rel="noreferrer"><MessageCircle aria-hidden="true" />Reservar por WhatsApp</a>
            </div>
          )}
        </section>
      )}

      {step < 4 && (
        <footer className="booking-flow__fallback-bar">
          <span><CreditCard aria-hidden="true" /><b>Pago online próximamente</b></span>
          <a href={whatsapp} target="_blank" rel="noreferrer"><MessageCircle aria-hidden="true" />Reservar por WhatsApp</a>
        </footer>
      )}
    </div>
  )
}
