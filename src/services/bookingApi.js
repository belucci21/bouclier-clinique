const DEFAULT_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

function apiError(payload, status) {
  const source = payload?.error || payload || {}
  const error = new Error(source.message || 'No pudimos completar la solicitud')
  error.code = source.code || `http_${status}`
  error.retryable = Boolean(source.retryable ?? status >= 500)
  error.status = status
  return error
}

async function parseResponse(response) {
  let payload
  try {
    payload = await response.json()
  } catch {
    payload = null
  }
  if (!response.ok) throw apiError(payload, response.status)
  return payload
}

function patientPayload(patient = {}) {
  return {
    fullName: patient.fullName,
    email: patient.email,
    phone: patient.phone,
  }
}

export function createBookingApi({ fetchImpl = globalThis.fetch, baseUrl = DEFAULT_BASE_URL } = {}) {
  if (typeof fetchImpl !== 'function') throw new TypeError('fetchImpl es obligatorio')

  async function request(path, { method = 'GET', body } = {}) {
    const response = await fetchImpl(`${baseUrl}${path}`, {
      method,
      credentials: 'same-origin',
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    })
    return parseResponse(response)
  }

  return {
    createHold(input) {
      return request('/api/booking/hold', {
        method: 'POST',
        body: {
          appointmentTypeId: input.appointmentTypeId,
          doctorId: input.doctorId,
          startsAt: input.startsAt,
          patient: patientPayload(input.patient),
        },
      })
    },
    createCheckoutSession({ holdId }) {
      return request('/api/booking/checkout-session', { method: 'POST', body: { holdId } })
    },
    getSession(sessionId) {
      return request(`/api/booking/session/${encodeURIComponent(sessionId)}`)
    },
  }
}

export const bookingApi = createBookingApi()
