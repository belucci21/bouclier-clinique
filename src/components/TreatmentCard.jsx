import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getTreatmentPriceLabel } from '../data/treatments.js'

export default function TreatmentCard({ treatment }) {
  return (
    <article className="treatment-directory-card">
      <Link
        to={`/tratamientos/${treatment.slug}`}
        className="treatment-directory-card__image-link"
        aria-label={`Conocer ${treatment.name}`}
      >
        <img
          className="treatment-directory-card__image"
          src={treatment.cover}
          alt=""
          loading="lazy"
          width="640"
          height="760"
        />
      </Link>
      <div className="treatment-directory-card__body">
        <p className="treatment-directory-card__eyebrow">{treatment.eyebrow}</p>
        <h2 className="treatment-directory-card__title">{treatment.name}</h2>
        <p className="treatment-directory-card__summary">{treatment.summary}</p>
        <div className="treatment-directory-card__meta">
          <p className="treatment-directory-card__price">{getTreatmentPriceLabel(treatment)}</p>
          <Link className="treatment-directory-card__link" to={`/tratamientos/${treatment.slug}`}>
            Ver tratamiento <ArrowUpRight aria-hidden="true" size={18} />
          </Link>
        </div>
      </div>
    </article>
  )
}
