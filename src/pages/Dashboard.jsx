import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Calendar, Users, Clock, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({
    todayAppointments: 0,
    totalPatients: 0,
    pendingAppointments: 0,
    completedToday: 0,
  });
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [appointmentsRes, patientsRes] = await Promise.all([
      supabase
        .from('appointments')
        .select('*, profiles!appointments_patient_id_fkey(full_name), profiles!appointments_doctor_id_fkey(full_name), appointment_types(name, color)')
        .gte('scheduled_at', today.toISOString())
        .lt('scheduled_at', tomorrow.toISOString())
        .order('scheduled_at'),
      supabase.from('patients').select('id', { count: 'exact' }),
    ]);

    const appointments = appointmentsRes.data || [];

    setStats({
      todayAppointments: appointments.length,
      totalPatients: patientsRes.count || 0,
      pendingAppointments: appointments.filter(a => a.status === 'scheduled').length,
      completedToday: appointments.filter(a => a.status === 'completed').length,
    });

    setRecentAppointments(appointments.slice(0, 5));
    setLoading(false);
  }

  const statCards = [
    { label: 'Citas Hoy', value: stats.todayAppointments, icon: Calendar, color: 'text-bouclier-gold' },
    { label: 'Total Pacientes', value: stats.totalPatients, icon: Users, color: 'text-blue-400' },
    { label: 'Pendientes', value: stats.pendingAppointments, icon: Clock, color: 'text-yellow-400' },
    { label: 'Completadas Hoy', value: stats.completedToday, icon: CheckCircle, color: 'text-green-400' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-bouclier-gold animate-pulse">Cargando dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-heading text-white">Dashboard</h1>
        <p className="text-gray-400 mt-1">Resumen de la clínica</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card-dark">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">{label}</p>
                <p className="text-3xl font-bold text-white mt-1">{value}</p>
              </div>
              <Icon className={`w-10 h-10 ${color} opacity-50`} />
            </div>
          </div>
        ))}
      </div>

      {/* Recent Appointments */}
      <div className="card-dark">
        <h2 className="text-xl font-heading text-white mb-4">Próximas Citas</h2>
        {recentAppointments.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No hay citas programadas para hoy</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#333]">
                  <th className="text-left py-3 px-4 text-gray-400 text-sm font-medium">Hora</th>
                  <th className="text-left py-3 px-4 text-gray-400 text-sm font-medium">Paciente</th>
                  <th className="text-left py-3 px-4 text-gray-400 text-sm font-medium">Doctor</th>
                  <th className="text-left py-3 px-4 text-gray-400 text-sm font-medium">Tipo</th>
                  <th className="text-left py-3 px-4 text-gray-400 text-sm font-medium">Estado</th>
                </tr>
              </thead>
              <tbody>
                {recentAppointments.map((apt) => (
                  <tr key={apt.id} className="border-b border-[#333]/50 hover:bg-bouclier-darker/50">
                    <td className="py-3 px-4 text-white">
                      {new Date(apt.scheduled_at).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-4 text-white">{apt.profiles?.full_name || 'Sin asignar'}</td>
                    <td className="py-3 px-4 text-gray-300">{apt.profiles?.full_name || 'Sin asignar'}</td>
                    <td className="py-3 px-4">
                      <span
                        className="px-2 py-1 rounded-full text-xs font-medium"
                        style={{ backgroundColor: apt.appointment_types?.color + '20', color: apt.appointment_types?.color }}
                      >
                        {apt.appointment_types?.name || 'Sin tipo'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={apt.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    scheduled: 'bg-yellow-500/20 text-yellow-400',
    confirmed: 'bg-blue-500/20 text-blue-400',
    checked_in: 'bg-purple-500/20 text-purple-400',
    in_progress: 'bg-bouclier-gold/20 text-bouclier-gold',
    completed: 'bg-green-500/20 text-green-400',
    cancelled: 'bg-red-500/20 text-red-400',
    no_show: 'bg-gray-500/20 text-gray-400',
  };

  const labels = {
    scheduled: 'Programada',
    confirmed: 'Confirmada',
    checked_in: 'Check-in',
    in_progress: 'En curso',
    completed: 'Completada',
    cancelled: 'Cancelada',
    no_show: 'No asistió',
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-500/20 text-gray-400'}`}>
      {labels[status] || status}
    </span>
  );
}
