import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp, Zap, Sun, Sparkles, ArrowRight, Play } from 'lucide-react'
import SEO from '../components/SEO.jsx'

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }
}

const stagger = {
  visible: { transition: { staggerChildren: 0.15 } }
}

function AnimatedSection({ children, className = '' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.section
      ref={ref}
      className={className}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={stagger}
    >
      {children}
    </motion.section>
  )
}

const faqData = [
  {
    q: '¿Cómo funciona el tratamiento de manchas Bouclier?',
    a: 'El tratamiento combina láser Aerolase Neo de 1064nm con protocolos personalizados de bioestimulación. El láser destruye selectivamente la melanina acumulada sin dañar el tejido sano, mientras que los protocolos Bouclier activan los mecanismos naturales de regeneración de la piel.'
  },
  {
    q: '¿Cuántas sesiones necesito?',
    a: 'El protocolo Bouclier para manchas consta de entre 6 y 8 sesiones, dependiendo de la profundidad y extensión de las manchas. Cada sesión dura aproximadamente 30-45 minutos. Los resultados son progresivos y visibles desde las primeras sesiones.'
  },
  {
    q: '¿Duele el tratamiento?',
    a: 'No. La tecnología Aerolase Neo utiliza pulsos ultracortos de 650 microsegundos que eliminan prácticamente la sensación de dolor. Los pacientes describen la sensación como un ligero cosquilleo. No se requiere anestesia ni numbing cream.'
  },
  {
    q: '¿Cuándo veré resultados?',
    a: 'Los primeros resultados son visibles 2-3 semanas después de la primera sesión. La eliminación completa de manchas se logra al finalizar el protocolo, con mejoras continuas hasta 3 meses después de la última sesión.'
  },
  {
    q: '¿Puedo hacer el tratamiento en verano?',
    a: 'Sí, a diferencia de otros tratamientos láser, el protocolo Bouclier con Aerolase 1064nm puede realizarse durante todo el año, incluso en verano. Sin embargo, es fundamental el uso de bloqueador solar SPF 50+ para proteger los resultados.'
  },
  {
    q: '¿Quién es candidato para este tratamiento?',
    a: 'Cualquier persona con manchas, melasma, hiperpigmentación o tono irregular de piel puede ser candidata. Durante la evaluación inicial, la Dra. Gissel determina el protocolo ideal según tu tipo de piel, historial y objetivos específicos.'
  }
]

const protocols = [
  { icon: <Sun size={40} />, name: 'Despertar', level: 'Nivel 1', text: 'Activación celular con láser de baja intensidad para preparar la piel.' },
  { icon: <Zap size={40} />, name: 'Liberación', level: 'Nivel 2', text: 'Eliminación activa de manchas con protocolos combinados de láser y bioestimulación.' },
  { icon: <Sparkles size={40} />, name: 'Renacimiento', level: 'Nivel 3', text: 'Renovación completa de la piel con resultados definitivos.' }
]

