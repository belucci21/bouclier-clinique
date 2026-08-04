import { useState } from 'react'
import TreatmentCard from '../components/TreatmentCard.jsx'
import SEO from '../components/SEO.jsx'
import { TREATMENT_CATEGORIES, TREATMENTS } from '../data/treatments.js'

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
        <p className="editorial-kicker">Tratamientos</p>
        <h1>Tratamientos médicos avanzados.</h1>
        <p>
          Protocolos personalizados que combinan tecnología, experiencia médica y una visión integral de tu piel.
        </p>
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
    </main>
  )
}
