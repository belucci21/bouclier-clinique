import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Shield, CheckCircle, Clock, MapPin, User, Stethoscope, AlertCircle, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CheckIn() {
  const { qrCode } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [checked, setChecked] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (qrCode) {
      fetchAppointment();
    }
  }, [qrCode]);

  async function fetchAppointment() {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        profiles!appointments_patient_id_fkey(full_name, phone),
        profiles!appointments_doctor_id_fkey(full_name),
        appointment_types(name, color, duration_minutes)
      `)
      .eq('qr_code', qrCode)
      .single();

    if (error || !data) {
      setError('Cita no encontrada. Verifica el código QR.');
      setLoading(false);
      return;
    }

    if (data.status === 'completed') {
      setError('Esta cita ya fue completada.');
      setLoading(false);
      return;
    }

    if (data.status === 'cancelled') {
      setError('Esta cita fue cancelada.');
      setLoading(false);
      return;
    }

    setAppointment(data);
    setLoading(false);
  }

  async function handleCheckIn() {
    setChecking(true);

    const { error } = await supabase
      .from('appointments')
      .update({
        status: 'checked_in',
        checked_in_at: new Date().toISOString(),
      })
      .eq('qr_code', qrCode);

    if (error) {
      toast.error('Error al hacer check-in');
      setChecking(false);
      return;
    }

    setChecked(true);
    setChecking(false);
    toast.success('¡Check-in exitoso!');

    // Crear notificación
    if (appointment?.patient_id) {
      await supabase.from('notifications').insert({
        user_id: appointment.patient_id,
        title: 'Check-in realizado',
        message: `Tu check-in para la cita del ${new Date(appointment.scheduled_at).toLocaleString('es-MX')} fue registrado.`,
        type: 'appointment_confirmed',
      });
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bouclier-darker flex items-center justify-center">
        <Loader className="w-10 h-10 text-bouclier-gold animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-bouclier-darker flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-heading text-white mb-2">Error</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <button onClick={() => navigate('/')} className="btn-gold">
            Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  if (checked) {
    return (
      <div className="min-h-screen bg-bouclier-darker flex items-center justify-center px-4">
        <div className="text-center max-w-md animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-400" />
          </div>
          <h1 className="text-3xl font-heading text-white mb-2">¡Check-in Exitoso!</h1>
          <p className="text-gray-400 mb-4">
            Tu llegada fue registrada. Por favor espera en sala de espera.
          </p>
          <div className="bg-bouclier-gray border border-[#333] rounded-xl p-4 text-left">
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-bouclier-gold" />
                <span className="text-gray-400">
                  Hora programada: {new Date(appointment.scheduled_at).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-bouclier-gold" />
                <span className="text-gray-400">
                  Doctor: {appointment.profiles?.full_name || 'Por asignar'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-bouclier-gold" />
                <span className="text-gray-400">
                  {appointment.location || 'Torre EXERTIA'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bouclier-darker flex items-center justify-center px-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <Shield className="w-12 h-12 text-bouclier-gold mx-auto mb-3" />
          <h1 className="text-2xl font-heading text-white">Bouclier Clinique</h1>
          <p className="text-gray-500 text-sm">Confirmación de Llegada</p>
        </div>

        {/* Appointment Card */}
        <div className="bg-bouclier-gray border border-[#333] rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: appointment.appointment_types?.color || '#b89a5a' }}
            />
            <span className="text-white font-medium">
              {appointment.appointment_types?.name || 'Cita'}
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-bouclier-gold" />
              <div>
                <p className="text-gray-500 text-xs">Paciente</p>
                <p className="text-white text-sm">{appointment.profiles?.full_name || 'Sin nombre'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Stethoscope className="w-5 h-5 text-bouclier-gold" />
              <div>
                <p className="text-gray-500 text-xs">Doctor</p>
                <p className="text-white text-sm">{appointment.profiles?.full_name || 'Por asignar'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-bouclier-gold" />
              <div>
                <p className="text-gray-500 text-xs">Hora Programada</p>
                <p className="text-white text-sm">
                  {new Date(appointment.scheduled_at).toLocaleString('es-MX', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-bouclier-gold" />
              <div>
                <p className="text-gray-500 text-xs">Ubicación</p>
                <p className="text-white text-sm">{appointment.location || 'Torre EXERTIA'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Check-in Button */}
        <button
          onClick={handleCheckIn}
          disabled={checking}
          className="w-full btn-gold py-4 text-lg font-semibold disabled:opacity-50"
        >
          {checking ? (
            <span className="flex items-center justify-center gap-2">
              <Loader className="w-5 h-5 animate-spin" />
              Procesando...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Confirmar Mi Llegada
            </span>
          )}
        </button>

        <p className="text-center text-gray-600 text-xs mt-4">
          Al confirmar, el personal será notificado de tu llegada
        </p>
      </div>
    </div>
  );
}
