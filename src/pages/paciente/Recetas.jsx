import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { usePatientAuth } from '../../contexts/usePatientAuth.js';
import { supabase } from '../../lib/supabase';

export default function Recetas() {
  const { user } = usePatientAuth();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    async function fetchPrescriptions() {
      setLoading(true);
      const { data } = await supabase
        .from('prescriptions')
        .select('*, doctors(*, profiles!doctors_id_fkey(full_name))')
        .eq('patient_id', user.id)
        .order('created_at', { ascending: false });
      setPrescriptions(data || []);
      setLoading(false);
    }
    fetchPrescriptions();
  }, [user]);

  function formatDate(dateStr) {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('es-MX', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
  }

  if (loading) {
    return (
      <div className="portal-loading">
        <div className="portal-loading__spinner" />
        <p>Cargando recetas...</p>
      </div>
    );
  }

  return (
    <div className="portal-page">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="portal-page__title">Mis Recetas</h1>
        <p className="portal-page__subtitle">Recetas médicas prescritas por tu doctor</p>

        {prescriptions.length === 0 ? (
          <div className="portal-empty">
            <div className="portal-empty__icon">📋</div>
            <p>No tienes recetas registradas</p>
            <p className="portal-empty__hint">Tus recetas aparecerán aquí una vez que tu doctor las agregue.</p>
          </div>
        ) : (
          <div className="portal-card-list">
            {prescriptions.map((p, i) => (
              <motion.div
                key={p.id}
                className="portal-card portal-card--prescription"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="portal-card__content">
                  <div className="portal-card__header">
                    <h3 className="portal-card__title">{p.diagnosis || 'Receta médica'}</h3>
                    <span className="portal-card__date">{formatDate(p.created_at)}</span>
                  </div>
                  {p.medications && (
                    <p className="portal-card__detail">{p.medications}</p>
                  )}
                  {p.notes && (
                    <p className="portal-card__detail portal-card__detail--muted">{p.notes}</p>
                  )}
                  <p className="portal-card__detail">
                    👨‍⚕️ Dr. {p.doctors?.profiles?.full_name || '—'}
                  </p>
                </div>
                {p.file_url && (
                  <a
                    href={p.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="portal-card__download"
                  >
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Descargar PDF
                  </a>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
