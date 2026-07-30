import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Shield, Mail, Lock, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error: authError } = await signIn(email, password);

    if (authError) {
      setError('Credenciales incorrectas. Verifica tu email y contraseña.');
      toast.error('Error al iniciar sesión');
    } else {
      toast.success('¡Bienvenido!');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-bouclier-darker flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Shield className="w-16 h-16 text-bouclier-gold mx-auto mb-4" />
          <h1 className="text-3xl font-heading text-white mb-2">Bouclier Clinique</h1>
          <p className="text-gray-400">Sistema de Gestión de Citas</p>
        </div>

        {/* Login Form */}
        <div className="bg-bouclier-gray border border-[#333] rounded-2xl p-8">
          <h2 className="text-xl font-heading text-white mb-6 text-center">Iniciar Sesión</h2>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-gray-400 text-sm mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-dark pl-11"
                  placeholder="tu@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-2">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-dark pl-11"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-gold py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Iniciando sesión...
                </span>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-gray-500 text-sm mt-6">
          ¿Necesitas acceso? Contacta al administrador
        </p>
      </div>
    </div>
  );
}
