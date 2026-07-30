import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { FileText, Plus, Search, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Diagnoses() {
  const [diagnoses, setDiagnoses] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    patient_id: '',
    appointment_id: '',
    diagnosis: '',
    diagnosis_code: '',
    severity: '',
    notes: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const [diagRes, patientsRes, aptRes] = await Promise.all([
      supabase
        .from('diagnoses')
        .select('*, profiles!diagnoses_patient_id_fkey(full_name), profiles!diagnoses_doctor_id_fkey(full_name), appointments(scheduled_at)')
        .order('created_at', { ascending: false }),
      supabase.from('patients').select('id, profiles!patients_id_fkey(full_name)'),
      supabase.from('appointments').select('id, scheduled_at, profiles!appointments_patient_id_fkey(full_name)').order('scheduled_at', { ascending: false }),
    ]);

    setDiagnoses(diagRes.data || []);
    setPatients(patientsRes.data || []);
    setAppointments(aptRes.data || []);
    setLoading(false);
  }

  const filteredDiagnoses = diagnoses.filter(d =>
    d.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from('diagnoses').insert({
      patient_id: formData.patient_id || null,
      appointment_id: formData.appointment_id || null,
      doctor_id: user?.id,
      diagnosis: formData.diagnosis,
      diagnosis_code: formData.diagnosis_code,
      severity: formData.severity || null,
      notes: formData.notes,
    });

    if (error) {
      toast.error('Error al crear diagnóstico');
      return;
    }

    toast.success('Diagnóstico registrado');
    setShowModal(false);
    fetchData();
    setFormData({ patient_id: '', appointment_id: '', diagnosis: '', diagnosis_code: '', severity: '', notes: '' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-bouclier-gold animate-pulse">Cargando diagnósticos...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading text-white">Diagnósticos</h1>
          <p className="text-gray-400 mt-1">{diagnoses.length} diagnósticos registrados</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-gold flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Nuevo Diagnóstico
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
        <input
          type="text"
          placeholder="Buscar por diagnóstico o paciente..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-dark pl-11"
        />
      </div>

      <div className="space-y-3">
        {filteredDiagnoses.map((diag) => (
          <div key={diag.id} className="card-dark">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-white font-medium">{diag.diagnosis}</h3>
                  {diag.diagnosis_code && (
                    <span className="text-xs bg-bouclier-darker px-2 py-0.5 rounded text-gray-400 font-mono">
                      {diag.diagnosis_code}
                    </span>
                  )}
                  {diag.severity && (
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      diag.severity === 'severo' ? 'bg-red-500/20 text-red-400' :
                      diag.severity === 'moderado' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                      {diag.severity}
                    </span>
                  )}
                </div>
                <p className="text-gray-400 text-sm">
                  Paciente: {diag.profiles?.full_name || 'Sin asignar'} · 
                  Doctor: {diag.profiles?.full_name || 'Sin asignar'} · 
                  {new Date(diag.created_at).toLocaleDateString('es-MX')}
                </p>
                {diag.notes && <p className="text-gray-500 text-sm mt-1">{diag.notes}</p>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredDiagnoses.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500">No se encontraron diagnósticos</p>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-bouclier-gray border border-[#333] rounded-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-[#333]">
              <h2 className="text-xl font-heading text-white">Nuevo Diagnóstico</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-1">Paciente</label>
                <select
                  value={formData.patient_id}
                  onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
                  className="input-dark"
                >
                  <option value="">Seleccionar paciente...</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.profiles?.full_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Cita Relacionada</label>
                <select
                  value={formData.appointment_id}
                  onChange={(e) => setFormData({ ...formData, appointment_id: e.target.value })}
                  className="input-dark"
                >
                  <option value="">Ninguna</option>
                  {appointments.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.profiles?.full_name} - {new Date(a.scheduled_at).toLocaleDateString('es-MX')}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Diagnóstico *</label>
                  <input
                    type="text"
                    value={formData.diagnosis}
                    onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                    className="input-dark"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Código (CIE-10)</label>
                  <input
                    type="text"
                    value={formData.diagnosis_code}
                    onChange={(e) => setFormData({ ...formData, diagnosis_code: e.target.value })}
                    className="input-dark font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Severidad</label>
                <select
                  value={formData.severity}
                  onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                  className="input-dark"
                >
                  <option value="">Seleccionar...</option>
                  <option value="leve">Leve</option>
                  <option value="moderado">Moderado</option>
                  <option value="severo">Severo</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Notas</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="input-dark"
                  rows={3}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 btn-outline">Cancelar</button>
                <button type="submit" className="flex-1 btn-gold">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
