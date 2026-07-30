import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import SEO from '../../components/SEO';
import { usePatientAuth } from '../../contexts/PatientAuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = usePatientAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!email.trim()) throw new Error('Ingresa tu correo electrónico');
      if (!password) throw new Error('Ingresa tu contraseña');

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) throw new Error('Correo electrónico inválido');

      await signIn(email.trim().toLowerCase(), password);
      navigate('/paciente/dashboard');
    } catch (err) {
      if (err.message.includes('Invalid login')) {
        setError('Correo o contraseña incorrectos');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <SEO
        title="Mi Portal | Bouclier Clinique"
        description="Accede a tu portal de paciente Bouclier Clinique. Consulta tus citas, recetas e informes."
        canonical="https://bouclier-clinique.com/paciente/login"
      />

      <div className="portal-login">
        <div className="portal-login__left">
          <div className="portal-login__brand">
            <img src="/assets/img/logo-white.webp" alt="Bouclier" className="portal-login__logo" />
          </div>
          <div className="portal-login__welcome">
            <h1 className="portal-login__title">Bienvenido a tu Portal</h1>
            <p className="portal-login__subtitle">
              Consulta tus citas, recetas, informes y mantén tu información médica al alcance de un clic.
            </p>
            <div className="portal-login__features">
              <div className="portal-login__feature">
                <span className="portal-login__feature-icon">📅</span>
                <span>Agenda de citas</span>
              </div>
              <div className="portal-login__feature">
                <span className="portal-login__feature-icon">📋</span>
                <span>Recetas médicas</span>
              </div>
              <div className="portal-login__feature">
                <span className="portal-login__feature-icon">📊</span>
                <span>Informes clínicos</span>
              </div>
              <div className="portal-login__feature">
                <span className="portal-login__feature-icon">📱</span>
                <span>Check-in por QR</span>
              </div>
            </div>
          </div>
        </div>

        <div className="portal-login__right">
          <motion.form
            className="portal-login__form"
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="portal-login__form-title">Iniciar Sesión</h2>
            <p className="portal-login__form-subtitle">Ingresa tus credenciales para acceder</p>

            {error && (
              <div className="portal-login__error">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            <div className="portal-login__field">
              <label className="portal-login__label">Correo electrónico</label>
              <input
                type="email"
                className="portal-login__input"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tu@email.com"
                autoComplete="email"
              />
            </div>

            <div className="portal-login__field">
              <label className="portal-login__label">Contraseña</label>
              <input
                type="password"
                className="portal-login__input"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              className="portal-login__btn"
              disabled={loading}
            >
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>

            <p className="portal-login__help">
              ¿No tienes cuenta? Contacta a la clínica para registrarte.
            </p>

            <a href="/" className="portal-login__back">
              ← Volver al sitio web
            </a>
          </motion.form>
        </div>
      </div>
    </>
  );
}
