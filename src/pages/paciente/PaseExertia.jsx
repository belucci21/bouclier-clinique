import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { usePatientAuth } from '../../contexts/usePatientAuth.js'
import { supabase } from '../../lib/supabase.js'
import { loadPatientBuildingPasses, visibleBuildingPass } from '../../lib/patientBuildingPasses.js'
import './PaseExertia.css'

const time = value => new Intl.DateTimeFormat('es-MX', { timeZone: 'America/Mexico_City', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(value))
export default function PaseExertia() {
  const { user } = usePatientAuth()
  const userId = user?.id
  const [passes, setPasses] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [revision, setRevision] = useState(0)
  useEffect(() => {
    let active = true, controller, pending = false
    setPasses(null); setError(''); setLoading(true)
    const load = async () => {
      if (pending || document.visibilityState === 'hidden') return
      pending = true; controller = new AbortController()
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!userId || session?.user.id !== userId) throw new Error('Vuelve a iniciar sesión.')
        const result = await loadPatientBuildingPasses({ userId, accessToken: session.access_token,
          signal: AbortSignal.any([controller.signal, AbortSignal.timeout(15000)]) })
        if (active && !controller.signal.aborted && document.visibilityState !== 'hidden') { setPasses(result); setError('') }
      } catch (cause) {
        if (active && !controller.signal.aborted) { setPasses(null); setError(cause.message || 'No se pudo comprobar tu pase.') }
      } finally { pending = false; if (active) setLoading(false) }
    }
    const visibility = () => {
      setPasses(null)
      if (document.visibilityState === 'hidden') controller?.abort()
      else setRevision(value => value + 1)
    }
    load()
    const timer = setInterval(load, 30000)
    document.addEventListener('visibilitychange', visibility)
    return () => { active = false; controller?.abort(); clearInterval(timer); document.removeEventListener('visibilitychange', visibility) }
  }, [userId, revision])
  // Remove expired credentials even between the 30-second source refreshes.
  useEffect(() => {
    const expiry = Math.min(...(passes || []).map(value => Date.parse(value.pass?.validTo)).filter(value => value > Date.now()))
    if (!Number.isFinite(expiry)) return
    const timer = setTimeout(() => setRevision(value => value + 1), Math.max(0, expiry - Date.now()))
    return () => clearTimeout(timer)
  }, [passes])
  return <section className="portal-page portal-access">
    <h1 className="portal-page__title">Tu acceso a EXERTIA</h1>
    <p className="portal-page__subtitle">Pase privado de entrada al edificio. Es distinto de tu identificación clínica Bouclier.</p>
    <div className="portal-access__notice">Los avisos se programan el día de la cita a las 09:00 de la mañana; para citas anteriores, a las 08:00. Hora de Veracruz. Recepción debe haber adjuntado el pase real de Hik-Connect.</div>
    {loading ? <p role="status">Comprobando tus accesos de hoy…</p> : null}
    {error ? <p role="alert" className="portal-access__error">{error}</p> : null}
    {passes?.length === 0 ? <p>No hay citas vigentes vinculadas a tu cuenta para hoy. Si esperabas una cita, contacta con recepción.</p> : null}
    {passes?.map(value => <article key={value.appointment.id} className="portal-access__card">
      <h2>Cita de hoy · {time(value.appointment.scheduledAt)}</h2>
      <p>{value.pass?.message || 'Recepción todavía no ha adjuntado el pase.'}</p>
      {value.pass?.validFrom && value.pass?.validTo ? <p>Acceso permitido de {time(value.pass.validFrom)} a {time(value.pass.validTo)} · Veracruz</p> : null}
      {visibleBuildingPass(value) ? <img src={value.imageDataUrl} alt="QR real de acceso temporal a EXERTIA" className="portal-access__qr" /> : null}
      {value.pass?.doors?.length ? <p>{value.pass.doors.join(' · ')}</p> : null}
    </article>)}
    <div className="portal-access__actions">
      <button type="button" className="portal-btn" disabled={loading} onClick={() => setRevision(value => value + 1)}>Actualizar pase</button>
      <a href="mailto:marketing@bouclier-clinique.com">Contactar con Bouclier</a>
      <Link to="/descargar">Abrir la página de la app</Link>
    </div>
    <p>No compartas tu pase. Si cambia la cita, consulta siempre el acceso actualizado; una copia anterior puede haber sido retirada.</p>
  </section>
}
