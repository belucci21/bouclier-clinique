import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Smartphone, Shield, Bell, Calendar, QrCode } from 'lucide-react'
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
    <motion.section ref={ref} className={className} initial="hidden" animate={inView ? 'visible' : 'hidden'} variants={stagger}>
      {children}
    </motion.section>
  )
}

const features = [
  { icon: Calendar, title: 'Agendar Citas', desc: 'Reserva tu cita en línea en cualquier momento' },
  { icon: QrCode, title: 'Check-in QR', desc: 'Escanea el código QR al llegar para registrarte' },
  { icon: Bell, title: 'Recordatorios', desc: 'Recibe notificaciones de tus próximas citas' },
  { icon: Shield, title: 'Historial', desc: 'Consulta tu historial médico y recetas' },
]

export default function Descargar() {
  return (
    <>
      <SEO
        title="Descargar App | Bouclier Clinique"
        description="Descarga la app de Bouclier Clinique para iOS y Android. Agenda citas, haz check-in y gestiona tu salud desde tu celular."
        canonical="https://bouclier-clinique.com/descargar"
      />

      {/* Hero */}
      <section className="page-hero">
        <div className="page-hero__overlay" style={{ background: 'linear-gradient(135deg, rgba(26,26,26,0.85), rgba(26,26,26,0.95))' }} />
        <motion.div className="page-hero__content" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}>
          <p className="section-label" style={{ color: 'var(--color-accent)' }}>App Móvil</p>
          <h1 className="page-hero__title">Descarga Nuestra App</h1>
          <p className="page-hero__subtitle">Disponible para iOS y Android. Gestiona tus citas y salud desde tu celular.</p>
        </motion.div>
      </section>

      {/* App Content */}
      <AnimatedSection className="section">
        <div className="section__inner">
          <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div style={{
              width: '80px', height: '80px', borderRadius: '20px',
              background: 'linear-gradient(135deg, var(--color-accent), #a08848)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 24px'
            }}>
              <Shield className="w-10 h-10" style={{ color: '#1a1a1a' }} />
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '36px', fontWeight: 500, marginBottom: '12px' }}>App Bouclier</h2>
            <p style={{ color: '#999', fontSize: '18px', maxWidth: '600px', margin: '0 auto' }}>
              Tu portal personal para agendar citas, hacer check-in y consultar tu historial médico.
            </p>
          </motion.div>

          {/* Features */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '48px' }}>
            {features.map(({ icon: Icon, title, desc }, i) => (
              <motion.div key={i} variants={fadeUp} style={{
                background: 'rgba(255,255,255,0.03)', borderRadius: '16px', padding: '24px',
                border: '1px solid rgba(255,255,255,0.05)'
              }}>
                <Icon className="w-8 h-8" style={{ color: 'var(--color-accent)', marginBottom: '16px' }} />
                <h3 style={{ color: '#fff', fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>{title}</h3>
                <p style={{ color: '#888', fontSize: '14px', lineHeight: '1.6' }}>{desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Download Buttons */}
          <motion.div variants={fadeUp} style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <a href="https://apps.apple.com/app/bouclier-paciente/id6748048993" target="_blank" rel="noopener noreferrer"
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                background: '#000', color: '#fff', padding: '16px 32px', borderRadius: '12px',
                textDecoration: 'none', fontSize: '16px', fontWeight: 600, border: '1px solid #333'
              }}>
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '10px', fontWeight: 400, opacity: 0.8 }}>Descargar en</div>
                <div style={{ fontSize: '16px' }}>App Store</div>
              </div>
            </a>

            <a href="https://play.google.com/store/apps/details?id=com.bouclier.patient" target="_blank" rel="noopener noreferrer"
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                background: '#000', color: '#fff', padding: '16px 32px', borderRadius: '12px',
                textDecoration: 'none', fontSize: '16px', fontWeight: 600, border: '1px solid #333'
              }}>
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.199l2.302 1.33a1 1 0 010 1.722l-2.302 1.33-2.532-2.532 2.532-2.852zM5.864 2.658L16.8 9.022l-2.302 2.302-8.634-8.666z"/>
              </svg>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '10px', fontWeight: 400, opacity: 0.8 }}>Disponible en</div>
                <div style={{ fontSize: '16px' }}>Google Play</div>
              </div>
            </a>
          </motion.div>
        </div>
      </AnimatedSection>
    </>
  )
}
