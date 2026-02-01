import React from 'react';
import { 
  LayoutDashboard, 
  Printer, 
  Ticket as TicketIcon, 
  Bell, 
  Search, 
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { Ticket } from '../types';

interface DashboardProps {
  tickets: Ticket[];
  loading: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ tickets, loading }) => {
  // Cálculos de Auditoría para el Pliego
  const totalOpen = tickets.filter(t => t.status !== 'closed').length;
  const slaViolations = tickets.filter(t => (t.response_time_minutes || 0) > 240).length;

  return (
    <div className="flex h-screen bg-[#F8F9FD]">
      {/* Sidebar - Identidad GAD SD */}
      <aside className="w-64 bg-[#111C44] text-white flex flex-col shadow-2xl">
        <div className="p-8 border-b border-white/10">
          <h1 className="text-2xl font-black italic tracking-tighter">
            GAD<span className="text-blue-500 underline">SD</span>
          </h1>
          <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Auditoría de Sistemas</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 mt-4">
          <div className="flex items-center p-3 bg-blue-600 rounded-xl cursor-pointer shadow-lg shadow-blue-900/50">
            <LayoutDashboard size={20} className="mr-3" />
            <span className="font-bold text-sm">Panel de Control</span>
          </div>
          <div className="flex items-center p-3 text-gray-400 hover:bg-white/5 rounded-xl cursor-pointer transition-all">
            <TicketIcon size={20} className="mr-3" />
            <span className="font-medium text-sm">Gestión de Tickets</span>
          </div>
          <div className="flex items-center p-3 text-gray-400 hover:bg-white/5 rounded-xl cursor-pointer transition-all">
            <Printer size={20} className="mr-3" />
            <span className="font-medium text-sm">Inventario Equipos</span>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        <header className="flex justify-between items-center mb-10">
          <div className="relative w-96">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por Serial o Ticket..." 
              className="w-full pl-10 pr-4 py-2.5 bg-white border-none rounded-2xl shadow-sm text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-white p-2 rounded-xl shadow-sm"><Bell size={20} className="text-gray-500" /></div>
            <div className="flex items-center gap-3 bg-white p-1.5 pr-4 rounded-2xl shadow-sm">
              <div className="h-8 w-8 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xs">AD</div>
              <span className="text-xs font-bold text-[#1B2559]">ADMINISTRADOR</span>
            </div>
          </div>
        </header>

        {/* KPIs de Cumplimiento Contractual */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-50">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-2xl text-blue-600"><TicketIcon /></div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase">Tickets Activos</p>
                <h4 className="text-2xl font-black text-[#1B2559]">{totalOpen}</h4>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-50">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-50 rounded-2xl text-red-600"><AlertTriangle /></div>
              <div>
                <p className="text-xs font-bold text-red-400 uppercase">SLA Incumplido</p>
                <h4 className="text-2xl font-black text-red-600 italic tracking-tighter">{slaViolations}</h4>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-50">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-50 rounded-2xl text-green-600"><CheckCircle /></div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase">Eficiencia</p>
                <h4 className="text-2xl font-black text-[#1B2559]">98.2%</h4>
              </div>
            </div>
          </div>
        </div>

        {/* Tabla de Auditoría */}
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-gray-50">
          <div className="p-6 border-b border-gray-50 flex justify-between items-center">
            <h3 className="text-lg font-black text-[#1B2559] italic uppercase">Trazabilidad de Servicios</h3>
            <button className="text-xs font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-xl">DESCARGAR ACTAS (PDF)</button>
          </div>
          <table className="w-full text-left">
            <thead className="bg-[#F4F7FE]">
              <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <th className="px-6 py-4">Nro Ticket</th>
                <th className="px-6 py-4">Equipo / Marca</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4">Tiempo Respuesta</th>
                <th className="px-6 py-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={5} className="text-center py-20 animate-pulse font-bold text-gray-300 italic">Sincronizando con base de datos del GAD...</td></tr>
              ) : tickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-blue-600 text-sm">#{ticket.ticket_number}</td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-[#1B2559]">{ticket.equipment?.brand} {ticket.equipment?.model}</p>
                    <p className="text-[10px] text-gray-400 font-mono">{ticket.equipment?.serial}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                      ticket.status === 'open' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {ticket.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-xs font-bold text-gray-600">
                      <Clock size={14} className="mr-1 text-blue-500" />
                      {ticket.response_time_minutes || 0} min
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="bg-[#111C44] text-white text-[10px] font-bold px-4 py-2 rounded-lg hover:bg-blue-600 transition-all uppercase">Detalle</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
