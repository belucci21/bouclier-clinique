// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import PaseExertia from './PaseExertia.jsx'
const mocks = vi.hoisted(() => ({ load: vi.fn() }))
vi.mock('../../contexts/usePatientAuth.js', () => ({ usePatientAuth: () => ({ user: { id: 'own' } }) }))
vi.mock('../../lib/supabase.js', () => ({ supabase: { auth: { getSession: async () => ({ data: { session: { user: { id: 'own' }, access_token: 'fake' } } }) } } }))
vi.mock('../../lib/patientBuildingPasses.js', () => ({ loadPatientBuildingPasses: mocks.load, visibleBuildingPass: value => Boolean(value.imageDataUrl) }))
afterEach(() => { cleanup(); vi.clearAllMocks() })
describe('EXERTIA private page', () => {
  it('shows missing real passes honestly and updates after reception attaches one', async () => {
    const pass = { appointment: { id: 501, scheduledAt: '2026-10-25T18:00:00-06:00' }, pass: { state: 'missing', message: 'Recepción todavía no ha adjuntado el pase.' } }
    mocks.load.mockResolvedValueOnce([pass]).mockResolvedValueOnce([{ ...pass, pass: { state: 'active', message: 'Pase real de Hik-Connect.' }, imageDataUrl: 'data:image/png;base64,cHJpdmF0ZQ==' }])
    render(<MemoryRouter><PaseExertia /></MemoryRouter>)
    expect(await screen.findByText(/todavía no ha adjuntado/)).toBeTruthy()
    expect(screen.queryByRole('img')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Actualizar pase' }))
    expect(await screen.findByRole('img', { name: /QR real/ })).toBeTruthy()
    expect(screen.getByText(/09:00 de la mañana/)).toBeTruthy()
  })
  it('shows connection errors instead of falsely reporting an empty agenda', async () => {
    mocks.load.mockRejectedValue(new Error('Sin conexión'))
    render(<MemoryRouter><PaseExertia /></MemoryRouter>)
    expect((await screen.findByRole('alert')).textContent).toBe('Sin conexión')
    expect(screen.queryByText(/No hay citas vigentes/)).toBeNull()
  })
  it('removes QR data from the DOM when the page is backgrounded', async () => {
    mocks.load.mockResolvedValue([{ appointment: { id: 501, scheduledAt: '2026-10-25T18:00:00-06:00' }, imageDataUrl: 'data:image/png;base64,cHJpdmF0ZQ==' }])
    render(<MemoryRouter><PaseExertia /></MemoryRouter>)
    await screen.findByRole('img')
    await act(async () => { Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'hidden' }); document.dispatchEvent(new Event('visibilitychange')) })
    await waitFor(() => expect(screen.queryByRole('img')).toBeNull())
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'visible' })
  })
})
