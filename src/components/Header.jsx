import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'

const LOGO_URL = '/assets/img/logo.webp'

const navLinks = [
  { label: 'Inicio', to: '/' },
  { label: '¿Quiénes somos?', to: '/quienes-somos' },
  { label: 'Tratamientos', href: 'https://bouclier-dermatologia.com/' },
  { label: 'Método Bouclier', to: '/metodo-bouclier' },
  { label: 'Farmacia', href: 'https://bouclier-dermatologia.com/collections' },
  { label: 'Descargar App', to: '/descargar' },
  { label: 'Mi Portal', to: '/paciente/login' },
]

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  return (
    <header className={`header ${scrolled ? 'header--scrolled' : ''}`}>
      <div className="header__inner">
        <Link to="/" className="header__logo-link">
          <img src={LOGO_URL} alt="Bouclier Clinique" className="header__logo" />
        </Link>

        <nav className="header__nav">
          {navLinks.map((link) =>
            link.href ? (
              <a
                key={link.label}
                href={link.href}
                className="header__nav-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.label}
                to={link.to}
                className={`header__nav-link ${location.pathname === link.to ? 'header__nav-link--active' : ''} ${link.highlight ? 'header__nav-link--highlight' : ''}`}
              >
                {link.label}
              </Link>
            )
          )}
        </nav>

        <Link to="/citas" className="btn-primary header__cta">
          Agendar Cita
        </Link>

        <button
          className="header__hamburger"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="header__overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.nav
              className="header__mobile-nav"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              <div className="header__mobile-nav-header">
                <img src={LOGO_URL} alt="Bouclier Clinique" className="header__logo" />
                <button
                  className="header__hamburger"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Cerrar menú"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="header__mobile-nav-links">
                {navLinks.map((link, i) =>
                  link.href ? (
                    <motion.a
                      key={link.label}
                      href={link.href}
                      className="header__mobile-link"
                      target="_blank"
                      rel="noopener noreferrer"
                      initial={{ opacity: 0, x: 40 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + i * 0.05 }}
                    >
                      {link.label}
                    </motion.a>
                  ) : (
                    <motion.div
                      key={link.label}
                      initial={{ opacity: 0, x: 40 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + i * 0.05 }}
                    >
                      <Link
                        to={link.to}
                        className={`header__mobile-link ${location.pathname === link.to ? 'header__mobile-link--active' : ''}`}
                      >
                        {link.label}
                      </Link>
                    </motion.div>
                  )
                )}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="header__mobile-cta-wrapper"
                >
                  <Link to="/citas" className="btn-primary header__mobile-cta" onClick={() => setMobileOpen(false)}>
                    Agendar Cita
                  </Link>
                </motion.div>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </header>
  )
}
