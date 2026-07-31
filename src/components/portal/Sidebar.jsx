import { NavLink } from 'react-router-dom';
import { usePatientAuth } from '../../contexts/PatientAuthContext';

const links = [
  { to: '/paciente/dashboard', label: 'Inicio', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { to: '/paciente/citas', label: 'Mis Citas', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { to: '/paciente/agendar', label: 'Agendar Cita', icon: 'M12 6v6m0 0v6m0-6h6m-6 0H6' },
  { to: '/paciente/recetas', label: 'Recetas', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  { to: '/paciente/informes', label: 'Informes', icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  { to: '/paciente/qr', label: 'Mi QR', icon: 'M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z' },
  { to: '/paciente/perfil', label: 'Mi Perfil', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
];

export default function Sidebar({ isOpen, onClose }) {
  const { user, profile, signOut } = usePatientAuth();

  return (
    <>
      {isOpen && <div className="portal-sidebar__overlay" onClick={onClose} />}
      <aside className={`portal-sidebar ${isOpen ? 'portal-sidebar--open' : ''}`}>
        <div className="portal-sidebar__header">
          <div className="portal-sidebar__brand">
            <img src="/assets/img/logo-white.webp" alt="Bouclier" className="portal-sidebar__logo" />
            <span className="portal-sidebar__title">Mi Portal</span>
          </div>
          <button className="portal-sidebar__close" onClick={onClose}>✕</button>
        </div>

        {profile && (
          <div className="portal-sidebar__user">
            <div className="portal-sidebar__avatar">
              {profile.full_name?.charAt(0) || 'P'}
            </div>
            <div className="portal-sidebar__user-info">
              <span className="portal-sidebar__user-name">{profile.full_name || 'Paciente'}</span>
              <span className="portal-sidebar__user-email">{user?.email}</span>
            </div>
          </div>
        )}

        <nav className="portal-sidebar__nav">
          {links.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `portal-sidebar__link ${isActive ? 'portal-sidebar__link--active' : ''}`}
              onClick={onClose}
            >
              <svg className="portal-sidebar__icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d={link.icon} />
              </svg>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="portal-sidebar__footer">
          <button className="portal-sidebar__logout" onClick={signOut}>
            <svg className="portal-sidebar__icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Cerrar Sesión
          </button>
          <a href="/" className="portal-sidebar__back">
            ← Volver al sitio
          </a>
        </div>
      </aside>
    </>
  );
}
