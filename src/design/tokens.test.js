import { describe, expect, it } from 'vitest'
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
})
