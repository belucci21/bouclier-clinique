import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { usePatientAuth } from '../../contexts/PatientAuthContext';
import { supabase } from '../../lib/supabase';

export default function CitasPaciente() {
  const { user } = usePatientAuth();
  const [appointments, setAppointments] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchAppointments();
  }, [user]);

  async function fetchAppointments() {
    setLoading(true);
    const { data } = await supabase
      .from('appointments')
      .select('*, doctors(*, profiles!doctors_id_fkey(full_name)), appointment_types(name, color)')
      .eq('patient_id', user.id)
      .order('scheduled_at', { ascending: false });
    setAppointments(data || []);
    setLoading(false);
  }

  function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }

  function formatTime(dateStr) {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
  }

  function getStatusLabel(status) {
    const map = {
      scheduled: 'Programada', confirmed: 'Confirmada', in_progress: 'En curso',
      completed: 'Completada', cancelled: 'Cancelada', no_show: 'No asistió',
    };
    return map[status] || status;
  }

  function getStatusClass(status) {
    const map = {
      scheduled: 'portal-status--scheduled', confirmed: 'portal-status--confirmed',
      completed: 'portal-status--completed', cancelled: 'portal-status--cancelled',
    };
    return map[status] || 'portal-status--default';
  }

  const filtered = appointments.filter(a => {
    if (filter === 'all') return true;
    if (filter === 'upcoming') return new Date(a.scheduled_at) >= new Date() && a.status !== 'cancelled';
    if (filter === 'past') return new Date(a.scheduled_at) < new Date() || a.status === 'completed';
    return true;
  });

  if (loading) {
    return (
      <div className="portal-loading">
        <div className="portal-loading__spinner" />
        <p>Cargando citas...</p>
      </div>
    );
  }

  return (
    <div className="portal-page">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="portal-page__title">Mis Citas</h1>
        <p className="portal-page__subtitle">Consulta y gestiona tus citas médicas</p>

        <div className="portal-filters">
          {[
            { key: 'all', label: 'Todas' },
            { key: 'upcoming', label: 'Próximas' },
            { key: 'past', label: 'Pasadas' },
          ].map(f => (
            <button
              key={f.key}
              className={`portal-filter ${filter === f.key ? 'portal-filter--active' : ''}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="portal-empty">
            <p>No hay citas {filter === 'upcoming' ? 'próximas' : filter === 'past' ? 'pasadas' : ''}</p>
            <a href="/citas" className="portal-btn portal-btn--primary">Agendar una cita</a>
          </div>
        ) : (
          <div className="portal-card-list">
            {filtered.map((apt, i) => (
              <motion.div
                key={apt.id}
                className="portal-card"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
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
                    🕐 {formatTime(apt.scheduled_at)} · {apt.duration_minutes || 30} min
                  </p>
                  <p className="portal-card__detail">
                    👨‍⚕️ {apt.doctors?.profiles?.full_name || 'Doctor'}
                  </p>
                  <p className="portal-card__detail">📍 {apt.location || 'Torre EXERTIA'}</p>
                  {apt.chief_complaint && (
                    <p className="portal-card__detail">💬 {apt.chief_complaint}</p>
                  )}
                </div>
                <div className="portal-card__right">
                  <span className={`portal-status ${getStatusClass(apt.status)}`}>
                    {getStatusLabel(apt.status)}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
