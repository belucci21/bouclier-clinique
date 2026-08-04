import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import SEO from '../components/SEO.jsx'
import { getTreatmentBySlug } from '../data/treatments.js'

export default function TratamientoDetalle() {
  const { slug } = useParams()
  const treatment = getTreatmentBySlug(slug)

  if (!treatment) {
    return (
      <main className="treatment-empty">
        <p className="editorial-kicker">Bouclier Dermatología</p>
        <h1>Tratamiento no encontrado</h1>
        <p>El tratamiento que buscas cambió de dirección o ya no está disponible.</p>
        <Link className="btn-primary" to="/tratamientos">Ver todos los tratamientos</Link>
      </main>
    )
  }

  return (
    <main className="treatment-detail">
      <SEO
        title={`${treatment.name} | Bouclier Dermatología`}
        description={treatment.summary}
        canonical={`https://bouclier-clinique.com/tratamientos/${treatment.slug}`}
        ogImage={treatment.image}
      />

      <section className="treatment-detail__hero">
        <div className="treatment-detail__copy">
          <Link className="treatment-detail__back" to="/tratamientos">
            <ArrowLeft aria-hidden="true" size={17} /> Todos los tratamientos
          </Link>
          <p className="editorial-kicker">{treatment.eyebrow}</p>
          <h1>{treatment.name}</h1>
          <p className="treatment-detail__summary">{treatment.summary}</p>
          <Link className="btn-primary" to={`/citas?tratamiento=${treatment.slug}`}>
            Agendar valoración <ArrowRight aria-hidden="true" size={18} />
          </Link>
        </div>
        <img
          className="treatment-detail__image"
          src={treatment.image}
          alt={`Tratamiento ${treatment.name} en Bouclier Dermatología`}
          width="920"
          height="920"
        />
      </section>

      <section className="treatment-detail__facts" aria-label={`Información sobre ${treatment.name}`}>
        <article>
          <span>01</span>
          <h2>Indicado para</h2>
          <p>{treatment.indications}</p>
        </article>
        <article>
          <span>02</span>
          <h2>Qué puedes esperar</h2>
          <p>{treatment.expectations}</p>
        </article>
        <article>
          <span>03</span>
          <h2>Tecnología</h2>
          <p>{treatment.technology}</p>
        </article>
      </section>

      <section className="treatment-detail__note">
        <div>
          <p className="editorial-kicker">Antes de decidir</p>
          <h2>El tratamiento correcto empieza con un diagnóstico.</h2>
        </div>
        <ul>
          {treatment.faqs.map((faq) => (
            <li key={faq}><Check aria-hidden="true" size={18} />{faq}</li>
          ))}
          <li><Check aria-hidden="true" size={18} />La valoración determina indicación, seguridad y plan de sesiones.</li>
        </ul>
      </section>
    </main>
  )
}
