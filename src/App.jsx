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
import CheckIn from './pages/CheckIn';
import Layout from './components/Layout';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-bouclier-darker flex items-center justify-center">
        <div className="animate-pulse-gold text-bouclier-gold text-xl font-heading">
          Cargando...
        </div>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" />;
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
        <Route path="pacientes" element={<Patients />} />
        <Route path="doctores" element={<Doctors />} />
        <Route path="diagnosticos" element={<Diagnoses />} />
        <Route path="recetas" element={<Prescriptions />} />
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
