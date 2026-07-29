import { useState, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { MapPin, Phone, Mail, Clock } from 'lucide-react'
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

const treatments = [
  'Melasma / Manchas',
  'Blefaroplastia No Quirúrgica',
  'Rejuvenecimiento',
  'Acné',
  'Rosácea',
  'Otro'
]

export default function Citas() {
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    email: '',
    tratamiento: '',
    mensaje: '',
    consent: false
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    alert('¡Gracias! Hemos recibido tu solicitud. Te contactaremos pronto.')
    setFormData({ nombre: '', telefono: '', email: '', tratamiento: '', mensaje: '', consent: false })
  }

  return (
    <>
      <SEO
        title="Agendar Cita | Bouclier Clinique"
        description="Agenda tu cita en Bouclier Clinique. Consulta de dermatología estética preventiva en CDMX y Playa del Carmen. Tratamientos de manchas, blefaroplastia y rejuvenecimiento."
        canonical="https://bouclier-clinique.com/citas"
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
          <p className="section-label" style={{ color: 'var(--color-accent)' }}>Citas</p>
          <h1 className="page-hero__title">Agenda tu Cita</h1>
          <p className="page-hero__subtitle">
            Completa el formulario y nos pondremos en contacto contigo para confirmar tu consulta.
          </p>
        </motion.div>
      </section>

      {/* Form & Info */}
      <AnimatedSection className="section">
        <div className="section__inner">
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '60px', alignItems: 'start' }} className="citas-grid">
            <motion.div variants={fadeUp}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 500, marginBottom: '32px' }}>
                Formulario de Contacto
              </h2>
              <form className="form" onSubmit={handleSubmit} style={{ maxWidth: '100%' }}>
                <div className="form__group">
                  <label className="form__label">Nombre Completo *</label>
                  <input
                    type="text"
                    className="form__input"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    placeholder="Tu nombre completo"
                    required
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div className="form__group">
                    <label className="form__label">Teléfono *</label>
                    <input
                      type="tel"
                      className="form__input"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleChange}
                      placeholder="+52 ..."
                      required
                    />
                  </div>
                  <div className="form__group">
                    <label className="form__label">Email *</label>
                    <input
                      type="email"
                      className="form__input"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="tu@email.com"
                      required
                    />
                  </div>
                </div>
                <div className="form__group">
                  <label className="form__label">Tratamiento de Interés *</label>
                  <select
                    className="form__select"
                    name="tratamiento"
                    value={formData.tratamiento}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Selecciona un tratamiento</option>
                    {treatments.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div className="form__group">
                  <label className="form__label">Mensaje</label>
                  <textarea
                    className="form__textarea"
                    name="mensaje"
                    value={formData.mensaje}
                    onChange={handleChange}
                    placeholder="Cuéntanos sobre tu consulta o preocupación..."
                  />
                </div>
                <div className="form__group">
                  <label className="form__checkbox">
                    <input
                      type="checkbox"
                      name="consent"
                      checked={formData.consent}
                      onChange={handleChange}
                      required
                    />
                    <span>Acepto el aviso de privacidad y autorizo a Bouclier Clinique para utilizar mis datos con la finalidad de atender mi consulta.</span>
                  </label>
                </div>
                <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '8px' }}>
                  Enviar Solicitud
                </button>
              </form>
            </motion.div>

            <motion.div variants={fadeUp}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 500, marginBottom: '32px' }}>
                Nuestras Clínicas
              </h2>

              <div style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '20px' }}>
                  <MapPin size={20} style={{ color: 'var(--color-accent)', flexShrink: 0, marginTop: '4px' }} />
                  <div>
                    <strong style={{ fontSize: '16px' }}>Torre EXERTIA</strong>
                    <p style={{ fontSize: '14px', color: 'var(--color-text-light)', marginTop: '4px' }}>
                      Av. Paseo de la Reforma 505, Torre Exertia, Piso 12<br />
                      Col. Juárez, Ciudad de México
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '20px' }}>
                  <MapPin size={20} style={{ color: 'var(--color-accent)', flexShrink: 0, marginTop: '4px' }} />
                  <div>
                    <strong style={{ fontSize: '16px' }}>Bouclier Riviera</strong>
                    <p style={{ fontSize: '14px', color: 'var(--color-text-light)', marginTop: '4px' }}>
                      Calle 8 No. 102, Col. Centro<br />
                      Playa del Carmen, Quintana Roo
                    </p>
                  </div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '24px', marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <Phone size={18} style={{ color: 'var(--color-accent)' }} />
                  <a href="tel:+522291087016" style={{ fontSize: '15px' }}>+52 229 108 7016</a>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <Mail size={18} style={{ color: 'var(--color-accent)' }} />
                  <a href="mailto:info@bouclier-clinique.com" style={{ fontSize: '15px' }}>info@bouclier-clinique.com</a>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Clock size={18} style={{ color: 'var(--color-accent)' }} />
                  <span style={{ fontSize: '15px', color: 'var(--color-text-light)' }}>Lun - Vie: 9:00 - 19:00</span>
                </div>
              </div>

              <div className="map-placeholder">
                <p>Mapa de ubicación</p>
              </div>
            </motion.div>
          </div>
        </div>
      </AnimatedSection>

      <style>{`
        @media (max-width: 768px) {
          .citas-grid {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
        }
      `}</style>
    </>
  )
}
