import { describe, expect, it } from 'vitest'
import {
  CLINICAL_CONCERNS,
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

  it('includes every clinical treatment promoted by the dermatology site', () => {
    const sourceTreatmentSlugs = [
      'hydrafacial',
      'diamond-glow',
      'oxygeneo',
      'liftage',
      'exion-facial',
      'red-touch',
      'hollywood-peel',
      'natura-peel',
      'micropuncion',
      'retiro-tatuaje-cejas',
      'accent-prime',
      'exion-body',
      'masaje-deep-tissue',
      'masaje-relajante',
      'masaje-piedras-calientes',
      'endermologie',
      'estrias',
      'depilacion-laser',
      'emface',
      'morpheus-8',
    ]

    expect(TREATMENTS.map(({ slug }) => slug)).toEqual(expect.arrayContaining(sourceTreatmentSlugs))
  })

  it('preserves the complete clinical dermatology scope from the source site', () => {
    expect(CLINICAL_CONCERNS).toEqual(expect.arrayContaining([
      'Caída de pelo',
      'Acné en la mujer adulta',
      'Melasma',
      'Dermatitis seborreica',
      'Rosácea',
      'Dermatitis perioral',
      'Psoriasis',
      'Vitiligo',
      'Cáncer de piel',
      'Lunares',
      'Hongos en las uñas',
      'Armonización facial',
      'Rellenos',
      'Bioestimulantes',
      'Hilos tensores',
      'Láser',
    ]))
  })

  it('contains no retail or Shopify behavior', () => {
    const serialized = JSON.stringify({ TREATMENT_CATEGORIES, TREATMENTS })

    expect(serialized).not.toMatch(/\/products\/|collections|carrito|stock|cantidad|farmacia/i)
    expect(serialized).not.toMatch(/\$\s?\d|price|precio habitual/i)
  })

  it('does not ship multi-megabyte animated GIFs in treatment cards', () => {
    expect(TREATMENTS.map(({ image }) => image)).not.toEqual(
      expect.arrayContaining([expect.stringMatching(/\.gif$/i)]),
    )
  })
})
