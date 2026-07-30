import { Navigate, Outlet } from 'react-router-dom';
import { usePatientAuth } from '../../contexts/PatientAuthContext';

export default function ProtectedRoute() {
  const { user, loading } = usePatientAuth();

  if (loading) {
    return (
      <div className="portal-loading">
        <div className="portal-loading__spinner" />
        <p>Cargando...</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/paciente/login" replace />;

  return <Outlet />;
}
