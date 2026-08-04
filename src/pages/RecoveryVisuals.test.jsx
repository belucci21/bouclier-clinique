/* @vitest-environment jsdom */
import { readFileSync } from 'node:fs'
import { cleanup, render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import '../test/setup.js'
import Home from './Home.jsx'
import TratamientoDetalle from './TratamientoDetalle.jsx'
import Tratamientos from './Tratamientos.jsx'

afterEach(cleanup)

describe('approved recovery surfaces', () => {
  it('keeps the editorial footer light even after the generic footer rules load', () => {
    const styles = readFileSync('src/styles/global.css', 'utf8')

    expect(styles).toMatch(/\.footer\.editorial-footer\s*\{\s*background:\s*#efefec;/)
  })

  it('shows six documented real cases on the homepage', () => {
    render(<MemoryRouter><Home /></MemoryRouter>)

    expect(screen.getByRole('heading', { name: /casos cl[ií]nicos/i })).toBeInTheDocument()
    expect(screen.getAllByRole('img', { name: /resultado cl[ií]nico real/i })).toHaveLength(6)
    expect(screen.queryByText(/imagen pendiente|generad[ao] con/i)).not.toBeInTheDocument()
  })

  it('shows active source prices and quote states without commerce actions', () => {
    render(<MemoryRouter><Tratamientos /></MemoryRouter>)

    expect(screen.getByText('Desde $1,800 MXN')).toBeInTheDocument()
    expect(screen.getAllByText('Cotizar en valoración').length).toBeGreaterThan(0)
    expect(screen.queryByRole('link', { name: /comprar|agregar al carrito|tienda/i })).not.toBeInTheDocument()
  })

  it('renders 15 source services and nine clinical protocols in distinct titled groups', () => {
    render(<MemoryRouter><Tratamientos /></MemoryRouter>)

    const sourceSection = screen.getByRole('heading', { name: 'Tratamientos de cabina' }).closest('section')
    const clinicalSection = screen.getByRole('heading', { name: 'Dermatología clínica y protocolos' }).closest('section')

    expect(within(sourceSection).getAllByRole('article')).toHaveLength(15)
    expect(within(clinicalSection).getAllByRole('article')).toHaveLength(9)
  })

  it('passes the treatment slug through the primary appointment CTA', () => {
    render(
      <MemoryRouter initialEntries={['/tratamientos/hydrafacial']}>
        <Routes>
          <Route path="/tratamientos/:slug" element={<TratamientoDetalle />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: /agendar valoraci[oó]n/i })).toHaveAttribute(
      'href',
      '/citas?tratamiento=hydrafacial',
    )
    expect(screen.getByText('Desde $1,800 MXN')).toBeInTheDocument()
  })
})
