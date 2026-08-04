import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import SEO from '../components/SEO.jsx'
import TreatmentCard from '../components/TreatmentCard.jsx'
import { TREATMENTS } from '../data/treatments.js'

const featuredTreatments = ['hydrafacial', 'red-touch', 'accent-prime']
  .map((slug) => TREATMENTS.find((treatment) => treatment.slug === slug))

const methodSteps = [
  ['01', 'Escuchar', 'Tu historia, tu piel y tus objetivos antes de proponer cualquier intervención.'],
  ['02', 'Diagnosticar', 'Valoración médica para distinguir necesidades reales de tendencias pasajeras.'],
  ['03', 'Tratar', 'Protocolos medidos, seguimiento clínico y expectativas transparentes.'],
]

export default function Home() {
  return (
    <main className="home-editorial">
      <SEO
        title="Bouclier Dermatología | Medicina estética con criterio"
        description="Dermatología, medicina estética y láser con diagnóstico, tecnología y seguimiento médico."
        canonical="https://bouclier-clinique.com/"
        ogImage="/assets/img/hero-clinical-editorial.webp"
      />

      <section className="editorial-hero">
        <div className="editorial-hero__copy">
          <p className="editorial-hero__brandline">Dermatología · Estética · Láser</p>
          <h1>Medicina estética <span>con criterio</span></h1>
          <p className="editorial-hero__lead">Ciencia, prevención y resultados reales para tu piel.</p>
          <div className="editorial-hero__actions">
            <Link className="btn-primary" to="/citas">Agendar cita</Link>
            <Link className="editorial-link" to="/tratamientos">Ver tratamientos</Link>
          </div>
        </div>
        <figure className="editorial-hero__media">
          <img
            src="/assets/img/hero-clinical-editorial.webp"
            alt="Valoración dermatológica cuidadosa en Bouclier"
            width="1536"
            height="1024"
            fetchPriority="high"
          />
        </figure>
      </section>

      <section className="home-treatment-intro">
        <p className="editorial-kicker">Tratamientos</p>
        <div>
          <h2>Tratamientos<br className="desktop-line-break" /> médicos avanzados.</h2>
          <p>Protocolos personalizados que combinan tecnología, experiencia médica y una visión integral de tu piel.</p>
        </div>
      </section>

      <section className="home-featured-treatments" aria-label="Tratamientos destacados">
        {featuredTreatments.map((treatment) => <TreatmentCard key={treatment.slug} treatment={treatment} />)}
      </section>

      <div className="home-view-all">
        <Link className="editorial-link" to="/tratamientos">Explorar todos los tratamientos</Link>
      </div>

      <section className="home-method">
        <div className="home-method__heading">
          <p className="editorial-kicker">Método Bouclier</p>
          <h2>Decisiones médicas. Resultados que respetan quién eres.</h2>
        </div>
        <div className="home-method__steps">
          {methodSteps.map(([number, title, text]) => (
            <article key={number}>
              <span>{number}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
        <Link to="/metodo-bouclier" className="home-method__link">
          Conocer el método <ArrowRight aria-hidden="true" size={18} />
        </Link>
      </section>

      <section className="home-doctor">
        <img src="/assets/img/dra-gissel.png" alt="Dra. Gissel, directora médica de Bouclier" loading="lazy" />
        <div>
          <p className="editorial-kicker">Dirección médica</p>
          <h2>Dra. Gissel</h2>
          <p>Una práctica centrada en comprender la piel, indicar solo lo necesario y acompañar cada evolución con honestidad clínica.</p>
          <Link className="editorial-link" to="/dra-gissel">Conocer a la doctora</Link>
        </div>
      </section>

      <section className="home-results-note">
        <p>Los resultados varían según el diagnóstico, antecedentes y respuesta individual. Ningún procedimiento sustituye una valoración médica.</p>
      </section>

      <section className="home-final-cta">
        <p className="editorial-kicker">Tu piel, con intención</p>
        <h2>Empecemos por escucharte.</h2>
        <Link className="btn-primary btn-primary--light" to="/citas">Agendar cita</Link>
      </section>
    </main>
  )
}
