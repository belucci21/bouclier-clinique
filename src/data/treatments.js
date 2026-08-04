export const TREATMENT_CATEGORIES = Object.freeze([
  { id: 'limpieza-profunda', name: 'Limpieza profunda', shortName: 'Limpieza profunda' },
  { id: 'laser-facial', name: 'Láser facial', shortName: 'Láser facial' },
  { id: 'firmeza', name: 'Firmeza y rejuvenecimiento', shortName: 'Firmeza' },
  { id: 'corporal', name: 'Tratamientos corporales', shortName: 'Corporal' },
  { id: 'relajacion', name: 'Relajación y recuperación', shortName: 'Relajación' },
  { id: 'dermatologia-clinica', name: 'Dermatología clínica y protocolos', shortName: 'Dermatología clínica' },
])

export const CLINICAL_CONCERNS = Object.freeze([
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
])

const sourceAsset = (slug, count = 1) => Array.from(
  { length: count },
  (_, index) => `/assets/treatments/source/${slug}-${index + 1}.webp`,
)

const sourceTreatment = ({ gallery, variants, ...treatment }) => Object.freeze({
  source: 'source',
  bookingMode: variants.some(({ active, priceMxnMinor }) => active && priceMxnMinor > 0) ? 'direct' : 'quote',
  durationMinutes: 60,
  ...treatment,
  cover: gallery[0],
  image: gallery[0],
  gallery: Object.freeze(gallery),
  variants: Object.freeze(variants.map((variant) => Object.freeze(variant))),
  faqs: Object.freeze(treatment.faqs ?? []),
})

const variant = (id, name, priceMxnMinor, active) => ({ id, name, priceMxnMinor, active })

