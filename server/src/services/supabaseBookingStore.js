export function createSupabaseBookingStore(supabase) {
  async function unwrap(query) {
    const { data, error } = await query
    if (error) throw error
    return data
  }

  return {
    async getAppointmentType(id) {
      const data = await unwrap(supabase.from('appointment_types').select('id,name,duration_minutes,price_mxn_minor').eq('id', id).eq('is_active', true).single())
      return data && { id: data.id, name: data.name, durationMinutes: data.duration_minutes, priceMxnMinor: data.price_mxn_minor }
    },

    async assertSlotAvailable({ doctorId, startsAt }) {
      const data = await unwrap(supabase.from('appointments').select('id').eq('doctor_id', doctorId).eq('scheduled_at', startsAt).neq('status', 'cancelled').limit(1))
      if (data?.length) {
        const error = new Error('slot conflict')
        error.code = '23505'
        throw error
      }
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
