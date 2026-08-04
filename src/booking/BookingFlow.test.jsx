/* @vitest-environment jsdom */
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import '../test/setup.js'
import BookingFlow from './BookingFlow.jsx'

afterEach(cleanup)

const options = {
  appointmentTypes: [{ id: 'type_1', name: 'Valoración dermatológica', description: 'Primera consulta', priceMxnMinor: 100000 }],
  doctors: [{ id: 'doctor_1', name: 'Dra. Gissel Castellanos', specialty: 'Dermatología' }],
  slots: [{ doctorId: 'doctor_1', startsAt: '2026-08-05T16:00:00.000Z' }],
}

describe('BookingFlow', () => {
  it('recorre selección, retención y pago embebido sin abrir pestañas', async () => {
    const user = userEvent.setup()
    const api = {
      getOptions: vi.fn().mockResolvedValue(options),
      createHold: vi.fn().mockResolvedValue({ holdId: 'hold_1', totalMxnMinor: 100000, depositMxnMinor: 30000, currency: 'mxn' }),
      createCheckoutSession: vi.fn().mockResolvedValue({ sessionId: 'cs_1', clientSecret: 'secret_1' }),
    }
    const Payment = ({ clientSecret }) => <div>Pago embebido {clientSecret}</div>
    render(<BookingFlow api={api} PaymentComponent={Payment} />)

    await user.click(await screen.findByRole('button', { name: /valoración dermatológica/i }))
    await user.click(screen.getByRole('button', { name: /dra\. gissel castellanos/i }))
    await user.click(screen.getByRole('button', { name: /miércoles.*5.*18:00/i }))
    await user.type(screen.getByLabelText(/nombre completo/i), 'Ana Pérez')
    await user.type(screen.getByLabelText(/correo/i), 'ana@example.com')
    await user.type(screen.getByLabelText(/teléfono/i), '+522291234567')
    await user.click(screen.getByRole('button', { name: /continuar al pago/i }))

    expect(await screen.findByText('Pago embebido secret_1')).toBeInTheDocument()
    expect(screen.getByText('$300.00')).toBeInTheDocument()
    expect(api.createHold.mock.calls[0][0]).not.toHaveProperty('amount')
    expect(screen.queryByRole('link', { name: /pagar/i })).not.toBeInTheDocument()
  })

  it('permite recuperar un conflicto de horario', async () => {
    const user = userEvent.setup()
    const api = {
      getOptions: vi.fn().mockResolvedValue(options),
      createHold: vi.fn().mockRejectedValue(Object.assign(new Error('Ese horario acaba de ocuparse'), { code: 'slot_conflict', retryable: true })),
      createCheckoutSession: vi.fn(),
    }
    render(<BookingFlow api={api} PaymentComponent={() => null} />)

    await user.click(await screen.findByRole('button', { name: /valoración dermatológica/i }))
    await user.click(screen.getByRole('button', { name: /dra\. gissel castellanos/i }))
    await user.click(screen.getByRole('button', { name: /miércoles.*5.*18:00/i }))
    await user.type(screen.getByLabelText(/nombre completo/i), 'Ana Pérez')
    await user.type(screen.getByLabelText(/correo/i), 'ana@example.com')
    await user.type(screen.getByLabelText(/teléfono/i), '+522291234567')
    await user.click(screen.getByRole('button', { name: /continuar al pago/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/acaba de ocuparse/i)
    expect(screen.getByRole('button', { name: /elegir otro horario/i })).toBeInTheDocument()
  })
})
