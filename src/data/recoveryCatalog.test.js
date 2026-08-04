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

const EXPECTED_SOURCE_DESCRIPTIONS = {
  'laser-duoglide-exion-micropuncion': 'EXION Fracc, Control de Pulsos por Inteligencia Artificial. Dosifica la energía inteligente para limitar la percepción dolorosa. La energía es entregada únicamente desde la punta de la aguja. Hace una contracción y desnaturalización del colágeno viejo y fibras de elastina\n\nConduce a una fuerte remodelación del tejido que se ve como: Estiramiento de la piel, Corrección de tejido fibrótico como cicatrices, Mejora la textura de la piel, Trata las manchas de la piel.\n\nCicatrices por acné\nCicatrices por accidente\nCicatrices post operatorios\nCicatrices por quemaduras',
  hydrafacial: 'Protocolo de 4 pasos de limpieza profunda que incluyen: 1) limpieza, 2) exfoliación, 3)extracción de impurezas y 4) hidratación con antioxidantes.',
  'laser-duoglide': 'La sinergia de las dos longitudes de onda de CO2+1540 nm también logra el calentamiento, adyacente y no coagulante de toda la zona de escaneo, y alcanza una gran profundidad dérmica.\n\nEl efecto térmico alcanza un nivel de profundidad que maximiza la acción de estimulación tisular y, por tanto, se obtiene un tratamiento aún más eficaz con tiempos de cicatrización reducidos.',
  'depilacion-laser': 'MEDIOSTAR MONOLITH es el equipo más potente con la maxima frecuencia disponible en el mercado. Combinación única de longitudes de onda 810/940 nm con piezas de mano Monolith con refrigeración de contacto 360°, Mecánica única para un mantenimiento sencillo, Sistema de operación intuitivo.\n\nINMODE Triton® la mejor opción para depilación láser adaptable a todo tipo de vello y color de piel, siempre al cuidado de la seguridad del pacientes. Su innovación radica en optimizar la potencia así como la velocidad del pulso para obtener resultados satisfactorios desde la primera sesión; de igual forma, las tres ondas simultáneas disponibles en una sola plataforma con emisión paralela así como triple enfriamiento brinda máxima efectividad para eliminar el vello de cualquier parte del cuerpo.',
  'accent-prime': 'Tratamiento 3 en 1: eliminación de grasa no deseada, celulitis y tensado de la piel. plataforma líder para remodelación corporal, se centra simultáneamente en la reducción de tejido graso, en la producción y mejora de colágeno y en la tonificación de la piel',
  endermologie: 'Endermologie®, la única técnica 100 % natural, no invasiva y no agresiva de estimulación mecánica de la piel que permite reactivar el mecanismo de las células. Ejercita la piel y el tejido graso para suavizarlo y eliminar las acumulaciones fibrosas.\n\nSimultáneamente, la acción mecánica del cabezal de tratamiento estimula la eliminación natural de la grasa y reafirma la piel para devolverle su tonicidad y un aspecto más liso.',
  'hollywood-peel': 'Hollywood Peel es un tratamiento que ofrece unos increíbles resultados de rejuvenecimiento facial. Consiste en aplicar una fina capa de carbón activo sobre el rostro, para luego retirarlo emitiendo luz laser sobre el carbono, este es vaporizado eliminando todas las células muertas al instante, se realiza con la más alta e innovadora tecnología en cuanto a láser, conocida como Q-Switch de Quanta System.\n\nBeneficios:\nMejora la luminosidad, elasticidad e hidratación de la piel.\nActúa como destructor bactericida y regula la producción de las glándulas sebáceas.\nReduce las marcas de acné.\nEstimula la producción del colágeno.\nAumenta la circulación sanguínea rejuveneciendo la piel.\nUnifica el tono de la piel.\n\nIdeal para tratar melasma, poros y textura.',
  liftage: 'LIFTAGE es un HIFU que aplica un haz de ultrasonido de alta frecuencia en la piel para remodelar el tejido de alguna zona afectada. Con el uso de los transductores logra entregar ondas de ultrasonido uniformemente en las múltiples capas de la piel y tejidos corporales, sin necesidad de contacto directo con la epidermis',
  'red-touch': 'RedTouch es el primer sistema con absorción selectiva por parte del colágeno. La capa epidérmica no sufre daños, lo cual reduce los efectos secundarios del tratamiento. Es una nueva tecnología capaz de ofrecer al usuario sesiones de tratamiento no invasivas.\n\nIdeal para tratar: melasma, acné, rejuvenecimiento y rosácea.',
  'natura-peel': 'NaturaPeel® es un novedoso tratamiento de Quanta System para luchar contra los signos del envejecimiento cutáneo, desde impurezas de la piel y poros abiertos hasta líneas de expresión finas.\n\nLogra increibles resultados como: Apariencia de la piel uniforme y sana inmediatamente, Reducción del tamaño de los poros y la suavidad de la piel, Procedimiento relajante, Crema con principios activos naturales para un efecto antienvejecimiento más profundo.\n\nIdeal para tratar melasma, poros, textura y cicatrices',
  'masaje-piedras-calientes': 'Terapia oriental que trabaja en el plano físico y mental , aliviando tensiones musculares y equilibrando la energía. Se utilizan piedras lisas de origen volcánico que se deslizan sobre la piel con un masaje relajante.',
  'masaje-relajante': 'Tratamiento del cuerpo por frotamiento, amasamiento, y percusión, tiene como finalidad activar el flujo de la sangre y la linfa, aumentar flexibilidad de los músculos, aliviar el cansancio o inducir el sueño.',
  'masaje-deep-tissue': 'Es técnica para tratar problemas crónicos musculares por debajo de las capas superficiales del músculo, produciendo un estado de relajación más profundo y duradero.',
  oxygeneo: 'Combina una suave exfoliación, una oxigenación natural a la piel y un rejuvenecimiento facial profundo con la infusión de nutrientes revitalizantes esenciales.',
  'diamond-glow': 'La varita patentada de DiamondGlow, con punta de diamante incrustada, ofrece un tratamiento de rejuvenecimiento de nivel superior que limpia y revitaliza profundamente la piel.',
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

  it('preserves the exact source clinical descriptions without sales calls to action', () => {
    expect(Object.fromEntries(SOURCE_TREATMENTS.map(({ slug, description }) => [slug, description]))).toEqual(
      EXPECTED_SOURCE_DESCRIPTIONS,
    )
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
