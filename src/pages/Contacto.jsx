import { ExternalLink, Mail, MapPin, Phone } from 'lucide-react'
import SEO from '../components/SEO.jsx'
import { SITE_CONTENT } from '../data/siteContent.js'

export default function Contacto() {
  const { email, hours, location, phone } = SITE_CONTENT

  return (
    <main className="editorial-page contact-page">
      <SEO
        title="Contacto y ubicación | Bouclier Dermatología"
        description="Contacta a Bouclier Dermatología en Boca del Río, Veracruz, y consulta horarios y ubicación."
        canonical="https://bouclier-clinique.com/contacto"
      />

      <header className="editorial-page__header editorial-page__header--compact">
        <p className="editorial-kicker">Contacto</p>
        <h1>Hablemos de tu piel.</h1>
        <p>Estamos en Boca del Río, Veracruz. Agenda en línea o escríbenos si necesitas orientación antes de reservar.</p>
      </header>

      <section className="contact-page__grid">
        <article>
          <MapPin aria-hidden="true" />
          <h2>Clínica</h2>
          <p>{location.street}<br />{location.city}</p>
          <a href={location.mapsUrl} target="_blank" rel="noreferrer">Abrir ubicación <ExternalLink aria-hidden="true" size={16} /></a>
        </article>
        <article>
          <Phone aria-hidden="true" />
          <h2>Citas</h2>
          <a href={`tel:${phone.e164}`}>{phone.display}</a>
          <a href={phone.whatsappUrl} target="_blank" rel="noreferrer">Escribir por WhatsApp <ExternalLink aria-hidden="true" size={16} /></a>
        </article>
        <article>
          <Mail aria-hidden="true" />
          <h2>Correo</h2>
          <a href={`mailto:${email}`}>{email}</a>
        </article>
        <article>
          <span className="contact-page__clock">10:00</span>
          <h2>Horario</h2>
          {hours.map((row) => <p key={row.days}><strong>{row.days}</strong><br />{row.time}</p>)}
        </article>
      </section>
    </main>
  )
}
