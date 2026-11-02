import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { authConfirmationError, confirmationStatus, stripAuthReturnSecrets } from '../lib/authConfirmation.js'
import SEO from '../components/SEO.jsx'

export default function AuthConfirmation() {
  const [linkError] = useState(() => authConfirmationError(window.location.search, window.location.hash))
  const [status, setStatus] = useState('checking')
  useEffect(() => {
    let active = true
    const timeout = setTimeout(() => {
      if (active) setStatus('error')
      stripAuthReturnSecrets(window.location, window.history)
    }, 15000)
    // Supabase consumes the email return before getSession resolves. Do not
    // redirect to a user-controlled "next" URL or expose tokens to another app.
    supabase.auth.getSession().then(result => {
      if (active) setStatus(confirmationStatus(result, linkError))
    }).catch(() => { if (active) setStatus('error') }).finally(() => {
      clearTimeout(timeout)
      stripAuthReturnSecrets(window.location, window.history)
    })
    return () => { active = false; clearTimeout(timeout) }
  }, [linkError])
  const confirmed = status === 'confirmed'
  return <main className="editorial-page legal-page">
    <SEO title="Confirmación de correo | Bouclier Pacientes" description="Comprueba tu correo y vuelve de forma segura a Bouclier Pacientes." canonical="https://bouclier-clinique.com/auth/confirmacion" noindex />
    <header className="editorial-page__header editorial-page__header--compact">
      <p className="editorial-kicker">Bouclier Pacientes</p>
      <h1>{status === 'checking' ? 'Verificando correo.' : confirmed ? 'Correo confirmado.' : 'Revisa tu acceso.'}</h1>
      <p role="status">{status === 'checking' ? 'Estamos comprobando el enlace de confirmación.' : confirmed
        ? 'Tu correo está verificado. Vuelve a la app e inicia sesión con tu correo y contraseña, aunque todavía no tengas expediente. Podrás completar tu registro clínico desde la app. Si ya tienes expediente, la clínica debe verificar el vínculo.'
        : status === 'error' ? 'Este enlace no es válido, ya se utilizó o ha caducado. Si ya confirmaste tu correo, inicia sesión en la app. Si no, solicita un nuevo enlace desde la app o contacta con soporte.'
        : 'No hay una confirmación pendiente en esta página. Si ya verificaste tu correo, vuelve a la app e inicia sesión. No necesitas crear otra cuenta.'}</p>
      <p><Link className="btn-primary" to="/paciente/login">Ir al portal de pacientes</Link></p>
      <p><Link to="/descargar">Descargar o volver a la app</Link> · <a href="mailto:marketing@bouclier-clinique.com?subject=Ayuda%20con%20la%20confirmaci%C3%B3n%20de%20correo">Pedir ayuda</a></p>
    </header>
  </main>
}
