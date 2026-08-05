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
    expect(styles).toMatch(/\.editorial-footer \.footer__location p\s*\{[^}]*color:\s*#343432;/s)
    expect(styles).toMatch(/\.editorial-footer :is\([^)]+\)\s*\{[^}]*color:\s*#343432;/s)
  })

  it('constrains wide display copy to its grid column at every viewport', () => {
    const styles = readFileSync('src/styles/global.css', 'utf8')

    expect(styles).toMatch(/\.treatment-detail__hero > \*,\s*\.treatment-detail__copy,\s*\.home-results__intro > \*\s*\{\s*min-width:\s*0;/)
    expect(styles).toMatch(/\.treatment-detail__copy h1[^}]*width:\s*100%;[^}]*max-width:\s*100%;[^}]*overflow-wrap:\s*anywhere;/s)
    expect(styles).toMatch(/h1\.treatment-detail__title--long\s*\{[^}]*font-size:\s*clamp\(28px,\s*3vw,\s*54px\);[^}]*overflow-wrap:\s*normal;[^}]*word-break:\s*normal;/s)
    expect(styles).toMatch(/@media \(max-width:\s*420px\)[\s\S]*?h1\.treatment-detail__title--long\s*\{[^}]*font-size:\s*clamp\(26px,\s*7vw,\s*29px\);/)
    expect(styles).toMatch(/\.home-results__intro h2[^}]*width:\s*100%;[^}]*max-width:\s*100%;[^}]*overflow-wrap:\s*anywhere;/s)
  })

  it('uses fully visible, wrapping treatment filters on narrow screens', () => {
    const styles = readFileSync('src/styles/global.css', 'utf8')

    expect(styles).toMatch(/@media \(max-width:\s*820px\)[\s\S]*?\.treatment-filters\s*\{[^}]*flex-wrap:\s*wrap;[^}]*overflow:\s*visible;/)
    expect(styles).toMatch(/@media \(max-width:\s*560px\)[\s\S]*?\.treatment-filters\s*\{[^}]*display:\s*grid;[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\);/)
    expect(styles).toMatch(/\.treatment-filters button\s*\{[^}]*white-space:\s*normal;[^}]*overflow-wrap:\s*anywhere;/s)
    expect(styles).toMatch(/@media \(max-width:\s*680px\)[\s\S]*?\.booking-flow__progress\s*\{[^}]*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\);[^}]*overflow:\s*visible;/)
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
