import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Smartphone, Shield, Bell, Calendar, QrCode, Clock, Star, Heart } from 'lucide-react'
import { Link } from 'react-router-dom'
import SEO from '../components/SEO.jsx'

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }
}

const stagger = {
  visible: { transition: { staggerChildren: 0.15 } }
}

function AnimatedSection({ children, className = '', style }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.section ref={ref} className={className} style={style} initial="hidden" animate={inView ? 'visible' : 'hidden'} variants={stagger}>
      {children}
    </motion.section>
  )
}

const patientFeatures = [
  { icon: Calendar, title: 'Agendar Citas', desc: 'Reserva tu cita en línea en cualquier momento del día' },
  { icon: QrCode, title: 'Check-in QR', desc: 'Escanea el código QR al llegar para registrarte al instante' },
  { icon: Bell, title: 'Recordatorios', desc: 'Recibe notificaciones de tus próximas citas y tratamientos' },
  { icon: Shield, title: 'Historial Médico', desc: 'Consulta tus diagnósticos, recetas e informes' },
  { icon: Heart, title: 'Mi Perfil', desc: 'Gestiona tu información personal y datos de contacto' },
  { icon: Star, title: 'Fácil y Rápido', desc: 'Interfaz sencilla diseñada para ti' },
]

export default function Descargar() {
  return (
    <main>
      <SEO
        title="Descargar App | Bouclier Dermatología"
        description="Descarga la app de Bouclier Dermatología para Android. Agenda citas, haz check-in y gestiona tu salud desde tu celular."
        canonical="https://bouclier-clinique.com/descargar"
      />

      {/* Hero */}
      <section className="page-hero">
        <div className="page-hero__overlay" style={{ background: 'linear-gradient(135deg, rgba(26,26,26,0.85), rgba(26,26,26,0.95))' }} />
        <motion.div className="page-hero__content" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}>
          <p className="section-label" style={{ color: 'var(--color-accent)' }}>App Móvil</p>
          <h1 className="page-hero__title">Descarga Nuestra App</h1>
          <p className="page-hero__subtitle">Gestiona tus citas y salud desde tu celular. Disponible para Android.</p>
        </motion.div>
      </section>

      {/* Patient App */}
      <AnimatedSection className="section">
        <div className="section__inner">
          <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div style={{
              width: '100px', height: '100px', borderRadius: '24px',
              background: 'var(--color-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 24px', boxShadow: '0 8px 32px rgba(0,0,0,0.18)'
            }}>
              <Smartphone className="w-12 h-12" style={{ color: '#fff' }} />
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '40px', fontWeight: 500, marginBottom: '12px' }}>App Bouclier Paciente</h2>
            <p style={{ color: '#999', fontSize: '18px', maxWidth: '600px', margin: '0 auto', lineHeight: '1.7' }}>
              Tu portal personal para agendar citas, hacer check-in, consultar tu historial y recibir recordatorios.
            </p>
          </motion.div>

          {/* Patient Features */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '64px' }}>
            {patientFeatures.map(({ icon: Icon, title, desc }, i) => (
              <motion.div key={i} variants={fadeUp} style={{
                background: 'var(--color-bg-alt)', borderRadius: '16px', padding: '28px',
                border: '1px solid var(--color-border)', transition: 'all 0.3s ease'
              }}>
                <div style={{
                  width: '48px', height: '48px', borderRadius: '12px',
                  background: 'rgba(17,17,17,0.08)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', marginBottom: '16px'
                }}>
                  <Icon className="w-6 h-6" style={{ color: 'var(--color-accent)' }} />
                </div>
                <h3 style={{ color: 'var(--color-text)', fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>{title}</h3>
                <p style={{ color: 'var(--color-text-light)', fontSize: '14px', lineHeight: '1.6' }}>{desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Download Section */}
          <motion.div variants={fadeUp} style={{ textAlign: 'center' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 500, marginBottom: '32px' }}>Descargar Ahora</h3>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
              {/* Android Download */}
              <a href="https://expo.dev/artifacts/eas/-AU9FeaVS8S31lLCzYtLseCEJoML6OYfNKlWEhowlQA.apk" target="_blank" rel="noopener noreferrer"
                download="Bouclier-Paciente.apk"
                style={{
                  display: 'flex', alignItems: 'center', gap: '14px',
                  background: 'var(--color-primary)', color: '#fff',
                  padding: '18px 36px', borderRadius: '14px',
                  textDecoration: 'none', fontSize: '17px', fontWeight: 700,
                  boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
                  transition: 'all 0.3s ease'
                }}>
                <Smartphone className="w-6 h-6" style={{ color: '#fff' }} />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '11px', fontWeight: 400, opacity: 0.7, lineHeight: 1 }}>Descargar para</div>
                  <div style={{ fontSize: '17px', lineHeight: 1.2 }}>Android</div>
                </div>
              </a>

              {/* iOS Coming Soon */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                background: 'var(--color-bg-alt)', color: 'var(--color-text-light)',
                padding: '18px 36px', borderRadius: '14px',
                fontSize: '17px', fontWeight: 600,
                border: '1px solid var(--color-border)',
                cursor: 'not-allowed'
              }}>
                <Smartphone className="w-6 h-6" style={{ color: '#666' }} />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '11px', fontWeight: 400, opacity: 0.5, lineHeight: 1 }}>Próximamente en</div>
                  <div style={{ fontSize: '17px', lineHeight: 1.2, color: '#666' }}>iOS</div>
                </div>
              </div>
            </div>

            <p style={{ color: '#666', fontSize: '13px', marginTop: '24px' }}>
              Versión 1.0.0 · Android 6.0+
            </p>
          </motion.div>
        </div>
      </AnimatedSection>

      {/* Web Alternative */}
      <AnimatedSection className="section" style={{ background: 'var(--color-bg-alt)' }}>
        <div className="section__inner">
          <motion.div variants={fadeUp} style={{
            background: 'var(--color-primary)', borderRadius: '20px', padding: '48px',
            border: '1px solid rgba(255,255,255,0.14)', textAlign: 'center'
          }}>
            <Clock className="w-10 h-10" style={{ color: 'var(--color-accent)', margin: '0 auto 20px' }} />
            <h3 style={{ color: '#fff', fontSize: '24px', fontWeight: 600, marginBottom: '12px', fontFamily: 'var(--font-display)' }}>
              ¿No puedes descargar la app?
            </h3>
            <p style={{ color: '#999', fontSize: '16px', maxWidth: '500px', margin: '0 auto 28px', lineHeight: '1.7' }}>
              Accede a tu cuenta desde el navegador. Tu portal de paciente tiene todas las funciones de la app.
            </p>
            <Link to="/paciente/login"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '10px',
                background: '#fff', color: '#111', padding: '16px 32px',
                borderRadius: '12px', textDecoration: 'none', fontSize: '16px', fontWeight: 600,
                transition: 'all 0.3s ease'
              }}>
              <Smartphone className="w-5 h-5" />
              Abrir Portal Web
            </Link>
          </motion.div>
        </div>
      </AnimatedSection>
    </main>
  )
}
