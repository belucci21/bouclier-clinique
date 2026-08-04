import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { DESIGN_TOKENS } from './tokens.js'

describe('Bouclier design tokens', () => {
  it('uses Druk Wide for display typography', () => {
    expect(DESIGN_TOKENS.font.display).toBe("'Druk Wide', sans-serif")
  })

  it('defines a monochrome palette without the legacy gold', () => {
    expect(JSON.stringify(DESIGN_TOKENS)).not.toMatch(/b89a5a|d4b97a|9a7d3f/i)
    expect(DESIGN_TOKENS.color.ink).toBe('#111111')
    expect(DESIGN_TOKENS.color.canvas).toBe('#f4f4f2')
  })

  it('contains no hard-coded legacy gold in rendered web surfaces', () => {
    const renderedSources = [
      '../../src/styles/global.css',
      '../../src/pages/Descargar.jsx',
      '../../src/pages/Reservar.jsx',
      '../../public/404.html',
    ].map((path) => readFileSync(new URL(path, import.meta.url), 'utf8')).join('\n')

    expect(renderedSources).not.toMatch(/#b89a5a|#a08848|#9a7d3f|184\s*,\s*154\s*,\s*90/i)
  })
})
