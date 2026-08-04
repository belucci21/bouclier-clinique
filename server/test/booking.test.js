import request from 'supertest'
import { describe, expect, it, vi } from 'vitest'
import { createApp } from '../src/app.js'
import { createBookingService } from '../src/services/bookingService.js'

function fixture({ paymentsEnabled = false } = {}) {
  const now = new Date('2026-08-04T12:00:00.000Z')
  const store = {
    getAppointmentType: vi.fn().mockResolvedValue({ id: 'type_1', name: 'Valoración dermatológica', durationMinutes: 60, priceMxnMinor: 100000 }),
    getAppointmentVariant: vi.fn().mockResolvedValue({ id: 'variant_1', appointmentTypeId: 'type_1', name: 'Valoración', durationMinutes: 60, priceMxnMinor: 100000, active: true }),
    getActiveDoctor: vi.fn().mockResolvedValue({ id: 'doctor_1' }),
    listAvailability: vi.fn().mockResolvedValue([{ dayOfWeek: 3, startTime: '10:00:00', endTime: '15:00:00' }]),
    listBusyIntervals: vi.fn().mockResolvedValue([]),
    assertSlotAvailable: vi.fn().mockResolvedValue(undefined),
    createHold: vi.fn(async (record) => ({
      id: 'hold_1',
      expiresAt: '2026-08-04T12:30:00.000Z',
      priceMxnMinor: record.priceMxnMinor,
      durationMinutes: record.durationMinutes,
      depositMxnMinor: record.depositMxnMinor,
    })),
    getHold: vi.fn().mockResolvedValue({ id: 'hold_1', status: 'active', expiresAt: '2026-08-04T12:30:00.000Z', depositMxnMinor: 30000, appointmentTypeName: 'Valoración dermatológica' }),
    markCheckoutCreated: vi.fn(),
    getSession: vi.fn(),
    claimWebhookEvent: vi.fn().mockResolvedValue(true),
    completePayment: vi.fn().mockResolvedValue({ outcome: 'scheduled', appointmentId: 'appointment_1', holdId: 'hold_1', reason: null, duplicate: false }),
    releaseExpiredHold: vi.fn(),
  }
  const stripe = {
    checkout: { sessions: { create: vi.fn().mockResolvedValue({ id: 'cs_test_1', client_secret: 'secret_1' }) } },
  }
  const service = createBookingService({ store, stripe, publicWebUrl: 'https://bouclier-clinique.com', paymentsEnabled, now: () => now })
  return { store, stripe, service }
}

function holdPayload(overrides = {}) {
  return {
    appointmentTypeId: 'type_1',
    variantId: 'variant_1',
    doctorId: 'doctor_1',
    startsAt: '2026-08-05T16:00:00.000Z',
    patient: { fullName: 'Ana Pérez', email: 'ana@example.com', phone: '+522291234567' },
    ...overrides,
  }
}

