import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import WhatsAppFloat from './components/WhatsAppFloat.jsx'
import { PatientAuthProvider } from './contexts/PatientAuthContext.jsx'
import PortalLayout from './components/portal/PortalLayout.jsx'
import ProtectedRoute from './components/portal/ProtectedRoute.jsx'
import Home from './pages/Home.jsx'
import MetodoBouclier from './pages/MetodoBouclier.jsx'
import Manchas from './pages/Manchas.jsx'
import Blefaroplastia from './pages/Blefaroplastia.jsx'
import Reservar from './pages/Reservar.jsx'
import Descargar from './pages/Descargar.jsx'
import Login from './pages/paciente/Login.jsx'
import Dashboard from './pages/paciente/Dashboard.jsx'
import CitasPaciente from './pages/paciente/CitasPaciente.jsx'
import Recetas from './pages/paciente/Recetas.jsx'
import Informes from './pages/paciente/Informes.jsx'
import Perfil from './pages/paciente/Perfil.jsx'
import CodigoQR from './pages/paciente/CodigoQR.jsx'

const Tratamientos = lazy(() => import('./pages/Tratamientos.jsx'))
const TratamientoDetalle = lazy(() => import('./pages/TratamientoDetalle.jsx'))
const QuienesSomos = lazy(() => import('./pages/QuienesSomos.jsx'))
const DraGissel = lazy(() => import('./pages/DraGissel.jsx'))
const Contacto = lazy(() => import('./pages/Contacto.jsx'))
const PreguntasFrecuentes = lazy(() => import('./pages/PreguntasFrecuentes.jsx'))
const Legal = lazy(() => import('./pages/Legal.jsx'))
const Citas = lazy(() => import('./pages/Citas.jsx'))
const AgendarCita = lazy(() => import('./pages/paciente/AgendarCita.jsx'))

function LazyPage({ children }) {
  return <Suspense fallback={<main className="route-loading" aria-label="Cargando contenido" />}>{children}</Suspense>
}

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function MarketingLayout() {
  return (
    <>
      <Header />
      <ScrollToTop />
    </>
  )
}

function App() {
  const location = useLocation()
  const isPortal = location.pathname.startsWith('/paciente')

  return (
    <div className="app">
      {!isPortal && <MarketingLayout />}
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/quienes-somos" element={<LazyPage><QuienesSomos /></LazyPage>} />
          <Route path="/metodo-bouclier" element={<MetodoBouclier />} />
          <Route path="/manchas" element={<Manchas />} />
          <Route path="/blefaroplastia" element={<Blefaroplastia />} />
          <Route path="/citas" element={<LazyPage><Citas /></LazyPage>} />
          <Route path="/reservar" element={<Reservar />} />
          <Route path="/descargar" element={<Descargar />} />
          <Route path="/tratamientos" element={<LazyPage><Tratamientos /></LazyPage>} />
          <Route path="/tratamientos/:slug" element={<LazyPage><TratamientoDetalle /></LazyPage>} />
          <Route path="/dra-gissel" element={<LazyPage><DraGissel /></LazyPage>} />
          <Route path="/contacto" element={<LazyPage><Contacto /></LazyPage>} />
          <Route path="/preguntas-frecuentes" element={<LazyPage><PreguntasFrecuentes /></LazyPage>} />
          <Route path="/aviso-de-privacidad" element={<LazyPage><Legal /></LazyPage>} />

          <Route path="/paciente/login" element={
            <PatientAuthProvider>
              <Login />
            </PatientAuthProvider>
          } />
          <Route path="/paciente" element={
            <PatientAuthProvider>
              <PortalLayout />
            </PatientAuthProvider>
          }>
            <Route index element={<Navigate to="login" replace />} />
            <Route element={<ProtectedRoute />}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="citas" element={<CitasPaciente />} />
              <Route path="recetas" element={<Recetas />} />
              <Route path="informes" element={<Informes />} />
              <Route path="perfil" element={<Perfil />} />
              <Route path="qr" element={<CodigoQR />} />
              <Route path="agendar" element={<LazyPage><AgendarCita /></LazyPage>} />
            </Route>
          </Route>
        </Routes>
      </AnimatePresence>
      {!isPortal && <Footer />}
      {!isPortal && <WhatsAppFloat />}
    </div>
  )
}

export default App
