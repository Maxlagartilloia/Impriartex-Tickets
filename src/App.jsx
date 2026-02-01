import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';
import DashboardLayout from './components/layout/DashboardLayout';
import SlaStats from './components/tickets/SlaStats';
import { AlertCircle, Plus, Printer, CheckCircle2, Clock } from 'lucide-react';

function App() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInitialData = async () => {
      const { data } = await supabase
        .from('tickets')
        .select('*, equipment(brand, model, serial)')
        .order('created_at', { ascending: false });
      setTickets(data || []);
      setLoading(false);
    };
    fetchInitialData();
  }, []);

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-6">
        {/* Encabezado de Auditoría */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter italic">AUDITORÍA GAD SD 2026</h1>
            <p className="text-slate-500 font-medium uppercase text-xs tracking-widest">Panel de Control de Cumplimiento Contractual</p>
          </div>
          <div className="bg-white border-2 border-slate-900 p-2 px-4 font-bold text-sm shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
            SLA REQUERIDO: 04:00:00 HS
          </div>
        </div>

        <SlaStats stats={{
          open: tickets.length,
          expired: tickets.filter(t => t.response_time_minutes > 240).length,
          closedToday: 0,
          avgTime: "N/A"
        }} />

        {/* Tabla de Evidencias */}
        <div className="bg-white border border-slate-200 rounded-none shadow-xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white uppercase text-[10px] tracking-widest">
                <th className="p-4">Nro Ticket</th>
                <th className="p-4">Equipo (Inventario GAD)</th>
                <th className="p-4">Prioridad</th>
                <th className="p-4">Estado SLA</th>
                <th className="p-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="5" className="p-10 text-center animate-pulse font-bold text-slate-400">SINCRONIZANDO CON SUPABASE...</td></tr>
              ) : tickets.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-20 text-center">
                    <div className="flex flex-col items-center opacity-20">
                      <Printer size={64} />
                      <p className="font-black italic mt-4">NO HAY TICKETS ACTIVOS</p>
                    </div>
                  </td>
                </tr>
              ) : (
                tickets.map(ticket => (
                  <tr key={ticket.id} className="hover:bg-blue-50/50 transition-colors">
                    <td className="p-4 font-mono font-bold text-blue-600">#{ticket.ticket_number}</td>
                    <td className="p-4">
                      <div className="font-bold text-slate-800">{ticket.equipment?.brand} {ticket.equipment?.model}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{ticket.equipment?.serial}</div>
                    </td>
                    <td className="p-4">
                      <span className="bg-slate-100 text-slate-600 px-2 py-1 text-[10px] font-black uppercase rounded">
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center text-green-600 text-xs font-bold">
                        <CheckCircle2 size={14} className="mr-1" /> CUMPLIDO
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <button className="bg-slate-900 text-white text-[10px] font-bold px-3 py-1 hover:invert transition-all uppercase">Detalles</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default App;
