import { useState } from 'react'
import TreatmentCard from '../components/TreatmentCard.jsx'
import SEO from '../components/SEO.jsx'
import { CalendarDays, LockKeyhole, Tags } from 'lucide-react'
import {
  CLINICAL_CONCERNS,
  CLINICAL_PROTOCOLS,
  SOURCE_TREATMENTS,
  TREATMENT_CATEGORIES,
} from '../data/treatments.js'

export default function Tratamientos() {
  const [activeCategory, setActiveCategory] = useState('todos')
  const sourceCategories = TREATMENT_CATEGORIES.filter(({ id }) => id !== 'dermatologia-clinica')
  const visibleTreatments = activeCategory === 'todos'
    ? SOURCE_TREATMENTS
    : SOURCE_TREATMENTS.filter((treatment) => treatment.category === activeCategory)

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

      <section className="treatment-catalog-group" aria-labelledby="source-treatments-title">
        <div className="treatment-catalog-group__header">
          <p className="editorial-kicker">Servicios de la clínica</p>
          <h2 id="source-treatments-title">Tratamientos de cabina</h2>
        </div>

        <div className="treatment-filters" role="group" aria-label="Filtrar tratamientos por categoría">
          <button
            className={activeCategory === 'todos' ? 'is-active' : ''}
            type="button"
            aria-pressed={activeCategory === 'todos'}
            onClick={() => setActiveCategory('todos')}
          >
            Todos
          </button>
          {sourceCategories.map((category) => (
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

        <div className="treatment-directory" aria-label="Tratamientos de cabina">
          {visibleTreatments.map((treatment) => (
            <TreatmentCard key={treatment.slug} treatment={treatment} />
          ))}
        </div>
      </section>

      <section className="treatment-confidence" aria-label="Información de reserva">
        <p><Tags aria-hidden="true" /> Precios y variantes activas mostrados.</p>
        <p><LockKeyhole aria-hidden="true" /> Pago en línea próximamente.</p>
        <p><CalendarDays aria-hidden="true" /> Agenda tu cita en línea disponible.</p>
      </section>

      <section className="treatment-catalog-group treatment-catalog-group--clinical" aria-labelledby="clinical-protocols-title">
        <div className="treatment-catalog-group__header">
          <p className="editorial-kicker">Atención dermatológica</p>
          <h2 id="clinical-protocols-title">Dermatología clínica y protocolos</h2>
          <p>Planes médicos que parten del diagnóstico y se cotizan durante una valoración personalizada.</p>
        </div>
        <div className="treatment-directory" aria-label="Protocolos clínicos">
          {CLINICAL_PROTOCOLS.map((treatment) => (
            <TreatmentCard key={treatment.slug} treatment={treatment} />
          ))}
        </div>
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
