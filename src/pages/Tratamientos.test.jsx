/* @vitest-environment jsdom */
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import '../test/setup.js'
import Tratamientos from './Tratamientos.jsx'
import TratamientoDetalle from './TratamientoDetalle.jsx'

afterEach(cleanup)

describe('Tratamientos', () => {
  it('filtra el catálogo sin enlaces de comercio externo', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <Tratamientos />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: /tratamientos médicos avanzados/i })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /comprar|tienda|producto/i })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Corporal' }))

    expect(screen.getByRole('link', { name: /conocer accent prime/i })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /conocer hydrafacial/i })).not.toBeInTheDocument()
  })

  it('shows the complete clinical dermatology scope without turning it into products', () => {
    render(
      <MemoryRouter>
        <Tratamientos />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: /dermatología clínica con enfoque funcional/i })).toBeInTheDocument()
    expect(screen.getByText('Psoriasis')).toBeInTheDocument()
    expect(screen.getByText('Cáncer de piel')).toBeInTheDocument()
    expect(screen.getByText('Bioestimulantes')).toBeInTheDocument()
  })

  it('muestra la ficha clínica y conduce a agendar cita', () => {
    render(
      <MemoryRouter initialEntries={['/tratamientos/hydrafacial']}>
        <Routes>
          <Route path="/tratamientos/:slug" element={<TratamientoDetalle />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { level: 1, name: 'Hydrafacial' })).toBeInTheDocument()
    expect(screen.getByText(/qué puedes esperar/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /agendar valoración/i })).toHaveAttribute('href', '/citas?tratamiento=hydrafacial')
  })

  it('resuelve fichas inexistentes con una salida útil', () => {
    render(
      <MemoryRouter initialEntries={['/tratamientos/no-existe']}>
        <Routes>
          <Route path="/tratamientos/:slug" element={<TratamientoDetalle />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: /tratamiento no encontrado/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /ver todos los tratamientos/i })).toHaveAttribute('href', '/tratamientos')
  })
})
