import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { Link } from 'react-router-dom'
import SEO from '../components/SEO.jsx'
import { CLINICAL_FAQS } from '../data/siteContent.js'

function FAQItem({ item }) {
  const [open, setOpen] = useState(false)
  return (
    <article className="clinical-faq">
      <h2>
        <button type="button" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
          {item.question}<ChevronDown aria-hidden="true" className={open ? 'is-open' : ''} />
        </button>
      </h2>
      {open && <p>{item.answer}</p>}
    </article>
  )
}

export default function PreguntasFrecuentes() {
  return (
    <main className="editorial-page faq-page">
      <SEO title="Preguntas frecuentes | Bouclier Dermatología" description="Respuestas sobre valoración, preparación y expectativas de los tratamientos Bouclier." canonical="https://bouclier-clinique.com/preguntas-frecuentes" />
      <header className="editorial-page__header editorial-page__header--compact">
        <p className="editorial-kicker">Preguntas frecuentes</p>
        <h1>Antes de tu visita.</h1>
      </header>
      <section className="faq-page__list">
        {CLINICAL_FAQS.map((item) => <FAQItem key={item.question} item={item} />)}
      </section>
      <section className="editorial-page-cta">
        <h2>¿Tienes una pregunta diferente?</h2>
        <Link className="btn-primary" to="/contacto">Contactar al equipo</Link>
      </section>
    </main>
  )
}
