import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { 
  LayoutDashboard, Ticket, Printer, 
  Building2, Wrench, LogOut, Menu, X, Calendar, FileText, UserCircle2, ShieldCheck
} from 'lucide-react';

export function MainLayout({ children, title }: { children: React.ReactNode; title: string }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex text-slate-900 font-sans">
      
      {/* SIDEBAR DINÁMICO ENTERPRISE */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#0056b3] text-white transition-transform lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full shadow-2xl'}`}>
        <div className="p-8 h-full flex flex-col">
          {/* Logo y Rol */}
          <div className="mb-10">
            <h2 className="text-2xl font-black flex flex-col uppercase tracking-tighter italic">
              IMPRIARTEX 
              <span className="text-[#facc15] text-[10px] tracking-[0.4em] not-italic">PLATFORM SAAS</span>
            </h2>
            <div className="mt-4 flex items-center gap-2 bg-white/10 p-3 rounded-2xl border border-white/5">
              <div className="w-8 h-8 rounded-lg bg-[#facc15] flex items-center justify-center text-[#0056b3]">
                <ShieldCheck size={20} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase text-[#facc15] leading-none">{role}</span>
                <span className="text-[9px] font-bold opacity-60 truncate max-w-[140px]">{user?.email}</span>
              </div>
            </div>
          </div>
          
          <nav className="space-y-2 flex-1">
            {/* VISTA SUPERVISOR: DASHBOARD COMPLETO */}
            {role === 'supervisor' && (
              <button onClick={() => navigate('/dashboard')} className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl font-black text-[11px] transition-all uppercase tracking-widest ${isActive('/dashboard') ? 'bg-white text-[#0056b3] shadow-xl translate-x-2' : 'hover:bg-white/10'}`}>
                <LayoutDashboard size={18} /> Consola Global
              </button>
            )}

            {/* VISTA TÉCNICO Y SUPERVISOR: GESTIÓN DE TICKETS */}
            {(role === 'technician' || role === 'supervisor') && (
              <button onClick={() => navigate('/tickets')} className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl font-black text-[11px] transition-all uppercase tracking-widest ${isActive('/tickets') ? 'bg-white text-[#0056b3] shadow-xl translate-x-2' : 'hover:bg-white/10'}`}>
                <Ticket size={18} /> Central de Servicios
              </button>
            )}

            {/* VISTA TODOS: INVENTARIO */}
            <button onClick={() => navigate('/equipment')} className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl font-black text-[11px] transition-all uppercase tracking-widest ${isActive('/equipment') ? 'bg-white text-[#0056b3] shadow-xl translate-x-2' : 'hover:bg-white/10'}`}>
              <Printer size={18} /> Control de Activos
            </button>

            {/* PANEL EXCLUSIVO SUPERVISOR: GESTIÓN EMPRESARIAL */}
            {role === 'supervisor' && (
              <div className="pt-6 mt-6 border-t border-white/10 space-y-2">
                <p className="px-5 text-[9px] font-black text-[#facc15] uppercase tracking-[0.3em] mb-4 opacity-80">Administración Enterprise</p>
                
                <button onClick={() => navigate('/institutions')} className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl font-black text-[11px] transition-all uppercase tracking-widest ${isActive('/institutions') ? 'bg-white text-[#0056b3] shadow-xl translate-x-2' : 'hover:bg-white/10'}`}>
                  <Building2 size={18} /> Clientes y Contratos
                </button>
                
                <button onClick={() => navigate('/technicians')} className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl font-black text-[11px] transition-all uppercase tracking-widest ${isActive('/technicians') ? 'bg-white text-[#0056b3] shadow-xl translate-x-2' : 'hover:bg-white/10'}`}>
                  <Wrench size={18} /> Escuadrón Técnico
                </button>

                <button onClick={() => navigate('/reports')} className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl font-black text-[11px] transition-all uppercase tracking-widest ${isActive('/reports') ? 'bg-white text-[#0056b3] shadow-xl translate-x-2' : 'hover:bg-white/10'}`}>
                  <FileText size={18} /> Inteligencia de Datos
                </button>
              </div>
            )}
          </nav>

          <div className="mt-auto pt-6 border-t border-white/10">
            <div className="flex items-center gap-2 text-[8px] font-black text-white/30 uppercase tracking-[0.4em]">
              <UserCircle2 size={12} /> Powered by CL TECH SOLUTIONS
            </div>
          </div>
        </div>
      </aside>

      {/* ÁREA DE CONTENIDO PRINCIPAL */}
      <main className="flex-1 lg:ml-72 min-h-screen flex flex-col relative">
        <header className="h-24 border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-40 px-10 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button className="lg:hidden p-3 bg-slate-100 rounded-xl text-[#0056b3]" onClick={() => setSidebarOpen(!isSidebarOpen)}>
              {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div>
              <h1 className="font-black text-[#0056b3] uppercase text-lg tracking-tighter italic leading-none">{title}</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Gestión Operativa v1.2</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* FILTROS GLOBALES (Solo para Supervisor) */}
            {role === 'supervisor' && (
              <div className="hidden xl:flex items-center gap-4 bg-slate-50 px-5 py-3 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-black text-slate-400 uppercase">Inicio:</span>
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-transparent text-[10px] font-bold outline-none text-[#0056b3]" />
                </div>
                <div className="w-px h-6 bg-slate-200"></div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-black text-slate-400 uppercase">Fin:</span>
                  <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="bg-transparent text-[10px] font-bold outline-none text-[#0056b3]" />
                </div>
                <Calendar size={16} className="text-[#0056b3]" />
              </div>
            )}

            <button 
              onClick={handleLogout} 
              className="flex items-center gap-3 bg-red-50 text-red-600 font-black text-[10px] px-6 py-3.5 rounded-2xl hover:bg-red-600 hover:text-white transition-all border border-red-100 uppercase tracking-widest shadow-sm active:scale-95"
            >
              Cerrar Sesión <LogOut size={16} />
            </button>
          </div>
        </header>

        <div className="p-10 animate-in fade-in duration-500">
          {children}
        </div>
      </main>
    </div>
  );
}