describe('booking API', () => {
  it('returns treatments with variants, doctors, and the payment feature state', async () => {
    const { service, store } = fixture()
    store.listAppointmentTypes = vi.fn().mockResolvedValue([{
      id: 'type_1',
      name: 'Valoración',
      description: 'Consulta',
      durationMinutes: 60,
      variants: [{ id: 'variant_1', name: 'Valoración', priceMxnMinor: 100000, durationMinutes: 60, active: true }],
    }])
    store.listDoctors = vi.fn().mockResolvedValue([{ id: 'doctor_1', name: 'Dra. Gissel', specialty: 'Dermatología' }])
    const app = createApp({ bookingService: service, webhookHandler: vi.fn() })

    const result = await request(app).get('/api/booking/options')

    expect(result.status).toBe(200)
    expect(result.body.appointmentTypes[0]).not.toHaveProperty('patient')
    expect(result.body.appointmentTypes[0].variants).toEqual([{ id: 'variant_1', name: 'Valoración', priceMxnMinor: 100000, durationMinutes: 60, active: true }])
    expect(result.body).toMatchObject({ paymentsEnabled: false })
    expect(result.body).not.toHaveProperty('slots')
  })

  it('subtracts blocked times, appointments, and live holds with overlap-safe calculations', async () => {
    const { service, store } = fixture()
    store.listBusyIntervals.mockResolvedValue([
      { startAt: '2026-08-05T16:45:00.000Z', endAt: '2026-08-05T17:15:00.000Z', source: 'blocked_time' },
      { startAt: '2026-08-05T18:00:00.000Z', endAt: '2026-08-05T19:00:00.000Z', source: 'appointment' },
      { startAt: '2026-08-05T19:15:00.000Z', endAt: '2026-08-05T19:45:00.000Z', source: 'hold' },
    ])
    const app = createApp({ bookingService: service, webhookHandler: vi.fn() })

    const result = await request(app).get('/api/booking/availability').query({
      doctorId: 'doctor_1', appointmentTypeId: 'type_1', variantId: 'variant_1', month: '2026-08',
    })

    expect(result.status).toBe(200)
    expect(result.body).toMatchObject({ month: '2026-08', timeZone: 'America/Mexico_City', intervalMinutes: 30 })
    expect(result.body.slots.filter(({ startsAt }) => startsAt.startsWith('2026-08-05'))).toEqual([
      { startsAt: '2026-08-05T20:00:00.000Z', endsAt: '2026-08-05T21:00:00.000Z' },
    ])
  })

  it('recalculates the deposit from the stored price and carries the variant', async () => {
    const { service, store } = fixture()
    const app = createApp({ bookingService: service, webhookHandler: vi.fn() })

    const result = await request(app).post('/api/booking/hold').send({ ...holdPayload(), amount: 1 })

    expect(result.status).toBe(201)
    expect(result.body).toMatchObject({ holdId: 'hold_1', totalMxnMinor: 100000, depositMxnMinor: 30000 })
    expect(store.createHold.mock.calls[0][0]).toMatchObject({ depositMxnMinor: 30000, variantId: 'variant_1' })
  })

  it('rejects a hold whose start is not aligned to a 30-minute Mexico City boundary', async () => {
    const { service } = fixture()
    const app = createApp({ bookingService: service, webhookHandler: vi.fn() })

    const result = await request(app).post('/api/booking/hold').send(holdPayload({ startsAt: '2026-08-05T16:15:00.000Z' }))

    expect(result.status).toBe(400)
    expect(result.body.error.code).toBe('invalid_slot')
  })

  it('rejects a hold outside the doctor active availability window', async () => {
    const { service } = fixture()
    const app = createApp({ bookingService: service, webhookHandler: vi.fn() })

    const result = await request(app).post('/api/booking/hold').send(holdPayload({ startsAt: '2026-08-05T21:00:00.000Z' }))

    expect(result.status).toBe(409)
    expect(result.body.error.code).toBe('slot_unavailable')
  })

  it('rejects a hold beyond the rolling 90-day booking range', async () => {
    const { service } = fixture()
    const app = createApp({ bookingService: service, webhookHandler: vi.fn() })

    const result = await request(app).post('/api/booking/hold').send(holdPayload({ startsAt: '2026-11-04T16:00:00.000Z' }))

    expect(result.status).toBe(400)
    expect(result.body.error.code).toBe('invalid_slot')
  })

  it.each([
    ['unknown', 'variant_unknown'],
    ['mismatched', 'variant_other_type'],
    ['inactive', 'variant_inactive'],
  ])('rejects an %s variant instead of accepting its browser identifier', async (_label, variantId) => {
    const { service, store } = fixture()
    store.getAppointmentVariant.mockResolvedValue(null)
    const app = createApp({ bookingService: service, webhookHandler: vi.fn() })

    const result = await request(app).post('/api/booking/hold').send(holdPayload({ variantId }))

    expect(result.status).toBe(400)
    expect(result.body.error.code).toBe('invalid_variant')
  })

  it('uses the validated variant duration and server price for the atomic hold', async () => {
    const { service, store } = fixture()
    store.getAppointmentVariant.mockResolvedValue({
      id: 'variant_1', appointmentTypeId: 'type_1', name: 'Extendida', durationMinutes: 90, priceMxnMinor: 120000, active: true,
    })
    store.createHold.mockResolvedValue({
      id: 'hold_1', expiresAt: '2026-08-04T12:30:00.000Z', priceMxnMinor: 120000, durationMinutes: 90, depositMxnMinor: 36000,
    })
    const app = createApp({ bookingService: service, webhookHandler: vi.fn() })

    const result = await request(app).post('/api/booking/hold').send({ ...holdPayload(), amount: 1 })

    expect(result.status).toBe(201)
    expect(result.body).toMatchObject({ totalMxnMinor: 120000, depositMxnMinor: 36000 })
    expect(store.createHold.mock.calls[0][0]).toMatchObject({
      variantId: 'variant_1', durationMinutes: 90, priceMxnMinor: 120000, endsAt: '2026-08-05T17:30:00.000Z',
    })
  })

  it('returns a retryable conflict when the atomic hold reports an overlap', async () => {
    const { service, store } = fixture()
    store.createHold.mockRejectedValue(Object.assign(new Error('overlap'), { code: 'slot_conflict' }))
    const app = createApp({ bookingService: service, webhookHandler: vi.fn() })

    const result = await request(app).post('/api/booking/hold').send(holdPayload())

    expect(result.status).toBe(409)
    expect(result.body.error).toMatchObject({ code: 'slot_conflict', retryable: true })
  })

  it('creates embedded Checkout with metadata and idempotency', async () => {
    const { service, stripe } = fixture({ paymentsEnabled: true })
    const app = createApp({ bookingService: service, webhookHandler: vi.fn() })

    const result = await request(app).post('/api/booking/checkout-session').send({ holdId: 'hold_1' })

    expect(result.status).toBe(201)
    expect(result.body).toEqual({ sessionId: 'cs_test_1', clientSecret: 'secret_1' })
    expect(stripe.checkout.sessions.create).toHaveBeenCalledWith(
      expect.objectContaining({ ui_mode: 'embedded', metadata: { booking_hold_id: 'hold_1' } }),
      { idempotencyKey: 'booking-hold-hold_1' },
    )
  })

  it('rejects an expired hold', async () => {
    const { service, store } = fixture({ paymentsEnabled: true })
    store.getHold.mockResolvedValue({ id: 'hold_1', status: 'active', expiresAt: '2026-08-04T11:59:00.000Z' })
    const app = createApp({ bookingService: service, webhookHandler: vi.fn() })

    const result = await request(app).post('/api/booking/checkout-session').send({ holdId: 'hold_1' })

    expect(result.status).toBe(409)
    expect(result.body.error.code).toBe('hold_expired')
  })

  it('returns the deterministic scheduling outcome for a completed payment', async () => {
    const { service, store } = fixture()
    store.completePayment.mockResolvedValue({ outcome: 'manual_review', appointmentId: null, holdId: 'hold_1', reason: 'hold_expired', duplicate: false })
    const event = {
      id: 'evt_late',
      type: 'checkout.session.completed',
      data: { object: { id: 'cs_late', payment_intent: 'pi_late', amount_total: 30000 } },
    }

    await expect(service.processWebhook(event)).resolves.toEqual({
      duplicate: false,
      outcome: 'manual_review',
      manualReview: true,
    })
  })

  it('replays an already-claimed completed event through the idempotent payment RPC', async () => {
    const { service, store } = fixture()
    store.claimWebhookEvent.mockResolvedValue(false)
    store.completePayment.mockResolvedValue({ outcome: 'scheduled', appointmentId: 'appointment_1', holdId: 'hold_1', reason: null, duplicate: true })
    const event = {
      id: 'evt_duplicate',
      type: 'checkout.session.completed',
      data: { object: { id: 'cs_success', payment_intent: 'pi_success', amount_total: 30000 } },
    }

    await expect(service.processWebhook(event)).resolves.toEqual({
      duplicate: true,
      outcome: 'scheduled',
      manualReview: false,
    })
    expect(store.completePayment).toHaveBeenCalledOnce()
  })
})
