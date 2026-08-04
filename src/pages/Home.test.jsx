/* @vitest-environment jsdom */
import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import '../test/setup.js'
import Home from './Home.jsx'

afterEach(cleanup)

describe('Home editorial', () => {
  it('presenta la propuesta aprobada y llamadas a acción internas', () => {
    render(<MemoryRouter><Home /></MemoryRouter>)

    expect(screen.getByRole('heading', { level: 1, name: /medicina estética con criterio/i })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /valoración dermatológica/i })).toHaveAttribute('src', '/assets/img/hero-clinical-editorial.webp')
    expect(screen.getAllByRole('link', { name: /agendar cita/i })[0]).toHaveAttribute('href', '/citas')
    expect(screen.getByRole('link', { name: /ver tratamientos/i })).toHaveAttribute('href', '/tratamientos')
  })
})
