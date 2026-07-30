import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { usePatientAuth } from '../../contexts/PatientAuthContext';
import { supabase } from '../../lib/supabase';

export default function CodigoQR() {
  const { user, profile } = usePatientAuth();
  const [qrCode, setQrCode] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchQR();
  }, [user]);

  async function fetchQR() {
    setLoading(true);
    const { data } = await supabase
      .from('appointments')
      .select('qr_code')
      .eq('patient_id', user.id)
      .not('qr_code', 'is', null)
      .order('scheduled_at', { ascending: false })
      .limit(1)
      .single();

    if (data?.qr_code) {
      setQrCode(data.qr_code);
    } else {
      setQrCode(`patient:${user.id}`);
    }
    setLoading(false);
  }

  function downloadQR() {
    const canvas = document.querySelector('.portal-qr__canvas canvas');
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'bouclier-qr.png';
    link.href = canvas.toDataURL();
    link.click();
  }

  if (loading) {
    return (
      <div className="portal-loading">
        <div className="portal-loading__spinner" />
        <p>Cargando código QR...</p>
      </div>
    );
  }

  return (
    <div className="portal-page">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="portal-qr"
      >
        <h1 className="portal-page__title">Mi Código QR</h1>
        <p className="portal-page__subtitle">Presenta este código en recepción para hacer check-in</p>

        <div className="portal-qr__card">
          <div className="portal-qr__header">
            <img src="/assets/img/logo.webp" alt="Bouclier" className="portal-qr__logo" />
            <h2 className="portal-qr__name">{profile?.full_name || 'Paciente'}</h2>
            <p className="portal-qr__id">ID: {user?.id?.slice(0, 8)}...</p>
          </div>

          <div className="portal-qr__canvas">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrCode)}&bgcolor=ffffff&color=1a1a1a`}
              alt="Código QR"
              className="portal-qr__image"
            />
          </div>

          <p className="portal-qr__instruction">
            Escanea este código al llegar a la clínica para registrar tu llegada
          </p>
        </div>
      </motion.div>
    </div>
  );
}
