import { Link } from 'react-router-dom'
import SEO from '../components/SEO.jsx'
import { SITE_CONTENT } from '../data/siteContent.js'

export default function DraGissel() {
  const { doctor } = SITE_CONTENT

  return (
    <main className="editorial-page doctor-page">
      <SEO
        title="Dra. Gissel Castellanos | Bouclier Dermatología"
        description="Conoce la formación y el enfoque clínico de la Dra. Gissel Castellanos, médico especialista en Dermatología."
        canonical="https://bouclier-clinique.com/dra-gissel"
        ogImage="/assets/img/dra-gissel.png"
      />

      <section className="doctor-page__hero">
        <div>
          <p className="editorial-kicker">Dirección médica</p>
          <h1>{doctor.name}</h1>
          <p className="doctor-page__role">{doctor.title}</p>
          <p>“Estoy aquí para ayudarte a conseguir la mejor versión de tu piel, con decisiones médicas claras y resultados que respeten quién eres.”</p>
          <Link className="btn-primary" to="/citas">Agendar valoración</Link>
        </div>
        <img src="/assets/img/dra-gissel.png" alt={doctor.fullName} />
      </section>

      <section className="doctor-page__credentials">
        <div>
          <p className="editorial-kicker">Formación</p>
          <h2>Experiencia que sigue aprendiendo.</h2>
        </div>
        <ul>
          {doctor.education.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </section>

      <section className="doctor-page__licenses">
        <p><span>Cédula general</span>{doctor.generalLicense}</p>
        <p><span>Cédula de especialidad</span>{doctor.specialtyLicense}</p>
      </section>
    </main>
  )
}
