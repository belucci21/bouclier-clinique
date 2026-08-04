import { describe, expect, it } from 'vitest'
import {
  CLINICAL_PROTOCOLS,
  CLINICAL_RESULTS,
  SOURCE_TREATMENTS,
  TREATMENTS,
  TREATMENT_CATEGORIES,
  getTreatmentBySlug,
} from './treatments.js'

const SOURCE_SLUGS = [
  'laser-duoglide-exion-micropuncion',
  'hydrafacial',
  'laser-duoglide',
  'depilacion-laser',
  'accent-prime',
  'endermologie',
  'hollywood-peel',
  'liftage',
  'red-touch',
  'natura-peel',
  'masaje-piedras-calientes',
  'masaje-relajante',
  'masaje-deep-tissue',
  'oxygeneo',
  'diamond-glow',
]

const REQUIRED_FIELDS = [
  'slug',
  'source',
  'category',
  'name',
  'summary',
  'description',
  'indications',
  'expectations',
  'technology',
  'cover',
  'gallery',
  'bookingMode',
  'durationMinutes',
  'variants',
]

const EXPECTED_ACTIVE_VARIANTS = {
  'laser-duoglide-exion-micropuncion': [],
  hydrafacial: [
    ['47992673763636', 'Deluxe', 180000],
    ['47992675729716', 'Platinum', 230000],
    ['47992675795252', 'Booster JLO', 300000],
  ],
  'laser-duoglide': [],
  'depilacion-laser': [],
  'accent-prime': [
    ['48092068118836', 'Espalda: 4 sesiones', 673500],
    ['48092046524724', 'Brazos: 4 sesiones', 487000],
    ['48092068151604', 'Abdomen: 4 sesiones', 673500],
    ['48092068184372', 'Piernas completas: 4 sesiones', 935000],
  ],
  endermologie: [],
  'hollywood-peel': [['48092149449012', 'Default Title', 225000]],
  liftage: [],
  'red-touch': [
    ['48092106129716', 'Cara', 200000],
    ['48092113436980', 'Cara y cuello', 250000],
  ],
  'natura-peel': [['48092087451956', 'Default Title', 380000]],
  'masaje-piedras-calientes': [['48018502779188', 'Default Title', 208000]],
  'masaje-relajante': [['48018502648116', 'Default Title', 151000]],
  'masaje-deep-tissue': [['48018502385972', 'Default Title', 170000]],
  oxygeneo: [
    ['48092148334900', 'Revive', 220000],
    ['48092148367668', 'Illuminate', 220000],
    ['48092148400436', 'Balance', 220000],
    ['48092148433204', 'Hydrate', 220000],
    ['48092148465972', 'Detox', 220000],
    ['48092148498740', 'Glam', 220000],
  ],
  'diamond-glow': [['47992698798388', 'Default Title', 255000]],
}

describe('Bouclier recovery treatment registry', () => {
  it('keeps the 15 current source services separate from local clinical protocols', () => {
    expect(SOURCE_TREATMENTS.map(({ slug }) => slug)).toEqual(SOURCE_SLUGS)
    expect(SOURCE_TREATMENTS).toHaveLength(15)
    expect(CLINICAL_PROTOCOLS.length).toBeGreaterThan(0)
    expect(SOURCE_TREATMENTS.every(({ source }) => source === 'source')).toBe(true)
    expect(CLINICAL_PROTOCOLS.every(({ source }) => source === 'clinical')).toBe(true)
    expect(TREATMENTS).toEqual([...SOURCE_TREATMENTS, ...CLINICAL_PROTOCOLS])
  })

  it('exposes the complete booking and media contract with unique covers', () => {
    expect(new Set(TREATMENTS.map(({ cover }) => cover)).size).toBe(TREATMENTS.length)

    TREATMENTS.forEach((treatment) => {
      REQUIRED_FIELDS.forEach((field) => expect(treatment[field], `${treatment.slug}.${field}`).toBeTruthy())
      expect(TREATMENT_CATEGORIES.some(({ id }) => id === treatment.category)).toBe(true)
      expect(treatment.gallery.length).toBeGreaterThan(0)
      expect(treatment.gallery[0]).toBe(treatment.cover)
      expect(treatment.durationMinutes).toBeGreaterThan(0)
      expect(['direct', 'quote']).toContain(treatment.bookingMode)
      expect(getTreatmentBySlug(treatment.slug)).toBe(treatment)
      treatment.variants.forEach((variant) => {
        expect(variant).toEqual(expect.objectContaining({
          id: expect.any(String),
          name: expect.any(String),
          priceMxnMinor: expect.any(Number),
          active: expect.any(Boolean),
        }))
      })
    })
  })

  it('preserves source active prices and explicit quote states', () => {
    const activeVariants = Object.fromEntries(SOURCE_TREATMENTS.map((treatment) => [
      treatment.slug,
      treatment.variants
        .filter(({ active }) => active)
        .map(({ id, name, priceMxnMinor }) => [id, name, priceMxnMinor]),
    ]))

    expect(activeVariants).toEqual(EXPECTED_ACTIVE_VARIANTS)
    expect(getTreatmentBySlug('laser-duoglide').bookingMode).toBe('quote')
    expect(getTreatmentBySlug('endermologie').bookingMode).toBe('quote')
    expect(getTreatmentBySlug('liftage').bookingMode).toBe('quote')
  })

  it('registers exactly the six real local before-and-after assets', () => {
    expect(CLINICAL_RESULTS).toEqual([
      expect.objectContaining({ image: '/assets/img/perfilamiento.png' }),
      expect.objectContaining({ image: '/assets/img/acne-tratamiento.png' }),
      expect.objectContaining({ image: '/assets/img/filler-labios.png' }),
      expect.objectContaining({ image: '/assets/img/flacidez.png' }),
      expect.objectContaining({ image: '/assets/img/calvicie.png' }),
      expect.objectContaining({ image: '/assets/img/reduccion-corporal.png' }),
    ])
  })

  it('contains no store, cart, stock, shipping, or purchase language', () => {
    const serialized = JSON.stringify({ SOURCE_TREATMENTS, CLINICAL_PROTOCOLS })
    expect(serialized).not.toMatch(/shopify|tienda|carrito|stock|env[ií]o|comprar|agregar al carrito|\/products\//i)
  })
})
