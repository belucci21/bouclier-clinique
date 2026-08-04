import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  calendarDays,
  canShiftBackward,
  canShiftForward,
  dateKey,
  formatBookingTime,
  monthLabel,
  shiftMonth,
} from './bookingCalendar.js'

const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

export default function BookingCalendar({ month, now, slots, selectedDay, selectedSlot, onMonthChange, onDayChange, onSlotChange }) {
  const days = calendarDays(month, slots, now)
  const firstWeekday = (new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth(), 1)).getUTCDay() + 6) % 7
  const daySlots = selectedDay ? slots.filter(({ startsAt }) => dateKey(new Date(startsAt)) === selectedDay) : []

  return (
    <div className="booking-calendar">
      <div className="booking-calendar__month">
        <button type="button" aria-label="Mes anterior" disabled={!canShiftBackward(month, now)} onClick={() => onMonthChange(shiftMonth(month, -1))}>
          <ChevronLeft aria-hidden="true" size={18} />
        </button>
        <h2>{monthLabel(month)}</h2>
        <button type="button" aria-label="Mes siguiente" disabled={!canShiftForward(month, now)} onClick={() => onMonthChange(shiftMonth(month, 1))}>
          <ChevronRight aria-hidden="true" size={18} />
        </button>
      </div>

      <div className="booking-calendar__body">
        <div className="booking-calendar__dates">
          <div className="booking-calendar__weekdays" aria-hidden="true">{WEEKDAYS.map((day) => <span key={day}>{day}</span>)}</div>
          <div className="booking-calendar__grid">
            {Array.from({ length: firstWeekday }, (_, index) => <span key={`empty-${index}`} />)}
            {days.map((day) => (
              <button
                key={day.key}
                type="button"
                aria-label={day.label.replace(',', '')}
                aria-pressed={selectedDay === day.key}
                className={selectedDay === day.key ? 'is-selected' : ''}
                disabled={!day.available}
                onClick={() => onDayChange(day.key)}
              >
                {day.day}<i aria-hidden="true" />
              </button>
            ))}
          </div>
          <p className="booking-calendar__legend"><span />Disponible <span />No disponible</p>
        </div>

        <div className="booking-calendar__times">
          <h3>Horarios disponibles</h3>
          {selectedDay ? daySlots.map((slot) => (
            <button
              key={slot.startsAt}
              type="button"
              aria-pressed={selectedSlot?.startsAt === slot.startsAt}
              className={selectedSlot?.startsAt === slot.startsAt ? 'is-selected' : ''}
              onClick={() => onSlotChange(slot)}
            >
              {formatBookingTime(new Date(slot.startsAt))}
            </button>
          )) : <p>Selecciona un día disponible.</p>}
        </div>
      </div>
    </div>
  )
}
