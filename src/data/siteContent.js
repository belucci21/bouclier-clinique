export const SITE_CONTENT = Object.freeze({
  name: 'Bouclier Dermatología',
  legalOwner: 'Dra. Gissel Ivonne Castellanos Ramos',
  tagline: 'Dermatología, estética y láser con criterio médico.',
  email: 'bouclier.bdr@gmail.com',
  phone: {
    e164: '+522291087016',
    display: '+52 229 108 7016',
    whatsappUrl: 'https://api.whatsapp.com/send?phone=522291087016&text=Hola%2C%20quiero%20agendar%20una%20cita%20en%20Bouclier',
  },
  location: {
    name: 'Bouclier Dermatología Boca del Río',
    street: 'Torre EXERTIA, oficinas 704 y 706, Barco Viejo s/n, Col. Mocambo, C.P. 94293',
    city: 'Boca del Río, Veracruz',
    mapsUrl: 'https://maps.app.goo.gl/ERrkiKWpfEh14T37A',
  },
  hours: [
    { days: 'Lunes a viernes', time: '10:00–14:00 · 15:00–19:00' },
    { days: 'Sábado', time: '10:00–15:00' },
  ],
  social: {
    instagram: 'https://www.instagram.com/bouclier_dermatologia_/',
    facebook: 'https://www.facebook.com/Bouclier.boca/?locale=es_LA',
  },
  doctor: {
    name: 'Dra. Gissel Castellanos',
    fullName: 'Dra. Gissel Ivonne Castellanos Ramos',
    title: 'Médico especialista en Dermatología',
    generalLicense: '5496751 UV',
    specialtyLicense: '7515215 UNAM',
    education: [
      'Medicina General, Universidad Veracruzana, 2007.',
      'Especialidad en Dermatología, UNAM, 2012.',
      'Máster en Tricología y Trasplante Capilar, Universidad de Alcalá de Henares, España, 2023.',
    ],
  },
})

export const CLINICAL_FAQS = Object.freeze([
  {
    question: '¿Cómo sé qué tratamiento necesita mi piel?',
    answer: 'La indicación parte de una valoración médica. Revisamos antecedentes, estado actual de la piel y objetivos antes de recomendar un protocolo.',
  },
  {
    question: '¿Cómo debo acudir a mi cita?',
    answer: 'Llega a la hora confirmada y, si es posible, sin maquillaje. Informa medicamentos, alergias, procedimientos recientes y cualquier cambio de salud.',
  },
  {
    question: '¿Los resultados son iguales para todas las personas?',
    answer: 'No. La respuesta depende del diagnóstico, el fototipo, los antecedentes y la adherencia al plan. En consulta explicamos expectativas y recuperación.',
  },
  {
    question: '¿Puedo agendar directamente un procedimiento?',
    answer: 'Puedes seleccionar el motivo de consulta, pero la indicación definitiva se confirma durante la valoración para cuidar tu seguridad.',
  },
])

export const PRIVACY_NOTICE = Object.freeze([
  {
    title: 'Responsable',
    body: 'La Dra. Gissel Ivonne Castellanos Ramos, responsable de Bouclier Dermatología, con domicilio en Torre EXERTIA, oficinas 704 y 706, Barco Viejo s/n, Col. Mocambo, C.P. 94293, Boca del Río, Veracruz, es responsable de recabar, tratar y proteger sus datos personales.',
  },
  {
    title: 'Datos recabados',
    body: 'Podemos recabar datos de identificación, contacto, fiscales y datos sensibles de salud necesarios para integrar el expediente clínico, establecer diagnósticos y prestar los servicios solicitados. La información recibe tratamiento confidencial.',
  },
  {
    title: 'Finalidades',
    body: 'La información puede utilizarse para agendar, confirmar o cancelar citas; integrar expedientes; prestar servicios; emitir comprobantes y recetas; establecer diagnósticos y planes; y comunicar información relacionada con la atención.',
  },
  {
    title: 'Derechos ARCO',
    body: 'Puede solicitar acceso, rectificación, cancelación u oposición escribiendo a bouclier.bdr@gmail.com. La solicitud debe identificar al titular, indicar un medio de respuesta y describir con claridad los datos o el derecho que desea ejercer.',
  },
  {
    title: 'Actualizaciones',
    body: 'Este aviso puede actualizarse para atender cambios legales o de operación. Las modificaciones se comunicarán mediante este sitio o avisos visibles en la clínica.',
  },
])