export const SOURCE_TREATMENTS = Object.freeze([
  sourceTreatment({
    slug: 'laser-duoglide-exion-micropuncion',
    name: 'Láser Duoglide/Exion Micropunción',
    category: 'laser-facial',
    eyebrow: 'Remodelación fraccionada',
    summary: 'Control inteligente de energía para remodelar colágeno, textura, cicatrices y manchas.',
    description: 'EXION Fracc, Control de Pulsos por Inteligencia Artificial. Dosifica la energía inteligente para limitar la percepción dolorosa. La energía es entregada únicamente desde la punta de la aguja. Hace una contracción y desnaturalización del colágeno viejo y fibras de elastina. Conduce a una fuerte remodelación del tejido que se ve como: estiramiento de la piel, corrección de tejido fibrótico como cicatrices, mejora la textura de la piel y trata las manchas de la piel.',
    indications: 'Cicatrices por acné, accidente, quemaduras o procedimientos; textura irregular, firmeza y manchas seleccionadas.',
    expectations: 'Remodelación gradual del tejido con recuperación ajustada a la profundidad y zona tratadas.',
    technology: 'Micropunción fraccionada Exion con control inteligente de pulsos y energía desde la punta.',
    gallery: sourceAsset('laser-duoglide-exion-micropuncion'),
    variants: [variant('48092084797748', 'Default Title', 0, false)],
    faqs: ['La profundidad y la energía se definen después de valorar fototipo, cicatrización y objetivo clínico.'],
  }),
  sourceTreatment({
    slug: 'hydrafacial',
    name: 'Hydrafacial',
    category: 'limpieza-profunda',
    eyebrow: 'Limpieza profunda',
    summary: 'Hidratación profunda, limpieza y renovación en un protocolo de cuatro pasos.',
    description: 'Protocolo de 4 pasos de limpieza profunda que incluyen: 1) limpieza, 2) exfoliación, 3) extracción de impurezas y 4) hidratación con antioxidantes.',
    indications: 'Piel congestionada, textura irregular, poros visibles, deshidratación o falta de luminosidad.',
    expectations: 'Piel limpia, hidratada y luminosa con recuperación mínima y activos adaptados a cada piel.',
    technology: 'Hidrodermoabrasión, extracción e infusión controlada de antioxidantes.',
    gallery: sourceAsset('hydrafacial', 4),
    variants: [
      variant('47992677695796', 'Signature', 140000, false),
      variant('47992673763636', 'Deluxe', 180000, true),
      variant('47992675729716', 'Platinum', 230000, true),
      variant('47992675762484', 'Murad Retinol', 290000, false),
      variant('47992675795252', 'Booster JLO', 300000, true),
    ],
    faqs: ['La intensidad y los activos se personalizan tras revisar sensibilidad y antecedentes.'],
  }),
  sourceTreatment({
    slug: 'laser-duoglide',
    name: 'Láser Duoglide',
    category: 'laser-facial',
    eyebrow: 'Remodelación láser',
    summary: 'Tecnología CO₂ + 1540 nm para estimular tejido con precisión y recuperación controlada.',
    description: 'La sinergia de las dos longitudes de onda de CO2+1540 nm también logra el calentamiento, adyacente y no coagulante de toda la zona de escaneo, y alcanza una gran profundidad dérmica. El efecto térmico alcanza un nivel de profundidad que maximiza la acción de estimulación tisular y, por tanto, se obtiene un tratamiento aún más eficaz con tiempos de cicatrización reducidos.',
    indications: 'Textura marcada, cicatrices, signos de fotoenvejecimiento o lesiones seleccionadas tras diagnóstico.',
    expectations: 'Mejora progresiva de textura y calidad de piel con recuperación proporcional a la profundidad.',
    technology: 'Sinergia láser CO₂ + 1540 nm con estimulación térmica profunda y controlada.',
    gallery: sourceAsset('laser-duoglide'),
    variants: [variant('48092079358260', 'Default Title', 0, false)],
  }),
  sourceTreatment({
    slug: 'depilacion-laser',
    name: 'Depilación Láser',
    category: 'corporal',
    eyebrow: 'Reducción progresiva de vello',
    summary: 'Reducción progresiva de vello con plataformas médicas adaptables al fototipo y calibre.',
    description: 'MEDIOSTAR MONOLITH es el equipo más potente con la máxima frecuencia disponible en el mercado. Combinación única de longitudes de onda 810/940 nm con piezas de mano Monolith con refrigeración de contacto 360°, mecánica única para un mantenimiento sencillo y sistema de operación intuitivo. INMODE Triton® es una opción de depilación láser adaptable a distintos tipos de vello y color de piel. Su innovación radica en optimizar la potencia y la velocidad del pulso; tres ondas simultáneas disponibles en una plataforma con emisión paralela y triple enfriamiento permiten tratar el vello de distintas partes del cuerpo.',
    indications: 'Vello no deseado y pseudofoliculitis en zonas valoradas previamente.',
    expectations: 'Reducción progresiva que requiere varias sesiones y mantenimiento; no todos los colores responden igual.',
    technology: 'MedioStar Monolith 810/940 nm e InMode Triton con enfriamiento de contacto.',
    gallery: sourceAsset('depilacion-laser', 3),
    variants: [variant('48092075229492', 'Default Title', 0, false)],
  }),
  sourceTreatment({
    slug: 'accent-prime',
    name: 'Accent Prime',
    category: 'corporal',
    eyebrow: 'Contorno corporal',
    summary: 'Remodela, reafirma y mejora la textura de la piel con un protocolo corporal no invasivo.',
    description: 'Tratamiento 3 en 1: eliminación de grasa no deseada, celulitis y tensado de la piel. Plataforma para remodelación corporal que se centra simultáneamente en la reducción de tejido graso, la producción y mejora de colágeno y la tonificación de la piel.',
    indications: 'Adiposidad localizada, celulitis y laxitud corporal leve o moderada.',
    expectations: 'Cambios graduales de contorno y firmeza que dependen del tejido, la zona y el plan de sesiones.',
    technology: 'Radiofrecuencia y ultrasonido combinados según la zona y el objetivo.',
    durationMinutes: 75,
    gallery: sourceAsset('accent-prime', 4),
    variants: [
      variant('48092068118836', 'Espalda: 4 sesiones', 673500, true),
      variant('48092046524724', 'Brazos: 4 sesiones', 487000, true),
      variant('48092068151604', 'Abdomen: 4 sesiones', 673500, true),
      variant('48092068184372', 'Piernas completas: 4 sesiones', 935000, true),
    ],
  }),
  sourceTreatment({
    slug: 'endermologie',
    name: 'Endermologie',
    category: 'corporal',
    eyebrow: 'Celulitis y drenaje',
    summary: 'Estimulación mecánica no invasiva para tonificar, alisar y mejorar la calidad de la piel.',
    description: 'Endermologie®, la única técnica 100 % natural, no invasiva y no agresiva de estimulación mecánica de la piel que permite reactivar el mecanismo de las células. Ejercita la piel y el tejido graso para suavizarlo y eliminar las acumulaciones fibrosas. Simultáneamente, la acción mecánica del cabezal estimula la eliminación natural de la grasa y reafirma la piel para devolverle su tonicidad y un aspecto más liso.',
    indications: 'Celulitis, retención de líquidos, textura corporal o recuperación en protocolos seleccionados.',
    expectations: 'Sensación de ligereza y cambios progresivos de textura que requieren constancia.',
    technology: 'Estimulación mecánica con rodillos motorizados y aspiración controlada.',
    gallery: sourceAsset('endermologie'),
    variants: [variant('48092069134644', 'Default Title', 0, false)],
  }),
  sourceTreatment({
    slug: 'hollywood-peel',
    name: 'Hollywood Peel',
    category: 'laser-facial',
    eyebrow: 'Tono y textura',
    summary: 'Peeling de carbón y láser Q-Switch para luminosidad, poros, textura y tono.',
    description: 'Hollywood Peel es un tratamiento de rejuvenecimiento facial. Consiste en aplicar una fina capa de carbón activo sobre el rostro para luego retirarlo emitiendo luz láser sobre el carbono; este es vaporizado eliminando las células muertas al instante con tecnología Q-Switch de Quanta System. Sus beneficios incluyen mejorar luminosidad, elasticidad e hidratación; regular la producción sebácea; reducir marcas de acné; estimular colágeno; favorecer la circulación y unificar el tono. Ideal para tratar melasma, poros y textura.',
    indications: 'Tono apagado, poros, textura irregular, exceso de sebo o marcas de acné seleccionadas.',
    expectations: 'Mejora visible de luminosidad y textura con recuperación breve y fotoprotección estricta.',
    technology: 'Carbón activo y láser Q-Switch de Quanta System.',
    gallery: sourceAsset('hollywood-peel', 2),
    variants: [variant('48092149449012', 'Default Title', 225000, true)],
  }),
  sourceTreatment({
    slug: 'liftage',
    name: 'Liftage',
    category: 'firmeza',
    eyebrow: 'Firmeza facial',
    summary: 'Ultrasonido focalizado de alta frecuencia para remodelar tejido en profundidad.',
    description: 'LIFTAGE es un HIFU que aplica un haz de ultrasonido de alta frecuencia en la piel para remodelar el tejido de alguna zona afectada. Con el uso de los transductores logra entregar ondas de ultrasonido uniformemente en las múltiples capas de la piel y tejidos corporales, sin necesidad de contacto directo con la epidermis.',
    indications: 'Laxitud facial leve o moderada, pérdida de definición y zonas corporales seleccionadas.',
    expectations: 'Firmeza gradual condicionada por la calidad del colágeno, anatomía y plan indicado.',
    technology: 'HIFU con transductores para distintas capas de piel y tejido.',
    gallery: sourceAsset('liftage', 4),
    variants: [
      variant('48092113666356', 'Fullface', 0, false),
      variant('48092113699124', 'Mejilla y papada', 0, false),
      variant('48092116451636', 'Tercio superio: contorno de ojos y frente', 0, false),
    ],
  }),
  sourceTreatment({
    slug: 'red-touch',
    name: 'Red Touch',
    category: 'laser-facial',
    eyebrow: 'Láser de colágeno',
    summary: 'Estimula colágeno y acompaña protocolos de melasma, acné, rosácea y rejuvenecimiento.',
    description: 'RedTouch es el primer sistema con absorción selectiva por parte del colágeno. La capa epidérmica no sufre daños, lo cual reduce los efectos secundarios del tratamiento. Es una tecnología capaz de ofrecer sesiones no invasivas. Ideal para tratar: melasma, acné, rejuvenecimiento y rosácea.',
    indications: 'Melasma seleccionado, acné, rosácea y signos visibles de envejecimiento.',
    expectations: 'Estimulación progresiva de colágeno con sesiones no invasivas y cuidado epidérmico.',
    technology: 'Láser no ablativo con absorción selectiva por el colágeno.',
    gallery: sourceAsset('red-touch', 5),
    variants: [
      variant('48092106129716', 'Cara', 200000, true),
      variant('48092113436980', 'Cara y cuello', 250000, true),
    ],
  }),
  sourceTreatment({
    slug: 'natura-peel',
    name: 'Natura Peel',
    category: 'laser-facial',
    eyebrow: 'Renovación facial',
    summary: 'Renueva, suaviza y mejora poros, textura, manchas y líneas finas.',
    description: 'NaturaPeel® es un novedoso tratamiento de Quanta System para luchar contra los signos del envejecimiento cutáneo, desde impurezas de la piel y poros abiertos hasta líneas de expresión finas. Busca una apariencia uniforme y sana, reducción del tamaño de los poros y mayor suavidad. Combina un procedimiento relajante con crema de principios activos naturales. Ideal para tratar melasma, poros, textura y cicatrices.',
    indications: 'Impurezas, poros visibles, líneas finas, melasma, textura y cicatrices seleccionadas.',
    expectations: 'Piel más uniforme y suave, con un protocolo adaptado a sensibilidad y fototipo.',
    technology: 'Plataforma NaturaPeel® de Quanta System y activos tópicos seleccionados.',
    gallery: sourceAsset('natura-peel', 3),
    variants: [variant('48092087451956', 'Default Title', 380000, true)],
  }),
  sourceTreatment({
    slug: 'masaje-piedras-calientes',
    name: 'Masaje Piedras Calientes',
    category: 'relajacion',
    eyebrow: 'Relajación profunda',
    summary: 'Piedras volcánicas y masaje relajante para aliviar tensión y favorecer descanso.',
    description: 'Terapia oriental que trabaja en el plano físico y mental, aliviando tensiones musculares y equilibrando la energía. Se utilizan piedras lisas de origen volcánico que se deslizan sobre la piel con un masaje relajante.',
    indications: 'Tensión muscular leve, cansancio y búsqueda de una experiencia de relajación corporal.',
    expectations: 'Sensación temporal de descanso con presión y temperatura personalizadas.',
    technology: 'Técnicas manuales y piedras lisas de origen volcánico a temperatura controlada.',
    durationMinutes: 75,
    gallery: sourceAsset('masaje-piedras-calientes'),
    variants: [variant('48018502779188', 'Default Title', 208000, true)],
  }),
  sourceTreatment({
    slug: 'masaje-relajante',
    name: 'Masaje Relajante',
    category: 'relajacion',
    eyebrow: 'Bienestar',
    summary: 'Trabajo manual de ritmo suave para favorecer circulación, flexibilidad y descanso.',
    description: 'Tratamiento del cuerpo por frotamiento, amasamiento y percusión; tiene como finalidad activar el flujo de la sangre y la linfa, aumentar la flexibilidad de los músculos, aliviar el cansancio o inducir el sueño.',
    indications: 'Estrés, cansancio y tensión leve sin patología aguda.',
    expectations: 'Bienestar temporal y reducción subjetiva de tensión con presión adaptada.',
    technology: 'Técnicas manuales de frotamiento, amasamiento y percusión.',
    durationMinutes: 60,
    gallery: sourceAsset('masaje-relajante'),
    variants: [variant('48018502648116', 'Default Title', 151000, true)],
  }),
  sourceTreatment({
    slug: 'masaje-deep-tissue',
    name: 'Masaje Deep Tissue',
    category: 'relajacion',
    eyebrow: 'Liberación muscular',
    summary: 'Presión profunda para trabajar tensión muscular por debajo de las capas superficiales.',
    description: 'Es una técnica para tratar problemas crónicos musculares por debajo de las capas superficiales del músculo, produciendo un estado de relajación más profundo y duradero.',
    indications: 'Sobrecarga y tensión muscular crónica sin lesión aguda ni contraindicación médica.',
    expectations: 'Liberación muscular profunda; puede existir sensibilidad transitoria posterior.',
    technology: 'Técnicas manuales de presión profunda realizadas por personal capacitado.',
    durationMinutes: 60,
    gallery: sourceAsset('masaje-deep-tissue'),
    variants: [variant('48018502385972', 'Default Title', 170000, true)],
  }),
  sourceTreatment({
    slug: 'oxygeneo',
    name: 'Oxygeneo',
    category: 'limpieza-profunda',
    eyebrow: 'Oxigenación y luminosidad',
    summary: 'Oxigena, exfolia e infunde nutrientes esenciales en un protocolo facial no invasivo.',
    description: 'Combina una suave exfoliación, una oxigenación natural a la piel y un rejuvenecimiento facial profundo con la infusión de nutrientes revitalizantes esenciales.',
    indications: 'Piel opaca, deshidratada o con textura superficial irregular.',
    expectations: 'Piel más luminosa, uniforme e hidratada con recuperación mínima.',
    technology: 'Exfoliación, oxigenación natural e infusión de nutrientes revitalizantes.',
    gallery: sourceAsset('oxygeneo', 9),
    variants: [
      variant('48092148334900', 'Revive', 220000, true),
      variant('48092148367668', 'Illuminate', 220000, true),
      variant('48092148400436', 'Balance', 220000, true),
      variant('48092148433204', 'Hydrate', 220000, true),
      variant('48092148465972', 'Detox', 220000, true),
      variant('48092148498740', 'Glam', 220000, true),
      variant('48092148531508', 'Retouch', 255000, false),
    ],
  }),
  sourceTreatment({
    slug: 'diamond-glow',
    name: 'Diamond Glow',
    category: 'limpieza-profunda',
    eyebrow: 'Renovación superficial',
    summary: 'Exfoliación con punta de diamante para limpiar y revitalizar profundamente la piel.',
    description: 'La varita patentada de DiamondGlow, con punta de diamante incrustada, ofrece un tratamiento de rejuvenecimiento de nivel superior que limpia y revitaliza profundamente la piel.',
    indications: 'Textura áspera, tono apagado, poros visibles y acumulación superficial de células.',
    expectations: 'Mejora de suavidad y luminosidad con intensidad adaptada a cada zona.',
    technology: 'Varita DiamondGlow con punta de diamante incrustada.',
    gallery: sourceAsset('diamond-glow', 2),
    variants: [variant('47992698798388', 'Default Title', 255000, true)],
  }),
])

