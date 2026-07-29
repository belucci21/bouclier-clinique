import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { ChevronDown, Eye, Clock, Scissors, Sparkles, ShieldCheck, Heart } from 'lucide-react'
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
    q: '¿Qué es la blefaroplastia no quirúrgica?',
    a: 'Es un procedimiento que rejuvenece la zona de los ojos sin cirugía. Utilizamos PRP (plasma rico en plaquetas) y láser para eliminar grasa, tensar la piel y reducir ojeras y bolsas, sin bisturí ni cicatrices.'
  },
  {
    q: '¿Cuánto dura el procedimiento?',
    a: 'La sesión dura aproximadamente 45-60 minutos. No requiere anestesia general, solo tópica en algunos casos. Puedes regresar a tus actividades normales el mismo día.'
  },
  {
    q: '¿Cuándo veré los resultados?',
    a: 'Los primeros resultados son visibles en 1-2 semanas. La mejoría continúa progresivamente durante 3-6 meses, alcanzando el resultado óptimo al completar el protocolo.'
  },
  {
    q: '¿Es seguro?',
    a: 'Sí, es un procedimiento mínimamente invasivo con un perfil de seguridad excepcional. Al utilizar PRP de tu propia sangre, no hay riesgo de reacciones alérgicas. La Dra. Gissel evalúa cada caso para garantizar la idoneidad del tratamiento.'
  },
  {
    q: '¿Puedo hacerlo si tengo bolsas grandes?',
    a: 'La blefaroplastia no quirúrgica es ideal para casos leves a moderados. Para bolsas muy pronunciadas, la Dra. Gissel puede recomendar una combinación de tratamientos o referirte a cirugía si es necesario. La evaluación inicial determinará tu candidatura.'
  },
  {
    q: '¿Los resultados son permanentes?',
    a: 'Los resultados son duraderos pero no permanentes, ya que el envejecimiento natural continúa. Con protocolos de mantenimiento periódicos, puedes preservar los resultados por años. El rejuvenecimiento logrado es natural y progresivo.'
  }
]

const phases = [
  { name: 'Preparación', description: 'Aplicación de PRP autólogo en la zona periocular para activar factores de crecimiento y preparar el tejido.', icon: <Heart size={40} /> },
  { name: 'Tratamiento Láser', description: 'Aplicación de láser fraccional de alta precisión para tensar la piel, eliminar grasa y estimular colágeno.', icon: <Sparkles size={40} /> },
  { name: 'Bioestimulación', description: 'Protocolo de recuperación acelerada que potencia y prolonga los resultados del tratamiento.', icon: <ShieldCheck size={40} /> }
]

const benefits = [
  { icon: <Scissors size={32} />, title: 'Sin bisturí', text: 'Procedimiento completamente no invasivo.' },
  { icon: <ShieldCheck size={32} />, title: 'Sin cicatrices', text: 'No hay incisiones ni puntos.' },
  { icon: <Clock size={32} />, title: 'Recuperación 24h', text: 'Regresas a tus actividades el mismo día.' },
  { icon: <Eye size={32} />, title: 'Resultados naturales', text: 'Mirada rejuvenecida, no operada.' }
]

