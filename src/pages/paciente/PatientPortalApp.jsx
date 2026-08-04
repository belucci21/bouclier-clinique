import { Navigate, Route, Routes } from 'react-router-dom'
import PortalLayout from '../../components/portal/PortalLayout.jsx'
import ProtectedRoute from '../../components/portal/ProtectedRoute.jsx'
import { PatientAuthProvider } from '../../contexts/PatientAuthContext.jsx'
import AgendarCita from './AgendarCita.jsx'
import CitasPaciente from './CitasPaciente.jsx'
import CodigoQR from './CodigoQR.jsx'
import Dashboard from './Dashboard.jsx'
import Informes from './Informes.jsx'
import Login from './Login.jsx'
import Perfil from './Perfil.jsx'
import Recetas from './Recetas.jsx'

export default function PatientPortalApp() {
  return (
    <PatientAuthProvider>
      <Routes>
        <Route path="login" element={<Login />} />
        <Route element={<PortalLayout />}>
          <Route index element={<Navigate to="login" replace />} />
          <Route element={<ProtectedRoute />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="citas" element={<CitasPaciente />} />
            <Route path="recetas" element={<Recetas />} />
            <Route path="informes" element={<Informes />} />
            <Route path="perfil" element={<Perfil />} />
            <Route path="qr" element={<CodigoQR />} />
            <Route path="agendar" element={<AgendarCita />} />
          </Route>
        </Route>
      </Routes>
    </PatientAuthProvider>
  )
}
