function intervalConflict(errorMessage = 'slot conflict') {
  const error = new Error(errorMessage)
  error.code = '23505'
  return error
}

function overlaps(start, end, interval) {
  return start < new Date(interval.endAt) && end > new Date(interval.startAt)
}

export function createSupabaseBookingStore(supabase) {
  async function unwrap(query) {
    const { data, error } = await query
    if (error) throw error
    return data
  }

  async function listBusyIntervals({ doctorId, from, to, now }) {
    const appointmentFloor = new Date(new Date(from).getTime() - 24 * 60 * 60_000).toISOString()
    const [blockedTimes, appointments, holds] = await Promise.all([
      unwrap(supabase.from('blocked_times').select('start_at,end_at').eq('doctor_id', doctorId).lt('start_at', to).gt('end_at', from)),
      unwrap(supabase.from('appointments').select('scheduled_at,duration_minutes').eq('doctor_id', doctorId).gte('scheduled_at', appointmentFloor).lt('scheduled_at', to).neq('status', 'cancelled')),
      unwrap(supabase.from('booking_holds').select('starts_at,ends_at').eq('doctor_id', doctorId).lt('starts_at', to).gt('ends_at', from).gt('expires_at', now).in('status', ['active', 'checkout_created', 'paid'])),
    ])
    return [
      ...blockedTimes.map((item) => ({ startAt: item.start_at, endAt: item.end_at, source: 'blocked_time' })),
      ...appointments.map((item) => ({
        startAt: item.scheduled_at,
        endAt: new Date(new Date(item.scheduled_at).getTime() + (item.duration_minutes || 30) * 60_000).toISOString(),
        source: 'appointment',
      })),
      ...holds.map((item) => ({ startAt: item.starts_at, endAt: item.ends_at, source: 'hold' })),
    ]
  }

  return {
    async listAppointmentTypes() {
      const data = await unwrap(supabase.from('appointment_types').select('id,name,description,duration_minutes,price_mxn_minor').eq('is_active', true).not('price_mxn_minor', 'is', null).order('name'))
      return data.map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description || 'Valoración y protocolo personalizado',
        durationMinutes: item.duration_minutes || 30,
        variants: [{ id: item.id, name: item.name, priceMxnMinor: item.price_mxn_minor, active: true }],
      }))
    },

    async listDoctors() {
      const data = await unwrap(supabase.from('doctors').select('id,specialty,profiles!doctors_id_fkey(full_name)').eq('is_active', true))
      return data.map((doctor) => ({ id: doctor.id, name: doctor.profiles?.full_name || 'Especialista Bouclier', specialty: doctor.specialty || 'Dermatología' }))
    },

    async listAvailability({ doctorId }) {
      const data = await unwrap(supabase.from('availability').select('day_of_week,start_time,end_time').eq('doctor_id', doctorId).eq('is_active', true))
      return data.map((item) => ({ dayOfWeek: item.day_of_week, startTime: item.start_time, endTime: item.end_time }))
    },

    listBusyIntervals,

    async getAppointmentType(id) {
      const data = await unwrap(supabase.from('appointment_types').select('id,name,duration_minutes,price_mxn_minor').eq('id', id).eq('is_active', true).single())
      return data && { id: data.id, name: data.name, durationMinutes: data.duration_minutes || 30, priceMxnMinor: data.price_mxn_minor }
    },

    async assertSlotAvailable({ doctorId, startsAt, endsAt, now }) {
      const intervals = await listBusyIntervals({ doctorId, from: startsAt, to: endsAt, now })
      if (intervals.some((interval) => overlaps(new Date(startsAt), new Date(endsAt), interval))) throw intervalConflict()
    },

    async createHold(record) {
      const data = await unwrap(supabase.from('booking_holds').insert({
        appointment_type_id: record.appointmentTypeId,
        doctor_id: record.doctorId,
        patient_full_name: record.patient.fullName,
        patient_email: record.patient.email,
        patient_phone: record.patient.phone,
        starts_at: record.startsAt,
        ends_at: record.endsAt,
        expires_at: record.expiresAt,
        price_mxn_minor: record.priceMxnMinor,
        deposit_rate_bps: record.depositRateBps,
        deposit_mxn_minor: record.depositMxnMinor,
      }).select('id,expires_at').single())
      return { id: data.id, expiresAt: data.expires_at }
    },

    async getHold(id) {
      const data = await unwrap(supabase.from('booking_holds').select('id,status,expires_at,deposit_mxn_minor,appointment_types(name)').eq('id', id).single())
      return data && { id: data.id, status: data.status, expiresAt: data.expires_at, depositMxnMinor: data.deposit_mxn_minor, appointmentTypeName: data.appointment_types?.name }
    },

    markCheckoutCreated({ holdId, sessionId }) {
      return unwrap(supabase.from('booking_holds').update({ status: 'checkout_created', stripe_checkout_session_id: sessionId, updated_at: new Date().toISOString() }).eq('id', holdId))
    },

    async getSession(sessionId) {
      const data = await unwrap(supabase.from('booking_holds').select('id,status,starts_at,deposit_mxn_minor').eq('stripe_checkout_session_id', sessionId).single())
      return { holdId: data.id, status: data.status, startsAt: data.starts_at, depositMxnMinor: data.deposit_mxn_minor, currency: 'mxn' }
    },

    async claimWebhookEvent(eventId, eventType) {
      const { error } = await supabase.from('stripe_webhook_events').insert({ stripe_event_id: eventId, event_type: eventType })
      if (error?.code === '23505') return false
      if (error) throw error
      return true
    },

    completePayment({ eventId, session }) {
      return unwrap(supabase.rpc('complete_booking_payment', {
        p_stripe_event_id: eventId,
        p_stripe_session_id: session.id,
        p_stripe_payment_intent_id: session.payment_intent || null,
        p_amount_mxn_minor: session.amount_total,
      }))
    },

    releaseExpiredHold({ eventId, session }) {
      return unwrap(supabase.rpc('expire_booking_hold', { p_stripe_event_id: eventId, p_stripe_session_id: session.id }))
    },
  }
}
