import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import { Zap, Sun, Sparkles, ArrowRight } from 'lucide-react'
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

const protocols = [
  {
    icon: <Sun size={48} />,
    level: 'Nivel 1',
    name: 'Despertar',
    description: 'El primer paso del Método Bouclier. Activamos los mecanismos naturales de regeneración de tu piel mediante tecnología láser de baja intensidad. Este nivel prepara el tejido para recibir tratamientos más profundos, mejorando la microcirculación y estimulando la producción de colágeno de forma natural.',
    details: ['Activación celular láser', 'Estimulación de colágeno', 'Mejora de microcirculación', 'Preparación tisular']
  },
  {
    icon: <Zap size={48} />,
    level: 'Nivel 2',
    name: 'Liberación',
    description: 'En este nivel liberamos el potencial regenerativo de tu piel. Utilizamos protocolos combinados de láser y PRP (plasma rico en plaquetas) para eliminar las imperfecciones acumuladas: manchas, líneas finas, textura irregular. La piel comienza a transformarse visiblemente.',
    details: ['Eliminación de manchas', 'Líneas finas', 'Textura irregular', 'Combinación láser + PRP']
  },
  {
    icon: <Sparkles size={48} />,
    level: 'Nivel 3',
    name: 'Renacimiento',
    description: 'El nivel más profundo del Método Bouclier. Aquí logramos la renovación completa de la piel. Con protocolos de alta precisión, restructuramos el tejido dérmico para obtener una piel más firme, luminosa y uniforme. Es el renacimiento de tu piel.',
    details: ['Renovación dérmica completa', 'Firmeza y luminosidad', 'Uniformidad del tono', 'Resultados duraderos']
  }
]

export default function MetodoBouclier() {
  return (
    <>
      <SEO
        title="Método Bouclier | Bouclier Clinique"
        description="Descubre el Método Bouclier: un protocolo en 3 niveles (Despertar, Liberación, Renacimiento) que combina tecnología láser y PRP para la renovación completa de tu piel."
        canonical="https://bouclier-clinique.com/metodo-bouclier"
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
          <p className="section-label" style={{ color: 'var(--color-accent)' }}>Nuestro Método</p>
          <h1 className="page-hero__title">Método Bouclier</h1>
          <p className="page-hero__subtitle">
            Un protocolo en 3 niveles diseñado para renovar tu piel desde adentro hacia afuera
          </p>
        </motion.div>
      </section>

      {/* Explanation */}
      <AnimatedSection className="section">
        <div className="section__inner">
          <motion.div variants={fadeUp} style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <p className="section-label">¿Qué es?</p>
            <h2 className="section-title mb-32">La ciencia detrás de tu mejor piel</h2>
            <p style={{ fontSize: '17px', lineHeight: '1.8', color: 'var(--color-text-light)' }}>
              El Método Bouclier es un protocolo médico desarrollado a lo largo de más de una década de investigación clínica. No es un simple tratamiento estético: es un sistema integral que trabaja en capas progresivas para lograr una transformación real y duradera de la piel. Combinamos tecnología láser de última generación con bioestimulación y PRP para activar los mecanismos naturales de reparación de tu cuerpo.
            </p>
          </motion.div>
        </div>
      </AnimatedSection>

      {/* Protocol Levels */}
      <AnimatedSection className="section section--alt">
        <div className="section__inner">
          <motion.div className="section__header" variants={fadeUp}>
            <p className="section-label">Los 3 Niveles</p>
            <h2 className="section-title">Protocolos de Transformación</h2>
          </motion.div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
            {protocols.map((protocol, i) => (
              <motion.div
                key={protocol.level}
                variants={fadeUp}
                style={{
                  display: 'grid',
                  gridTemplateColumns: i % 2 === 0 ? '200px 1fr' : '1fr 200px',
                  gap: '48px',
                  alignItems: 'center',
                  background: '#fff',
                  border: '1px solid var(--color-border)',
                  padding: '48px',
                  direction: i % 2 === 0 ? 'ltr' : 'rtl'
                }}
                className="protocol-card"
              >
                <div style={{ direction: 'ltr', textAlign: 'center' }}>
                  <div style={{ color: 'var(--color-accent)', marginBottom: '16px' }}>{protocol.icon}</div>
                  <p className="section-label">{protocol.level}</p>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 600 }}>{protocol.name}</h3>
                </div>
                <div style={{ direction: 'ltr' }}>
                  <p style={{ fontSize: '16px', lineHeight: '1.8', color: 'var(--color-text-light)', marginBottom: '24px' }}>
                    {protocol.description}
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    {protocol.details.map((detail) => (
                      <div key={detail} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--color-primary)' }}>
                        <div style={{ width: '6px', height: '6px', background: 'var(--color-accent)', borderRadius: '50%', flexShrink: 0 }} />
                        {detail}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* Technology */}
      <AnimatedSection className="section">
        <div className="section__inner">
          <motion.div className="section__header" variants={fadeUp}>
            <p className="section-label">Tecnología</p>
            <h2 className="section-title">Equipamiento de Vanguardia</h2>
            <p className="section-subtitle">
              Utilizamos los equipos más avanzados del mundo para garantizar resultados excepcionales.
            </p>
          </motion.div>

          <motion.div variants={fadeUp} style={{ marginBottom: '48px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            <img src="/assets/img/soma-clinique.webp" alt="Soma Clínique" style={{ width: '100%', objectFit: 'cover', aspectRatio: '4/3' }} />
            <img src="/assets/img/soma-laser.webp" alt="Láser Bouclier" style={{ width: '100%', objectFit: 'cover', aspectRatio: '4/3' }} />
            <img src="/assets/img/soma-masajes.webp" alt="Tratamiento Bouclier" style={{ width: '100%', objectFit: 'cover', aspectRatio: '4/3' }} />
          </motion.div>

          <motion.div className="card-grid" variants={stagger}>
            <motion.div className="card" variants={fadeUp}>
              <Zap className="card__icon" size={48} />
              <h3 className="card__title">Aerolase Neo</h3>
              <p className="card__text">
                Láser Nd:YAG de 1064nm con pulsos de 650 microsegundos. La tecnología más avanzada para manchas, rejuvenecimiento y acné sin dolor ni tiempo de recuperación.
              </p>
            </motion.div>
            <motion.div className="card" variants={fadeUp}>
              <Sun className="card__icon" size={48} />
              <h3 className="card__title">Quanta System</h3>
              <p className="card__text">
                Sistemas láser italianos de última generación para depilación, manchas vasculares y rejuvenecimiento no invasivo con resultados superiores.
              </p>
            </motion.div>
            <motion.div className="card" variants={fadeUp}>
              <Sparkles className="card__icon" size={48} />
              <h3 className="card__title">PRP Autólogo</h3>
              <p className="card__text">
                Plasma rico en plaquetas derivado de tu propia sangre. Bioestimulación natural que potencia los resultados de cada tratamiento láser.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </AnimatedSection>

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-section__inner">
          <h2 className="cta-section__title">¿Listo para transformar tu piel?</h2>
          <p className="cta-section__text">
            Agenda una evaluación y descubre qué nivel del Método Bouclier es ideal para ti.
          </p>
          <div className="cta-section__actions">
            <Link to="/citas" className="btn-primary">Agendar Cita</Link>
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 768px) {
          .protocol-card {
            grid-template-columns: 1fr !important;
            direction: ltr !important;
            text-align: center !important;
          }
        }
      `}</style>
    </>
  )
}
