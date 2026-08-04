import { useState } from 'react';
import { motion } from 'framer-motion';
import { usePatientAuth } from '../../contexts/usePatientAuth.js';

export default function Perfil() {
  const { user, profile, updateProfile } = usePatientAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    date_of_birth: profile?.date_of_birth || '',
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    try {
      await updateProfile(form);
      setMsg('Perfil actualizado correctamente');
      setEditing(false);
    } catch {
      setMsg('Error al actualizar el perfil');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="portal-page">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="portal-page__title">Mi Perfil</h1>
        <p className="portal-page__subtitle">Gestiona tu información personal</p>

        <div className="portal-profile">
          <div className="portal-profile__avatar">
            {profile?.full_name?.charAt(0) || 'P'}
          </div>

          {msg && (
            <div className={`portal-msg ${msg.includes('Error') ? 'portal-msg--error' : 'portal-msg--success'}`}>
              {msg}
            </div>
          )}

          {!editing ? (
            <div className="portal-profile__info">
              <div className="portal-profile__field">
                <span className="portal-profile__label">Nombre completo</span>
                <span className="portal-profile__value">{profile?.full_name || '—'}</span>
              </div>
              <div className="portal-profile__field">
                <span className="portal-profile__label">Correo electrónico</span>
                <span className="portal-profile__value">{user?.email}</span>
              </div>
              <div className="portal-profile__field">
                <span className="portal-profile__label">Teléfono</span>
                <span className="portal-profile__value">{profile?.phone || '—'}</span>
              </div>
              <div className="portal-profile__field">
                <span className="portal-profile__label">Fecha de nacimiento</span>
                <span className="portal-profile__value">
                  {profile?.date_of_birth
                    ? new Date(profile.date_of_birth).toLocaleDateString('es-MX')
                    : '—'}
                </span>
              </div>
              <button className="portal-btn portal-btn--primary" onClick={() => setEditing(true)}>
                Editar perfil
              </button>
            </div>
          ) : (
            <form className="portal-profile__form" onSubmit={handleSave}>
              <div className="portal-form__group">
                <label className="portal-form__label">Nombre completo</label>
                <input
                  className="portal-form__input"
                  value={form.full_name}
                  onChange={e => setForm({ ...form, full_name: e.target.value })}
                  required
                />
              </div>
              <div className="portal-form__group">
                <label className="portal-form__label">Teléfono</label>
                <input
                  className="portal-form__input"
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  placeholder="229 123 4567"
                />
              </div>
              <div className="portal-form__group">
                <label className="portal-form__label">Fecha de nacimiento</label>
                <input
                  type="date"
                  className="portal-form__input"
                  value={form.date_of_birth}
                  onChange={e => setForm({ ...form, date_of_birth: e.target.value })}
                />
              </div>
              <div className="portal-form__actions">
                <button type="submit" className="portal-btn portal-btn--primary" disabled={saving}>
                  {saving ? 'Guardando...' : 'Guardar'}
                </button>
                <button type="button" className="portal-btn portal-btn--ghost" onClick={() => setEditing(false)}>
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
