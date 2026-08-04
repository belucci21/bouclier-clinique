import request from 'supertest'
import { describe, expect, it, vi } from 'vitest'
import { createApp } from '../src/app.js'
import { createBookingService } from '../src/services/bookingService.js'

function fixture() {
  const now = new Date('2026-08-04T12:00:00.000Z')
  const store = {
    getAppointmentType: vi.fn().mockResolvedValue({ id: 'type_1', name: 'Valoración dermatológica', durationMinutes: 60, priceMxnMinor: 100000 }),
    assertSlotAvailable: vi.fn().mockResolvedValue(undefined),
    createHold: vi.fn(async (record) => ({ id: 'hold_1', ...record })),
    getHold: vi.fn().mockResolvedValue({ id: 'hold_1', status: 'active', expiresAt: '2026-08-04T12:30:00.000Z', depositMxnMinor: 30000, appointmentTypeName: 'Valoración dermatológica' }),
    markCheckoutCreated: vi.fn(),
    getSession: vi.fn(),
  }
  const stripe = {
    checkout: { sessions: { create: vi.fn().mockResolvedValue({ id: 'cs_test_1', client_secret: 'secret_1' }) } },
  }
  const service = createBookingService({ store, stripe, publicWebUrl: 'https://bouclier-clinique.com', now: () => now })
  return { store, stripe, service }
}

describe('booking API', () => {
  it('publica opciones reservables sin datos privados de pacientes', async () => {
    const { service, store } = fixture()
    store.listAppointmentTypes = vi.fn().mockResolvedValue([{ id: 'type_1', name: 'Valoración', description: 'Consulta', priceMxnMinor: 100000 }])
    store.listDoctors = vi.fn().mockResolvedValue([{ id: 'doctor_1', name: 'Dra. Gissel', specialty: 'Dermatología' }])
    store.listBusyStarts = vi.fn().mockResolvedValue([])
    const app = createApp({ bookingService: service, webhookHandler: vi.fn() })

    const result = await request(app).get('/api/booking/options')

    expect(result.status).toBe(200)
    expect(result.body.appointmentTypes[0]).not.toHaveProperty('patient')
    expect(result.body.slots.length).toBeGreaterThan(0)
  })

  it('recalcula el anticipo desde el precio almacenado', async () => {
    const { service, store } = fixture()
    const app = createApp({ bookingService: service, webhookHandler: vi.fn() })

    const result = await request(app).post('/api/booking/hold').send({
      appointmentTypeId: 'type_1',
      doctorId: 'doctor_1',
      startsAt: '2026-08-05T16:00:00.000Z',
      patient: { fullName: 'Ana Pérez', email: 'ana@example.com', phone: '+522291234567' },
      amount: 1,
    })

    expect(result.status).toBe(201)
    expect(result.body).toMatchObject({ holdId: 'hold_1', totalMxnMinor: 100000, depositMxnMinor: 30000 })
    expect(store.createHold.mock.calls[0][0].depositMxnMinor).toBe(30000)
  })

  it('crea Checkout embebido con metadata e idempotencia', async () => {
    const { service, stripe } = fixture()
    const app = createApp({ bookingService: service, webhookHandler: vi.fn() })

    const result = await request(app).post('/api/booking/checkout-session').send({ holdId: 'hold_1' })

    expect(result.status).toBe(201)
    expect(result.body).toEqual({ sessionId: 'cs_test_1', clientSecret: 'secret_1' })
    expect(stripe.checkout.sessions.create).toHaveBeenCalledWith(
      expect.objectContaining({ ui_mode: 'embedded', metadata: { booking_hold_id: 'hold_1' } }),
      { idempotencyKey: 'booking-hold-hold_1' },
    )
  })

  it('rechaza una retención expirada', async () => {
    const { service, store } = fixture()
    store.getHold.mockResolvedValue({ id: 'hold_1', status: 'active', expiresAt: '2026-08-04T11:59:00.000Z' })
    const app = createApp({ bookingService: service, webhookHandler: vi.fn() })

    const result = await request(app).post('/api/booking/checkout-session').send({ holdId: 'hold_1' })

    expect(result.status).toBe(409)
    expect(result.body.error.code).toBe('hold_expired')
  })
})
