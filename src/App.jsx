import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Appointments from './pages/Appointments';
import Patients from './pages/Patients';
import Doctors from './pages/Doctors';
import Diagnoses from './pages/Diagnoses';
import Prescriptions from './pages/Prescriptions';
import Reports from './pages/Reports';
import CheckIn from './pages/CheckIn';
import Layout from './components/Layout';

function ProtectedRoute({ children, roles }) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-bouclier-darker flex items-center justify-center">
        <div className="animate-pulse-gold text-bouclier-gold text-xl font-heading">
          Cargando...
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(profile?.role)) return <Navigate to="/" />;

  return children;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/" /> : <Login />}
      />
      <Route path="/checkin/:qrCode" element={<CheckIn />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="citas" element={<Appointments />} />
        <Route path="pacientes" element={<ProtectedRoute roles={['admin', 'doctor', 'reception']}><Patients /></ProtectedRoute>} />
        <Route path="doctores" element={<ProtectedRoute roles={['admin']}><Doctors /></ProtectedRoute>} />
        <Route path="diagnosticos" element={<ProtectedRoute roles={['admin', 'doctor']}><Diagnoses /></ProtectedRoute>} />
        <Route path="recetas" element={<ProtectedRoute roles={['admin', 'doctor']}><Prescriptions /></ProtectedRoute>} />
        <Route path="informes" element={<ProtectedRoute roles={['admin', 'doctor']}><Reports /></ProtectedRoute>} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1a1a1a',
              color: '#fff',
              border: '1px solid #333',
            },
            success: {
              iconTheme: { primary: '#b89a5a', secondary: '#fff' },
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}
