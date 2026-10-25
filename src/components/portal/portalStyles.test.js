import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('private patient portal navigation', () => {
  it('keeps the selected link readable on the dark sidebar independently of the public accent', () => {
    const css = readFileSync(new URL('../../styles/global.css', import.meta.url), 'utf8')
    const active = css.match(/\.portal-sidebar__link--active\s*\{([^}]+)\}/)?.[1]
    expect(active).toMatch(/(?:^|;)\s*color:\s*#fff\s*;/)
    expect(active).toMatch(/border-left-color:\s*#fff\s*;/)
    expect(active).not.toContain('var(--color-accent)')
  })
})
