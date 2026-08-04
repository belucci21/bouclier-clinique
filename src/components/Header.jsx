import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ChevronDown, Menu, X } from 'lucide-react'
import TreatmentMegaMenu from './TreatmentMegaMenu.jsx'

const LOGO_URL = '/assets/img/logo.webp'

const navLinks = [
  { label: 'Clínica', to: '/quienes-somos' },
  { label: 'Método', to: '/metodo-bouclier' },
  { label: 'Dra. Gissel', to: '/dra-gissel' },
  { label: 'Mi portal', to: '/paciente/login' },
]

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [treatmentsOpen, setTreatmentsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const isHome = location.pathname === '/'
  const treatmentButtonRef = useRef(null)
  const treatmentNavRef = useRef(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
    setTreatmentsOpen(false)
  }, [location.pathname])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  useEffect(() => {
    if (!treatmentsOpen) return undefined

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setTreatmentsOpen(false)
        treatmentButtonRef.current?.focus()
      }
    }
    const onPointerDown = (event) => {
      if (!treatmentNavRef.current?.contains(event.target)) setTreatmentsOpen(false)
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('pointerdown', onPointerDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('pointerdown', onPointerDown)
    }
  }, [treatmentsOpen])

  return (
    <header className={`header editorial-header ${isHome ? 'editorial-header--home' : ''} ${scrolled ? 'header--scrolled' : ''}`}>
      <div className="header__inner">
        <Link to="/" className="header__logo-link" aria-label="Bouclier Dermatología, inicio">
          <img src={LOGO_URL} alt="" className="header__logo" />
        </Link>

        <nav className="header__nav" aria-label="Navegación principal">
          <Link
            to="/quienes-somos"
            className={`header__nav-link ${location.pathname === '/quienes-somos' ? 'header__nav-link--active' : ''}`}
          >
            Clínica
          </Link>
          <div className="header__treatments" ref={treatmentNavRef}>
            <button
              ref={treatmentButtonRef}
              type="button"
              className={`header__nav-link header__treatment-button ${location.pathname.startsWith('/tratamientos') ? 'header__nav-link--active' : ''}`}
              aria-expanded={treatmentsOpen}
              aria-controls="treatment-mega-menu"
              onClick={() => setTreatmentsOpen((open) => !open)}
            >
              Tratamientos <ChevronDown aria-hidden="true" size={14} />
            </button>
            {treatmentsOpen && <TreatmentMegaMenu onNavigate={() => setTreatmentsOpen(false)} />}
          </div>
          {navLinks.slice(1).map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className={`header__nav-link ${location.pathname === link.to ? 'header__nav-link--active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <Link to="/citas" className="btn-primary header__cta">Agendar cita</Link>

        <button
          className="header__hamburger"
          type="button"
          onClick={() => setMobileOpen((open) => !open)}
          aria-expanded={mobileOpen}
          aria-controls="mobile-navigation"
          aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
        >
          {mobileOpen ? <X aria-hidden="true" size={24} /> : <Menu aria-hidden="true" size={24} />}
        </button>
      </div>

      {mobileOpen && (
        <>
          <button className="header__overlay" type="button" aria-label="Cerrar menú" onClick={() => setMobileOpen(false)} />
          <nav id="mobile-navigation" className="header__mobile-nav" aria-label="Navegación móvil">
            <div className="header__mobile-nav-header">
              <img src={LOGO_URL} alt="Bouclier Dermatología" className="header__logo" />
              <button className="header__hamburger" type="button" onClick={() => setMobileOpen(false)} aria-label="Cerrar menú">
                <X aria-hidden="true" size={24} />
              </button>
            </div>
            <div className="header__mobile-nav-links">
              {[navLinks[0], { label: 'Tratamientos', to: '/tratamientos' }, ...navLinks.slice(1)].map((link) => (
                <Link key={link.label} to={link.to} className="header__mobile-link">{link.label}</Link>
              ))}
              <Link to="/citas" className="btn-primary header__mobile-cta">Agendar cita</Link>
            </div>
          </nav>
        </>
      )}
    </header>
  )
}
