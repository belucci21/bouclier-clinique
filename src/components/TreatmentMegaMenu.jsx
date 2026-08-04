import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { TREATMENT_CATEGORIES } from '../data/treatments.js'

export default function TreatmentMegaMenu({ onNavigate }) {
  return (
    <div id="treatment-mega-menu" className="treatment-mega-menu">
      <div>
        <p className="treatment-mega-menu__kicker">Dermatología, estética y láser</p>
        <p className="treatment-mega-menu__title">Un diagnóstico.<br />Un plan para tu piel.</p>
        <Link to="/tratamientos" className="treatment-mega-menu__all" onClick={onNavigate}>
          Ver todos los tratamientos <ArrowRight aria-hidden="true" size={17} />
        </Link>
      </div>
      <div className="treatment-mega-menu__categories">
        {TREATMENT_CATEGORIES.map((category) => (
          <Link key={category.id} to={`/tratamientos?categoria=${category.id}`} onClick={onNavigate}>
            {category.name}
          </Link>
        ))}
      </div>
    </div>
  )
}
