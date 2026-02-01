import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { 
  Plus, AlertCircle, Clock, CheckCircle2, 
  TrendingUp, Printer, Camera, X, Zap
} from 'lucide-react';

export default function DashboardPage() {
  const { user, role } = useAuth();
  const [stats, setStats] = useState({ pending: 0, active: 0, completed: 0 });
  const [invStats, setInvStats] = useState({ operational: 0, storage: 0, scrap: 0 });
  const [qualityScore, setQualityScore] = useState(0);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [role, user]);

  const fetchDashboardData = async () => {
    setLoading(true);
    
    // 1. OBTENER ESTADÍSTICAS DE TICKETS
    let ticketQuery = supabase.from('tickets').select('status, arrival_at, created_at');
    if (role === 'client') ticketQuery = ticketQuery.eq('client_id', user.id);
    else if (role === 'technician') ticketQuery = ticketQuery.eq('technician_id', user.id);

    const { data: tickets } = await ticketQuery;
    
    // 2. OBTENER ESTADÍSTICAS DE INVENTARIO (REAL)
    const { data: equip } = await supabase.from('equipment').select('status');

    if (tickets) {
      setStats({
        pending: tickets.filter(t => t.status === 'open').length,
        active: tickets.filter(t => t.status === 'in_progress').length,
        completed: tickets.filter(t => t.status === 'completed').length
      });

      // LÓGICA DE CALIDAD: % de tickets atendidos
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
    <MainLayout title="Panel de Control Principal">
      
      {/* SECCIÓN 1: BIENVENIDA */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter italic">
            Hola, {user?.email?.split('@')[0]}
          </h2>
          <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest">
            {role === 'supervisor' ? 'Control Global de Impriartex' : 'Estado de tu infraestructura tecnológica'}
          </p>
        </div>
        
        {role === 'client' && (
          <button 
            onClick={() => setShowTicketModal(true)}
            className="bg-[#0056b3] text-white px-8 py-4 rounded-2xl font-black flex items-center gap-3 shadow-xl shadow-blue-500/30 hover:bg-[#004494] transition-all transform active:scale-95 uppercase tracking-widest text-xs"
          >
            <Plus size={20} /> Crear Nueva Asistencia
          </button>
        )}
      </div>

      {/* SECCIÓN 2: TARJETAS DE ESTADO REALES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border-b-4 border-red-500 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pendientes</p>
            <h3 className="text-4xl font-black text-slate-800">{stats.pending}</h3>
          </div>
          <AlertCircle size={40} className="text-red-500 opacity-20" />
        </div>
        
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border-b-4 border-[#facc15] flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">En Atención</p>
            <h3 className="text-4xl font-black text-slate-800">{stats.active}</h3>
          </div>
          <Clock size={40} className="text-[#facc15] opacity-20" />
        </div>

        <div className="bg-white p-8 rounded-[2rem] shadow-sm border-b-4 border-[#0056b3] flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Completados</p>
            <h3 className="text-4xl font-black text-slate-800">{stats.completed}</h3>
          </div>
          <CheckCircle2 size={40} className="text-[#0056b3] opacity-20" />
        </div>
      </div>

      {/* SECCIÓN 3: CALIDAD SLA E INVENTARIO */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* GRÁFICO DE CALIDAD */}
        <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-xl text-white">
          <h4 className="font-black text-[#facc15] uppercase text-xs tracking-widest mb-8 flex items-center gap-2">
            <Zap size={16} /> Índice de Calidad Real (SLA)
          </h4>
          <div className="flex items-center gap-8">
             <div className="relative w-28 h-28 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="56" cy="56" r="50" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-white/10" />
                  <circle cx="56" cy="56" r="50" stroke="currentColor" strokeWidth="10" fill="transparent" 
                    className="text-[#facc15]" strokeDasharray={314} strokeDashoffset={314 - (314 * qualityScore) / 100} strokeLinecap="round" />
                </svg>
                <span className="absolute text-xl font-black italic">{qualityScore}%</span>
             </div>
             <div>
                <p className="font-black uppercase text-xs mb-1">Efectividad de Servicio</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Basado en tickets resueltos vs reportados</p>
             </div>
          </div>
        </div>

        {/* ESTADO DEL INVENTARIO REAL */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
          <h4 className="font-black text-[#0056b3] uppercase text-xs tracking-widest mb-6 flex items-center gap-2">
            <Printer size={16} /> Monitoreo de Inventario
          </h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
              <span className="text-xs font-black uppercase text-slate-600 italic">Equipos Operativos</span>
              <span className="bg-emerald-100 text-emerald-700 px-4 py-1 rounded-full text-[10px] font-black">{invStats.operational}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
              <span className="text-xs font-black uppercase text-slate-600 italic">En Almacén</span>
              <span className="bg-blue-100 text-[#0056b3] px-4 py-1 rounded-full text-[10px] font-black">{invStats.storage}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-red-50 rounded-2xl">
              <span className="text-xs font-black uppercase text-red-600 italic">Baja / Chatarra</span>
              <span className="bg-red-500 text-white px-4 py-1 rounded-full text-[10px] font-black">{invStats.scrap}</span>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL PARA CLIENTE: CREAR TICKET (Lógica completa) */}
      {showTicketModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white max-w-lg w-full p-10 rounded-[2.5rem] shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-black text-[#0056b3] uppercase tracking-tighter italic">Reportar Falla Técnica</h3>
              <button onClick={() => setShowTicketModal(false)} className="text-slate-300 hover:text-red-500 transition-colors"><X size={28} /></button>
            </div>
            
            <form className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ubicación / Dpto</label>
                  <input type="text" className="w-full mt-1 px-4 py-4 rounded-2xl bg-slate-50 border-none outline-none font-bold text-xs" placeholder="Ej. Contabilidad" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Código Equipo</label>
                  <input type="text" className="w-full mt-1 px-4 py-4 rounded-2xl bg-slate-50 border-none outline-none font-bold text-xs" placeholder="Serie del equipo" />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Descripción del Problema</label>
                <textarea className="w-full mt-1 px-4 py-4 rounded-2xl bg-slate-50 border-none outline-none font-bold text-xs h-32" placeholder="Explique qué sucede con el equipo..."></textarea>
              </div>

              <div className="bg-slate-50 p-6 rounded-2xl border-2 border-dashed border-slate-200 text-center group hover:border-[#0056b3] transition-all cursor-pointer">
                <Camera className="mx-auto text-slate-300 mb-2 group-hover:text-[#0056b3]" size={32} />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tomar Foto de Evidencia</p>
                <input type="file" className="hidden" id="evidence" accept="image/*" capture="environment" />
                <label htmlFor="evidence" className="mt-2 inline-block text-[10px] font-black text-[#0056b3] cursor-pointer hover:underline uppercase">Abrir Cámara</label>
              </div>

              <button type="submit" className="w-full bg-[#0056b3] text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-500/20 hover:bg-[#004494] transition-all mt-4 uppercase tracking-[0.2em] text-xs">
                ENVIAR REPORTE AHORA
              </button>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
