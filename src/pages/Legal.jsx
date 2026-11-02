import SEO from '../components/SEO.jsx'
import legal from '../data/patientLegal.json'

export default function Legal({ kind = 'privacy' }) {
  const isTerms = kind === 'terms'
  const title = isTerms ? 'Términos y condiciones' : 'Aviso de privacidad'
  const path = isTerms ? '/terminos-y-condiciones' : '/aviso-de-privacidad'
  const sections = isTerms ? legal.terms : legal.privacy
  return (
    <main className="editorial-page legal-page">
      <SEO title={`${title} | Bouclier Dermatología`} description={`${title} de la web y Bouclier Pacientes.`} canonical={`https://bouclier-clinique.com${path}`} />
      <header className="editorial-page__header editorial-page__header--compact">
        <p className="editorial-kicker">Información legal</p>
        <h1>{title}.</h1>
        <p>Web y Bouclier Pacientes · Actualizado el {legal.updatedLabel}.</p>
        <p><a href="/aviso-de-privacidad">Privacidad</a> · <a href="/terminos-y-condiciones">Términos de uso</a> · <a href={`mailto:${legal.supportEmail}`}>Soporte y derechos sobre tus datos</a></p>
      </header>
      <section className="legal-page__content">
        {sections.map((section, index) => (
          <article key={section.title}>
            <span>{String(index + 1).padStart(2, '0')}</span>
            <div><h2>{section.title}</h2><p>{section.body}</p></div>
          </article>
        ))}
      </section>
    </main>
  )
}
