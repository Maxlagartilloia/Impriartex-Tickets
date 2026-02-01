import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { 
  Plus, AlertCircle, Clock, CheckCircle2, 
  TrendingUp, Users, Printer, FileText, Camera, X
} from 'lucide-react';

export default function DashboardPage() {
  const { user, role } = useAuth();
  const [stats, setStats] = useState({ pending: 0, active: 0, completed: 0 });
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Lógica de carga de estadísticas según el ROL
  useEffect(() => {
    const fetchStats = async () => {
      let query = supabase.from('tickets').select('status', { count: 'exact' });
      
      // Si es cliente, solo ve sus tickets
      if (role === 'client') {
        query = query.eq('client_id', user.id);
      } 
      // Si es técnico, solo ve los que tiene asignados
      else if (role === 'technician') {
        query = query.eq('technician_id', user.id);
      }

      const { data } = await query;
      if (data) {
        setStats({
          pending: data.filter(t => t.status === 'open').length,
          active: data.filter(t => t.status === 'in_progress').length,
          completed: data.filter(t => t.status === 'completed').length
        });
      }
      setLoading(false);
    };
    fetchStats();
  }, [role, user]);

  return (
    <MainLayout title="Panel de Control Principal">
      
      {/* SECCIÓN 1: BIENVENIDA Y ACCIÓN RÁPIDA */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">
            Hola, {user?.email?.split('@')[0]}
          </h2>
          <p className="text-slate-500 font-medium">Estado actual de la infraestructura tecnológica.</p>
        </div>
        
        {/* Solo el Cliente ve el botón de Crear Ticket */}
        {role === 'client' && (
          <button 
            onClick={() => setShowTicketModal(true)}
            className="bg-[#0056b3] text-white px-8 py-4 rounded-2xl font-black flex items-center gap-3 shadow-xl shadow-blue-500/30 hover:bg-[#004494] transition-all transform active:scale-95 uppercase tracking-widest text-xs"
          >
            <Plus size={20} /> Crear Nueva Asistencia
          </button>
        )}
      </div>

      {/* SECCIÓN 2: TARJETAS DE ESTADO (KPIs) */}
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

      {/* SECCIÓN 3: GRÁFICOS DE SLA (CALIDAD DE SERVICIO) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
          <h4 className="font-black text-[#0056b3] uppercase text-xs tracking-widest mb-6 flex items-center gap-2">
            <TrendingUp size={16} /> Índice de Calidad (SLA)
          </h4>
          <div className="h-48 flex items-end justify-between gap-2">
            {/* Simulación de gráfico de barras */}
            {[40, 70, 90, 60, 85, 100, 75].map((h, i) => (
              <div key={i} className="flex-1 bg-slate-50 rounded-t-xl relative group">
                <div 
                  className="absolute bottom-0 left-0 right-0 bg-[#0056b3] rounded-t-xl transition-all duration-500 group-hover:bg-[#facc15]" 
                  style={{ height: `${h}%` }}
                ></div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4 text-[9px] font-black text-slate-400 uppercase">
            <span>Lun</span><span>Mar</span><span>Mie</span><span>Jue</span><span>Vie</span><span>Sab</span><span>Dom</span>
          </div>
        </div>

        {/* ÚLTIMOS MOVIMIENTOS */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
          <h4 className="font-black text-[#0056b3] uppercase text-xs tracking-widest mb-6 flex items-center gap-2">
            <Printer size={16} /> Estado del Inventario
          </h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
              <span className="text-xs font-bold uppercase">Equipos en Operación</span>
              <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black">94%</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
              <span className="text-xs font-bold uppercase">Equipos en Almacén</span>
              <span className="bg-blue-100 text-[#0056b3] px-3 py-1 rounded-full text-[10px] font-black">12</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
              <span className="text-xs font-bold uppercase">Baja / Chatarra</span>
              <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-[10px] font-black">5</span>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL PARA CLIENTE: CREAR TICKET */}
      {showTicketModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white max-w-lg w-full p-8 rounded-[2.5rem] shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-black text-[#0056b3] uppercase tracking-tighter">Reportar Falla Técnica</h3>
              <button onClick={() => setShowTicketModal(false)} className="text-slate-300 hover:text-red-500 transition-colors"><X size={24} /></button>
            </div>
            
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Departamento</label>
                  <select className="w-full mt-1 px-4 py-4 rounded-2xl bg-slate-50 border-none outline-none font-bold text-xs uppercase">
                    <option>Sistemas</option>
                    <option>Contabilidad</option>
                    <option>Gerencia</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Equipo (S/N)</label>
                  <select className="w-full mt-1 px-4 py-4 rounded-2xl bg-slate-50 border-none outline-none font-bold text-xs uppercase">
                    <option>Impresora Epson L3110</option>
                    <option>Copiadora Ricoh 301</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Descripción del Problema</label>
                <textarea className="w-full mt-1 px-4 py-4 rounded-2xl bg-slate-50 border-none outline-none font-bold text-xs h-32" placeholder="Describa el fallo brevemente..."></textarea>
              </div>

              <div className="bg-slate-50 p-6 rounded-2xl border-2 border-dashed border-slate-200 text-center">
                <Camera className="mx-auto text-slate-300 mb-2" size={32} />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Adjuntar Evidencia (Foto)</p>
                <input type="file" className="hidden" id="evidence" />
                <label htmlFor="evidence" className="mt-2 inline-block text-[10px] font-black text-[#0056b3] cursor-pointer hover:underline uppercase">Seleccionar Archivo</label>
              </div>

              <button type="submit" className="w-full bg-[#0056b3] text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-500/20 hover:bg-[#004494] transition-all mt-6 uppercase tracking-widest text-xs">
                ENVIAR REPORTE AHORA
              </button>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
