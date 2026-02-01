import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { 
  LayoutDashboard, Ticket, Printer, 
  Building2, Wrench, LogOut, Menu, X, Calendar, Settings
} from 'lucide-react';

export function MainLayout({ children, title }: { children: React.ReactNode; title: string }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const { role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Estado para el filtro global de fechas que pediste
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-[#f8fafc] flex text-slate-900 font-sans">
      {/* SIDEBAR: Ubicado a la izquierda */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0056b3] text-white transition-transform lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6">
          <h2 className="text-xl font-black mb-8 flex flex-col uppercase tracking-tighter">
            IMPRIARTEX 
            <span className="text-[#facc15] text-[10px] tracking-[0.3em]">SOPORTE TÉCNICO</span>
          </h2>
          
          <nav className="space-y-2">
            {/* Opciones Generales */}
            <button onClick={() => navigate('/dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs transition-all ${isActive('/dashboard') ? 'bg-white text-[#0056b3] shadow-lg' : 'hover:bg-white/10'}`}>
              <LayoutDashboard size={18} /> DASHBOARD
            </button>
            <button onClick={() => navigate('/tickets')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs transition-all ${isActive('/tickets') ? 'bg-white text-[#0056b3] shadow-lg' : 'hover:bg-white/10'}`}>
              <Ticket size={18} /> GESTIÓN DE TICKETS
            </button>

            {/* Opciones exclusivas de SUPERVISOR (Criss) */}
            {role === 'supervisor' && (
              <div className="pt-4 mt-4 border-t border-white/10 space-y-2">
                <p className="px-4 text-[9px] font-black text-[#facc15] uppercase tracking-[0.2em] mb-2 opacity-70">Administración</p>
                <button onClick={() => navigate('/equipment')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs transition-all ${isActive('/equipment') ? 'bg-white text-[#0056b3]' : 'hover:bg-white/10'}`}>
                  <Printer size={18} /> INVENTARIO GLOBAL
                </button>
                <button onClick={() => navigate('/institutions')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs transition-all ${isActive('/institutions') ? 'bg-white text-[#0056b3]' : 'hover:bg-white/10'}`}>
                  <Building2 size={18} /> CLIENTES / ENTIDADES
                </button>
                <button onClick={() => navigate('/technicians')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs transition-all ${isActive('/technicians') ? 'bg-white text-[#0056b3]' : 'hover:bg-white/10'}`}>
                  <Wrench size={18} /> EQUIPO TÉCNICO
                </button>
              </div>
            )}
          </nav>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <main className="flex-1 lg:ml-64 min-h-screen flex flex-col">
        {/* HEADER SUPERIOR CON FILTROS DE FECHA */}
        <header className="h-20 border-b border-slate-200 bg-white sticky top-0 z-40 px-6 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <button className="lg:hidden text-[#0056b3]" onClick={() => setSidebarOpen(!isSidebarOpen)}>
              {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <h1 className="font-black text-[#0056b3] uppercase text-sm tracking-tight italic">{title}</h1>
          </div>

          <div className="flex items-center gap-4">
            {/* SELECTORES DE FECHA PARA REPORTES */}
            <div className="hidden md:flex items-center gap-3 bg-slate-50 p-2 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black text-slate-400 uppercase">Desde:</span>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-transparent text-[10px] font-bold outline-none text-[#0056b3]" />
              </div>
              <div className="w-px h-4 bg-slate-200"></div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black text-slate-400 uppercase">Hasta:</span>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="bg-transparent text-[10px] font-bold outline-none text-[#0056b3]" />
              </div>
              <Calendar size={14} className="text-[#0056b3] ml-1" />
            </div>

            <button onClick={() => navigate('/login')} className="flex items-center gap-2 bg-red-50 text-red-600 font-black text-[10px] px-4 py-2.5 rounded-xl hover:bg-red-600 hover:text-white transition-all border border-red-100 uppercase tracking-widest">
              Salir <LogOut size={16} />
            </button>
          </div>
        </header>

        {/* CONTENIDO DINÁMICO */}
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
