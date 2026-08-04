import { calculateDepositMinor } from '../../../src/booking/deposit.js'

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

export function createBookingService({ store, stripe, publicWebUrl, now = () => new Date() }) {
  return {
    async createHold(input = {}) {
      const appointmentTypeId = required(input.appointmentTypeId, 'invalid_request', 'Selecciona un tratamiento')
      const doctorId = required(input.doctorId, 'invalid_request', 'Selecciona un especialista')
      const startsAt = new Date(required(input.startsAt, 'invalid_request', 'Selecciona un horario'))
      if (Number.isNaN(startsAt.getTime()) || startsAt <= now()) throw bookingError('invalid_slot', 'El horario seleccionado no es válido')
      required(input.patient?.fullName, 'invalid_patient', 'Indica el nombre del paciente')
      required(input.patient?.email, 'invalid_patient', 'Indica el correo del paciente')
      required(input.patient?.phone, 'invalid_patient', 'Indica el teléfono del paciente')

      const type = await store.getAppointmentType(appointmentTypeId)
      if (!type || !Number.isSafeInteger(type.priceMxnMinor) || type.priceMxnMinor <= 0) {
        throw bookingError('price_unavailable', 'Este tratamiento aún no tiene un precio reservable', 409)
      }

      const endsAt = new Date(startsAt.getTime() + type.durationMinutes * 60_000)
      await store.assertSlotAvailable({ doctorId, startsAt: startsAt.toISOString(), endsAt: endsAt.toISOString() })
      const depositMxnMinor = calculateDepositMinor(type.priceMxnMinor)
      const expiresAt = new Date(now().getTime() + 30 * 60_000)

      let hold
      try {
        hold = await store.createHold({
          appointmentTypeId,
          appointmentTypeName: type.name,
          doctorId,
          startsAt: startsAt.toISOString(),
          endsAt: endsAt.toISOString(),
          expiresAt: expiresAt.toISOString(),
          patient: {
            fullName: input.patient.fullName.trim(),
            email: input.patient.email.trim().toLowerCase(),
            phone: input.patient.phone.trim(),
          },
          priceMxnMinor: type.priceMxnMinor,
          depositRateBps: 3000,
          depositMxnMinor,
        })
      } catch (error) {
        if (error.code === '23505') throw bookingError('slot_conflict', 'Ese horario acaba de ocuparse', 409, true)
        throw error
      }

      return {
        holdId: hold.id,
        totalMxnMinor: type.priceMxnMinor,
        depositMxnMinor,
        currency: 'mxn',
        expiresAt: hold.expiresAt,
      }
    },

    async createCheckoutSession({ holdId } = {}) {
      required(holdId, 'invalid_request', 'Falta la retención de cita')
      const hold = await store.getHold(holdId)
      if (!hold || !['active', 'checkout_created'].includes(hold.status)) throw bookingError('hold_unavailable', 'La retención ya no está disponible', 409, true)
      if (new Date(hold.expiresAt) <= now()) throw bookingError('hold_expired', 'La retención expiró; elige el horario de nuevo', 409, true)

      const session = await stripe.checkout.sessions.create({
        ui_mode: 'embedded',
        mode: 'payment',
        line_items: [{
          quantity: 1,
          price_data: {
            currency: 'mxn',
            unit_amount: hold.depositMxnMinor,
            product_data: { name: `Anticipo 30% · ${hold.appointmentTypeName || 'Cita Bouclier'}` },
          },
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
      if (!claimed) return { duplicate: true }

      if (event.type === 'checkout.session.completed') {
        await store.completePayment({ eventId: event.id, session: event.data.object })
      } else if (event.type === 'checkout.session.expired') {
        await store.releaseExpiredHold({ eventId: event.id, session: event.data.object })
      }
      return { duplicate: false }
    },
  }
}
