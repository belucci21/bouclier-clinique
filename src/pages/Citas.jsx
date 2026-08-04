import BookingFlow from '../booking/BookingFlow.jsx'
import SEO from '../components/SEO.jsx'

export default function Citas() {
  return (
    <main className="editorial-page booking-page">
      <SEO title="Agendar cita | Bouclier Dermatología" description="Agenda una valoración y confirma tu horario con un anticipo seguro del 30%." canonical="https://bouclier-clinique.com/citas" />
      <header className="editorial-page__header editorial-page__header--compact">
        <p className="editorial-kicker">Agenda en línea</p>
        <h1>Tu piel empieza con una conversación.</h1>
        <p>Elige tratamiento, especialista y horario. Para confirmar la reserva se solicita un anticipo del 30%.</p>
      </header>
      <BookingFlow />
    </main>
  )
}
