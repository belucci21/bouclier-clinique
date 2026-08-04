import { describe, expect, it, vi } from 'vitest'
import { createSupabaseBookingStore } from '../src/services/supabaseBookingStore.js'

describe('Supabase booking store', () => {
  it('probes an authoritative table for runtime readiness', async () => {
    const limit = vi.fn().mockResolvedValue({ data: [], error: null })
    const select = vi.fn(() => ({ limit }))
    const supabase = { from: vi.fn(() => ({ select })) }
    const store = createSupabaseBookingStore(supabase)

    await expect(store.checkHealth()).resolves.toBeUndefined()
    expect(supabase.from).toHaveBeenCalledWith('appointment_variants')
    expect(select).toHaveBeenCalledWith('id', { head: true, count: 'exact' })
    expect(limit).toHaveBeenCalledWith(1)
  })

  it('rejects payment readiness when an active variant lacks catalog identifiers', async () => {
    const appointmentTypeEq = vi.fn().mockResolvedValue({
      data: [{ id: 'variant_face', stripe_product_id: 'prod_1', stripe_deposit_price_id: null }],
      error: null,
    })
    const variantEq = vi.fn(() => ({ eq: appointmentTypeEq }))
    const select = vi.fn(() => ({ eq: variantEq }))
    const supabase = { from: vi.fn(() => ({ select })) }
    const store = createSupabaseBookingStore(supabase)

    await expect(store.checkPaymentCatalog()).rejects.toThrow('payment_catalog_incomplete')
    expect(appointmentTypeEq).toHaveBeenCalledWith('appointment_types.is_active', true)
  })

  it('loads only active authoritative variants for the server-side catalog sync', async () => {
    const order = vi.fn().mockResolvedValue({
      data: [{
        id: 'variant_face',
        name: 'Facial',
        price_mxn_minor: 100000,
        stripe_product_id: 'prod_1',
        stripe_deposit_price_id: 'price_1',
        appointment_type_id: 'type_hydra',
        appointment_types: { name: 'Hydrafacial' },
      }],
      error: null,
    })
    const secondEq = vi.fn(() => ({ order }))
    const firstEq = vi.fn(() => ({ eq: secondEq }))
    const select = vi.fn(() => ({ eq: firstEq }))
    const supabase = { from: vi.fn(() => ({ select })) }
    const store = createSupabaseBookingStore(supabase)

    await expect(store.listActiveCatalogVariants()).resolves.toEqual([{
      id: 'variant_face',
      name: 'Facial',
      priceMxnMinor: 100000,
      appointmentTypeId: 'type_hydra',
      appointmentTypeName: 'Hydrafacial',
      stripeProductId: 'prod_1',
      stripeDepositPriceId: 'price_1',
    }])
    expect(firstEq).toHaveBeenCalledWith('is_active', true)
    expect(secondEq).toHaveBeenCalledWith('appointment_types.is_active', true)
  })

  it('persists the synchronized Product and Price identifiers together', async () => {
    const eq = vi.fn().mockResolvedValue({ data: null, error: null })
    const update = vi.fn(() => ({ eq }))
    const supabase = { from: vi.fn(() => ({ update })) }
    const store = createSupabaseBookingStore(supabase)

    await store.updateVariantStripeCatalog({
      variantId: 'variant_face', stripeProductId: 'prod_1', stripeDepositPriceId: 'price_1',
    })

    expect(update).toHaveBeenCalledWith({
      stripe_product_id: 'prod_1', stripe_deposit_price_id: 'price_1', updated_at: expect.any(String),
    })
    expect(eq).toHaveBeenCalledWith('id', 'variant_face')
  })

  it('creates a hold through the atomic database function and returns authoritative money', async () => {
    const supabase = {
      rpc: vi.fn().mockResolvedValue({
        data: [{
          id: 'hold_1',
          expires_at: '2026-08-04T12:30:00.000Z',
          price_mxn_minor: 120000,
          duration_minutes: 90,
          deposit_mxn_minor: 36000,
        }],
        error: null,
      }),
    }
    const store = createSupabaseBookingStore(supabase)

    const hold = await store.createHold({
      appointmentTypeId: 'type_1',
      variantId: 'variant_1',
      doctorId: 'doctor_1',
      startsAt: '2026-08-05T16:00:00.000Z',
      patient: { fullName: 'Ana Pérez', email: 'ana@example.com', phone: '+522291234567' },
      depositRateBps: 3000,
    })

    expect(hold).toEqual({
      id: 'hold_1',
      expiresAt: '2026-08-04T12:30:00.000Z',
      priceMxnMinor: 120000,
      durationMinutes: 90,
      depositMxnMinor: 36000,
    })
    expect(supabase.rpc).toHaveBeenCalledWith('create_booking_hold_atomic', {
      p_appointment_type_id: 'type_1',
      p_appointment_variant_id: 'variant_1',
      p_doctor_id: 'doctor_1',
      p_starts_at: '2026-08-05T16:00:00.000Z',
      p_patient_full_name: 'Ana Pérez',
      p_patient_email: 'ana@example.com',
      p_patient_phone: '+522291234567',
      p_deposit_rate_bps: 3000,
    })
  })

  it('retrieves true overlapping intervals in SQL without a fixed lookback assumption', async () => {
    const supabase = {
      rpc: vi.fn().mockResolvedValue({
        data: [{
          start_at: '2026-07-01T16:00:00.000Z',
          end_at: '2026-08-05T17:00:00.000Z',
          source: 'appointment',
        }],
        error: null,
      }),
    }
    const store = createSupabaseBookingStore(supabase)

    const intervals = await store.listBusyIntervals({
      doctorId: 'doctor_1',
      from: '2026-08-05T16:00:00.000Z',
      to: '2026-08-05T18:00:00.000Z',
      now: '2026-08-04T12:00:00.000Z',
    })

    expect(intervals).toEqual([{
      startAt: '2026-07-01T16:00:00.000Z',
      endAt: '2026-08-05T17:00:00.000Z',
      source: 'appointment',
    }])
    expect(supabase.rpc).toHaveBeenCalledWith('list_booking_busy_intervals', {
      p_doctor_id: 'doctor_1',
      p_from: '2026-08-05T16:00:00.000Z',
      p_to: '2026-08-05T18:00:00.000Z',
      p_now: '2026-08-04T12:00:00.000Z',
    })
  })

  it('maps database exception messages to booking error codes', async () => {
    const supabase = {
      rpc: vi.fn().mockResolvedValue({
        data: null,
        error: { code: 'P0001', message: 'slot_conflict' },
      }),
    }
    const store = createSupabaseBookingStore(supabase)

    await expect(store.createHold({
      appointmentTypeId: 'type_1',
      variantId: 'variant_1',
      doctorId: 'doctor_1',
      startsAt: '2026-08-05T16:00:00.000Z',
      patient: { fullName: 'Ana Pérez', email: 'ana@example.com', phone: '+522291234567' },
      depositRateBps: 3000,
    })).rejects.toMatchObject({ code: 'slot_conflict' })
  })

  it('maps the deterministic payment completion result', async () => {
    const supabase = {
      rpc: vi.fn().mockResolvedValue({
        data: {
          outcome: 'manual_review',
          appointment_id: null,
          hold_id: 'hold_1',
          reason: 'slot_conflict',
          duplicate: false,
        },
        error: null,
      }),
    }
    const store = createSupabaseBookingStore(supabase)

    await expect(store.completePayment({
      eventId: 'evt_1',
      session: { id: 'cs_1', payment_intent: 'pi_1', amount_total: 30000 },
    })).resolves.toEqual({
      outcome: 'manual_review',
      appointmentId: null,
      holdId: 'hold_1',
      reason: 'slot_conflict',
      duplicate: false,
    })
  })

  it('surfaces manual-review outcome and reason from the booking session', async () => {
    const single = vi.fn().mockResolvedValue({
      data: {
        id: 'hold_1',
        status: 'failed',
        starts_at: '2026-08-08T16:00:00.000Z',
        deposit_mxn_minor: 30000,
        scheduling_failure_reason: 'slot_conflict',
      },
      error: null,
    })
    const eq = vi.fn(() => ({ single }))
    const select = vi.fn(() => ({ eq }))
    const supabase = { from: vi.fn(() => ({ select })) }
    const store = createSupabaseBookingStore(supabase)

    await expect(store.getSession('cs_1')).resolves.toEqual({
      holdId: 'hold_1',
      status: 'failed',
      startsAt: '2026-08-08T16:00:00.000Z',
      depositMxnMinor: 30000,
      currency: 'mxn',
      outcome: 'manual_review',
      reason: 'slot_conflict',
    })
  })
})
