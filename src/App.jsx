import { lazy, Suspense, useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Footer from './components/Footer.jsx'
import Header from './components/Header.jsx'
import WhatsAppFloat from './components/WhatsAppFloat.jsx'
import Home from './pages/Home.jsx'

const MetodoBouclier = lazy(() => import('./pages/MetodoBouclier.jsx'))
const Descargar = lazy(() => import('./pages/Descargar.jsx'))
const Tratamientos = lazy(() => import('./pages/Tratamientos.jsx'))
const TratamientoDetalle = lazy(() => import('./pages/TratamientoDetalle.jsx'))
const QuienesSomos = lazy(() => import('./pages/QuienesSomos.jsx'))
const DraGissel = lazy(() => import('./pages/DraGissel.jsx'))
const Contacto = lazy(() => import('./pages/Contacto.jsx'))
const PreguntasFrecuentes = lazy(() => import('./pages/PreguntasFrecuentes.jsx'))
const Legal = lazy(() => import('./pages/Legal.jsx'))
const Citas = lazy(() => import('./pages/Citas.jsx'))
const PatientPortalApp = lazy(() => import('./pages/paciente/PatientPortalApp.jsx'))

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

function LazyPage({ children }) {
  return <Suspense fallback={<main className="route-loading" aria-label="Cargando contenido" />}>{children}</Suspense>
}

export default function App() {
  const location = useLocation()
  const isPortal = location.pathname.startsWith('/paciente')

  return (
    <div className="app">
      {!isPortal && <Header />}
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/quienes-somos" element={<LazyPage><QuienesSomos /></LazyPage>} />
        <Route path="/metodo-bouclier" element={<LazyPage><MetodoBouclier /></LazyPage>} />
        <Route path="/manchas" element={<Navigate to="/tratamientos/manchas-y-melasma" replace />} />
        <Route path="/blefaroplastia" element={<Navigate to="/tratamientos/blefaroplastia-no-quirurgica" replace />} />
        <Route path="/citas" element={<LazyPage><Citas /></LazyPage>} />
        <Route path="/reservar" element={<Navigate to="/citas" replace />} />
        <Route path="/descargar" element={<LazyPage><Descargar /></LazyPage>} />
        <Route path="/tratamientos" element={<LazyPage><Tratamientos /></LazyPage>} />
        <Route path="/tratamientos/:slug" element={<LazyPage><TratamientoDetalle /></LazyPage>} />
        <Route path="/dra-gissel" element={<LazyPage><DraGissel /></LazyPage>} />
        <Route path="/contacto" element={<LazyPage><Contacto /></LazyPage>} />
        <Route path="/preguntas-frecuentes" element={<LazyPage><PreguntasFrecuentes /></LazyPage>} />
        <Route path="/aviso-de-privacidad" element={<LazyPage><Legal /></LazyPage>} />
        <Route path="/paciente/*" element={<LazyPage><PatientPortalApp /></LazyPage>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {!isPortal && <Footer />}
      {!isPortal && <WhatsAppFloat />}
    </div>
  )
}
