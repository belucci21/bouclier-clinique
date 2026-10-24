const api = 'https://api.bouclier-clinique.com'
const day = now => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Mexico_City', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now)

export async function loadPatientBuildingPasses({ accessToken, userId, fetchImpl = fetch, signal, now = new Date() }) {
  if (!accessToken || !userId) throw new Error('Vuelve a iniciar sesión.')
  async function get(path) {
    const response = await fetchImpl(`${api}${path}`, { headers: { Accept: 'application/json', Authorization: `Bearer ${accessToken}` }, cache: 'no-store', signal })
    if (!response.headers.get('content-type')?.includes('application/json')) throw new Error('El servicio de acceso no está disponible. Inténtalo de nuevo.')
    const result = await response.json()
    if (!response.ok) throw new Error(response.status === 401 ? 'Vuelve a iniciar sesión.' : 'No se pudo verificar el pase. Contacta con recepción si el problema continúa.')
    return result
  }
  const { profile } = await get('/api/clinical/me')
  if (profile?.authUserId !== userId || profile.role !== 'patient' || !profile.linked || !/^[1-9]\d*$/.test(profile.clinicalId || '')) {
    throw new Error('La clínica debe verificar el vínculo de tu cuenta con tu expediente.')
  }
  const from = day(now), to = new Date(Date.parse(`${from}T12:00:00Z`) + 86400000).toISOString().slice(0, 10)
  const appointments = [], cursors = new Set()
  let cursor = null, complete = false
  for (let page = 0; page < 100; page++) {
    const params = new URLSearchParams({ from, to, pageSize: '100', ...(cursor ? { cursor } : {}) })
    const result = await get(`/api/clinical/appointments?${params}`)
    if (!Array.isArray(result.appointments)) throw new Error('No se pudo comprobar la agenda de hoy.')
    for (const appointment of result.appointments) {
      if (String(appointment.patientId) !== String(profile.clinicalId) || !/^[1-9]\d*$/.test(String(appointment.id))) throw new Error('No se pudo verificar la pertenencia de la cita.')
      if (['scheduled','confirmed','checked_in','in_progress'].includes(appointment.status)) appointments.push(appointment)
    }
    cursor = result.pagination?.nextCursor
    if (!cursor) { complete = true; break }
    if (cursors.has(cursor)) throw new Error('No se pudo completar la agenda. Actualízala de nuevo.')
    cursors.add(cursor)
  }
  if (!complete) throw new Error('No se pudo completar la agenda. Contacta con recepción.')
  const passes = []
  for (let index = 0; index < appointments.length; index += 5) {
    const batch = await Promise.all(appointments.slice(index, index + 5).map(async appointment => ({
      appointment, ...await get(`/api/clinical/appointments/${encodeURIComponent(appointment.id)}/building-pass`),
    })))
    passes.push(...batch)
  }
  return passes
}

export function visibleBuildingPass(value, now = Date.now()) {
  return value?.pass?.state === 'active' && Date.parse(value.pass.availableAt || value.pass.validFrom) <= now
    && Date.parse(value.pass.validTo) > now && /^data:image\/(?:png|jpeg);base64,/.test(value.imageDataUrl || '')
}
