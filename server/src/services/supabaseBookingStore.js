function mapRpcError(error) {
  const message = String(error?.message || '')
  for (const code of ['slot_conflict', 'slot_unavailable', 'invalid_variant', 'invalid_slot']) {
    if (message.includes(code)) error.code = code
  }
  return error
}

export function createSupabaseBookingStore(supabase) {
  async function unwrap(query) {
    const { data, error } = await query
    if (error) throw error
    return data
  }

  async function listBusyIntervals({ doctorId, from, to, now }) {
    const data = await unwrap(supabase.rpc('list_booking_busy_intervals', {
      p_doctor_id: doctorId,
      p_from: from,
      p_to: to,
      p_now: now,
    }))
    return data.map((item) => ({ startAt: item.start_at, endAt: item.end_at, source: item.source }))
  }

  return {
    acquireCatalogSyncLease(holderToken) {
      return unwrap(supabase.rpc('acquire_stripe_catalog_sync_lease', {
        p_holder_token: holderToken,
        p_ttl_seconds: 900,
      }))
    },

    renewCatalogSyncLease(holderToken) {
      return unwrap(supabase.rpc('renew_stripe_catalog_sync_lease', {
        p_holder_token: holderToken,
        p_ttl_seconds: 900,
      }))
    },

    async releaseCatalogSyncLease(holderToken) {
      await unwrap(supabase.rpc('release_stripe_catalog_sync_lease', {
        p_holder_token: holderToken,
      }))
    },

    async checkHealth() {
      await unwrap(supabase.from('appointment_variants').select('id', { head: true, count: 'exact' }).limit(1))
    },

    async checkPaymentCatalog() {
      const variants = await unwrap(
        supabase
          .from('appointment_variants')
          .select('id,stripe_product_id,stripe_deposit_price_id,appointment_types!inner(is_active)')
          .eq('is_active', true)
          .eq('appointment_types.is_active', true),
      )
      if (!variants.length || variants.some((variant) => !variant.stripe_product_id || !variant.stripe_deposit_price_id)) {
        throw new Error('payment_catalog_incomplete')
      }
    },

    async listActiveCatalogVariants() {
      const data = await unwrap(
        supabase
          .from('appointment_variants')
          .select('id,appointment_type_id,name,price_mxn_minor,stripe_product_id,stripe_deposit_price_id,appointment_types!inner(name,is_active)')
          .eq('is_active', true)
          .eq('appointment_types.is_active', true)
          .order('appointment_type_id'),
      )
      return data.map((variant) => ({
        id: variant.id,
        name: variant.name,
        priceMxnMinor: variant.price_mxn_minor,
        appointmentTypeId: variant.appointment_type_id,
        appointmentTypeName: variant.appointment_types.name,
        stripeProductId: variant.stripe_product_id,
        stripeDepositPriceId: variant.stripe_deposit_price_id,
      }))
    },

    async listCatalogVariants() {
      const data = await unwrap(
        supabase
          .from('appointment_variants')
          .select('id,appointment_type_id,name,price_mxn_minor,is_active,stripe_product_id,stripe_deposit_price_id,appointment_types(name,is_active)')
          .order('appointment_type_id'),
      )
      return data.map((variant) => ({
        id: variant.id,
        name: variant.name,
        priceMxnMinor: variant.price_mxn_minor,
        isActive: variant.is_active,
        appointmentTypeId: variant.appointment_type_id,
        appointmentTypeName: variant.appointment_types.name,
        appointmentTypeActive: variant.appointment_types.is_active,
        stripeProductId: variant.stripe_product_id,
        stripeDepositPriceId: variant.stripe_deposit_price_id,
      }))
    },

    async updateVariantStripeCatalog({
      leaseToken,
      variantId,
      expectedStripeProductId,
      expectedStripeDepositPriceId,
      stripeProductId,
      stripeDepositPriceId,
    }) {
      const updated = await unwrap(supabase.rpc('update_variant_stripe_catalog', {
        p_holder_token: leaseToken,
        p_variant_id: variantId,
        p_expected_stripe_product_id: expectedStripeProductId,
        p_expected_stripe_deposit_price_id: expectedStripeDepositPriceId,
        p_stripe_product_id: stripeProductId,
        p_stripe_deposit_price_id: stripeDepositPriceId,
      }))
      if (updated !== true) throw new Error('catalog_variant_changed')
    },

    async listAppointmentTypes() {
      const data = await unwrap(
        supabase
          .from('appointment_types')
          .select('id,name,description,duration_minutes,appointment_variants(id,name,price_mxn_minor,duration_minutes,is_active)')
          .eq('is_active', true)
          .eq('appointment_variants.is_active', true)
          .order('name'),
      )
      return data.map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description || 'Valoración y protocolo personalizado',
        durationMinutes: item.duration_minutes || 30,
        variants: (item.appointment_variants || []).map((variant) => ({
          id: variant.id,
          name: variant.name,
          priceMxnMinor: variant.price_mxn_minor,
          durationMinutes: variant.duration_minutes,
          active: variant.is_active,
        })),
      }))
    },

    async listDoctors() {
      const data = await unwrap(supabase.from('doctors').select('id,specialty,profiles!doctors_id_fkey(full_name)').eq('is_active', true))
      return data.map((doctor) => ({ id: doctor.id, name: doctor.profiles?.full_name || 'Especialista Bouclier', specialty: doctor.specialty || 'Dermatología' }))
    },

    async getActiveDoctor(id) {
      const data = await unwrap(supabase.from('doctors').select('id').eq('id', id).eq('is_active', true).maybeSingle())
      return data
    },

    async listAvailability({ doctorId }) {
      const data = await unwrap(supabase.from('availability').select('day_of_week,start_time,end_time').eq('doctor_id', doctorId).eq('is_active', true))
      return data.map((item) => ({ dayOfWeek: item.day_of_week, startTime: item.start_time, endTime: item.end_time }))
    },

    listBusyIntervals,

    async getAppointmentVariant({ appointmentTypeId, variantId }) {
      const data = await unwrap(
        supabase
          .from('appointment_variants')
          .select('id,appointment_type_id,name,price_mxn_minor,duration_minutes,is_active,appointment_types!inner(id,name,is_active)')
          .eq('id', variantId)
          .eq('appointment_type_id', appointmentTypeId)
          .eq('is_active', true)
          .eq('appointment_types.is_active', true)
          .maybeSingle(),
      )
      return data && {
        id: data.id,
        appointmentTypeId: data.appointment_type_id,
        appointmentTypeName: data.appointment_types?.name,
        name: data.name,
        priceMxnMinor: data.price_mxn_minor,
        durationMinutes: data.duration_minutes,
        active: data.is_active,
      }
    },

    async createHold(record) {
      let data
      try {
        data = await unwrap(supabase.rpc('create_booking_hold_atomic', {
          p_appointment_type_id: record.appointmentTypeId,
          p_appointment_variant_id: record.variantId,
          p_doctor_id: record.doctorId,
          p_starts_at: record.startsAt,
          p_patient_full_name: record.patient.fullName,
          p_patient_email: record.patient.email,
          p_patient_phone: record.patient.phone,
          p_deposit_rate_bps: record.depositRateBps,
        }))
      } catch (error) {
        throw mapRpcError(error)
      }
      const hold = data?.[0]
      return {
        id: hold.id,
        expiresAt: hold.expires_at,
        priceMxnMinor: hold.price_mxn_minor,
        durationMinutes: hold.duration_minutes,
        depositMxnMinor: hold.deposit_mxn_minor,
      }
    },

    async getHold(id) {
      const data = await unwrap(supabase.from('booking_holds').select('id,status,expires_at,deposit_mxn_minor,appointment_variant_id,appointment_types(name),appointment_variants(stripe_product_id,stripe_deposit_price_id)').eq('id', id).single())
      return data && {
        id: data.id,
        status: data.status,
        expiresAt: data.expires_at,
        depositMxnMinor: data.deposit_mxn_minor,
        appointmentTypeName: data.appointment_types?.name,
        appointmentVariantId: data.appointment_variant_id,
        stripeProductId: data.appointment_variants?.stripe_product_id,
        stripeDepositPriceId: data.appointment_variants?.stripe_deposit_price_id,
      }
    },

    markCheckoutCreated({ holdId, sessionId }) {
      return unwrap(supabase.from('booking_holds').update({ status: 'checkout_created', stripe_checkout_session_id: sessionId, updated_at: new Date().toISOString() }).eq('id', holdId))
    },

    async getSession(sessionId) {
      const data = await unwrap(supabase.from('booking_holds').select('id,status,starts_at,deposit_mxn_minor,scheduling_failure_reason').eq('stripe_checkout_session_id', sessionId).single())
      return {
        holdId: data.id,
        status: data.status,
        startsAt: data.starts_at,
        depositMxnMinor: data.deposit_mxn_minor,
        currency: 'mxn',
        outcome: data.status === 'paid' ? 'scheduled' : data.status === 'failed' ? 'manual_review' : 'pending',
        reason: data.scheduling_failure_reason || null,
      }
    },

    async claimWebhookEvent(eventId, eventType) {
      const { error } = await supabase.from('stripe_webhook_events').insert({ stripe_event_id: eventId, event_type: eventType })
      if (error?.code === '23505') return false
      if (error) throw error
      return true
    },

    async completePayment({ eventId, session }) {
      const data = await unwrap(supabase.rpc('complete_booking_payment', {
        p_stripe_event_id: eventId,
        p_stripe_session_id: session.id,
        p_stripe_payment_intent_id: session.payment_intent || null,
        p_amount_mxn_minor: session.amount_total,
      }))
      return {
        outcome: data.outcome,
        appointmentId: data.appointment_id,
        holdId: data.hold_id,
        reason: data.reason,
        duplicate: data.duplicate,
      }
    },

    releaseExpiredHold({ eventId, session }) {
      return unwrap(supabase.rpc('expire_booking_hold', { p_stripe_event_id: eventId, p_stripe_session_id: session.id }))
    },
  }
}
