import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Smartphone, Shield, Bell, Calendar, QrCode, Clock, Star, Heart, Stethoscope, UserRound } from 'lucide-react'
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

const androidApps = [
  {
    id: 'patient',
    name: 'Bouclier Pacientes',
    audience: 'Para pacientes',
    description: 'Agenda citas, consulta tu historial y recibe recordatorios.',
    icon: UserRound,
    url: 'https://github.com/belucci21/bouclier-clinique/releases/download/android-v1.0.0-20260811/Bouclier-Pacientes.apk',
    filename: 'Bouclier-Pacientes.apk',
    ariaLabel: 'Descargar app para pacientes en Android',
  },
  {
    id: 'clinic',
    name: 'Bouclier Clínica',
    audience: 'Para personal autorizado',
    description: 'Gestiona la agenda y la atención clínica desde Android.',
    icon: Stethoscope,
    url: 'https://github.com/belucci21/bouclier-clinique/releases/download/android-v1.0.0-20260811/Bouclier-Clinica.apk',
    filename: 'Bouclier-Clinica.apk',
    ariaLabel: 'Descargar app clínica para Android',
  },
]

export default function Descargar() {
  return (
    <main>
      <SEO
        title="Descargar App | Bouclier Dermatología"
        description="Descarga las apps de Bouclier Dermatología para Android: pacientes y personal clínico autorizado."
        canonical="https://bouclier-clinique.com/descargar"
      />

      {/* Hero */}
      <section className="page-hero">
        <div className="page-hero__overlay" style={{ background: 'linear-gradient(135deg, rgba(26,26,26,0.85), rgba(26,26,26,0.95))' }} />
        <motion.div className="page-hero__content" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}>
          <p className="section-label" style={{ color: 'var(--color-accent)' }}>App Móvil</p>
          <h1 className="page-hero__title">Apps Bouclier para Android</h1>
          <p className="page-hero__subtitle">Una app para pacientes y otra para el equipo clínico autorizado.</p>
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

          {/* Android downloads */}
          <motion.div variants={fadeUp} style={{ textAlign: 'center' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 500, marginBottom: '12px' }}>Elige tu aplicación</h3>
            <p style={{ color: 'var(--color-text-light)', margin: '0 auto 32px', maxWidth: '580px', lineHeight: 1.6 }}>
              Descarga el instalador oficial para Android según el tipo de acceso que necesitas.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'stretch', gap: '20px', flexWrap: 'wrap' }}>
              {androidApps.map(({ id, name, audience, description, icon: Icon, url, filename, ariaLabel }) => {
                const content = (
                  <>
                    <div style={{
                      width: '52px', height: '52px', flex: '0 0 52px', borderRadius: '14px',
                      background: url ? 'rgba(255,255,255,0.12)' : 'rgba(17,17,17,0.06)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <Icon className="w-6 h-6" aria-hidden="true" />
                    </div>
                    <div style={{ minWidth: 0, textAlign: 'left' }}>
                      <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', opacity: 0.7 }}>{audience}</div>
                      <div style={{ fontSize: '19px', fontWeight: 700, lineHeight: 1.25, marginTop: '4px' }}>{name}</div>
                      <div style={{ fontSize: '13px', fontWeight: 400, lineHeight: 1.45, marginTop: '8px', opacity: 0.74 }}>{description}</div>
                      <div style={{ fontSize: '13px', fontWeight: 700, marginTop: '14px' }}>{url ? 'Descargar APK para Android' : 'Preparando APK actualizado'}</div>
                    </div>
                  </>
                )

                const sharedStyle = {
                  boxSizing: 'border-box', width: 'min(100%, 360px)', minHeight: '190px',
                  display: 'flex', alignItems: 'flex-start', gap: '18px', padding: '28px',
                  borderRadius: '18px', textDecoration: 'none', transition: 'all 0.3s ease'
                }

                return url ? (
                  <a
                    key={id}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={filename}
                    aria-label={ariaLabel}
                    style={{ ...sharedStyle, background: 'var(--color-primary)', color: '#fff', boxShadow: '0 4px 24px rgba(0,0,0,0.18)' }}
                  >
                    {content}
                  </a>
                ) : (
                  <div key={id} aria-label={`${name}: compilación en curso`} style={{ ...sharedStyle, background: 'var(--color-bg-alt)', color: 'var(--color-text-light)', border: '1px solid var(--color-border)' }}>
                    {content}
                  </div>
                )
              })}
            </div>

            <p style={{ color: '#666', fontSize: '13px', marginTop: '24px' }}>
              Instalación directa para Android · Google Play próximamente
            </p>
            <p style={{ color: 'var(--color-text-light)', fontSize: '13px', maxWidth: '620px', margin: '10px auto 0', lineHeight: 1.6 }}>
              Android puede pedir permiso para instalar aplicaciones desde el navegador. Descarga únicamente desde esta página oficial.
            </p>

            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '12px', marginTop: '20px',
              background: 'var(--color-bg-alt)', color: 'var(--color-text-light)', padding: '14px 22px',
              borderRadius: '12px', border: '1px solid var(--color-border)'
            }}>
              <Smartphone className="w-5 h-5" style={{ color: '#666' }} />
              <span style={{ fontSize: '14px', fontWeight: 600 }}>iOS estará disponible después de TestFlight</span>
            </div>
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
