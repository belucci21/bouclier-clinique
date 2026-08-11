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
  it('offers distinct Android APK downloads for patients and clinic staff', () => {
    render(
      <MemoryRouter>
        <Descargar />
      </MemoryRouter>,
    )

    expect(screen.getByRole('main')).toBeTruthy()
    expect(screen.getByRole('heading', { level: 1, name: /apps bouclier para android/i })).toBeTruthy()

    const portalLink = screen.getByRole('link', { name: /abrir portal web/i })
    expect(portalLink.getAttribute('href')).toBe('/paciente/login')
    expect(portalLink.hasAttribute('target')).toBe(false)

    const patientDownload = screen.getByRole('link', { name: /descargar app para pacientes en android/i })
    const clinicDownload = screen.getByRole('link', { name: /descargar app clínica para android/i })
    const patientHref = patientDownload.getAttribute('href')
    const clinicHref = clinicDownload.getAttribute('href')

    expect(patientHref).toMatch(/^https:\/\/github\.com\/belucci21\/bouclier-clinique\/releases\/download\/.+\.apk$/)
    expect(clinicHref).toMatch(/^https:\/\/github\.com\/belucci21\/bouclier-clinique\/releases\/download\/.+\.apk$/)
    expect(patientHref).not.toBe(clinicHref)
    expect(patientDownload.getAttribute('download')).toBe('Bouclier-Pacientes.apk')
    expect(clinicDownload.getAttribute('download')).toBe('Bouclier-Clinica.apk')
    expect(document.title).toContain('Bouclier Dermatología')
  })
})
