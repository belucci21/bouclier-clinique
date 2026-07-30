import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Users, Plus, Search, Eye, Edit, Phone, Mail, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    gender: '',
    curp: '',
    blood_type: '',
    allergies: '',
    chronic_conditions: '',
    insurance_provider: '',
    insurance_number: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    skin_type: '',
    aesthetic_concerns: '',
  });

  useEffect(() => {
    fetchPatients();
  }, []);

  async function fetchPatients() {
    const { data, error } = await supabase
      .from('patients')
      .select(`
        *,
        profiles!patients_id_fkey(full_name, phone, email, avatar_url)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Error al cargar pacientes');
      return;
    }

    setPatients(data || []);
    setLoading(false);
  }

  const filteredPatients = patients.filter(p =>
    p.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.profiles?.phone?.includes(searchTerm) ||
    p.curp?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          role: 'patient',
        },
      },
    });

    if (authError) {
      toast.error('Error al crear cuenta: ' + authError.message);
      return;
    }

    const patientId = authData.user?.id;
    if (patientId) {
      const { error: patientError } = await supabase.from('patients').insert({
        id: patientId,
        date_of_birth: formData.date_of_birth || null,
        gender: formData.gender || null,
        curp: formData.curp,
        blood_type: formData.blood_type,
        allergies: formData.allergies ? formData.allergies.split(',').map(a => a.trim()) : [],
        chronic_conditions: formData.chronic_conditions ? formData.chronic_conditions.split(',').map(c => c.trim()) : [],
        insurance_provider: formData.insurance_provider,
        insurance_number: formData.insurance_number,
        emergency_contact_name: formData.emergency_contact_name,
        emergency_contact_phone: formData.emergency_contact_phone,
        skin_type: formData.skin_type,
        aesthetic_concerns: formData.aesthetic_concerns ? formData.aesthetic_concerns.split(',').map(a => a.trim()) : [],
      });

      if (patientError) {
        toast.error('Error al registrar paciente: ' + patientError.message);
        return;
      }
    }

    toast.success('Paciente registrado exitosamente');
    setShowModal(false);
    fetchPatients();
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      full_name: '', email: '', phone: '', date_of_birth: '', gender: '',
      curp: '', blood_type: '', allergies: '', chronic_conditions: '',
      insurance_provider: '', insurance_number: '',
      emergency_contact_name: '', emergency_contact_phone: '',
      skin_type: '', aesthetic_concerns: '',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-bouclier-gold animate-pulse">Cargando pacientes...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading text-white">Pacientes</h1>
          <p className="text-gray-400 mt-1">{patients.length} pacientes registrados</p>
        </div>
        <button onClick={() => { resetForm(); setShowModal(true); }} className="btn-gold flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Nuevo Paciente
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
        <input
          type="text"
          placeholder="Buscar por nombre, teléfono o CURP..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-dark pl-11"
        />
      </div>

      {/* Patients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredPatients.map((patient) => (
          <div key={patient.id} className="card-dark hover:border-bouclier-gold/50 transition-all">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-bouclier-gold/20 flex items-center justify-center">
                  <span className="text-bouclier-gold font-semibold text-lg">
                    {patient.profiles?.full_name?.charAt(0) || '?'}
                  </span>
                </div>
                <div>
                  <h3 className="text-white font-medium">{patient.profiles?.full_name}</h3>
                  <p className="text-gray-500 text-sm">{patient.gender || 'Sin género'}</p>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              {patient.profiles?.phone && (
                <div className="flex items-center gap-2 text-gray-400">
                  <Phone className="w-4 h-4" />
                  {patient.profiles.phone}
                </div>
              )}
              {patient.date_of_birth && (
                <div className="flex items-center gap-2 text-gray-400">
                  <Calendar className="w-4 h-4" />
                  {new Date(patient.date_of_birth).toLocaleDateString('es-MX')}
                </div>
              )}
              {patient.curp && (
                <div className="text-gray-500 text-xs font-mono">CURP: {patient.curp}</div>
              )}
              {patient.skin_type && (
                <div className="text-gray-500 text-xs">Piel: {patient.skin_type}</div>
              )}
            </div>

            <div className="flex gap-2 mt-4 pt-4 border-t border-[#333]">
              <button
                onClick={() => setSelectedPatient(patient)}
                className="flex-1 flex items-center justify-center gap-2 py-2 text-sm text-gray-400 hover:text-white hover:bg-bouclier-darker rounded-lg transition-colors"
              >
                <Eye className="w-4 h-4" />
                Ver
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 py-2 text-sm text-gray-400 hover:text-white hover:bg-bouclier-darker rounded-lg transition-colors">
                <Edit className="w-4 h-4" />
                Editar
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredPatients.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500">No se encontraron pacientes</p>
        </div>
      )}

      {/* New Patient Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-bouclier-gray border border-[#333] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-[#333]">
              <h2 className="text-xl font-heading text-white">Nuevo Paciente</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-gray-400 text-sm mb-1">Nombre Completo *</label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="input-dark"
                    required
                  />
                </div>
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
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Fecha de Nacimiento</label>
                  <input
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                    className="input-dark"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Género</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="input-dark"
                  >
                    <option value="">Seleccionar...</option>
                    <option value="F">Femenino</option>
                    <option value="M">Masculino</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">CURP</label>
                  <input
                    type="text"
                    value={formData.curp}
                    onChange={(e) => setFormData({ ...formData, curp: e.target.value.toUpperCase() })}
                    className="input-dark font-mono"
                    maxLength={18}
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Tipo de Sangre</label>
                  <select
                    value={formData.blood_type}
                    onChange={(e) => setFormData({ ...formData, blood_type: e.target.value })}
                    className="input-dark"
                  >
                    <option value="">Seleccionar...</option>
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Tipo de Piel</label>
                  <select
                    value={formData.skin_type}
                    onChange={(e) => setFormData({ ...formData, skin_type: e.target.value })}
                    className="input-dark"
                  >
                    <option value="">Seleccionar...</option>
                    {['Grasa', 'Seca', 'Mixta', 'Sensible', 'Normal'].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Alergias (separar con coma)</label>
                  <input
                    type="text"
                    value={formData.allergies}
                    onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                    className="input-dark"
                    placeholder="Penicilina, Látex..."
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Condiciones Crónicas</label>
                  <input
                    type="text"
                    value={formData.chronic_conditions}
                    onChange={(e) => setFormData({ ...formData, chronic_conditions: e.target.value })}
                    className="input-dark"
                    placeholder="Diabetes, Hipertensión..."
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Seguro Médico</label>
                  <input
                    type="text"
                    value={formData.insurance_provider}
                    onChange={(e) => setFormData({ ...formData, insurance_provider: e.target.value })}
                    className="input-dark"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">No. de Póliza</label>
                  <input
                    type="text"
                    value={formData.insurance_number}
                    onChange={(e) => setFormData({ ...formData, insurance_number: e.target.value })}
                    className="input-dark"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Contacto de Emergencia</label>
                  <input
                    type="text"
                    value={formData.emergency_contact_name}
                    onChange={(e) => setFormData({ ...formData, emergency_contact_name: e.target.value })}
                    className="input-dark"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Tel. Emergencia</label>
                  <input
                    type="tel"
                    value={formData.emergency_contact_phone}
                    onChange={(e) => setFormData({ ...formData, emergency_contact_phone: e.target.value })}
                    className="input-dark"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-gray-400 text-sm mb-1">Preocupaciones Estéticas</label>
                  <input
                    type="text"
                    value={formData.aesthetic_concerns}
                    onChange={(e) => setFormData({ ...formData, aesthetic_concerns: e.target.value })}
                    className="input-dark"
                    placeholder="Manchas, Arrugas, Flacidez..."
                  />
                </div>
              </div>

              <div className="bg-bouclier-darker rounded-lg p-4 mt-4">
                <p className="text-gray-400 text-sm">
                  <strong className="text-bouclier-gold">Nota:</strong> Se creará una cuenta temporal con contraseña <code className="bg-bouclier-gray px-1 rounded">Temp1234!</code>. El paciente deberá cambiarla en su primera sesión.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 btn-outline">
                  Cancelar
                </button>
                <button type="submit" className="flex-1 btn-gold">
                  Registrar Paciente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
