import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import { Heart, Target, Award, Users, ArrowRight } from 'lucide-react'
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

export default function QuienesSomos() {
  return (
    <>
      <SEO
        title="Quiénes Somos | Bouclier Clinique"
        description="Conoce a Bouclier Dermatología. Fundada en 2012 por la dermatóloga certificada Dra. Gissel Castellanos, somos la nueva medicina estética preventiva en México."
        canonical="https://bouclier-clinique.com/quienes-somos"
      />

      {/* Hero */}
      <section className="page-hero">
        <div className="page-hero__overlay" style={{ background: 'linear-gradient(135deg, rgba(26,26,26,0.85), rgba(26,26,26,0.95))' }} />
        <motion.div
          className="page-hero__content"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <p className="section-label" style={{ color: 'var(--color-accent)' }}>Sobre Nosotros</p>
          <h1 className="page-hero__title">¿Quiénes somos?</h1>
          <p className="page-hero__subtitle">
            La historia detrás de la nueva medicina estética preventiva en México
          </p>
        </motion.div>
      </section>

      {/* Story */}
      <AnimatedSection className="section">
        <div className="section__inner">
          <motion.div variants={fadeUp} style={{ maxWidth: '800px', margin: '0 auto' }}>
            <p className="section-label">Nuestra Historia</p>
            <h2 className="section-title mb-32">Un propósito claro: ver tu piel antes de que te hable</h2>
            <div style={{ fontSize: '17px', lineHeight: '1.8', color: 'var(--color-text-light)' }}>
              <p className="mb-24">
                En Bouclier Dermatología vivimos con un propósito claro: ver tu piel antes de que te hable. Fundada en 2012 por la dermatóloga certificada Dra. Gissel Castellanos, nacimos con la convicción de que la medicina estética debe ser preventiva, no reactiva.
              </p>
              <p className="mb-24">
                Por más de una década, hemos perfeccionado un enfoque único que combina tecnología de última generación con un profundo conocimiento dermatológico. No esperamos a que aparezcan las manchas, las arrugas o la flacidez para actuar. Anticipamos, prevenimos y protegemos.
              </p>
              <p>
                Nuestro nombre lo dice todo: "Bouclier" significa "escudo" en francés. Somos el escudo que tu piel necesita para enfrentar el paso del tiempo, el sol, la contaminación y el estrés del día a día.
              </p>
            </div>
          </motion.div>
        </div>
      </AnimatedSection>

      {/* Team */}
      <AnimatedSection className="section section--alt">
        <div className="section__inner">
          <motion.div className="section__header" variants={fadeUp}>
            <p className="section-label">Nuestro Equipo</p>
            <h2 className="section-title">Expertos en tu piel</h2>
            <p className="section-subtitle">
              Un equipo multidisciplinario de profesionales comprometidos con tu bienestar.
            </p>
          </motion.div>

          <motion.div className="card-grid" variants={stagger}>
            <motion.div className="card" variants={fadeUp}>
              <Award className="card__icon" size={48} />
              <h3 className="card__title">Dra. Gissel Castellanos</h3>
              <p className="card__text">
                Dermatóloga certificada. Fundadora de Bouclier con más de 12 años de experiencia en dermatología estética y preventiva.
              </p>
            </motion.div>
            <motion.div className="card" variants={fadeUp}>
              <Users className="card__icon" size={48} />
              <h3 className="card__title">Equipo Médico</h3>
              <p className="card__text">
                Profesionales especializados en cada procedimiento, capacitados continuamente en las últimas tecnologías y técnicas.
              </p>
            </motion.div>
            <motion.div className="card" variants={fadeUp}>
              <Heart className="card__icon" size={48} />
              <h3 className="card__title">Atención Personalizada</h3>
              <p className="card__text">
                Cada paciente es única. Diseñamos protocolos individualizados que respetan las necesidades específicas de tu piel.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </AnimatedSection>

      {/* Values */}
      <AnimatedSection className="section">
        <div className="section__inner">
          <motion.div className="section__header" variants={fadeUp}>
            <p className="section-label">¿Por qué Bouclier?</p>
            <h2 className="section-title">Nuestros Valores</h2>
          </motion.div>

          <motion.div className="benefits-grid" variants={stagger}>
            <motion.div className="benefit-card" variants={fadeUp}>
              <Target className="benefit-card__icon" size={48} />
              <h3 className="benefit-card__title">Prevención</h3>
              <p className="benefit-card__text">
                Actuamos antes de que el daño sea visible. Tu piel se mantiene joven porque cuidamos de ella a tiempo.
              </p>
            </motion.div>
            <motion.div className="benefit-card" variants={fadeUp}>
              <Award className="benefit-card__icon" size={48} />
              <h3 className="benefit-card__title">Científico</h3>
              <p className="benefit-card__text">
                Cada protocolo está respaldado por evidencia científica y tecnología de última generación.
              </p>
            </motion.div>
            <motion.div className="benefit-card" variants={fadeUp}>
              <Heart className="benefit-card__icon" size={48} />
              <h3 className="benefit-card__title">Humanizado</h3>
              <p className="benefit-card__text">
                Escuchamos, entendemos y acompañamos a cada paciente en su camino hacia su mejor versión.
              </p>
            </motion.div>
            <motion.div className="benefit-card" variants={fadeUp}>
              <Users className="benefit-card__icon" size={48} />
              <h3 className="benefit-card__title">Transparencia</h3>
              <p className="benefit-card__text">
                Documentamos cada caso con fotos y videos para que veas resultados reales antes de comprometerte.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </AnimatedSection>

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-section__inner">
          <h2 className="cta-section__title">¿Quieres conocernos?</h2>
          <p className="cta-section__text">
            Agenda una consulta y descubre cómo Bouclier puede cuidar de tu piel.
          </p>
          <div className="cta-section__actions">
            <Link to="/citas" className="btn-primary">Agendar Cita</Link>
            <Link to="/metodo-bouclier" className="btn-ghost">Conoce el Método</Link>
          </div>
        </div>
      </section>
    </>
  )
}
