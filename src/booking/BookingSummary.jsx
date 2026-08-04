import { Clock } from 'lucide-react'
import { formatBookingDate, formatBookingTime } from './bookingCalendar.js'

export default function BookingSummary({ treatment, variant, doctor, slot }) {
  return (
    <aside className="booking-summary" aria-label="Resumen de tu cita">
      <h3>Resumen de tu cita</h3>
      <dl>
        <div><dt>Tratamiento</dt><dd>{treatment?.name || 'Por seleccionar'}{variant ? ` · ${variant.name}` : ''}</dd></div>
        <div><dt>Especialista</dt><dd>{doctor?.name || 'Por seleccionar'}</dd></div>
        <div><dt>Fecha</dt><dd>{slot ? formatBookingDate(new Date(slot.startsAt)) : 'Por seleccionar'}</dd></div>
        <div><dt>Hora</dt><dd>{slot ? formatBookingTime(new Date(slot.startsAt)) : 'Por seleccionar'}</dd></div>
      </dl>
      <p className="booking-summary__duration"><Clock aria-hidden="true" /><span>Duración estimada<strong>{treatment?.durationMinutes || 60} minutos</strong></span></p>
    </aside>
  )
}
