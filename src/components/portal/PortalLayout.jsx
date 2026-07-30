import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function PortalLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="portal-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="portal-main">
        <header className="portal-topbar">
          <button className="portal-topbar__menu" onClick={() => setSidebarOpen(true)}>
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <img src="/assets/img/logo.webp" alt="Bouclier Clinique" className="portal-topbar__logo" />
        </header>
        <div className="portal-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
