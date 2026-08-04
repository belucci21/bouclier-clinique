import { Link } from 'react-router-dom'
import SEO from '../components/SEO.jsx'

export default function QuienesSomos() {
  return (
    <main className="editorial-page">
      <SEO
        title="Clínica | Bouclier Dermatología"
        description="Conoce el enfoque médico, preventivo y personalizado de Bouclier Dermatología en Boca del Río, Veracruz."
        canonical="https://bouclier-clinique.com/quienes-somos"
        ogImage="/assets/img/hero-clinica.jpg"
      />

      <header className="editorial-page__header">
        <p className="editorial-kicker">La clínica</p>
        <h1>Tu piel merece intención, no tendencias.</h1>
        <p>Dermatología clínica y estética guiada por diagnóstico, criterio médico y seguimiento.</p>
      </header>

      <section className="editorial-story">
        <img src="/assets/img/hero-clinica.jpg" alt="Consulta dermatológica en la clínica Bouclier" />
        <div>
          <p className="editorial-kicker">Nuestro enfoque</p>
          <h2>Ver la piel completa.</h2>
          <p>En Bouclier entendemos la medicina estética como una extensión de la salud dermatológica. Primero escuchamos y diagnosticamos; después indicamos solo aquello que aporta valor real.</p>
          <p>“Bouclier” significa escudo. Nuestro trabajo es proteger la piel con prevención, tecnología bien indicada y decisiones que respeten los rasgos de cada persona.</p>
          <Link className="editorial-link" to="/metodo-bouclier">Conocer el método</Link>
        </div>
      </section>

      <section className="editorial-values">
        {[
          ['01', 'Criterio', 'Cada decisión parte de una necesidad clínica, no de una moda.'],
          ['02', 'Transparencia', 'Explicamos alcance, recuperación y límites antes de tratar.'],
          ['03', 'Continuidad', 'Documentamos la evolución y ajustamos el plan cuando es necesario.'],
        ].map(([number, title, copy]) => (
          <article key={number}><span>{number}</span><h2>{title}</h2><p>{copy}</p></article>
        ))}
      </section>

      <section className="editorial-page-cta">
        <h2>Conoce una forma más consciente de cuidar tu piel.</h2>
        <Link className="btn-primary" to="/citas">Agendar cita</Link>
      </section>
    </main>
  )
}
