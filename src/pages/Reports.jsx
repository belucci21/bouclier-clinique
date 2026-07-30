import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { FileText, Plus, Upload, Download, Search, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [uploadFile, setUploadFile] = useState(null);
  const [formData, setFormData] = useState({
    patient_id: '',
    appointment_id: '',
    title: '',
    content: '',
    report_type: 'general',
    notes: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const [reportsRes, patientsRes, aptRes] = await Promise.all([
      supabase
        .from('reports')
        .select('*, profiles!reports_patient_id_fkey(full_name), profiles!reports_doctor_id_fkey(full_name), appointments(scheduled_at)')
        .order('created_at', { ascending: false }),
      supabase.from('patients').select('id, profiles!patients_id_fkey(full_name)'),
      supabase.from('appointments').select('id, scheduled_at, profiles!appointments_patient_id_fkey(full_name)').order('scheduled_at', { ascending: false }),
    ]);

    setReports(reportsRes.data || []);
    setPatients(patientsRes.data || []);
    setAppointments(aptRes.data || []);
    setLoading(false);
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('El archivo no debe exceder 10MB');
        return;
      }
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Solo se permiten archivos PDF o imágenes (JPG, PNG, WEBP)');
        return;
      }
      setUploadFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.patient_id) {
      toast.error('Debe seleccionar un paciente');
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();

    let fileUrl = null;
    let filePath = null;

    if (uploadFile) {
      const fileExt = uploadFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('reports')
        .upload(filePath, uploadFile);

      if (uploadError) {
        toast.error('Error al subir el archivo');
        return;
      }

      const { data: urlData } = supabase.storage
        .from('reports')
        .getPublicUrl(filePath);

      fileUrl = urlData.publicUrl;
    }

    const { error } = await supabase.from('reports').insert({
      patient_id: formData.patient_id || null,
      appointment_id: formData.appointment_id || null,
      doctor_id: user?.id,
      title: formData.title,
      content: formData.content,
      report_type: formData.report_type,
      notes: formData.notes,
      file_url: fileUrl,
      file_path: filePath,
      file_name: uploadFile?.name || null,
    });

    if (error) {
      toast.error('Error al crear reporte');
      return;
    }

    toast.success('Reporte creado exitosamente');
    setShowModal(false);
    setFormData({
      patient_id: '', appointment_id: '', title: '', content: '', report_type: 'general', notes: '',
    });
    setUploadFile(null);
    fetchData();
  };

  const handleDelete = async (id, filePath) => {
    if (!window.confirm('¿Estás seguro de eliminar este reporte?')) return;

    if (filePath) {
      await supabase.storage.from('reports').remove([filePath]);
    }

    const { error } = await supabase.from('reports').delete().eq('id', id);

    if (error) {
      toast.error('Error al eliminar reporte');
      return;
    }

    toast.success('Reporte eliminado exitosamente');
    fetchData();
  };

  const handleDownload = (url, fileName) => {
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.download = fileName || 'reporte';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredReports = reports.filter((r) => {
    const term = searchTerm.toLowerCase();
    return (
      r.title?.toLowerCase().includes(term) ||
      r.profiles?.full_name?.toLowerCase().includes(term) ||
      r.report_type?.toLowerCase().includes(term)
    );
  });

  const getReportTypeLabel = (type) => {
    const labels = {
      general: 'General',
      laboratory: 'Laboratorio',
      imaging: 'Imagenología',
      procedure: 'Procedimiento',
      follow_up: 'Seguimiento',
    };
    return labels[type] || type;
  };

  const getReportTypeColor = (type) => {
    const colors = {
      general: 'bg-gray-600',
      laboratory: 'bg-blue-600',
      imaging: 'bg-purple-600',
      procedure: 'bg-green-600',
      follow_up: 'bg-orange-600',
    };
    return colors[type] || 'bg-gray-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-bouclier-gold animate-pulse">Cargando reportes...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading text-white">Reportes Médicos</h1>
          <p className="text-gray-400 mt-1">{reports.length} reportes emitidos</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-gold flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Nuevo Reporte
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
        <input
          type="text"
          placeholder="Buscar por título, paciente o tipo..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-dark pl-10 w-full"
        />
      </div>

      <div className="space-y-3">
        {filteredReports.map((report) => (
          <div key={report.id} className="card-dark">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-5 h-5 text-bouclier-gold" />
                  <h3 className="text-white font-medium">{report.title}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs text-white ${getReportTypeColor(report.report_type)}`}>
                    {getReportTypeLabel(report.report_type)}
                  </span>
                </div>
                <p className="text-gray-400 text-sm mb-2">
                  Paciente: {report.profiles?.full_name || 'Sin paciente'} ·
                  Doctor: {report.profiles?.full_name || 'Sin asignar'} ·
                  Fecha: {new Date(report.created_at).toLocaleDateString('es-MX')}
                </p>
                {report.content && (
                  <p className="text-gray-400 text-sm mt-2 line-clamp-2">{report.content}</p>
                )}
                {report.notes && (
                  <p className="text-gray-500 text-sm mt-2 italic">{report.notes}</p>
                )}
                {report.file_url && (
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      onClick={() => handleDownload(report.file_url, report.file_name)}
                      className="flex items-center gap-1 text-bouclier-gold hover:text-bouclier-gold/80 text-sm"
                    >
                      <Download className="w-4 h-4" />
                      {report.file_name || 'Ver archivo adjunto'}
                    </button>
                  </div>
                )}
              </div>
              <button
                onClick={() => handleDelete(report.id, report.file_path)}
                className="text-gray-500 hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredReports.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500">
            {searchTerm ? 'No se encontraron reportes con ese criterio' : 'No hay reportes emitidos'}
          </p>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-bouclier-gray border border-[#333] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-[#333]">
              <h2 className="text-xl font-heading text-white">Nuevo Reporte</h2>
              <button onClick={() => { setShowModal(false); setUploadFile(null); }} className="text-gray-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Paciente *</label>
                  <select
                    value={formData.patient_id}
                    onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
                    className="input-dark"
                    required
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Título *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="input-dark"
                    placeholder="Título del reporte"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Tipo de Reporte</label>
                  <select
                    value={formData.report_type}
                    onChange={(e) => setFormData({ ...formData, report_type: e.target.value })}
                    className="input-dark"
                  >
                    <option value="general">General</option>
                    <option value="laboratory">Laboratorio</option>
                    <option value="imaging">Imagenología</option>
                    <option value="procedure">Procedimiento</option>
                    <option value="follow_up">Seguimiento</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-1">Contenido *</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="input-dark"
                  rows={4}
                  placeholder="Describe el contenido del reporte médico..."
                  required
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-1">Notas</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="input-dark"
                  rows={2}
                  placeholder="Notas adicionales..."
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-1">Archivo Adjunto (PDF o imagen, máx. 10MB)</label>
                <label className="flex items-center gap-2 input-dark cursor-pointer hover:border-bouclier-gold transition-colors">
                  <Upload className="w-5 h-5 text-gray-500" />
                  <span className="text-gray-400 text-sm truncate">
                    {uploadFile ? uploadFile.name : 'Seleccionar archivo...'}
                  </span>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                  />
                </label>
                {uploadFile && (
                  <button
                    type="button"
                    onClick={() => setUploadFile(null)}
                    className="text-red-400 text-xs mt-1 hover:underline"
                  >
                    Quitar archivo
                  </button>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => { setShowModal(false); setUploadFile(null); }} className="flex-1 btn-outline">Cancelar</button>
                <button type="submit" className="flex-1 btn-gold">Crear Reporte</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
