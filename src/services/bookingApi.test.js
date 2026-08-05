import { describe, expect, it, vi } from 'vitest'
import { createBookingApi } from './bookingApi.js'

function response(body, { ok = true, status = 200, contentType = 'application/json' } = {}) {
  return {
    ok,
    status,
    headers: { get: vi.fn().mockReturnValue(contentType) },
    json: vi.fn().mockResolvedValue(body),
  }
}

describe('bookingApi', () => {
  it('creates a hold without trusting browser-supplied amounts', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(response({ holdId: 'hold_1' }))
    const api = createBookingApi({ fetchImpl, baseUrl: 'https://api.example.test' })

    await api.createHold({
      appointmentTypeId: 'type_1',
      variantId: 'variant_1',
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
    expect(payload).toMatchObject({ appointmentTypeId: 'type_1', variantId: 'variant_1' })
  })

  it('rejects successful non-JSON responses so the offline booking path can activate', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(response('<!doctype html>', { contentType: 'text/html; charset=utf-8' }))
    const api = createBookingApi({ fetchImpl, baseUrl: '' })

    await expect(api.getOptions()).rejects.toMatchObject({
      code: 'api_unavailable',
      retryable: true,
      status: 200,
    })
  })

  it('treats a non-JSON gateway failure as an unavailable API', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(response(null, { ok: false, status: 502, contentType: 'text/html' }))
    const api = createBookingApi({ fetchImpl, baseUrl: '' })

    await expect(api.getOptions()).rejects.toMatchObject({
      code: 'api_unavailable',
      retryable: true,
      status: 502,
    })
  })

  it('normalizes network failures so the WhatsApp fallback can activate', async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'))
    const api = createBookingApi({ fetchImpl, baseUrl: '' })

    await expect(api.getOptions()).rejects.toMatchObject({
      code: 'api_unavailable',
      retryable: true,
    })
  })

  it('requests monthly availability with every encoded selection identifier', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(response({ slots: [] }))
    const api = createBookingApi({ fetchImpl, baseUrl: '' })

    await api.getAvailability({ doctorId: 'doctor/1', appointmentTypeId: 'type 1', variantId: 'variant&1', month: '2026-08' })

    expect(fetchImpl.mock.calls[0][0]).toBe('/api/booking/availability?doctorId=doctor%2F1&appointmentTypeId=type+1&variantId=variant%261&month=2026-08')
  })

  it('normalizes structured server errors', async () => {
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

  it('encodes session identifiers', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(response({ status: 'paid' }))
    const api = createBookingApi({ fetchImpl, baseUrl: '' })

    await api.getSession('cs_test/unsafe')

    expect(fetchImpl).toHaveBeenCalledWith('/api/booking/session/cs_test%2Funsafe', expect.objectContaining({ method: 'GET' }))
  })
})
