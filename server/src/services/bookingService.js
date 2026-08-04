import { calculateDepositMinor } from '../../../src/booking/deposit.js'

const BOOKING_TIME_ZONE = 'America/Mexico_City'
const SLOT_INTERVAL_MINUTES = 30
const BOOKING_RANGE_DAYS = 90
const DAY_MS = 24 * 60 * 60_000

function bookingError(code, message, status = 400, retryable = false) {
  const error = new Error(message)
  error.code = code
  error.status = status
  error.retryable = retryable
  error.expose = true
  return error
}

function required(value, code, message) {
  if (!value || (typeof value === 'string' && !value.trim())) throw bookingError(code, message)
  return value
}

function localParts(date, timeZone = BOOKING_TIME_ZONE) {
  return Object.fromEntries(new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date).filter(({ type }) => type !== 'literal').map(({ type, value }) => [type, Number(value)]))
}

function zonedDateTime(year, month, day, hour = 0, minute = 0, timeZone = BOOKING_TIME_ZONE) {
  const wanted = Date.UTC(year, month - 1, day, hour, minute)
  let instant = wanted
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const parts = localParts(new Date(instant), timeZone)
    const observed = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute)
    instant += wanted - observed
  }
  return new Date(instant)
}

function clockMinutes(value) {
  const [hour, minute] = String(value).split(':').map(Number)
  return hour * 60 + minute
}

function overlaps(start, end, busy) {
  return start < new Date(busy.endAt) && end > new Date(busy.startAt)
}

function slotFitsAvailability(startsAt, endsAt, availability) {
  const start = localParts(startsAt)
  const end = localParts(endsAt)
  if (start.year !== end.year || start.month !== end.month || start.day !== end.day) return false
  const weekday = new Date(Date.UTC(start.year, start.month - 1, start.day)).getUTCDay()
  const startMinute = start.hour * 60 + start.minute
  const endMinute = end.hour * 60 + end.minute
  return availability.some((window) => (
    window.dayOfWeek === weekday
    && startMinute >= clockMinutes(window.startTime)
    && endMinute <= clockMinutes(window.endTime)
  ))
}

function validateSlotBoundary(startsAt, rangeStart) {
  const rangeEnd = new Date(rangeStart.getTime() + BOOKING_RANGE_DAYS * DAY_MS)
  const parts = localParts(startsAt)
  if (startsAt <= rangeStart || startsAt > rangeEnd || parts.second !== 0 || parts.minute % SLOT_INTERVAL_MINUTES !== 0) {
    throw bookingError('invalid_slot', 'El horario seleccionado no es válido')
  }
}

function monthBounds(month) {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) throw bookingError('invalid_request', 'El mes no es válido')
  const [year, monthNumber] = month.split('-').map(Number)
  return {
    year,
    monthNumber,
    start: zonedDateTime(year, monthNumber, 1),
    end: zonedDateTime(year, monthNumber + 1, 1),
    days: new Date(Date.UTC(year, monthNumber, 0)).getUTCDate(),
  }
}

function slotConflict() {
  return bookingError('slot_conflict', 'Ese horario acaba de ocuparse', 409, true)
}

