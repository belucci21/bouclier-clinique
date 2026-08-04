export const BOOKING_TIME_ZONE = 'America/Mexico_City'
export const BOOKING_RANGE_DAYS = 90

const DAY_MS = 24 * 60 * 60_000

function dateParts(date) {
  return Object.fromEntries(new Intl.DateTimeFormat('en-CA', {
    timeZone: BOOKING_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date).filter(({ type }) => type !== 'literal').map(({ type, value }) => [type, Number(value)]))
}

function zonedDateTime(year, month, day, hour = 0, minute = 0) {
  const wanted = Date.UTC(year, month - 1, day, hour, minute)
  let instant = wanted
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const parts = Object.fromEntries(new Intl.DateTimeFormat('en-CA', {
      timeZone: BOOKING_TIME_ZONE,
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
    }).formatToParts(new Date(instant)).filter(({ type }) => type !== 'literal').map(({ type, value }) => [type, Number(value)]))
    const observed = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute)
    instant += wanted - observed
  }
  return new Date(instant)
}

export function initialMonth(now) {
  const parts = dateParts(now)
  return new Date(Date.UTC(parts.year, parts.month - 1, 1))
}

export function monthKey(month) {
  return `${month.getUTCFullYear()}-${String(month.getUTCMonth() + 1).padStart(2, '0')}`
}

export function shiftMonth(month, amount) {
  return new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth() + amount, 1))
}

export function monthLabel(month) {
  return new Intl.DateTimeFormat('es-MX', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(month).replace(' de ', ' ')
}

export function dateKey(date) {
  const parts = dateParts(date)
  return `${parts.year}-${String(parts.month).padStart(2, '0')}-${String(parts.day).padStart(2, '0')}`
}

export function formatBookingDate(date) {
  return new Intl.DateTimeFormat('es-MX', {
    timeZone: BOOKING_TIME_ZONE,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

export function formatBookingTime(date) {
  return new Intl.DateTimeFormat('es-MX', {
    timeZone: BOOKING_TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date)
}

export function calendarDays(month, slots, now) {
  const year = month.getUTCFullYear()
  const monthNumber = month.getUTCMonth() + 1
  const count = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate()
  const slotDates = new Set(slots.map(({ startsAt }) => dateKey(new Date(startsAt))))
  const today = dateKey(now)
  return Array.from({ length: count }, (_, index) => {
    const day = index + 1
    const key = `${year}-${String(monthNumber).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const noon = zonedDateTime(year, monthNumber, day, 12)
    return { day, key, label: formatBookingDate(noon), available: key >= today && slotDates.has(key) }
  })
}

export function canShiftForward(month, now) {
  const maxDate = new Date(now.getTime() + BOOKING_RANGE_DAYS * DAY_MS)
  const next = shiftMonth(month, 1)
  const maxParts = dateParts(maxDate)
  return next <= new Date(Date.UTC(maxParts.year, maxParts.month - 1, maxParts.day))
}

export function canShiftBackward(month, now) {
  return month > initialMonth(now)
}

export function fallbackSlots(month, now, durationMinutes = 60) {
  const year = month.getUTCFullYear()
  const monthNumber = month.getUTCMonth() + 1
  const count = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate()
  const maxDate = new Date(now.getTime() + BOOKING_RANGE_DAYS * DAY_MS)
  const slots = []
  for (let day = 1; day <= count; day += 1) {
    const weekday = new Date(Date.UTC(year, monthNumber - 1, day)).getUTCDay()
    const windows = weekday === 0 ? [] : weekday === 6 ? [[10 * 60, 15 * 60]] : [[10 * 60, 14 * 60], [15 * 60, 19 * 60]]
    for (const [start, end] of windows) {
      for (let minute = start; minute + durationMinutes <= end; minute += 30) {
        const startsAt = zonedDateTime(year, monthNumber, day, Math.floor(minute / 60), minute % 60)
        if (startsAt <= now || startsAt > maxDate) continue
        slots.push({ startsAt: startsAt.toISOString(), endsAt: new Date(startsAt.getTime() + durationMinutes * 60_000).toISOString() })
      }
    }
  }
  return slots
}
