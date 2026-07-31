import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { usePatientAuth } from '../../contexts/PatientAuthContext';
import { supabase } from '../../lib/supabase';

export default function Dashboard() {
  const { user, profile } = usePatientAuth();
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchData();
  }, [user]);

  async function fetchData() {
    setLoading(true);

    const [apptRes, prescRes, reportRes] = await Promise.all([
      supabase
        .from('appointments')
        .select('*, doctors(*, profiles!doctors_id_fkey(full_name)), appointment_types(name, color)')
        .eq('patient_id', user.id)
        .gte('scheduled_at', new Date().toISOString())
        .order('scheduled_at', { ascending: true })
        .limit(5),
      supabase
        .from('prescriptions')
        .select('*')
        .eq('patient_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3),
      supabase
        .from('reports')
        .select('*')
        .eq('patient_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3),
    ]);

    setAppointments(apptRes.data || []);
    setPrescriptions(prescRes.data || []);
    setReports(reportRes.data || []);
    setLoading(false);
  }

  function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }

  function formatTime(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
  }

  function getStatusLabel(status) {
    const map = {
      scheduled: 'Programada',
      confirmed: 'Confirmada',
      in_progress: 'En curso',
      completed: 'Completada',
      cancelled: 'Cancelada',
      no_show: 'No asistió',
    };
    return map[status] || status;
  }

  function getStatusClass(status) {
    const map = {
      scheduled: 'portal-status--scheduled',
      confirmed: 'portal-status--confirmed',
      completed: 'portal-status--completed',
      cancelled: 'portal-status--cancelled',
    };
    return map[status] || 'portal-status--default';
  }

  if (loading) {
    return (
      <div className="portal-loading">
        <div className="portal-loading__spinner" />
        <p>Cargando tu información...</p>
      </div>
    );
  }

  return (
    <div className="portal-dashboard">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="portal-welcome">
          <h1 className="portal-welcome__title">
            Hola, {profile?.full_name || 'Paciente'} 👋
          </h1>
          <p className="portal-welcome__subtitle">
            Bienvenido a tu portal personal de Bouclier Clinique
          </p>
        </div>

        <div className="portal-stats">
          <div className="portal-stat">
            <span className="portal-stat__number">{appointments.length}</span>
            <span className="portal-stat__label">Próximas citas</span>
          </div>
          <div className="portal-stat">
            <span className="portal-stat__number">{prescriptions.length}</span>
            <span className="portal-stat__label">Recetas recientes</span>
          </div>
          <div className="portal-stat">
            <span className="portal-stat__number">{reports.length}</span>
            <span className="portal-stat__label">Informes</span>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="portal-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="portal-section__header">
          <h2 className="portal-section__title">Próximas Citas</h2>
          <Link to="/paciente/citas" className="portal-section__link">Ver todas →</Link>
        </div>

        {appointments.length === 0 ? (
          <div className="portal-empty">
            <p>No tienes citas programadas</p>
            <a href="/paciente/agendar" className="portal-btn portal-btn--primary">Agendar una cita</a>
          </div>
        ) : (
          <div className="portal-card-list">
            {appointments.map((apt, i) => (
              <motion.div
                key={apt.id}
                className="portal-card"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="portal-card__left">
                  <div className="portal-card__date-badge">
                    <span className="portal-card__day">{new Date(apt.scheduled_at).getDate()}</span>
                    <span className="portal-card__month">
                      {new Date(apt.scheduled_at).toLocaleDateString('es-MX', { month: 'short' })}
                    </span>
                  </div>
                </div>
                <div className="portal-card__content">
                  <h3 className="portal-card__title">
                    {apt.appointment_types?.name || 'Cita'}
                  </h3>
                  <p className="portal-card__detail">
                    {formatTime(apt.scheduled_at)} · {apt.doctors?.profiles?.full_name || 'Doctor'}
                  </p>
                  <p className="portal-card__detail">{apt.location || 'Torre EXERTIA'}</p>
                </div>
                <span className={`portal-status ${getStatusClass(apt.status)}`}>
                  {getStatusLabel(apt.status)}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      <div className="portal-grid-2">
        <motion.div
          className="portal-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="portal-section__header">
            <h2 className="portal-section__title">Recetas Recientes</h2>
            <Link to="/paciente/recetas" className="portal-section__link">Ver todas →</Link>
          </div>

          {prescriptions.length === 0 ? (
            <div className="portal-empty"><p>No tienes recetas registradas</p></div>
          ) : (
            <div className="portal-card-list portal-card-list--compact">
              {prescriptions.map(p => (
                <div key={p.id} className="portal-card portal-card--small">
                  <div className="portal-card__content">
                    <h3 className="portal-card__title">{p.diagnosis || 'Receta'}</h3>
                    <p className="portal-card__detail">{formatDate(p.created_at)}</p>
                  </div>
                  {p.file_url && (
                    <a href={p.file_url} target="_blank" rel="noopener" className="portal-card__action">
                      Ver PDF
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div
          className="portal-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="portal-section__header">
            <h2 className="portal-section__title">Informes Recientes</h2>
            <Link to="/paciente/informes" className="portal-section__link">Ver todos →</Link>
          </div>

          {reports.length === 0 ? (
            <div className="portal-empty"><p>No tienes informes registrados</p></div>
          ) : (
            <div className="portal-card-list portal-card-list--compact">
              {reports.map(r => (
                <div key={r.id} className="portal-card portal-card--small">
                  <div className="portal-card__content">
                    <h3 className="portal-card__title">{r.title || 'Informe'}</h3>
                    <p className="portal-card__detail">{formatDate(r.created_at)}</p>
                  </div>
                  {r.file_url && (
                    <a href={r.file_url} target="_blank" rel="noopener" className="portal-card__action">
                      Ver PDF
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
