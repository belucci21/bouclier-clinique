import { Link } from 'react-router-dom'
import { Mail, Phone, MapPin } from 'lucide-react'

const InstagramIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
)

const FacebookIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
)

const TwitterIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
  </svg>
)

const LOGO_URL = '/assets/img/logo.webp'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__top">
          <div className="footer__brand">
            <img src={LOGO_URL} alt="Bouclier Clinique" className="footer__logo" />
            <p className="footer__tagline">
              La nueva medicina estética preventiva en México. Protegemos tu piel antes de que envejezca.
            </p>
            <div className="footer__social">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="footer__social-link" aria-label="Instagram">
                <InstagramIcon />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="footer__social-link" aria-label="Facebook">
                <FacebookIcon />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="footer__social-link" aria-label="Twitter">
                <TwitterIcon />
              </a>
            </div>
          </div>

          <div className="footer__locations">
            <h4 className="footer__heading">Nuestras Clínicas</h4>
            <div className="footer__location">
              <MapPin size={16} className="footer__icon" />
              <div>
                <strong>Bouclier Clínica</strong>
                <p>Torre EXERTIA, Oficina 704 Y 706, Barco Viejo s/n, Col. Mocambo, 94293 Boca del Río, Veracruz</p>
              </div>
            </div>
            <div className="footer__location">
              <MapPin size={16} className="footer__icon" />
              <div>
                <strong>Bouclier Riviera Veracruzana</strong>
                <p>Plaza Puerto Ceiba local 15 y 16, Blvd Riviera Veracruzana, Colonia Playas del Conchal</p>
              </div>
            </div>
          </div>

          <div className="footer__contact">
            <h4 className="footer__heading">Contacto</h4>
            <a href="mailto:info@bouclier-clinique.com" className="footer__contact-item">
              <Mail size={16} className="footer__icon" />
              info@bouclier-clinique.com
            </a>
            <a href="tel:+522291087016" className="footer__contact-item">
              <Phone size={16} className="footer__icon" />
              +52 229 108 7016
            </a>
          </div>

          <div className="footer__links">
            <h4 className="footer__heading">Enlaces</h4>
            <Link to="/" className="footer__link">Inicio</Link>
            <Link to="/quienes-somos" className="footer__link">Quiénes Somos</Link>
            <Link to="/metodo-bouclier" className="footer__link">Método Bouclier</Link>
            <Link to="/citas" className="footer__link">Agendar Cita</Link>
            <a href="#" className="footer__link">Aviso de Privacidad</a>
            <a href="#" className="footer__link">Términos y Condiciones</a>
          </div>
        </div>

        <div className="footer__bottom">
          <p>&copy; {new Date().getFullYear()} Bouclier Clinique. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
