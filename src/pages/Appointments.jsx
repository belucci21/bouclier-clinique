import { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Calendar, Plus, X, Clock, User, Stethoscope, MapPin, QrCode } from 'lucide-react';
import toast from 'react-hot-toast';
import QRModal from '../components/QRModal';

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [appointmentTypes, setAppointmentTypes] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [formData, setFormData] = useState({
    patient_id: '',
    doctor_id: '',
    type_id: '',
    scheduled_at: '',
    duration_minutes: 30,
    chief_complaint: '',
    notes: '',
  });
  const calendarRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const [typesRes, doctorsRes, patientsRes] = await Promise.all([
      supabase.from('appointment_types').select('*').eq('is_active', true),
      supabase.from('doctors').select('*, profiles!doctors_id_fkey(full_name)').eq('is_active', true),
      supabase.from('patients').select('*, profiles!patients_id_fkey(full_name, phone)'),
    ]);

    setAppointmentTypes(typesRes.data || []);
    setDoctors(doctorsRes.data || []);
    setPatients(patientsRes.data || []);
    fetchAppointments();
  }

  async function fetchAppointments() {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        profiles!appointments_patient_id_fkey(full_name),
        profiles!appointments_doctor_id_fkey(full_name),
        appointment_types(name, color, duration_minutes)
      `)
      .order('scheduled_at');

    if (error) {
      toast.error('Error al cargar citas');
      return;
    }

    const events = (data || []).map(apt => ({
      id: apt.id,
      title: `${apt.profiles?.full_name || 'Sin nombre'} - ${apt.appointment_types?.name || ''}`,
      start: apt.scheduled_at,
      end: new Date(new Date(apt.scheduled_at).getTime() + (apt.duration_minutes || 30) * 60000).toISOString(),
      backgroundColor: apt.appointment_types?.color || '#b89a5a',
      borderColor: apt.appointment_types?.color || '#b89a5a',
      extendedProps: { ...apt },
    }));

    setAppointments(events);
  }

  const handleDateClick = (info) => {
    setSelectedSlot(info);
    setFormData(prev => ({
      ...prev,
      scheduled_at: info.dateStr.slice(0, 16),
    }));
    setShowModal(true);
  };

  const handleEventClick = (info) => {
    const apt = info.event.extendedProps;
    setSelectedAppointment(apt);
    setShowQRModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const qrCode = `APT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const { error } = await supabase.from('appointments').insert({
      patient_id: formData.patient_id || null,
      doctor_id: formData.doctor_id || null,
      type_id: formData.type_id || null,
      scheduled_at: new Date(formData.scheduled_at).toISOString(),
      duration_minutes: formData.duration_minutes,
      chief_complaint: formData.chief_complaint,
      notes: formData.notes,
      qr_code: qrCode,
      status: 'scheduled',
    });

    if (error) {
      toast.error('Error al crear cita: ' + error.message);
      return;
    }

    toast.success('Cita creada exitosamente');
    setShowModal(false);
    fetchAppointments();
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      patient_id: '',
      doctor_id: '',
      type_id: '',
      scheduled_at: '',
      duration_minutes: 30,
      chief_complaint: '',
      notes: '',
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading text-white">Citas</h1>
          <p className="text-gray-400 mt-1">Gestión de citas y calendario</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="btn-gold flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nueva Cita
        </button>
      </div>

      {/* Calendar */}
      <div className="card-dark p-4">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          locale="es"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay',
          }}
          slotMinTime="08:00:00"
          slotMaxTime="20:00:00"
          slotDuration="00:30:00"
          allDaySlot={false}
          events={appointments}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          height="auto"
          buttonText={{
            today: 'Hoy',
            month: 'Mes',
            week: 'Semana',
            day: 'Día',
          }}
        />
      </div>

      {/* New Appointment Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-bouclier-gray border border-[#333] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-[#333]">
              <h2 className="text-xl font-heading text-white">Nueva Cita</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Patient */}
              <div>
                <label className="block text-gray-400 text-sm mb-2">
                  <User className="w-4 h-4 inline mr-1" />
                  Paciente
                </label>
                <select
                  value={formData.patient_id}
                  onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
                  className="input-dark"
                >
                  <option value="">Seleccionar paciente...</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.profiles?.full_name || 'Sin nombre'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Doctor */}
              <div>
                <label className="block text-gray-400 text-sm mb-2">
                  <Stethoscope className="w-4 h-4 inline mr-1" />
                  Doctor
                </label>
                <select
                  value={formData.doctor_id}
                  onChange={(e) => setFormData({ ...formData, doctor_id: e.target.value })}
                  className="input-dark"
                >
                  <option value="">Seleccionar doctor...</option>
                  {doctors.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.profiles?.full_name || 'Sin nombre'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Appointment Type */}
              <div>
                <label className="block text-gray-400 text-sm mb-2">Tipo de Cita</label>
                <select
                  value={formData.type_id}
                  onChange={(e) => {
                    const type = appointmentTypes.find(t => t.id === e.target.value);
                    setFormData({
                      ...formData,
                      type_id: e.target.value,
                      duration_minutes: type?.duration_minutes || 30,
                    });
                  }}
                  className="input-dark"
                >
                  <option value="">Seleccionar tipo...</option>
                  {appointmentTypes.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.duration_minutes} min)
                    </option>
                  ))}
                </select>
              </div>

              {/* Date & Time */}
              <div>
                <label className="block text-gray-400 text-sm mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Fecha y Hora
                </label>
                <input
                  type="datetime-local"
                  value={formData.scheduled_at}
                  onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
                  className="input-dark"
                  required
                />
              </div>

              {/* Chief Complaint */}
              <div>
                <label className="block text-gray-400 text-sm mb-2">Motivo de Consulta</label>
                <textarea
                  value={formData.chief_complaint}
                  onChange={(e) => setFormData({ ...formData, chief_complaint: e.target.value })}
                  className="input-dark"
                  rows={3}
                  placeholder="Describa brevemente el motivo de la consulta..."
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-gray-400 text-sm mb-2">Notas Internas</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="input-dark"
                  rows={2}
                  placeholder="Notas para el personal..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 btn-outline">
                  Cancelar
                </button>
                <button type="submit" className="flex-1 btn-gold">
                  Crear Cita
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Modal */}
      {showQRModal && selectedAppointment && (
        <QRModal
          appointment={selectedAppointment}
          onClose={() => {
            setShowQRModal(false);
            setSelectedAppointment(null);
          }}
        />
      )}
    </div>
  );
}
