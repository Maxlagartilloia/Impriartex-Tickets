import React, { useState } from 'react';
import { LayoutDashboard, Printer, Ticket as TicketIcon, Users, FileText, Settings, Search, Bell } from 'lucide-react';
import { Ticket } from '../types';
import AuditReports from '../components/reports/AuditReports';

interface DashboardProps {
  tickets: Ticket[];
  loading: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ tickets, loading }) => {
  const [role, setRole] = useState<'ADMIN' | 'CLIENT' | 'TECHNICIAN'>('ADMIN');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'reports' | 'inventory'>('dashboard');

  return (
    <div className="flex h-screen bg-[#F8F9FD]">
      {/* Sidebar Dinámico */}
      <aside className="w-64 bg-[#111C44] text-white flex flex-col shadow-2xl transition-all">
        <div className="p-8 border-b border-white/10">
          <h1 className="text-2xl font-black italic tracking-tighter">SISTEMA <span className="text-blue-500 underline">360</span></h1>
          <div className="mt-2 inline-block px-2 py-0.5 bg-blue-600/20 border border-blue-500/50 rounded text-[9px] font-black uppercase text-blue-400">
            MODO {role}
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 mt-4">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center p-3 rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-blue-600 shadow-lg' : 'text-gray-400 hover:bg-white/5'}`}
          >
            <LayoutDashboard size={20} className="mr-3" /> <span className="font-bold text-sm">Panel de Control</span>
          </button>
          
          {(role === 'ADMIN' || role === 'CLIENT') && (
            <button 
              onClick={() => setActiveTab('reports')}
              className={`w-full flex items-center p-3 rounded-xl transition-all ${activeTab === 'reports' ? 'bg-blue-600 shadow-lg' : 'text-gray-400 hover:bg-white/5'}`}
            >
              <FileText size={20} className="mr-3" /> <span className="font-bold text-sm">Reportes / Auditoría</span>
            </button>
          )}

          {role === 'ADMIN' && (
            <>
              <div className="pt-4 pb-2 px-3 text-[10px] font-black text-gray-500 uppercase tracking-widest">Gestión Central</div>
              <button className="w-full flex items-center p-3 text-gray-400 hover:bg-white/5 rounded-xl transition-all">
                <Users size={20} className="mr-3" /> <span className="font-medium text-sm">Técnicos</span>
              </button>
              <button className="w-full flex items-center p-3 text-gray-400 hover:bg-white/5 rounded-xl transition-all">
                <Printer size={20} className="mr-3" /> <span className="font-medium text-sm">Multi-Empresas</span>
              </button>
            </>
          )}
        </nav>

        {/* Simulador de Cambio de Rol para tu prueba */}
        <div className="p-4 border-t border-white/5">
          <p className="text-[8px] font-bold text-gray-500 uppercase mb-2">Simular Vista de:</p>
          <div className="grid grid-cols-3 gap-1">
            <button onClick={() => setRole('ADMIN')} className="text-[8px] bg-slate-800 p-1 rounded font-bold">SUP</button>
            <button onClick={() => setRole('CLIENT')} className="text-[8px] bg-slate-800 p-1 rounded font-bold">CLI</button>
            <button onClick={() => setRole('TECHNICIAN')} className="text-[8px] bg-slate-800 p-1 rounded font-bold">TEC</button>
          </div>
        </div>
      </aside>

      {/* Area de Trabajo */}
      <main className="flex-1 overflow-y-auto p-8">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl font-black text-[#1B2559] italic uppercase tracking-tighter">
              {activeTab === 'dashboard' ? 'Vista de Operaciones' : 'Centro de Analítica'}
            </h2>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">
              {role === 'CLIENT' ? 'Contrato de Outsourcing' : 'Administración Global de Servicios'}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100"><Bell size={20} className="text-gray-400" /></div>
            <div className="flex items-center gap-3 bg-white p-2 pr-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="h-10 w-10 bg-[#111C44] rounded-xl flex items-center justify-center text-white font-black italic">AD</div>
              <div className="text-left">
                <p className="text-[10px] font-black text-gray-400 leading-none">BIENVENIDO</p>
                <p className="text-xs font-black text-[#1B2559]">GERENTE OPERATIVO</p>
              </div>
            </div>
          </div>
        </header>

        {activeTab === 'reports' ? (
          <AuditReports tickets={tickets} />
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Aquí iría la tabla de tickets normal y los KPIs de hoy */}
            <div className="bg-blue-600 p-8 rounded-[40px] text-white shadow-2xl shadow-blue-200 mb-8 relative overflow-hidden">
               <div className="relative z-10">
                 <h3 className="text-4xl font-black italic mb-2">Resumen de Hoy</h3>
                 <p className="text-blue-100 text-sm font-bold uppercase tracking-widest">Tienes {tickets.filter(t => t.status !== 'closed').length} tickets pendientes de atención inmediata.</p>
               </div>
               <div className="absolute top-[-20px] right-[-20px] opacity-10">
                  <FileText size={200} />
               </div>
            </div>
            {/* Tabla resumida */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-50">
               <h4 className="text-sm font-black text-[#1B2559] uppercase mb-4 tracking-widest">Últimos Movimientos</h4>
               <p className="text-center py-20 text-gray-300 italic font-medium">Sincronizando flujos de trabajo en tiempo real...</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