const clinicalTreatment = (treatment) => {
  const gallery = [`/assets/treatments/protocols/${treatment.slug}.webp`]
  const variants = treatment.variants ?? [variant(`clinical-${treatment.slug}`, 'Valoración personalizada', 0, false)]
  return Object.freeze({
    source: 'clinical',
    category: 'dermatologia-clinica',
    bookingMode: 'quote',
    durationMinutes: 60,
    technology: 'Protocolo dermatológico personalizado según valoración médica.',
    expectations: 'El plan y los resultados dependen del diagnóstico, antecedentes y respuesta individual.',
    ...treatment,
    cover: gallery[0],
    image: gallery[0],
    gallery: Object.freeze(gallery),
    variants: Object.freeze(variants.map((item) => Object.freeze(item))),
    faqs: Object.freeze(treatment.faqs ?? ['La valoración confirma indicación, seguridad y plan de sesiones.']),
  })
}

export const CLINICAL_PROTOCOLS = Object.freeze([
  clinicalTreatment({ slug: 'exion-facial', name: 'Exion Facial', eyebrow: 'Remodelación de piel', summary: 'Remodelación cutánea para textura, firmeza y signos visibles de fotoenvejecimiento.', description: 'Protocolo facial personalizado para trabajar textura, firmeza y calidad de piel.', indications: 'Líneas finas, textura irregular, cicatrices seleccionadas y pérdida de firmeza.', technology: 'Radiofrecuencia y micropunción controlada en protocolos seleccionados.' }),
  clinicalTreatment({ slug: 'retiro-tatuaje-cejas', name: 'Retiro de tatuaje de cejas', eyebrow: 'Corrección láser', summary: 'Atenuación gradual de tatuaje o micropigmentación no deseada en cejas.', description: 'Protocolo láser para atenuar pigmentos de tatuaje o micropigmentación en la zona de las cejas.', indications: 'Pigmentos no deseados, cambios de color o diseños que requieren corrección médica.', technology: 'Láser dermatológico seleccionado según pigmento, profundidad y respuesta de la piel.' }),
  clinicalTreatment({ slug: 'manchas-y-melasma', name: 'Manchas y melasma', eyebrow: 'Dermatología pigmentaria', summary: 'Diagnóstico y protocolo combinado para controlar pigmentación con seguimiento médico.', description: 'Diagnóstico dermatológico y protocolo personalizado para melasma, lentigos e hiperpigmentación.', indications: 'Melasma, lentigos y pigmentación posterior a inflamación, previa confirmación diagnóstica.', technology: 'Tecnologías láser integradas con tratamiento dermatológico y fotoprotección.', legacyPath: '/manchas' }),
  clinicalTreatment({ slug: 'blefaroplastia-no-quirurgica', name: 'Blefaroplastia no quirúrgica', eyebrow: 'Rejuvenecimiento de mirada', summary: 'Protocolo médico para mejorar la calidad de la piel y el contorno ocular sin cirugía.', description: 'Protocolo médico para mejorar la calidad de la piel y la apariencia del contorno ocular sin cirugía.', indications: 'Laxitud leve, textura y signos de envejecimiento alrededor de los ojos.', technology: 'Láser, radiofrecuencia y bioestimulación según valoración.', legacyPath: '/blefaroplastia' }),
  clinicalTreatment({ slug: 'exion-body', name: 'Exion Body', eyebrow: 'Firmeza corporal', summary: 'Protocolo corporal no quirúrgico para firmeza y remodelación del tejido.', description: 'Tratamiento corporal no quirúrgico para acompañar protocolos de firmeza y remodelación del tejido.', indications: 'Laxitud, textura irregular y zonas que requieren un plan de remodelación personalizado.', technology: 'Radiofrecuencia y energía focalizada con parámetros adaptados a cada zona.' }),
  clinicalTreatment({ slug: 'estrias', name: 'Tratamiento de estrías', eyebrow: 'Remodelación de textura', summary: 'Plan personalizado para atenuar textura y color de estrías recientes o maduras.', description: 'Protocolo personalizado para mejorar textura, color y apariencia de estrías recientes o maduras.', indications: 'Estrías asociadas a crecimiento, embarazo, variaciones de peso u otros cambios del tejido.', technology: 'Láser, micropunción o bioestimulación según tipo y antigüedad.' }),
  clinicalTreatment({ slug: 'emface', name: 'Emface', eyebrow: 'Soporte facial', summary: 'Tratamiento facial no invasivo orientado al tono muscular y tejido de soporte.', description: 'Tratamiento facial no invasivo orientado al tono muscular y a la calidad del tejido de soporte.', indications: 'Pérdida leve de definición facial y pacientes que buscan opciones sin agujas ni cirugía.', technology: 'Energía electromagnética sincronizada y radiofrecuencia de uso facial.' }),
  clinicalTreatment({ slug: 'morpheus-8', name: 'Morpheus 8', eyebrow: 'Firmeza y textura', summary: 'Remodelación fraccionada para firmeza, textura y signos de envejecimiento.', description: 'Remodelación fraccionada para mejorar firmeza, textura y signos visibles de envejecimiento.', indications: 'Laxitud, cicatrices, textura irregular y fotoenvejecimiento en casos seleccionados.', technology: 'Radiofrecuencia fraccionada con microagujas y profundidad ajustable.' }),
  clinicalTreatment({ slug: 'tratamiento-capilar', name: 'Protocolo capilar', eyebrow: 'Salud del cuero cabelludo', summary: 'Evaluación dermatológica y plan personalizado para caída y calidad del cabello.', description: 'Evaluación dermatológica y plan personalizado para caída y calidad del cabello.', indications: 'Caída difusa, afinamiento o alteraciones del cuero cabelludo.', technology: 'Tricoscopia y tratamientos médicos o procedimientos según indicación.' }),
])

