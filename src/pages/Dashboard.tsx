import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { 
  Plus, AlertCircle, Clock, CheckCircle2, 
  TrendingUp, Printer, Camera, X, Zap, 
  BarChart3, Activity, Gauge, MonitorCheck
} from 'lucide-react';

export default function DashboardPage() {
  const { user, role } = useAuth();
  const [stats, setStats] = useState({ pending: 0, active: 0, completed: 0 });
  const [invStats, setInvStats] = useState({ operational: 0, storage: 0, scrap: 0 });
  const [totalPrints, setTotalPrints] = useState({ bn: 0, color: 0 });
  const [qualityScore, setQualityScore] = useState(0);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [role, user]);

  const fetchDashboardData = async () => {
    setLoading(true);
    
    // 1. ESTADÍSTICAS DE TICKETS Y CONSUMO REAL
    let ticketQuery = supabase.from('tickets').select('status, counter_bn_final, counter_color_final');
    if (role === 'client') ticketQuery = ticketQuery.eq('client_id', user.id);
    else if (role === 'technician') ticketQuery = ticketQuery.eq('technician_id', user.id);

    const { data: tickets } = await ticketQuery;
    
    // 2. ESTADÍSTICAS DE INVENTARIO
    const { data: equip } = await supabase.from('equipment').select('status');

    if (tickets) {
      setStats({
        pending: tickets.filter(t => t.status === 'open').length,
        active: tickets.filter(t => t.status === 'in_progress').length,
        completed: tickets.filter(t => t.status === 'completed').length
      });

      // LÓGICA DE NEGOCIO: Sumatoria de contadores para el Director
      const sumBN = tickets.reduce((acc, t) => acc + (t.counter_bn_final || 0), 0);
      const sumColor = tickets.reduce((acc, t) => acc + (t.counter_color_final || 0), 0);
      setTotalPrints({ bn: sumBN, color: sumColor });

      // ÍNDICE SLA: Resolución vs Reportados
      const total = tickets.length;
      const done = tickets.filter(t => t.status === 'completed').length;
      setQualityScore(total > 0 ? Math.round((done / total) * 100) : 0);
    }

    if (equip) {
      setInvStats({
        operational: equip.filter(e => e.status === 'operativo').length,
        storage: equip.filter(e => e.status === 'almacen').length,
        scrap: equip.filter(e => e.status === 'chatarra').length
      });
    }
    
    setLoading(false);
  };

  return (
    <MainLayout title="Centro de Inteligencia Operativa">
      
      {/* CABECERA DINÁMICA */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter italic leading-none flex items-center gap-3">
            <Activity className="text-[#0056b3]" /> Hola, {user?.email?.split('@')[0]}
          </h2>
          <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.3em] mt-2 italic">
            {role === 'supervisor' ? 'SaaS Enterprise Control — Impriartex' : 'Panel de Gestión Tecnológica'}
          </p>
        </div>
        
        {role === 'client' && (
          <button 
            onClick={() => setShowTicketModal(true)}
            className="bg-[#0056b3] text-white px-8 py-4 rounded-2xl font-black flex items-center gap-3 shadow-xl shadow-blue-500/30 hover:bg-[#004494] transition-all transform active:scale-95 uppercase tracking-widest text-[10px]"
          >
            <Plus size={20} /> Abrir Ticket de Soporte
          </button>
        )}
      </div>

      {/* KPI SECTION: ESTADO DE SERVICIOS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border-b-8 border-red-500 flex items-center justify-between group hover:shadow-2xl transition-all">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Atenciones Críticas</p>
            <h3 className="text-5xl font-black text-slate-800">{stats.pending}</h3>
          </div>
          <AlertCircle size={48} className="text-red-500 opacity-20 group-hover:opacity-100 transition-opacity" />
        </div>
        
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border-b-8 border-[#facc15] flex items-center justify-between group hover:shadow-2xl transition-all">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">En Intervención</p>
            <h3 className="text-5xl font-black text-slate-800">{stats.active}</h3>
          </div>
          <Clock size={48} className="text-[#facc15] opacity-20 group-hover:opacity-100 transition-opacity" />
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border-b-8 border-[#0056b3] flex items-center justify-between group hover:shadow-2xl transition-all">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cierres Exitosos</p>
            <h3 className="text-5xl font-black text-slate-800">{stats.completed}</h3>
          </div>
          <CheckCircle2 size={48} className="text-[#0056b3] opacity-20 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        {/* INDICADOR DE DESEMPEÑO TÉCNICO */}
        <div className="bg-slate-900 p-8 rounded-[3rem] shadow-xl text-white flex flex-col justify-between">
          <h4 className="font-black text-[#facc15] uppercase text-[10px] tracking-[0.2em] mb-8 flex items-center gap-2">
            <Zap size={16} /> Efectividad de Respuesta (SLA)
          </h4>
          <div className="flex flex-col items-center">
             <div className="relative w-40 h-40 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-white/10" />
                  <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" 
                    className="text-[#facc15]" strokeDasharray={440} strokeDashoffset={440 - (440 * qualityScore) / 100} strokeLinecap="round" />
                </svg>
                <span className="absolute text-4xl font-black italic">{qualityScore}%</span>
             </div>
             <p className="mt-6 text-[9px] text-slate-400 font-bold uppercase tracking-widest text-center italic">Calculado según cumplimiento de órdenes de trabajo.</p>
          </div>
        </div>

        {/* MONITOR DE CONSUMO ACUMULADO */}
        <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 flex flex-col justify-between">
          <h4 className="font-black text-[#0056b3] uppercase text-[10px] tracking-[0.2em] mb-8 flex items-center gap-2">
            <Gauge size={18} /> Monitoreo de Impresiones
          </h4>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-[10px] font-black uppercase text-slate-400">Total Páginas B/N</span>
                <span className="text-sm font-black text-slate-800">{totalPrints.bn.toLocaleString()}</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-slate-800 h-full transition-all duration-1000" style={{ width: '75%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-[10px] font-black uppercase text-slate-400">Total Páginas Color</span>
                <span className="text-sm font-black text-[#0056b3]">{totalPrints.color.toLocaleString()}</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-[#0056b3] h-full transition-all duration-1000" style={{ width: '40%' }}></div>
              </div>
            </div>
            <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
              <p className="text-[8px] text-[#0056b3] font-black uppercase leading-tight italic">
                Sincronizado con el último reporte técnico certificado.
              </p>
            </div>
          </div>
        </div>

        {/* ESTADO DE SALUD DE INFRAESTRUCTURA */}
        <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
          <h4 className="font-black text-[#0056b3] uppercase text-[10px] tracking-[0.2em] mb-8 flex items-center gap-2">
            <MonitorCheck size={16} /> Estado de Salud de Flota
          </h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-5 bg-emerald-50 rounded-[1.5rem] border border-emerald-100">
              <span className="text-xs font-black uppercase text-emerald-700 italic">Equipos Online</span>
              <span className="bg-emerald-500 text-white px-4 py-1 rounded-full text-[10px] font-black">{invStats.operational}</span>
            </div>
            <div className="flex items-center justify-between p-5 bg-blue-50 rounded-[1.5rem] border border-blue-100">
              <span className="text-xs font-black uppercase text-[#0056b3] italic">En Almacén</span>
              <span className="bg-[#0056b3] text-white px-4 py-1 rounded-full text-[10px] font-black">{invStats.storage}</span>
            </div>
            <div className="flex items-center justify-between p-5 bg-red-50 rounded-[1.5rem] border border-red-100">
              <span className="text-xs font-black uppercase text-red-600 italic">Fuera de Servicio</span>
              <span className="bg-red-500 text-white px-4 py-1 rounded-full text-[10px] font-black">{invStats.scrap}</span>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
