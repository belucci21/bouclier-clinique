import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { usePatientAuth } from '../../contexts/usePatientAuth.js';
import { supabase } from '../../lib/supabase';
import { loadClinicalQrIdentity } from '../../lib/clinicalQr.js';

export default function CodigoQR() {
  const { user } = usePatientAuth();
  const [identity, setIdentity] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    setIdentity(null); setError(''); setLoading(true);
    const load = async () => {
      if (!user) throw new Error('Vuelve a iniciar sesión.');
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user.id !== user.id) throw new Error('Vuelve a iniciar sesión.');
      const result = await loadClinicalQrIdentity({ accessToken: session.access_token, userId: user.id,
        signal: AbortSignal.any([controller.signal, AbortSignal.timeout(15000)]) });
      if (active) setIdentity(result);
    };
    load().catch(cause => { if (active) setError(cause.message || 'No se pudo consultar la identificación.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; controller.abort(); };
  }, [user, revision]);
  return <section className="portal-page portal-qr">
    <h1 className="portal-page__title">Mi identificación Bouclier</h1>
    <p className="portal-page__subtitle">Muéstrala al personal de recepción. No registra una llegada automáticamente ni abre las puertas de EXERTIA.</p>
    <div className="portal-qr__card">
      <img src="/assets/img/logo.webp" alt="Bouclier" className="portal-qr__logo" />
      {loading ? <p role="status">Verificando tu identificación clínica…</p> : null}
      {error ? <p role="alert">{error}</p> : null}
      {identity ? <>
        <h2 className="portal-qr__name">{identity.fullName || 'Paciente'}</h2>
        <QRCodeSVG value={identity.payload} size={250} bgColor="#ffffff" fgColor="#111111" marginSize={4}
          role="img" title="Identificación clínica Bouclier, no es un pase del edificio" style={{ maxWidth: '100%', height: 'auto' }} />
      </> : null}
      <button type="button" className="portal-btn" disabled={loading} onClick={() => setRevision(value => value + 1)}>Actualizar identificación</button>
    </div>
    <p>El pase real de EXERTIA se consulta de forma privada dentro de la aplicación de pacientes.</p>
    <Link to="/descargar">Descargar Bouclier Pacientes</Link>
  </section>;
}
