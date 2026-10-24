import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { usePatientAuth } from '../../contexts/usePatientAuth.js';

export default function ProtectedRoute() {
  const { user, loading } = usePatientAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="portal-loading">
        <div className="portal-loading__spinner" />
        <p>Cargando...</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/paciente/login" replace state={{ returnTo: location.pathname === '/paciente/acceso' ? '/paciente/acceso' : '/paciente/dashboard' }} />;

  return <Outlet />;
}
