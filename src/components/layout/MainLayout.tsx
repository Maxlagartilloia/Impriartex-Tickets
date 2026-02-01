import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { 
  LayoutDashboard, Ticket, Printer, 
  Building2, Wrench, LogOut, Menu, X 
} from 'lucide-react';

export function MainLayout({ children, title }: { children: React.ReactNode; title: string }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const { role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Soporte', icon: Ticket, path: '/tickets' },
    { label: 'Inventario', icon: Printer, path: '/equipment' }, // Corregido: Agregado icono Printer
  ];

  const adminItems = [
    { label: 'Clientes', icon: Building2, path: '/institutions' },
    { label: 'Técnicos', icon: Wrench, path: '/technicians' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-[#f8fafc] flex text-slate-900 font-sans">
      {/* Sidebar con Azul Impriartex */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0056b3] text-white transition-transform lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full shadow-2xl'}`}>
        <div className="p-6">
          <h2 className="text-xl font-black tracking-tighter uppercase mb-8 flex flex-col">
            IMPRIARTEX 
            <span className="text-[#facc15] text-sm tracking-widest">SOPORTE TÉCNICO</span>
          </h2>
          
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.path}
                onClick={() => { navigate(item.path); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                  isActive(item.path) 
                  ? 'bg-white text-[#0056b3] shadow-lg' 
                  : 'hover:bg-white/10 text-white/80 hover:text-white'
                }`}
              >
                <item.icon size={20} /> {item.label}
              </button>
            ))}

            {role === 'supervisor' && (
              <div className="pt-4 mt-4 border-t border-white/10 space-y-2">
                <p className="px-4 text-[10px] font-black text-[#facc15] uppercase tracking-widest mb-2">Panel Administrativo</p>
                {adminItems.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => { navigate(item.path); setSidebarOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                      isActive(item.path) 
                      ? 'bg-white text-[#0056b3] shadow-lg' 
                      : 'hover:bg-white/10 text-white/80 hover:text-white'
                    }`}
                  >
                    <item.icon size={20} /> {item.label}
                  </button>
                ))}
              </div>
            )}
          </nav>
        </div>
        
        {/* Footer del Sidebar con info del usuario */}
        <div className="absolute bottom-0 w-full p-4 bg-black/10 text-[10px] text-white/50 text-center uppercase font-bold">
          v1.0.0 - CL Tech Solutions
        </div>
      </aside>

      {/* Contenido Principal con fondo blanco limpio */}
      <main className="flex-1 lg:ml-64 min-h-screen flex flex-col">
        <header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button className="lg:hidden text-[#0056b3]" onClick={() => setSidebarOpen(!isSidebarOpen)}>
              {isSidebarOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
            <h1 className="font-black text-[#0056b3] uppercase tracking-tight">{title}</h1>
          </div>
          <button 
            onClick={() => navigate('/login')} 
            className="flex items-center gap-2 text-red-600 font-bold hover:bg-red-50 px-3 py-2 rounded-lg transition-colors"
          >
            <span className="hidden sm:inline text-xs">SALIR</span>
            <LogOut size={20} />
          </button>
        </header>

        <div className="p-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
          {children}
        </div>
      </main>
      
      {/* Overlay para móviles */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
