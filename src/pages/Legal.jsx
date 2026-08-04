import SEO from '../components/SEO.jsx'
import { PRIVACY_NOTICE } from '../data/siteContent.js'

export default function Legal() {
  return (
    <main className="editorial-page legal-page">
      <SEO title="Aviso de privacidad | Bouclier Dermatología" description="Aviso de privacidad de Bouclier Dermatología." canonical="https://bouclier-clinique.com/aviso-de-privacidad" />
      <header className="editorial-page__header editorial-page__header--compact">
        <p className="editorial-kicker">Información legal</p>
        <h1>Aviso de privacidad.</h1>
        <p>Versión clínica consolidada a partir del aviso vigente de Bouclier Dermatología.</p>
      </header>
      <section className="legal-page__content">
        {PRIVACY_NOTICE.map((section, index) => (
          <article key={section.title}>
            <span>{String(index + 1).padStart(2, '0')}</span>
            <div><h2>{section.title}</h2><p>{section.body}</p></div>
          </article>
        ))}
      </section>
    </main>
  )
}
