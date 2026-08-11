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
  it('keeps the original patient download design and hides the clinic app', () => {
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

    const patientDownload = screen.getByRole('link', { name: /descargar para android/i })
    const patientHref = patientDownload.getAttribute('href')

    expect(patientHref).toMatch(/^https:\/\/github\.com\/belucci21\/bouclier-clinique\/releases\/download\/.+\/Bouclier-Pacientes\.apk$/)
    expect(patientDownload.getAttribute('download')).toBe('Bouclier-Pacientes.apk')
    expect(screen.queryByText(/bouclier clínica/i)).toBeNull()
    expect(document.querySelectorAll('a[download$=".apk"]')).toHaveLength(1)
    expect(document.title).toContain('Bouclier Dermatología')
  })
})
