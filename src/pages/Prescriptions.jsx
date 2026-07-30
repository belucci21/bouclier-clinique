import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Pill, Plus, Trash2, FileText, Download } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Prescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    patient_id: '',
    appointment_id: '',
    notes: '',
    medications: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }],
  });
  const [file, setFile] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const [rxRes, patientsRes, aptRes] = await Promise.all([
      supabase
        .from('prescriptions')
        .select('*, profiles!prescriptions_patient_id_fkey(full_name), profiles!prescriptions_doctor_id_fkey(full_name), appointments(scheduled_at), pdf_url')
        .order('created_at', { ascending: false }),
      supabase.from('patients').select('id, profiles!patients_id_fkey(full_name)'),
      supabase.from('appointments').select('id, scheduled_at, profiles!appointments_patient_id_fkey(full_name)').order('scheduled_at', { ascending: false }),
    ]);

    setPrescriptions(rxRes.data || []);
    setPatients(patientsRes.data || []);
    setAppointments(aptRes.data || []);
    setLoading(false);
  }

  const addMedication = () => {
    setFormData({
      ...formData,
      medications: [...formData.medications, { name: '', dosage: '', frequency: '', duration: '', instructions: '' }],
    });
  };

  const removeMedication = (index) => {
    if (formData.medications.length <= 1) return;
    setFormData({
      ...formData,
      medications: formData.medications.filter((_, i) => i !== index),
    });
  };

  const updateMedication = (index, field, value) => {
    const updated = [...formData.medications];
    updated[index][field] = value;
    setFormData({ ...formData, medications: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from('prescriptions').insert({
      patient_id: formData.patient_id || null,
      appointment_id: formData.appointment_id || null,
      doctor_id: user?.id,
      medications: formData.medications.filter(m => m.name),
      notes: formData.notes,
    });

    if (error) {
      toast.error('Error al crear receta');
      return;
    }

    if (file) {
      const { data: prescription } = await supabase
        .from('prescriptions')
        .select('id')
        .eq('doctor_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (prescription) {
        const filePath = `${user.id}/${prescription.id}/${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from('prescriptions')
          .upload(filePath, file);

        if (!uploadError) {
          const { data: urlData } = supabase.storage
            .from('prescriptions')
            .getPublicUrl(filePath);

          await supabase
            .from('prescriptions')
            .update({ pdf_url: urlData.publicUrl })
            .eq('id', prescription.id);
        }
      }
    }

    toast.success('Receta creada exitosamente');
    setShowModal(false);
    fetchData();
    setFormData({
      patient_id: '', appointment_id: '', notes: '',
      medications: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }],
    });
    setFile(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-bouclier-gold animate-pulse">Cargando recetas...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading text-white">Recetas</h1>
          <p className="text-gray-400 mt-1">{prescriptions.length} recetas emitidas</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-gold flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Nueva Receta
        </button>
      </div>

      <div className="space-y-3">
        {prescriptions.map((rx) => (
          <div key={rx.id} className="card-dark">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Pill className="w-5 h-5 text-bouclier-gold" />
                  <h3 className="text-white font-medium">
                    Receta para {rx.profiles?.full_name || 'Sin paciente'}
                  </h3>
                </div>
                <p className="text-gray-400 text-sm mb-2">
                  Doctor: {rx.profiles?.full_name || 'Sin asignar'} · 
                  Fecha: {new Date(rx.created_at).toLocaleDateString('es-MX')}
                </p>

                <div className="space-y-1 mt-3">
                  {rx.medications?.map((med, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm bg-bouclier-darker rounded-lg px-3 py-2">
                      <span className="text-bouclier-gold font-medium">{med.name}</span>
                      <span className="text-gray-500">·</span>
                      <span className="text-gray-400">{med.dosage}</span>
                      <span className="text-gray-500">·</span>
                      <span className="text-gray-400">{med.frequency}</span>
                      {med.duration && (
                        <>
                          <span className="text-gray-500">·</span>
                          <span className="text-gray-400">{med.duration}</span>
                        </>
                      )}
                    </div>
                  ))}
                </div>

                {rx.notes && (
                  <p className="text-gray-500 text-sm mt-2 italic">{rx.notes}</p>
                )}
                {rx.pdf_url && (
                  <a href={rx.pdf_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-bouclier-gold text-sm hover:underline mt-2">
                    <Download className="w-4 h-4" /> Ver documento
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {prescriptions.length === 0 && (
        <div className="text-center py-12">
          <Pill className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500">No hay recetas emitidas</p>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-bouclier-gray border border-[#333] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-[#333]">
              <h2 className="text-xl font-heading text-white">Nueva Receta</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Paciente</label>
                  <select
                    value={formData.patient_id}
                    onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
                    className="input-dark"
                  >
                    <option value="">Seleccionar...</option>
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>{p.profiles?.full_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Cita</label>
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
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-gray-400 text-sm">Medicamentos</label>
                  <button type="button" onClick={addMedication} className="text-bouclier-gold text-sm hover:underline">
                    + Agregar
                  </button>
                </div>
                <div className="space-y-3">
                  {formData.medications.map((med, i) => (
                    <div key={i} className="bg-bouclier-darker rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 text-xs">Medicamento {i + 1}</span>
                        {formData.medications.length > 1 && (
                          <button type="button" onClick={() => removeMedication(i)} className="text-red-400 hover:text-red-300">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Nombre *"
                          value={med.name}
                          onChange={(e) => updateMedication(i, 'name', e.target.value)}
                          className="input-dark text-sm"
                          required
                        />
                        <input
                          type="text"
                          placeholder="Dosis"
                          value={med.dosage}
                          onChange={(e) => updateMedication(i, 'dosage', e.target.value)}
                          className="input-dark text-sm"
                        />
                        <input
                          type="text"
                          placeholder="Frecuencia"
                          value={med.frequency}
                          onChange={(e) => updateMedication(i, 'frequency', e.target.value)}
                          className="input-dark text-sm"
                        />
                        <input
                          type="text"
                          placeholder="Duración"
                          value={med.duration}
                          onChange={(e) => updateMedication(i, 'duration', e.target.value)}
                          className="input-dark text-sm"
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="Instrucciones adicionales"
                        value={med.instructions}
                        onChange={(e) => updateMedication(i, 'instructions', e.target.value)}
                        className="input-dark text-sm w-full"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-1">Notas</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="input-dark"
                  rows={3}
                  placeholder="Indicaciones generales..."
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-1">Archivo adjunto (opcional)</label>
                <input type="file" accept=".pdf,image/*" onChange={(e) => setFile(e.target.files[0])} className="input-dark" />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 btn-outline">Cancelar</button>
                <button type="submit" className="flex-1 btn-gold">Crear Receta</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
