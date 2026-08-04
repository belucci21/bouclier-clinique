// @vitest-environment jsdom

import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import Descargar from './Descargar.jsx'

beforeAll(() => {
  class IntersectionObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }

  vi.stubGlobal('IntersectionObserver', IntersectionObserver)
})

describe('Descargar', () => {
  it('uses the unified brand and keeps the portal navigation in the same tab', () => {
    render(
      <MemoryRouter>
        <Descargar />
      </MemoryRouter>,
    )

    expect(screen.getByRole('main')).toBeTruthy()
    expect(screen.getByRole('heading', { level: 1, name: /descarga nuestra app/i })).toBeTruthy()

    const portalLink = screen.getByRole('link', { name: /abrir portal web/i })
    expect(portalLink.getAttribute('href')).toBe('/paciente/login')
    expect(portalLink.hasAttribute('target')).toBe(false)
    expect(document.title).toContain('Bouclier Dermatología')
  })
})
