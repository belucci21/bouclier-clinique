import { Routes, Route } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import WhatsAppFloat from './components/WhatsAppFloat.jsx'
import Home from './pages/Home.jsx'
import QuienesSomos from './pages/QuienesSomos.jsx'
import MetodoBouclier from './pages/MetodoBouclier.jsx'
import Manchas from './pages/Manchas.jsx'
import Blefaroplastia from './pages/Blefaroplastia.jsx'
import Citas from './pages/Citas.jsx'
import Reservar from './pages/Reservar.jsx'
import Descargar from './pages/Descargar.jsx'
import { useEffect } from 'react'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function App() {
  const location = useLocation()

  return (
    <div className="app">
      <Header />
      <ScrollToTop />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/quienes-somos" element={<QuienesSomos />} />
          <Route path="/metodo-bouclier" element={<MetodoBouclier />} />
          <Route path="/manchas" element={<Manchas />} />
          <Route path="/blefaroplastia" element={<Blefaroplastia />} />
          <Route path="/citas" element={<Citas />} />
          <Route path="/reservar" element={<Reservar />} />
          <Route path="/descargar" element={<Descargar />} />
        </Routes>
      </AnimatePresence>
      <Footer />
      <WhatsAppFloat />
    </div>
  )
}

export default App
