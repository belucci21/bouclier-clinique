/* @vitest-environment jsdom */
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import '../test/setup.js'
import Header from './Header.jsx'

afterEach(cleanup)

describe('Header unificado', () => {
  it('mantiene tratamientos y citas dentro del sitio y elimina farmacia', async () => {
    const user = userEvent.setup()
    render(<MemoryRouter><Header /></MemoryRouter>)

    expect(screen.getByRole('banner')).toHaveClass('editorial-header--home')

    const treatments = screen.getByRole('button', { name: 'Tratamientos' })
    const appointmentLinks = screen.getAllByRole('link', { name: /agendar cita/i })
    const downloadLink = screen.getByRole('link', { name: /descargar app/i })

    await user.click(treatments)
    expect(treatments).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('link', { name: /ver todos los tratamientos/i })).toHaveAttribute('href', '/tratamientos')
    expect(appointmentLinks.every((link) => link.getAttribute('href') === '/citas')).toBe(true)
    expect(downloadLink).toHaveAttribute('href', '/descargar')
    expect(screen.queryByRole('link', { name: /farmacia/i })).not.toBeInTheDocument()

    await user.keyboard('{Escape}')
    expect(treatments).toHaveAttribute('aria-expanded', 'false')
    expect(treatments).toHaveFocus()

    await user.click(screen.getByRole('button', { name: /abrir menú/i }))
    expect(screen.getAllByRole('link', { name: /descargar app/i })).toHaveLength(2)
  })
})
