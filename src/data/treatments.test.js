import { describe, expect, it } from 'vitest'
import {
  TREATMENT_CATEGORIES,
  TREATMENTS,
  getTreatmentBySlug,
} from './treatments.js'

const REQUIRED_FIELDS = [
  'slug',
  'name',
  'category',
  'summary',
  'indications',
  'expectations',
  'technology',
  'image',
]

describe('clinical treatment registry', () => {
  it('uses unique internal slugs and complete clinical content', () => {
    const slugs = TREATMENTS.map(({ slug }) => slug)

    expect(new Set(slugs).size).toBe(slugs.length)
    expect(TREATMENTS.length).toBeGreaterThanOrEqual(15)

    TREATMENTS.forEach((treatment) => {
      REQUIRED_FIELDS.forEach((field) => expect(treatment[field]).toBeTruthy())
      expect(TREATMENT_CATEGORIES.some(({ id }) => id === treatment.category)).toBe(true)
      expect(getTreatmentBySlug(treatment.slug)).toEqual(treatment)
    })
  })

  it('preserves the clinical pages already created', () => {
    expect(getTreatmentBySlug('manchas-y-melasma')?.legacyPath).toBe('/manchas')
    expect(getTreatmentBySlug('blefaroplastia-no-quirurgica')?.legacyPath).toBe('/blefaroplastia')
  })

  it('contains no retail or Shopify behavior', () => {
    const serialized = JSON.stringify({ TREATMENT_CATEGORIES, TREATMENTS })

    expect(serialized).not.toMatch(/\/products\/|collections|carrito|stock|cantidad|farmacia/i)
    expect(serialized).not.toMatch(/\$\s?\d|price|precio habitual/i)
  })
})
