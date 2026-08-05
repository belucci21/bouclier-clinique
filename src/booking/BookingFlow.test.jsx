/* @vitest-environment jsdom */
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import '../test/setup.js'
import BookingFlow from './BookingFlow.jsx'

const AUGUST_NOW = new Date('2026-08-04T12:00:00.000Z')

const options = {
  appointmentTypes: [{
    id: 'type_1',
    slug: 'hydrafacial',
    name: 'Hydrafacial',
    description: 'Limpieza e hidratación',
    durationMinutes: 60,
    variants: [{ id: '47992673763636', name: 'Deluxe', priceMxnMinor: 180000, active: true }],
  }],
  doctors: [{ id: 'doctor_1', name: 'Dra. Gissel Castellanos', specialty: 'Dermatología' }],
  paymentsEnabled: false,
}

function apiFixture(overrides = {}) {
  return {
    getOptions: vi.fn().mockResolvedValue(options),
    getAvailability: vi.fn().mockResolvedValue({ slots: [{ startsAt: '2026-08-05T16:00:00.000Z', endsAt: '2026-08-05T17:00:00.000Z' }] }),
    createHold: vi.fn(),
    createCheckoutSession: vi.fn(),
    ...overrides,
  }
}

async function reachCalendar(user, api) {
  render(<BookingFlow api={api} now={() => AUGUST_NOW} PaymentComponent={() => null} />)
  await user.click(await screen.findByRole('button', { name: /hydrafacial/i }))
  await user.click(screen.getByRole('button', { name: /continuar con el especialista/i }))
  await user.click(screen.getByRole('button', { name: /dra\. gissel castellanos/i }))
  await screen.findByRole('heading', { name: /agosto 2026/i })
}

beforeEach(() => window.history.replaceState({}, '', '/citas'))
afterEach(cleanup)

describe('BookingFlow', () => {
  it('preselects treatment and variant from the URL query', async () => {
    window.history.replaceState({}, '', '/citas?tratamiento=hydrafacial&variante=47992673763636')

    render(<BookingFlow api={apiFixture()} now={() => AUGUST_NOW} PaymentComponent={() => null} />)

    expect(await screen.findByRole('button', { name: /hydrafacial/i })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('radio', { name: /deluxe/i })).toBeChecked()
  })

  it('limits calendar month navigation to the 90-day booking range', async () => {
    const user = userEvent.setup()
    await reachCalendar(user, apiFixture())

    await user.click(screen.getByRole('button', { name: /mes siguiente/i }))
    expect(screen.getByRole('heading', { name: /septiembre 2026/i })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /mes siguiente/i }))
    expect(screen.getByRole('heading', { name: /octubre 2026/i })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /mes siguiente/i }))
    expect(screen.getByRole('heading', { name: /noviembre 2026/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /mes siguiente/i })).toBeDisabled()
  })

  it('requires an available day and time before continuing', async () => {
    const user = userEvent.setup()
    const api = apiFixture()
    await reachCalendar(user, api)

    await user.click(await screen.findByRole('button', { name: /miércoles 5 de agosto/i }))
    expect(screen.getByRole('button', { name: /continuar con mis datos/i })).toBeDisabled()
    await user.click(screen.getByRole('button', { name: '10:00' }))

    expect(screen.getByText(/miércoles, 5 de agosto de 2026/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /continuar con mis datos/i })).toBeEnabled()
    expect(api.getAvailability).toHaveBeenCalledWith(expect.objectContaining({ month: '2026-08', variantId: '47992673763636' }))
  })

  it('keeps all five steps usable and completes through WhatsApp when the API is unavailable', async () => {
    const user = userEvent.setup()
    window.history.replaceState({}, '', '/citas?tratamiento=hydrafacial&variante=47992673763636')
    const api = apiFixture({
      getOptions: vi.fn().mockRejectedValue(Object.assign(new Error('No pudimos completar la solicitud'), { code: 'api_unavailable' })),
      getAvailability: vi.fn().mockRejectedValue(Object.assign(new Error('Sin conexión'), { code: 'api_unavailable' })),
    })
    render(<BookingFlow api={api} now={() => AUGUST_NOW} PaymentComponent={() => null} />)

    expect(await screen.findByRole('alert')).toHaveTextContent(/agenda en línea está temporalmente sin conexión/i)
    expect(screen.getAllByRole('listitem')).toHaveLength(5)
    await user.click(screen.getByRole('button', { name: /continuar con el especialista/i }))
    await user.click(screen.getByRole('button', { name: /dra\. gissel castellanos/i }))
    await user.click(await screen.findByRole('button', { name: /miércoles 5 de agosto/i }))
    await user.click(screen.getByRole('button', { name: '10:00' }))
    await user.click(screen.getByRole('button', { name: /continuar con mis datos/i }))
    await user.type(screen.getByLabelText(/nombre completo/i), 'Ana Pérez')
    await user.type(screen.getByLabelText(/correo/i), 'ana@example.com')
    await user.type(screen.getByLabelText(/teléfono/i), '+522291234567')
    await user.click(screen.getByRole('button', { name: /continuar a confirmación/i }))

    expect(await screen.findByRole('heading', { name: /pago online próximamente/i })).toBeInTheDocument()
    const whatsapp = screen.getByRole('link', { name: /reservar por whatsapp/i })
    const message = new URL(whatsapp.href).searchParams.get('text')
    expect(message).toContain('Hydrafacial')
    expect(message).toContain('Deluxe')
    expect(message).toContain('Ana Pérez')
    expect(message).toContain('5 de agosto de 2026')
    expect(api.createHold).not.toHaveBeenCalled()
  }, 15000)

  it('returns to the calendar after a live hold conflict', async () => {
    const user = userEvent.setup()
    const api = apiFixture({
      getOptions: vi.fn().mockResolvedValue({ ...options, paymentsEnabled: true }),
      createHold: vi.fn().mockRejectedValue(Object.assign(new Error('Ese horario acaba de ocuparse'), { code: 'slot_conflict', retryable: true })),
    })
    await reachCalendar(user, api)
    await user.click(await screen.findByRole('button', { name: /miércoles 5 de agosto/i }))
    await user.click(screen.getByRole('button', { name: '10:00' }))
    await user.click(screen.getByRole('button', { name: /continuar con mis datos/i }))
    await user.type(screen.getByLabelText(/nombre completo/i), 'Ana Pérez')
    await user.type(screen.getByLabelText(/correo/i), 'ana@example.com')
    await user.type(screen.getByLabelText(/teléfono/i), '+522291234567')
    await user.click(screen.getByRole('button', { name: /continuar al pago/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/acaba de ocuparse/i)
    await user.click(screen.getByRole('button', { name: /elegir otro horario/i }))
    await waitFor(() => expect(screen.getByRole('heading', { name: /agosto 2026/i })).toBeInTheDocument())
  }, 15000)
})
