import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import { HeartPulse, Microscope, ShieldCheck, ArrowRight, ChevronRight, MapPin, Star, Play, CheckCircle } from 'lucide-react'
import SEO from '../components/SEO.jsx'

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }
}

const stagger = {
  visible: { transition: { staggerChildren: 0.15 } }
}

function AnimatedSection({ children, className = '', id }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.section
      ref={ref}
      id={id}
      className={className}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={stagger}
    >
      {children}
    </motion.section>
  )
}

export default function Home() {
  return (
    <>
      <SEO
        title="Bouclier Clinique | Medicina Estética Preventiva"
        description="La nueva medicina estética preventiva en México. Tratamientos de manchas, blefaroplastia no quirúrgica y rejuvenecimiento con tecnología de vanguardia."
        canonical="https://bouclier-clinique.com/"
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
          <h1 className="page-hero__title">
            Tu piel merece criterio médico y resultados reales
          </h1>
          <p className="page-hero__subtitle">
            La nueva medicina estética preventiva en México. Protegemos tu piel antes de que envejezca.
          </p>
          <div className="page-hero__actions">
            <Link to="/citas" className="btn-primary">Agendar Cita</Link>
            <Link to="/metodo-bouclier" className="btn-ghost">Conoce el Método</Link>
          </div>
        </motion.div>
      </section>

      {/* Filosofía */}
      <AnimatedSection className="section" id="filosofia">
        <div className="section__inner">
          <motion.div className="section__header" variants={fadeUp}>
            <p className="section-label">Nuestra Filosofía</p>
            <h2 className="section-title">Cuidamos tu piel con ciencia, no con promesas</h2>
            <p className="section-subtitle">
              En Bouclier combinamos tecnología de última generación con un enfoque médico preventivo para obtener resultados reales y duraderos.
            </p>
          </motion.div>

          <motion.div className="card-grid" variants={stagger}>
            <motion.div className="card" variants={fadeUp}>
              <HeartPulse className="card__icon" size={48} />
              <h3 className="card__title">Prevención Inteligente</h3>
              <p className="card__text">
                Detectamos y tratamos el daño antes de que sea visible. Tu piel se mantiene joven más tiempo porque actuamos a tiempo.
              </p>
            </motion.div>
            <motion.div className="card" variants={fadeUp}>
              <Microscope className="card__icon" size={48} />
              <h3 className="card__title">Criterio Médico</h3>
              <p className="card__text">
                Cada protocolo está respaldado por evidencia científica y diseñado por dermatólogos certificados con más de una década de experiencia.
              </p>
            </motion.div>
            <motion.div className="card" variants={fadeUp}>
              <ShieldCheck className="card__icon" size={48} />
              <h3 className="card__title">Resultados Reales</h3>
              <p className="card__text">
                Sin promesas vacías. Documentamos cada caso con fotos y videos para que veas tu progreso real antes de comprometerte.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </AnimatedSection>

      {/* Método Bouclier */}
      <AnimatedSection className="section section--alt" id="metodo">
        <div className="section__inner">
          <motion.div className="section__header" variants={fadeUp}>
            <p className="section-label">Método Bouclier</p>
            <h2 className="section-title">Un protocolo en 4 pasos hacia tu mejor piel</h2>
          </motion.div>

          <motion.div className="steps" variants={stagger}>
            <motion.div className="step" variants={fadeUp}>
              <div className="step__number">01</div>
              <h3 className="step__title">Evaluación Integral</h3>
              <p className="step__text">Diagnóstico completo de tu piel con tecnología de mapping para entender exactamente qué necesita.</p>
            </motion.div>
            <motion.div className="step" variants={fadeUp}>
              <div className="step__number">02</div>
              <h3 className="step__title">Protocolo Personalizado</h3>
              <p className="step__text">Diseñamos un plan de tratamiento único basado en tu tipo de piel, historial y objetivos.</p>
            </motion.div>
            <motion.div className="step" variants={fadeUp}>
              <div className="step__number">03</div>
              <h3 className="step__title">Tratamiento de Precisión</h3>
              <p className="step__text">Aplicamos tecnología de vanguardia con parámetros médicos exactos para cada sesión.</p>
            </motion.div>
            <motion.div className="step" variants={fadeUp}>
              <div className="step__number">04</div>
              <h3 className="step__title">Mantenimiento Preventivo</h3>
              <p className="step__text">Protocolos de seguimiento que protegen tus resultados y previenen el envejecimiento futuro.</p>
            </motion.div>
          </motion.div>
        </div>
      </AnimatedSection>

      {/* Tratamientos */}
      <AnimatedSection className="section" id="tratamientos">
        <div className="section__inner">
          <motion.div className="section__header" variants={fadeUp}>
            <p className="section-label">Tratamientos</p>
            <h2 className="section-title">Soluciones médicas para cada necesidad</h2>
          </motion.div>

          <motion.div className="treatment-grid" variants={stagger}>
            <motion.div variants={fadeUp}>
              <Link to="/manchas" className="treatment-card" style={{ backgroundImage: 'url(/assets/img/aerolase.webp)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
                <div className="treatment-card__overlay" />
                <div className="treatment-card__content">
                  <h3 className="treatment-card__title">Manchas y Melasma</h3>
                  <p className="treatment-card__text">Protocolos Bouclier con Aerolase para eliminar manchas de forma definitiva.</p>
                  <span className="btn-primary" style={{ fontSize: '12px', padding: '10px 20px' }}>
                    Ver más <ArrowRight size={14} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: '6px' }} />
                  </span>
                </div>
              </Link>
            </motion.div>
            <motion.div variants={fadeUp}>
              <Link to="/blefaroplastia" className="treatment-card" style={{ backgroundImage: 'url(/assets/img/nano-banana.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
                <div className="treatment-card__overlay" />
                <div className="treatment-card__content">
                  <h3 className="treatment-card__title">Blefaroplastia No Quirúrgica</h3>
                  <p className="treatment-card__text">Rejuvenecimiento de mirada con PRP y láser sin cirugía.</p>
                  <span className="btn-primary" style={{ fontSize: '12px', padding: '10px 20px' }}>
                    Ver más <ArrowRight size={14} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: '6px' }} />
                  </span>
                </div>
              </Link>
            </motion.div>
            <motion.div variants={fadeUp}>
              <a href="https://bouclier-dermatologia.com/" target="_blank" rel="noopener noreferrer" className="treatment-card" style={{ backgroundImage: 'url(/assets/img/soma-clinique.webp)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
                <div className="treatment-card__overlay" />
                <div className="treatment-card__content">
                  <h3 className="treatment-card__title">Todos los Tratamientos</h3>
                  <p className="treatment-card__text">Explora nuestro catálogo completo de tratamientos dermatológicos.</p>
                  <span className="btn-primary" style={{ fontSize: '12px', padding: '10px 20px' }}>
                    Ver todos <ArrowRight size={14} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: '6px' }} />
                  </span>
                </div>
              </a>
            </motion.div>
          </motion.div>
        </div>
      </AnimatedSection>

      {/* Dra. Gissel */}
      <AnimatedSection className="section section--alt" id="dra-gissel">
        <div className="section__inner">
          <motion.div className="expert-section" variants={stagger}>
            <motion.div variants={fadeUp} className="expert-section__video-wrapper">
              <img 
                src="/assets/img/dra-gissel.png" 
                alt="Dra. Gissel Castellanos" 
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }}
              />
            </motion.div>
            <motion.div className="expert-section__content" variants={fadeUp}>
              <p className="section-label">Tu Dermatóloga</p>
              <h2 className="section-title">Dra. Gissel Castellanos</h2>
              <p className="section-subtitle mb-24">
                Dermatóloga certificada con más de 12 años de experiencia. Fundadora de Bouclier Dermatología con un propósito claro: ver tu piel antes de que te hable.
              </p>
              <p style={{ fontSize: '15px', color: 'var(--color-text-light)', lineHeight: '1.7', marginBottom: '32px' }}>
                "En Bouclier no esperamos a que aparezcan los problemas. Nuestra filosofía es prevenir el daño visible antes de que ocurra, utilizando tecnología de última generación y protocolos médicos basados en evidencia."
              </p>
              <Link to="/quienes-somos" className="btn-primary">
                Conoce más <ArrowRight size={14} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: '6px' }} />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </AnimatedSection>

      {/* Testimonio */}
      <AnimatedSection className="section">
        <div className="section__inner">
          <motion.div className="section__header" variants={fadeUp}>
            <p className="section-label">Testimonios</p>
            <h2 className="section-title">Lo que dicen nuestros pacientes</h2>
          </motion.div>

          <motion.div
            variants={fadeUp}
            style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}
          >
            <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', marginBottom: '24px' }}>
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={20} fill="var(--color-accent)" color="var(--color-accent)" />
              ))}
            </div>
            <blockquote style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(20px, 3vw, 28px)',
              fontStyle: 'italic',
              lineHeight: '1.5',
              color: 'var(--color-primary)',
              marginBottom: '24px'
            }}>
              "Llevaba años intentando tratar mis manchas con diferentes dermatólogos. En Bouclier no solo eliminaron mis manchas, sino que mi piel se ve mejor que nunca. El método Bouclier cambió mi vida."
            </blockquote>
            <p style={{ fontSize: '14px', color: 'var(--color-accent)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              — María Fernanda, paciente desde 2022
            </p>
          </motion.div>
        </div>
      </AnimatedSection>

      {/* Social Proof */}
      <div className="social-proof">
        <div className="social-proof__inner">
          <motion.div className="stat" variants={fadeUp}>
            <div className="stat__number">+12</div>
            <div className="stat__label">Años de Experiencia</div>
          </motion.div>
          <motion.div className="stat" variants={fadeUp}>
            <div className="stat__number">+5,000</div>
            <div className="stat__label">Pacientes Atendidas</div>
          </motion.div>
          <motion.div className="stat" variants={fadeUp}>
            <div className="stat__number">+100</div>
            <div className="stat__label">Reseñas en Google</div>
          </motion.div>
          <motion.div className="stat" variants={fadeUp}>
            <div className="stat__number">3</div>
            <div className="stat__label">Sucursales</div>
          </motion.div>
        </div>
      </div>

      {/* Testimonios */}
      <AnimatedSection className="section section--alt" id="testimonios">
        <div className="section__inner">
          <motion.div className="section__header" variants={fadeUp}>
            <p className="section-label">Testimonios</p>
            <h2 className="section-title">Lo que dicen nuestras pacientes</h2>
          </motion.div>

          <motion.div variants={fadeUp} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            <div className="testimonial-card">
              <div className="testimonial-card__stars">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill="var(--color-accent)" color="var(--color-accent)" />
                ))}
              </div>
              <p className="testimonial-card__text">
                "Llevaba años intentando tratar mis manchas con diferentes dermatólogos. En Bouclier no solo eliminaron mis manchas, sino que mi piel se ve mejor que nunca. El método Bouclier cambió mi vida."
              </p>
              <p className="testimonial-card__author">María Fernanda</p>
              <p className="testimonial-card__source">Paciente desde 2022</p>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-card__stars">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill="var(--color-accent)" color="var(--color-accent)" />
                ))}
              </div>
              <p className="testimonial-card__text">
                "El trato de la Dra. Gissel es excepcional. No solo es una excelente profesional, sino que realmente se preocupa por sus pacientes. Mis cicatrices del acné mejoraron notablemente."
              </p>
              <p className="testimonial-card__author">Laura Sánchez</p>
              <p className="testimonial-card__source">Paciente desde 2023</p>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-card__stars">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill="var(--color-accent)" color="var(--color-accent)" />
                ))}
              </div>
              <p className="testimonial-card__text">
                "Después de mi embarazo me salieron muchas manchas. En Bouclier me explicaron que era melasma y me diseñaron un protocolo personalizado. Estoy encantada con los resultados."
              </p>
              <p className="testimonial-card__author">Carolina Méndez</p>
              <p className="testimonial-card__source">Paciente desde 2024</p>
            </div>
          </motion.div>
        </div>
      </AnimatedSection>

      {/* Trust Badges */}
      <div className="trust-badges">
        <div className="trust-badge">
          <div className="trust-badge__icon">
            <CheckCircle size={20} />
          </div>
          <span>Dermatóloga Certificada</span>
        </div>
        <div className="trust-badge">
          <div className="trust-badge__icon">
            <CheckCircle size={20} />
          </div>
          <span>Tecnología Aerolase Neo</span>
        </div>
        <div className="trust-badge">
          <div className="trust-badge__icon">
            <CheckCircle size={20} />
          </div>
          <span>#1 en Veracruz</span>
        </div>
        <div className="trust-badge">
          <div className="trust-badge__icon">
            <CheckCircle size={20} />
          </div>
          <span>+100 Reseñas Google</span>
        </div>
      </div>

      {/* Locaciones */}
      <AnimatedSection className="section section--alt" id="ubicaciones">
        <div className="section__inner">
          <motion.div className="section__header" variants={fadeUp}>
            <p className="section-label">Ubicaciones</p>
            <h2 className="section-title">Encuéntranos</h2>
          </motion.div>

          <motion.div className="locations-grid" variants={stagger}>
            <motion.div className="location-card" variants={fadeUp}>
              <h3 className="location-card__name">
                <MapPin size={20} /> Torre EXERTIA
              </h3>
              <p className="location-card__address">
                Av. Paseo de la Reforma 505, Torre Exertia, Piso 12<br />
                Col. Juárez, Ciudad de México
              </p>
            </motion.div>
            <motion.div className="location-card" variants={fadeUp}>
              <h3 className="location-card__name">
                <MapPin size={20} /> Riviera
              </h3>
              <p className="location-card__address">
                Calle 8 No. 102, Col. Centro<br />
                Playa del Carmen, Quintana Roo
              </p>
            </motion.div>
          </motion.div>
        </div>
      </AnimatedSection>

      {/* CTA Urgency */}
      <section className="cta-urgency">
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 24px' }}>
          <div className="cta-urgency__badge">Oferta de Bienvenida</div>
          <h2 className="cta-urgency__title">Primera evaluación dermatológica sin costo</h2>
          <p className="cta-urgency__text">
            Descubre qué necesita tu piel con un diagnóstico personalizado por la Dra. Gissel Castellanos. 
            Sin compromiso, sin costos ocultos.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/citas" className="btn-primary">Agendar Mi Evaluación Gratis</Link>
            <a href="https://api.whatsapp.com/send?phone=522291087016&text=Hola%2C+quiero+agendar+mi+evaluación+gratuita" className="btn-ghost" target="_blank" rel="noopener noreferrer">
              WhatsApp Directo
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
