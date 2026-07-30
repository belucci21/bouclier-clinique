import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Smartphone, Shield, Bell, Calendar, QrCode, Monitor, Clock } from 'lucide-react'
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

const patientFeatures = [
  { icon: Calendar, title: 'Agendar Citas', desc: 'Reserva tu cita en línea en cualquier momento' },
  { icon: QrCode, title: 'Check-in QR', desc: 'Escanea el código QR al llegar para registrarte' },
  { icon: Bell, title: 'Recordatorios', desc: 'Recibe notificaciones de tus próximas citas' },
  { icon: Shield, title: 'Historial', desc: 'Consulta tu historial médico y recetas' },
]

const doctorFeatures = [
  { icon: Monitor, title: 'Dashboard', desc: 'Gestiona citas, pacientes y recetas desde la web' },
  { icon: QrCode, title: 'Check-in Pacientes', desc: 'Escanea QR para registrar llegada de pacientes' },
  { icon: Calendar, title: 'Calendario', desc: 'Vista completa del día con FullCalendar' },
  { icon: Shield, title: 'Informes', desc: 'Crea diagnósticos, recetas e informes médicos' },
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

      {/* Patient App */}
      <AnimatedSection className="section">
        <div className="section__inner">
          <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div style={{
              width: '80px', height: '80px', borderRadius: '20px',
              background: 'linear-gradient(135deg, var(--color-accent), #a08848)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 24px'
            }}>
              <Smartphone className="w-10 h-10" style={{ color: '#1a1a1a' }} />
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '36px', fontWeight: 500, marginBottom: '12px' }}>App Paciente</h2>
            <p style={{ color: '#999', fontSize: '18px', maxWidth: '600px', margin: '0 auto' }}>
              Tu portal personal para agendar citas, hacer check-in y consultar tu historial médico.
            </p>
          </motion.div>

          {/* Patient Features */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '48px' }}>
            {patientFeatures.map(({ icon: Icon, title, desc }, i) => (
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

          {/* Coming Soon Notice */}
          <motion.div variants={fadeUp} style={{
            background: 'rgba(184,154,90,0.1)', borderRadius: '16px', padding: '32px',
            border: '1px solid rgba(184,154,90,0.2)', textAlign: 'center', marginBottom: '48px'
          }}>
            <Clock className="w-10 h-10" style={{ color: 'var(--color-accent)', margin: '0 auto 16px' }} />
            <h3 style={{ color: '#fff', fontSize: '20px', fontWeight: 600, marginBottom: '12px' }}>Próximamente en Tiendas</h3>
            <p style={{ color: '#999', fontSize: '15px', maxWidth: '500px', margin: '0 auto', lineHeight: '1.6' }}>
              Las apps móviles están en proceso de publicación. Mientras tanto, puedes acceder a tu cuenta desde el navegador en el dashboard.
            </p>
            <a href="https://bouclier-clinic-system.vercel.app" target="_blank" rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px', marginTop: '20px',
                background: 'var(--color-accent)', color: '#1a1a1a', padding: '14px 28px',
                borderRadius: '10px', textDecoration: 'none', fontSize: '15px', fontWeight: 600
              }}>
              <Monitor className="w-5 h-5" />
              Abrir Dashboard
            </a>
          </motion.div>
        </div>
      </AnimatedSection>

      {/* Doctor/Staff Section */}
      <AnimatedSection className="section" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="section__inner">
          <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div style={{
              width: '80px', height: '80px', borderRadius: '20px',
              background: 'linear-gradient(135deg, #2a2a2a, #1a1a1a)',
              border: '2px solid rgba(184,154,90,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 24px'
            }}>
              <Monitor className="w-10 h-10" style={{ color: 'var(--color-accent)' }} />
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '36px', fontWeight: 500, marginBottom: '12px' }}>Dashboard Médico</h2>
            <p style={{ color: '#999', fontSize: '18px', maxWidth: '600px', margin: '0 auto' }}>
              Plataforma web para doctores, recepción y administración de la clínica.
            </p>
          </motion.div>

          {/* Doctor Features */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '48px' }}>
            {doctorFeatures.map(({ icon: Icon, title, desc }, i) => (
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

          {/* Dashboard Access */}
          <motion.div variants={fadeUp} style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <a href="https://bouclier-clinic-system.vercel.app" target="_blank" rel="noopener noreferrer"
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                background: 'var(--color-accent)', color: '#1a1a1a',
                padding: '16px 32px', borderRadius: '12px',
                textDecoration: 'none', fontSize: '16px', fontWeight: 600
              }}>
              <Monitor className="w-6 h-6" />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '10px', fontWeight: 400, opacity: 0.7 }}>Acceso para</div>
                <div style={{ fontSize: '16px' }}>Doctores y Staff</div>
              </div>
            </a>
          </motion.div>
        </div>
      </AnimatedSection>
    </>
  )
}
