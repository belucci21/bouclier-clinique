import BookingFlow from '../../booking/BookingFlow.jsx'
import { usePatientAuth } from '../../contexts/PatientAuthContext.jsx'

export default function AgendarCita() {
  const { profile, user } = usePatientAuth()

  return (
    <section className="portal-booking">
      <div className="portal-page__header">
        <div><h1>Agendar cita</h1><p>Selecciona horario y confirma tu anticipo de forma segura.</p></div>
      </div>
      <BookingFlow initialPatient={{
        fullName: profile?.full_name || '',
        email: user?.email || '',
        phone: profile?.phone || '',
      }} />
    </section>
  )
}
