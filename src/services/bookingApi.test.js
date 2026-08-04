import { describe, expect, it, vi } from 'vitest'
import { createBookingApi } from './bookingApi.js'

function response(body, { ok = true, status = 200 } = {}) {
  return { ok, status, json: vi.fn().mockResolvedValue(body) }
}

describe('bookingApi', () => {
  it('crea una retención sin permitir importes enviados por el navegador', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(response({ holdId: 'hold_1' }))
    const api = createBookingApi({ fetchImpl, baseUrl: 'https://api.example.test' })

    await api.createHold({
      appointmentTypeId: 'type_1',
      doctorId: 'doctor_1',
      startsAt: '2026-08-05T16:00:00.000Z',
      patient: { fullName: 'Ana Pérez', email: 'ana@example.com', phone: '+522291234567' },
      amount: 1,
      depositMinor: 1,
    })

    const payload = JSON.parse(fetchImpl.mock.calls[0][1].body)
    expect(fetchImpl.mock.calls[0][0]).toBe('https://api.example.test/api/booking/hold')
    expect(payload).not.toHaveProperty('amount')
    expect(payload).not.toHaveProperty('depositMinor')
    expect(payload.appointmentTypeId).toBe('type_1')
  })

  it('normaliza errores del servidor', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(response(
      { error: { code: 'slot_conflict', message: 'Horario no disponible', retryable: true } },
      { ok: false, status: 409 },
    ))
    const api = createBookingApi({ fetchImpl, baseUrl: '' })

    await expect(api.createCheckoutSession({ holdId: 'hold_1' })).rejects.toMatchObject({
      code: 'slot_conflict',
      message: 'Horario no disponible',
      retryable: true,
    })
  })

  it('consulta el estado de una sesión con id codificado', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(response({ status: 'paid' }))
    const api = createBookingApi({ fetchImpl, baseUrl: '' })

    await api.getSession('cs_test/unsafe')

    expect(fetchImpl).toHaveBeenCalledWith('/api/booking/session/cs_test%2Funsafe', expect.objectContaining({ method: 'GET' }))
  })
})
