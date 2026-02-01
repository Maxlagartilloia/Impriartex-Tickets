import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { supabase } from '@/lib/supabase';
import { 
  Ticket, Users, Building2, 
  AlertCircle, CheckCircle2, Clock 
} from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    process: 0,
    completed: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const { data: tickets } = await supabase.from('tickets').select('status');
    
    if (tickets) {
      setStats({
        total: tickets.length,
        open: tickets.filter(t => t.status === 'open').length,
        process: tickets.filter(t => t.status === 'in_progress').length,
        completed: tickets.filter(t => t.status === 'completed').length,
      });
    }
    setLoading(false);
  };

  return (
    <MainLayout title="Panel de Control Principal">
      {/* SECCIÓN DE MÉTRICAS CORPORATIVAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        {/* Total - Azul Impriartex */}
        <div className="bg-[#0056b3] p-6 rounded-2xl shadow-xl text-white transform hover:scale-105 transition-all">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-white/80 text-xs font-bold uppercase tracking-widest">Total Servicios</p>
              <h3 className="text-4xl font-black mt-1">{stats.total}</h3>
            </div>
            <Ticket size={28} className="text-[#facc15]" />
          </div>
        </div>

        {/* Abiertos - Rojo Alerta */}
        <div className="bg-white p-6 rounded-2xl shadow-md border-b-4 border-red-500 transform hover:scale-105 transition-all">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Pendientes</p>
              <h3 className="text-4xl font-black mt-1 text-slate-900">{stats.open}</h3>
            </div>
            <AlertCircle size={28} className="text-red-500" />
          </div>
        </div>

        {/* En Proceso - Amarillo Impriartex */}
        <div className="bg-[#facc15] p-6 rounded-2xl shadow-xl text-[#0056b3] transform hover:scale-105 transition-all">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[#0056b3]/80 text-xs font-bold uppercase tracking-widest">En Atención</p>
              <h3 className="text-4xl font-black mt-1">{stats.process}</h3>
            </div>
            <Clock size={28} />
          </div>
        </div>

        {/* Finalizados - Verde Éxito */}
        <div className="bg-white p-6 rounded-2xl shadow-md border-b-4 border-emerald-500 transform hover:scale-105 transition-all">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Completados</p>
              <h3 className="text-4xl font-black mt-1 text-slate-900">{stats.completed}</h3>
            </div>
            <CheckCircle2 size={28} className="text-emerald-500" />
          </div>
        </div>
      </div>

      {/* SECCIÓN DE ACCESO RÁPIDO */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <h4 className="font-black text-[#0056b3] mb-4 uppercase tracking-tight">Resumen Operativo</h4>
          <p className="text-slate-600 text-sm leading-relaxed">
            Bienvenido al sistema de gestión de **Impriartex**. Desde aquí puedes monitorear en tiempo real 
            el estado de los mantenimientos y reparaciones asignadas a tus técnicos.
          </p>
          <div className="mt-6 flex gap-3">
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#0056b3]" 
                style={{ width: `${(stats.completed / (stats.total || 1)) * 100}%` }}
              ></div>
            </div>
            <span className="text-[10px] font-bold text-[#0056b3]">EFICIENCIA</span>
          </div>
        </div>

        <div className="bg-[#0056b3] p-8 rounded-3xl shadow-lg text-white relative overflow-hidden">
          <div className="relative z-10">
            <h4 className="font-black mb-2 uppercase tracking-tight text-[#facc15]">Atención Inmediata</h4>
            <p className="text-white/80 text-sm">
              Tienes {stats.open} tickets que requieren asignación o diagnóstico urgente.
            </p>
          </div>
          <Building2 size={120} className="absolute -right-8 -bottom-8 text-white/5" />
        </div>
      </div>
    </MainLayout>
  );
}
