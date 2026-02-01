import React from 'react';
import { 
  LayoutDashboard, 
  Ticket, 
  Printer, 
  FileBarChart, 
  LogOut, 
  AlertCircle 
} from 'lucide-react';

const DashboardLayout = ({ children, userRole }) => {
  const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Panel General', roles: ['admin', 'technician'] },
    { icon: <Ticket size={20} />, label: 'Gestión de Tickets', roles: ['admin', 'technician', 'client'] },
    { icon: <Printer size={20} />, label: 'Inventario GAD', roles: ['admin', 'technician'] },
    { icon: <FileBarChart size={20} />, label: 'Reportes SLA', roles: ['admin'] },
  ];

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* Sidebar - Identidad Corporativa */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-xl font-bold tracking-tight text-blue-400">SISTEMA GAD SD</h1>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest">Auditoría Técnica</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item, index) => (
            item.roles.includes(userRole) && (
              <button 
                key={index}
                className="flex items-center w-full p-3 text-sm font-medium transition-all rounded-lg hover:bg-slate-800 hover:text-blue-400 group"
              >
                <span className="mr-3 text-slate-400 group-hover:text-blue-400">{item.icon}</span>
                {item.label}
              </button>
            )
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button className="flex items-center w-full p-3 text-sm font-medium text-red-400 hover:bg-red-900/20 rounded-lg transition-all">
            <LogOut size={20} className="mr-3" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
          <div className="flex items-center text-sm text-gray-500">
            <span>Dashboard</span>
            <span className="mx-2">/</span>
            <span className="font-semibold text-gray-900 italic">Vista de Verificación Contractual</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex flex-col text-right">
              <span className="text-sm font-bold text-gray-900 italic uppercase">Admin Contrato</span>
              <span className="text-xs text-green-500 font-medium">Sistema Online</span>
            </div>
            <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
              AC
            </div>
          </div>
        </header>

        <section className="flex-1 overflow-y-auto p-8">
          {children}
        </section>
      </main>
    </div>
  );
};

export default DashboardLayout;
