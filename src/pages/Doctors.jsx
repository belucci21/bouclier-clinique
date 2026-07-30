import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { UserCheck, Plus, Stethoscope, Award, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    specialty: '',
    cedula_number: '',
    bio: '',
    consultation_fee: '',
  });

  useEffect(() => {
    fetchDoctors();
  }, []);

  async function fetchDoctors() {
    const { data, error } = await supabase
      .from('doctors')
      .select('*, profiles!doctors_id_fkey(full_name, phone, email)')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Error al cargar doctores');
      return;
    }

    setDoctors(data || []);
    setLoading(false);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    const tempPassword = Array.from(array, b => b.toString(16).padStart(2, '0')).join('').slice(0, 16) + '!A';

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: tempPassword,
      options: {
        data: {
          full_name: formData.full_name,
          phone: formData.phone,
          role: 'doctor',
        },
      },
    });

    if (authError) {
      toast.error('Error al crear cuenta: ' + authError.message);
      return;
    }

    const doctorId = authData.user?.id;
    if (doctorId) {
      const { error: doctorError } = await supabase.from('doctors').insert({
        id: doctorId,
        specialty: formData.specialty,
        cedula_number: formData.cedula_number,
        bio: formData.bio,
        consultation_fee: formData.consultation_fee ? parseFloat(formData.consultation_fee) : null,
      });

      if (doctorError) {
        toast.error('Error al registrar doctor: ' + doctorError.message);
        return;
      }
    }

    toast.success('Doctor registrado exitosamente');
    setShowModal(false);
    fetchDoctors();
    setFormData({ full_name: '', email: '', phone: '', specialty: '', cedula_number: '', bio: '', consultation_fee: '' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-bouclier-gold animate-pulse">Cargando doctores...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading text-white">Doctores</h1>
          <p className="text-gray-400 mt-1">{doctors.length} doctores activos</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-gold flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Nuevo Doctor
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {doctors.map((doctor) => (
          <div key={doctor.id} className="card-dark hover:border-bouclier-gold/50 transition-all">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-14 h-14 rounded-full bg-bouclier-gold/20 flex items-center justify-center flex-shrink-0">
                <Stethoscope className="w-7 h-7 text-bouclier-gold" />
              </div>
              <div>
                <h3 className="text-white font-medium text-lg">{doctor.profiles?.full_name}</h3>
                <p className="text-bouclier-gold text-sm">{doctor.specialty || 'Sin especialidad'}</p>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              {doctor.cedula_number && (
                <div className="flex items-center gap-2 text-gray-400">
                  <Award className="w-4 h-4" />
                  Cédula: {doctor.cedula_number}
                </div>
              )}
              {doctor.consultation_fee && (
                <div className="flex items-center gap-2 text-gray-400">
                  <DollarSign className="w-4 h-4" />
                  Consulta: ${doctor.consultation_fee}
                </div>
              )}
              {doctor.bio && (
                <p className="text-gray-500 text-xs mt-2 line-clamp-2">{doctor.bio}</p>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-[#333]">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <div className={`w-2 h-2 rounded-full ${doctor.is_active ? 'bg-green-400' : 'bg-red-400'}`} />
                {doctor.is_active ? 'Activo' : 'Inactivo'}
              </div>
            </div>
          </div>
        ))}
      </div>

      {doctors.length === 0 && (
        <div className="text-center py-12">
          <UserCheck className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500">No hay doctores registrados</p>
        </div>
      )}

      {/* New Doctor Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-bouclier-gray border border-[#333] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-[#333]">
              <h2 className="text-xl font-heading text-white">Nuevo Doctor</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="input-dark"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input-dark"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Teléfono</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="input-dark"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Especialidad</label>
                  <input
                    type="text"
                    value={formData.specialty}
                    onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                    className="input-dark"
                    placeholder="Dermatología, Estética..."
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">No. Cédula</label>
                  <input
                    type="text"
                    value={formData.cedula_number}
                    onChange={(e) => setFormData({ ...formData, cedula_number: e.target.value })}
                    className="input-dark"
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Costo de Consulta</label>
                <input
                  type="number"
                  value={formData.consultation_fee}
                  onChange={(e) => setFormData({ ...formData, consultation_fee: e.target.value })}
                  className="input-dark"
                  placeholder="0.00"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Biografía</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="input-dark"
                  rows={3}
                />
              </div>

              <div className="bg-bouclier-darker rounded-lg p-4">
                <p className="text-gray-400 text-sm">
                  <strong className="text-bouclier-gold">Nota:</strong> Se creará una cuenta con contraseña <code className="bg-bouclier-gray px-1 rounded">Doctor123!</code>.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 btn-outline">
                  Cancelar
                </button>
                <button type="submit" className="flex-1 btn-gold">
                  Registrar Doctor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
