import { Mail, MapPin, Phone } from 'lucide-react'
import { Link } from 'react-router-dom'
import { SITE_CONTENT } from '../data/siteContent.js'

const LOGO_URL = '/assets/img/logo.webp'

function InstagramIcon() {
  return <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg>
}

function FacebookIcon() {
  return <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M14 8h3V4.2c-.5-.1-2.2-.2-4.1-.2C9 4 6.3 6.4 6.3 10.8V14H2v4.3h4.3V24h5.2v-5.7h4.1l.7-4.3h-4.8v-2.8C11.5 10 11.9 8 14 8Z" /></svg>
}

export default function Footer() {
  const { email, location, name, phone, social, tagline } = SITE_CONTENT

  return (
    <footer className="footer editorial-footer">
      <div className="footer__inner">
        <div className="footer__top">
          <div className="footer__brand">
            <img src={LOGO_URL} alt={name} className="footer__logo" />
            <p className="footer__tagline">{tagline}</p>
            <div className="footer__social">
              <a href={social.instagram} target="_blank" rel="noreferrer" className="footer__social-link" aria-label="Instagram de Bouclier Dermatología"><InstagramIcon /></a>
              <a href={social.facebook} target="_blank" rel="noreferrer" className="footer__social-link" aria-label="Facebook de Bouclier Dermatología"><FacebookIcon /></a>
            </div>
          </div>

          <div className="footer__locations">
            <h2 className="footer__heading">Clínica</h2>
            <div className="footer__location"><MapPin aria-hidden="true" size={16} className="footer__icon" /><p>{location.street}<br />{location.city}</p></div>
            <a className="footer__link" href={location.mapsUrl} target="_blank" rel="noreferrer">Cómo llegar</a>
          </div>

          <div className="footer__contact">
            <h2 className="footer__heading">Contacto</h2>
            <a href={`mailto:${email}`} className="footer__contact-item"><Mail aria-hidden="true" size={16} className="footer__icon" />{email}</a>
            <a href={`tel:${phone.e164}`} className="footer__contact-item"><Phone aria-hidden="true" size={16} className="footer__icon" />{phone.display}</a>
          </div>

          <nav className="footer__links" aria-label="Enlaces de pie de página">
            <h2 className="footer__heading">Explorar</h2>
            <Link to="/tratamientos" className="footer__link">Tratamientos</Link>
            <Link to="/dra-gissel" className="footer__link">Dra. Gissel</Link>
            <Link to="/contacto" className="footer__link">Contacto</Link>
            <Link to="/preguntas-frecuentes" className="footer__link">Preguntas frecuentes</Link>
            <Link to="/aviso-de-privacidad" className="footer__link">Aviso de privacidad</Link>
          </nav>
        </div>

        <div className="footer__bottom">
          <p>&copy; {new Date().getFullYear()} {name}. Todos los derechos reservados.</p>
          <p>La información del sitio no sustituye una valoración médica.</p>
        </div>
      </div>
    </footer>
  )
}