export default function Blefaroplastia() {
  return (
    <>
      <SEO
        title="Blefaroplastia No Quirúrgica | Bouclier Clinique"
        description="Blefaroplastia no quirúrgica con PRP y láser en CDMX y Playa del Carmen. Rejuvenecimiento de mirada sin cirugía, sin cicatrices, sin dolor. Resultados naturales."
        canonical="https://bouclier-clinique.com/blefaroplastia"
        ogImage="/assets/img/logo.webp"
      />

      {/* Hero */}
      <section className="page-hero page-hero--full">
        <video
          className="page-hero__video"
          autoPlay
          muted
          loop
          playsInline
          poster="/assets/img/logo.webp"
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
          <p className="section-label" style={{ color: 'var(--color-accent)' }}>Blefaroplastia</p>
          <h1 className="page-hero__title">Blefaroplastia no quirúrgica</h1>
          <p className="page-hero__subtitle">
            Rejuvenecimiento de mirada con PRP y láser. Sin bisturí, sin cicatrices, sin tiempo de recuperación. Resultados naturales desde la primera sesión.
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
            <h2 className="section-title mb-32">Tus ojos cuentan tu edad antes que el resto</h2>
            <p style={{ fontSize: '17px', lineHeight: '1.8', color: 'var(--color-text-light)' }}>
              La zona periocular es la primera en mostrar signos de envejecimiento. Bolsas, ojeras, párpados caídos y líneas de expresión hacen que tu mirada se vea cansada y envejecida, aunque no te sientas así. La cirugía tradicional implica riesgos, cicatrices y semanas de recuperación. Existe una alternativa mejor.
            </p>
          </motion.div>
        </div>
      </AnimatedSection>

      {/* Method */}
      <AnimatedSection className="section section--alt" id="metodo">
        <div className="section__inner">
          <motion.div className="section__header" variants={fadeUp}>
            <p className="section-label">El Método</p>
            <h2 className="section-title">Tres fases para tu nueva mirada</h2>
          </motion.div>

          <motion.div className="steps" variants={stagger}>
            {phases.map((p) => (
              <motion.div className="step" key={p.name} variants={fadeUp}>
                <div style={{ color: 'var(--color-accent)', marginBottom: '16px' }}>{p.icon}</div>
                <h3 className="step__title">{p.name}</h3>
                <p className="step__text">{p.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </AnimatedSection>

      {/* Benefits */}
      <AnimatedSection className="section">
        <div className="section__inner">
          <motion.div className="section__header" variants={fadeUp}>
            <p className="section-label">Ventajas</p>
            <h2 className="section-title">¿Por qué no quirúrgica?</h2>
            <p className="section-subtitle">
              Todos los beneficios de la blefaroplastia sin los inconvenientes de la cirugía.
            </p>
          </motion.div>

          <motion.div className="benefits-grid" variants={stagger}>
            {benefits.map((b) => (
              <motion.div className="benefit-card" key={b.title} variants={fadeUp}>
                <div className="benefit-card__icon">{b.icon}</div>
                <h3 className="benefit-card__title">{b.title}</h3>
                <p className="benefit-card__text">{b.text}</p>
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
            "La mirada es lo primero que la gente ve. Nuestro trabajo es que esa mirada refleje la energía que sientes por dentro."
          </motion.p>
          <p className="quote-banner__author">— Dra. Gissel Castellanos</p>
        </div>
      </div>

      {/* Results */}
      <AnimatedSection className="section section--alt" id="resultados">
        <div className="section__inner">
          <motion.div className="section__header" variants={fadeUp}>
            <p className="section-label">Resultados</p>
            <h2 className="section-title">Miradas Transformadas</h2>
            <p className="section-subtitle">
              Cada caso está documentado para que veas resultados reales antes de decidir.
            </p>
          </motion.div>

          <motion.div variants={fadeUp} style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
            <p style={{ fontSize: '16px', color: 'var(--color-text-light)', lineHeight: '1.7' }}>
              Nuestros pacientes experimentan una transformación visible en su mirada: ojos más abiertos, descansados yjuveniles. Los resultados son naturales y progresivos, sin el aspecto "operado" de la cirugía tradicional.
            </p>
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
          <h2 className="cta-section__title">¿Lista para una nueva mirada?</h2>
          <p className="cta-section__text">
            Agenda tu evaluación y descubre cómo la blefaroplastia no quirúrgica puede transformar tu mirada.
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
              <textarea className="form__textarea" placeholder="Cuéntanos sobre tu consulta..." />
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
            <h2 className="section-title mb-32">Dra. Gissel Castellanos sobre la Blefaroplastia</h2>
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
              "La blefaroplastia no quirúrgica es una de las innovaciones más emocionantes de la medicina estética moderna. Permitimos a nuestros pacientes recuperar una mirada joven y descansada sin los riesgos ni el tiempo de recuperación de la cirugía. El PRP potencia los resultados de forma natural, y el láser permite una precisión que la cirugía no puede igualar en casos seleccionados."
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