export const CLINICAL_RESULTS = Object.freeze([
  { id: 'perfilamiento', name: 'Perfilamiento', image: '/assets/img/perfilamiento.png' },
  { id: 'acne', name: 'Acné', image: '/assets/img/acne-tratamiento.png' },
  { id: 'armonizacion-labial', name: 'Armonización labial', image: '/assets/img/filler-labios.png' },
  { id: 'flacidez', name: 'Flacidez', image: '/assets/img/flacidez.png' },
  { id: 'capilar', name: 'Capilar', image: '/assets/img/calvicie.png' },
  { id: 'reduccion-corporal', name: 'Reducción corporal', image: '/assets/img/reduccion-corporal.png' },
])

export const TREATMENTS = Object.freeze([...SOURCE_TREATMENTS, ...CLINICAL_PROTOCOLS])

export function getTreatmentBySlug(slug) {
  return TREATMENTS.find((treatment) => treatment.slug === slug)
}

export function getTreatmentPriceLabel(treatment) {
  const activePrices = treatment.variants
    .filter(({ active, priceMxnMinor }) => active && priceMxnMinor > 0)
    .map(({ priceMxnMinor }) => priceMxnMinor)

  if (treatment.bookingMode === 'quote' || activePrices.length === 0) return 'Cotizar en valoración'

  const minimum = Math.min(...activePrices) / 100
  return `Desde ${new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0,
  }).format(minimum)} MXN`
}
