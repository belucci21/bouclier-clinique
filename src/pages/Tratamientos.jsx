import { useState } from 'react'
import TreatmentCard from '../components/TreatmentCard.jsx'
import SEO from '../components/SEO.jsx'
import { CalendarDays, LockKeyhole, Tags } from 'lucide-react'
import { CLINICAL_CONCERNS, TREATMENT_CATEGORIES, TREATMENTS } from '../data/treatments.js'

export default function Tratamientos() {
  const [activeCategory, setActiveCategory] = useState('todos')
  const visibleTreatments = activeCategory === 'todos'
    ? TREATMENTS
    : TREATMENTS.filter((treatment) => treatment.category === activeCategory)

  return (
    <main className="treatments-page">
      <SEO
        title="Tratamientos médicos avanzados | Bouclier Dermatología"
        description="Dermatología, medicina estética y láser con diagnóstico médico y protocolos personalizados."
        canonical="https://bouclier-clinique.com/tratamientos"
        ogImage="/assets/img/tratamientos-bouclier.png"
      />

      <header className="treatments-page__intro">
        <h1>Tratamientos <br aria-hidden="true" />médicos avanzados.</h1>
      </header>

      <div className="treatment-filters" role="group" aria-label="Filtrar tratamientos por categoría">
        <button
          className={activeCategory === 'todos' ? 'is-active' : ''}
          type="button"
          aria-pressed={activeCategory === 'todos'}
          onClick={() => setActiveCategory('todos')}
        >
          Todos
        </button>
        {TREATMENT_CATEGORIES.map((category) => (
          <button
            key={category.id}
            className={activeCategory === category.id ? 'is-active' : ''}
            type="button"
            aria-pressed={activeCategory === category.id}
            onClick={() => setActiveCategory(category.id)}
          >
            {category.shortName}
          </button>
        ))}
      </div>

      <p className="treatments-page__count" aria-live="polite">
        {visibleTreatments.length} {visibleTreatments.length === 1 ? 'tratamiento' : 'tratamientos'}
      </p>

      <section className="treatment-directory" aria-label="Catálogo de tratamientos">
        {visibleTreatments.map((treatment) => (
          <TreatmentCard key={treatment.slug} treatment={treatment} />
        ))}
      </section>

      <section className="treatment-confidence" aria-label="Información de reserva">
        <p><Tags aria-hidden="true" /> Precios y variantes activas mostrados.</p>
        <p><LockKeyhole aria-hidden="true" /> Pago en línea próximamente.</p>
        <p><CalendarDays aria-hidden="true" /> Agenda tu cita en línea disponible.</p>
      </section>

      <section className="clinical-scope" aria-labelledby="clinical-scope-title">
        <div>
          <p className="editorial-kicker">Dermatología clínica y protocolos</p>
          <h2 id="clinical-scope-title">Dermatología clínica con enfoque funcional.</h2>
          <p>La tecnología es solo una parte del cuidado. También diagnosticamos y acompañamos enfermedades de piel, pelo y uñas.</p>
        </div>
        <ul>
          {CLINICAL_CONCERNS.map((concern) => <li key={concern}>{concern}</li>)}
        </ul>
      </section>
    </main>
  )
}