export function createBookingService({ store, stripe, publicWebUrl, paymentsEnabled = false, now = () => new Date() }) {
  return {
    async getOptions() {
      const [appointmentTypes, doctors] = await Promise.all([
        store.listAppointmentTypes(),
        store.listDoctors(),
      ])
      return { appointmentTypes, doctors, paymentsEnabled: Boolean(paymentsEnabled) }
    },

    async getAvailability(input = {}) {
      const doctorId = required(input.doctorId, 'invalid_request', 'Selecciona un especialista')
      const appointmentTypeId = required(input.appointmentTypeId, 'invalid_request', 'Selecciona un tratamiento')
      required(input.variantId, 'invalid_request', 'Selecciona una variante')
      const bounds = monthBounds(required(input.month, 'invalid_request', 'Selecciona un mes'))
      const rangeStart = now()
      const rangeEnd = new Date(rangeStart.getTime() + BOOKING_RANGE_DAYS * DAY_MS)
      if (bounds.end <= rangeStart || bounds.start > rangeEnd) throw bookingError('invalid_range', 'El mes está fuera del periodo de reserva')

      const [variant, doctor] = await Promise.all([
        store.getAppointmentVariant({ appointmentTypeId, variantId: input.variantId }),
        store.getActiveDoctor(doctorId),
      ])
      if (!variant) throw bookingError('invalid_variant', 'La variante no está disponible')
      if (!doctor) throw bookingError('slot_unavailable', 'El especialista no está disponible', 409)
      const durationMinutes = variant.durationMinutes || SLOT_INTERVAL_MINUTES
      const [availability, busyIntervals] = await Promise.all([
        store.listAvailability({ doctorId }),
        store.listBusyIntervals({ doctorId, from: bounds.start.toISOString(), to: bounds.end.toISOString(), now: rangeStart.toISOString() }),
      ])

      const slots = []
      for (let day = 1; day <= bounds.days; day += 1) {
        const weekday = new Date(Date.UTC(bounds.year, bounds.monthNumber - 1, day)).getUTCDay()
        for (const window of availability.filter((item) => item.dayOfWeek === weekday)) {
          const windowStart = clockMinutes(window.startTime)
          const windowEnd = clockMinutes(window.endTime)
          for (let minute = windowStart; minute + durationMinutes <= windowEnd; minute += SLOT_INTERVAL_MINUTES) {
            const startsAt = zonedDateTime(bounds.year, bounds.monthNumber, day, Math.floor(minute / 60), minute % 60)
            const endsAt = new Date(startsAt.getTime() + durationMinutes * 60_000)
            if (startsAt <= rangeStart || startsAt > rangeEnd) continue
            if (busyIntervals.some((busy) => overlaps(startsAt, endsAt, busy))) continue
            slots.push({ startsAt: startsAt.toISOString(), endsAt: endsAt.toISOString() })
          }
        }
      }

      return { month: input.month, timeZone: BOOKING_TIME_ZONE, intervalMinutes: SLOT_INTERVAL_MINUTES, slots }
    },

    async createHold(input = {}) {
      const appointmentTypeId = required(input.appointmentTypeId, 'invalid_request', 'Selecciona un tratamiento')
      const variantId = required(input.variantId, 'invalid_request', 'Selecciona una variante')
      const doctorId = required(input.doctorId, 'invalid_request', 'Selecciona un especialista')
      const startsAt = new Date(required(input.startsAt, 'invalid_request', 'Selecciona un horario'))
      if (Number.isNaN(startsAt.getTime())) throw bookingError('invalid_slot', 'El horario seleccionado no es válido')
      const rangeStart = now()
      validateSlotBoundary(startsAt, rangeStart)
      required(input.patient?.fullName, 'invalid_patient', 'Indica el nombre del paciente')
      required(input.patient?.email, 'invalid_patient', 'Indica el correo del paciente')
      required(input.patient?.phone, 'invalid_patient', 'Indica el teléfono del paciente')

      const [variant, doctor, availability] = await Promise.all([
        store.getAppointmentVariant({ appointmentTypeId, variantId }),
        store.getActiveDoctor(doctorId),
        store.listAvailability({ doctorId }),
      ])
      if (!variant) throw bookingError('invalid_variant', 'La variante no está disponible')
      if (!doctor) throw bookingError('slot_unavailable', 'El especialista no está disponible', 409)
      if (!Number.isSafeInteger(variant.priceMxnMinor) || variant.priceMxnMinor <= 0) {
        throw bookingError('price_unavailable', 'Esta variante aún no tiene un precio reservable', 409)
      }

      const endsAt = new Date(startsAt.getTime() + variant.durationMinutes * 60_000)
      if (!slotFitsAvailability(startsAt, endsAt, availability)) {
        throw bookingError('slot_unavailable', 'El horario no está dentro de la disponibilidad del especialista', 409)
      }
      const busyIntervals = await store.listBusyIntervals({
        doctorId,
        from: startsAt.toISOString(),
        to: endsAt.toISOString(),
        now: rangeStart.toISOString(),
      })
      if (busyIntervals.some((busy) => overlaps(startsAt, endsAt, busy))) throw slotConflict()
      const depositMxnMinor = calculateDepositMinor(variant.priceMxnMinor)

      let hold
      try {
        hold = await store.createHold({
          appointmentTypeId,
          variantId,
          appointmentTypeName: variant.appointmentTypeName,
          doctorId,
          startsAt: startsAt.toISOString(),
          endsAt: endsAt.toISOString(),
          durationMinutes: variant.durationMinutes,
          patient: {
            fullName: input.patient.fullName.trim(),
            email: input.patient.email.trim().toLowerCase(),
            phone: input.patient.phone.trim(),
          },
          priceMxnMinor: variant.priceMxnMinor,
          depositRateBps: 3000,
          depositMxnMinor,
        })
      } catch (error) {
        if (error.code === '23505' || error.code === 'slot_conflict') throw slotConflict()
        if (error.code === 'invalid_variant') throw bookingError('invalid_variant', 'La variante no está disponible')
        if (error.code === 'invalid_slot') throw bookingError('invalid_slot', 'El horario seleccionado no es válido')
        if (error.code === 'slot_unavailable') throw bookingError('slot_unavailable', 'El horario no está disponible', 409)
        throw error
      }

      return {
        holdId: hold.id,
        totalMxnMinor: hold.priceMxnMinor,
        depositMxnMinor: hold.depositMxnMinor,
        currency: 'mxn',
        expiresAt: hold.expiresAt,
      }
    },

    async createCheckoutSession({ holdId } = {}) {
      if (!paymentsEnabled) throw bookingError('payments_disabled', 'Online payments are disabled', 503)
      required(holdId, 'invalid_request', 'Falta la retención de cita')
      const hold = await store.getHold(holdId)
      if (!hold || !['active', 'checkout_created'].includes(hold.status)) throw bookingError('hold_unavailable', 'La retención ya no está disponible', 409, true)
      if (new Date(hold.expiresAt) <= now()) throw bookingError('hold_expired', 'La retención expiró; elige el horario de nuevo', 409, true)

      let price
      try {
        price = hold.stripeDepositPriceId && await stripe.prices.retrieve(hold.stripeDepositPriceId)
      } catch {
        throw bookingError('payment_catalog_mismatch', 'The payment catalog is not ready', 503)
      }
      const productId = typeof price?.product === 'string' ? price.product : price?.product?.id
      if (
        !price?.active
        || price.currency !== 'mxn'
        || price.type !== 'one_time'
        || price.unit_amount !== hold.depositMxnMinor
        || productId !== hold.stripeProductId
      ) {
        throw bookingError('payment_catalog_mismatch', 'The payment catalog is not ready', 503)
      }

      const session = await stripe.checkout.sessions.create({
        ui_mode: 'embedded',
        mode: 'payment',
        line_items: [{
          quantity: 1,
          price: hold.stripeDepositPriceId,
        }],
        metadata: { booking_hold_id: hold.id },
        return_url: `${publicWebUrl}/citas?session_id={CHECKOUT_SESSION_ID}`,
      }, { idempotencyKey: `booking-hold-${hold.id}` })

      await store.markCheckoutCreated({ holdId: hold.id, sessionId: session.id })
      return { sessionId: session.id, clientSecret: session.client_secret }
    },

    getSession(sessionId) {
      required(sessionId, 'invalid_request', 'Falta el id de sesión')
      return store.getSession(sessionId)
    },

    async processWebhook(event) {
      const claimed = await store.claimWebhookEvent(event.id, event.type)
      if (event.type === 'checkout.session.completed') {
        const payment = await store.completePayment({ eventId: event.id, session: event.data.object })
        return {
          duplicate: !claimed || Boolean(payment.duplicate),
          outcome: payment.outcome,
          manualReview: payment.outcome === 'manual_review',
        }
      } else if (event.type === 'checkout.session.expired') {
        if (!claimed) return { duplicate: true }
        await store.releaseExpiredHold({ eventId: event.id, session: event.data.object })
      }
      return { duplicate: false }
    },
  }
}