const results = [
  { src: '/assets/video/caso-1.webm', label: 'Caso 1' },
  { src: '/assets/video/caso-2.webm', label: 'Caso 2' },
  { src: '/assets/video/caso-3.webm', label: 'Caso 3' },
  { src: '/assets/video/caso-4.webm', label: 'Caso 4' },
  { src: '/assets/video/caso-5.webm', label: 'Caso 5' },
]

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="faq-item">
      <button className="faq-item__question" onClick={() => setOpen(!open)}>
        {q}
        <ChevronDown size={20} className={`faq-item__icon ${open ? 'faq-item__icon--open' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            className="faq-item__answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="faq-item__answer-inner">{a}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function Manchas() {
  return (
    <>
      <SEO
        title="Tratamiento de Manchas y Melasma | Bouclier Clinique"
        description="Tratamiento de manchas y melasma con Aerolase Neo 1064nm en CDMX y Playa del Carmen. Protocolos Bouclier: resultados reales en 6-8 sesiones sin dolor."
        canonical="https://bouclier-clinique.com/manchas"
        ogImage="/assets/img/aerolase.webp"
      />

      {/* Hero */}
      <section className="page-hero page-hero--full">
        <video
          className="page-hero__video"
          autoPlay
          muted
          loop
          playsInline
        >
          <source src="/assets/video/hero.mp4" type="video/mp4" />
        </video>
        <div className="page-hero__overlay" />
        <motion.div
          className="page-hero__content"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <p className="section-label" style={{ color: 'var(--color-accent)' }}>Tratamiento de Manchas</p>
          <h1 className="page-hero__title">¿Hasta cuándo vas a sufrir esas manchas?</h1>
          <p className="page-hero__subtitle">
            Protocolos Bouclier con tecnología Aerolase para eliminar manchas de forma definitiva. Sin dolor, sin cicatrices, sin tiempo de recuperación.
          </p>
          <div className="page-hero__actions">
            <Link to="/citas" className="btn-primary">Agendar Evaluación</Link>
            <a href="#metodo" className="btn-ghost">Conoce el Método</a>
          </div>
        </motion.div>
      </section>

      {/* Problem */}
      <AnimatedSection className="section">
        <div className="section__inner">
          <motion.div variants={fadeUp} style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <p className="section-label">El Problema</p>
            <h2 className="section-title mb-32">Las manchas no desaparecen solas</h2>
            <p style={{ fontSize: '17px', lineHeight: '1.8', color: 'var(--color-text-light)' }}>
              El melasma, las manchas solares y la hiperpigmentación son problemas que afectan a millones de personas. Los tratamientos tradicionales prometen resultados pero rara vez los entregan. Cremas que no funcionan, peelings agresivos que empeoran el problema, láseres que dejan manchas peores. En Bouclier entendemos tu frustración y hemos desarrollado una solución real.
            </p>
          </motion.div>
        </div>
      </AnimatedSection>

      {/* Method */}
      <AnimatedSection className="section section--alt" id="metodo">
        <div className="section__inner">
          <motion.div className="section__header" variants={fadeUp}>
            <p className="section-label">El Método Bouclier</p>
            <h2 className="section-title">Tres niveles para eliminar manchas</h2>
          </motion.div>

          <motion.div className="steps" variants={stagger}>
            {protocols.map((p) => (
              <motion.div className="step" key={p.name} variants={fadeUp}>
                <div style={{ color: 'var(--color-accent)', marginBottom: '16px' }}>{p.icon}</div>
                <p className="section-label">{p.level}</p>
                <h3 className="step__title">{p.name}</h3>
                <p className="step__text">{p.text}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </AnimatedSection>

      {/* Quote */}
      <div className="quote-banner">
        <div className="quote-banner__inner">
          <motion.p
            className="quote-banner__text"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            "Cada mancha cuenta una historia de daño solar acumulado. Nuestro trabajo es reescribir esa historia."
          </motion.p>
          <p className="quote-banner__author">— Dra. Gissel Castellanos</p>
        </div>
      </div>

      {/* Technology */}
      <AnimatedSection className="section">
        <div className="section__inner">
          <motion.div className="section__header" variants={fadeUp}>
            <p className="section-label">Tecnología</p>
            <h2 className="section-title">Aerolase Neo: Precisión Milimétrica</h2>
          </motion.div>

          <motion.div variants={fadeUp} style={{ marginBottom: '48px', textAlign: 'center' }}>
            <img src="/assets/img/aerolase.webp" alt="Equipo Aerolase Neo" style={{ width: '100%', maxWidth: '800px', height: '350px', objectFit: 'cover' }} />
          </motion.div>

          <motion.div className="spec-list" variants={stagger}>
            <motion.div className="spec-item" variants={fadeUp}>
              <div className="spec-item__value">1064nm</div>
              <div className="spec-item__label">Longitud de Onda</div>
            </motion.div>
            <motion.div className="spec-item" variants={fadeUp}>
              <div className="spec-item__value">650μs</div>
              <div className="spec-item__label">Pulso Ultracorto</div>
            </motion.div>
            <motion.div className="spec-item" variants={fadeUp}>
              <div className="spec-item__value">0</div>
              <div className="spec-item__label">Dolor</div>
            </motion.div>
            <motion.div className="spec-item" variants={fadeUp}>
              <div className="spec-item__value">0h</div>
              <div className="spec-item__label">Recuperación</div>
            </motion.div>
          </motion.div>
        </div>
      </AnimatedSection>

      {/* Results */}
      <AnimatedSection className="section section--alt" id="resultados">
        <div className="section__inner">
          <motion.div className="section__header" variants={fadeUp}>
            <p className="section-label">Resultados Reales</p>
            <h2 className="section-title">Casos de Éxito</h2>
            <p className="section-subtitle">
              Cada caso está documentado con fotos y videos para que veas resultados reales antes de comprometerte.
            </p>
          </motion.div>

          <motion.div variants={fadeUp}>
            <div className="results-carousel">
              {results.map((r) => (
                <div key={r.label} className="result-card">
                  <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    style={{ width: '100%', aspectRatio: '9/16', objectFit: 'cover' }}
                  >
                    <source src={r.src} type="video/webm" />
                  </video>
                  <p style={{ textAlign: 'center', fontSize: '14px', color: 'var(--color-text-light)', marginTop: '12px' }}>{r.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

        </div>
      </AnimatedSection>

      {/* FAQ */}
      <AnimatedSection className="section" id="faq">
        <div className="section__inner">
          <motion.div className="section__header" variants={fadeUp}>
            <p className="section-label">Preguntas Frecuentes</p>
            <h2 className="section-title">¿Tienes dudas?</h2>
          </motion.div>

          <motion.div variants={fadeUp} style={{ maxWidth: '700px', margin: '0 auto' }}>
            {faqData.map((item) => (
              <FAQItem key={item.q} q={item.q} a={item.a} />
            ))}
          </motion.div>
        </div>
      </AnimatedSection>

      {/* Final CTA */}
      <section className="cta-section">
        <div className="cta-section__inner">
          <h2 className="cta-section__title">¿Lista para decir adiós a las manchas?</h2>
          <p className="cta-section__text">
            Agenda tu evaluación y descubre cómo el Método Bouclier puede transformar tu piel.
          </p>
          <div className="cta-section__actions">
            <Link to="/citas" className="btn-primary">Agendar Evaluación</Link>
          </div>
        </div>
      </section>

      {/* Form */}
      <AnimatedSection className="section">
        <div className="section__inner">
          <motion.div className="section__header" variants={fadeUp}>
            <p className="section-label">Contacto</p>
            <h2 className="section-title">Solicita tu Evaluación</h2>
          </motion.div>

          <motion.form className="form" variants={fadeUp} onSubmit={(e) => e.preventDefault()}>
            <div className="form__group">
              <label className="form__label">Nombre Completo</label>
              <input type="text" className="form__input" placeholder="Tu nombre" />
            </div>
            <div className="form__group">
              <label className="form__label">Teléfono</label>
              <input type="tel" className="form__input" placeholder="+52 ..." />
            </div>
            <div className="form__group">
              <label className="form__label">Email</label>
              <input type="email" className="form__input" placeholder="tu@email.com" />
            </div>
            <div className="form__group">
              <label className="form__label">Mensaje</label>
              <textarea className="form__textarea" placeholder="Cuéntanos sobre tu problema de piel..." />
            </div>
            <div className="form__group">
              <label className="form__checkbox">
                <input type="checkbox" />
                <span>Acepto el aviso de privacidad y autorizo el uso de mis datos.</span>
              </label>
            </div>
            <button type="submit" className="btn-primary" style={{ width: '100%' }}>
              Enviar Solicitud
            </button>
          </motion.form>
        </div>
      </AnimatedSection>

      {/* Expert Opinion */}
      <AnimatedSection className="section section--alt">
        <div className="section__inner">
          <motion.div variants={fadeUp} style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <p className="section-label">Opinión Experta</p>
            <h2 className="section-title mb-32">Dra. Gissel Castellanos sobre el Melasma</h2>
            <blockquote style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(18px, 2.5vw, 24px)',
              fontStyle: 'italic',
              lineHeight: '1.6',
              color: 'var(--color-primary)',
              marginBottom: '24px',
              borderLeft: '3px solid var(--color-accent)',
              paddingLeft: '24px',
              textAlign: 'left'
            }}>
              "El melasma es una de las condiciones más frustrantes que tratamos. No es solo un problema estético, es emocional. Por eso en Bouclier no solo tratamos la piel, tratamos a la persona. Cada protocolo está diseñado considerando no solo la profundidad de la mancha, sino el estilo de vida, el historial hormonal y los objetivos de cada paciente. La tecnología Aerolase nos permite llegar donde otros láseres no pueden, y los resultados hablan por sí mismos."
            </blockquote>
            <p style={{ fontSize: '14px', color: 'var(--color-accent)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              — Dra. Gissel Castellanos, Dermatóloga Certificada
            </p>
          </motion.div>
        </div>
      </AnimatedSection>
    </>
  )
}
