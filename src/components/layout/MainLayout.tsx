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
    { label: 'Inventario', icon: '/equipment' },
  ];

  // Solo mostramos estas opciones si el usuario es supervisor
  const adminItems = [
    { label: 'Clientes', icon: Building2, path: '/institutions' },
    { label: 'Técnicos', icon: Wrench, path: '/technicians' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-background flex text-foreground">
      {/* Sidebar para PC */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transition-transform lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6">
          <h2 className="text-xl font-black tracking-tighter uppercase mb-8">
            IMPRIARTEX <span className="text-primary">SOPORTE</span>
          </h2>
          
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${isActive(item.path) ? 'bg-primary/10 text-primary border border-primary/20' : 'hover:bg-muted text-muted-foreground'}`}
              >
                <item.icon size={20} /> {item.label}
              </button>
            ))}

            {role === 'supervisor' && (
              <div className="pt-4 mt-4 border-t border-border space-y-2">
                <p className="px-4 text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest mb-2">Administración</p>
                {adminItems.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${isActive(item.path) ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-muted-foreground'}`}
                  >
                    <item.icon size={20} /> {item.label}
                  </button>
                ))}
              </div>
            )}
          </nav>
        </div>
      </aside>

      {/* Contenido Principal */}
      <main className="flex-1 lg:ml-64 min-h-screen flex flex-col">
        <header className="h-16 border-b border-border bg-card/50 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button className="lg:hidden" onClick={() => setSidebarOpen(!isSidebarOpen)}>
              {isSidebarOpen ? <X /> : <Menu />}
            </button>
            <h1 className="font-bold text-lg">{title}</h1>
          </div>
          <button onClick={() => navigate('/login')} className="text-destructive hover:bg-destructive/10 p-2 rounded-lg transition-colors">
            <LogOut size={20} />
          </button>
        </header>

        <div className="p-6 animate-in fade-in duration-500">
          {children}
        </div>
      </main>
    </div>
  );
}
