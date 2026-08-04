/* @vitest-environment jsdom */
import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import '../test/setup.js'
import MetodoBouclier from './MetodoBouclier.jsx'

afterEach(cleanup)
beforeEach(() => {
  vi.stubGlobal('IntersectionObserver', class {
    observe() {}
    unobserve() {}
    disconnect() {}
  })
})

describe('Método Bouclier', () => {
  it('uses the unified brand and a semantic main heading', async () => {
    render(<MemoryRouter><MetodoBouclier /></MemoryRouter>)

    expect(screen.getByRole('main')).toContainElement(
      screen.getByRole('heading', { level: 1, name: 'Método Bouclier' }),
    )
    expect(document.title).toBe('Método Bouclier | Bouclier Dermatología')
  })
})
