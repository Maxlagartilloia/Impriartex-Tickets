import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';
import DashboardLayout from './components/layout/DashboardLayout';
import SlaStats from './components/tickets/SlaStats';
import { AlertCircle, Plus } from 'lucide-react';

function App() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cargar datos de auditoría
  useEffect(() => {
    fetchTickets();
  }, []);

  async function fetchTickets() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tickets')
        .select(`
          *,
          equipment (model, serial, brand)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTickets(data || []);
    } catch (error) {
      console.error('Error cargando auditoría:', error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <DashboardLayout userRole="admin">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 italic">PANEL DE CONTROL DE SERVICIOS</h2>
            <p className="text-sm text-gray-500 uppercase tracking-widest">Cumplimiento de SLA y Trazabilidad</p>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold flex items-center transition-all shadow-lg">
            <Plus size={20} className="mr-2" />
            NUEVO TICKET DE SOPORTE
          </button>
        </div>

        {/* Estadísticas de Cumplimiento de Pliego */}
        <SlaStats stats={{
          open: tickets.filter(t => t.status !== 'closed').length,
          expired: tickets.filter(t => t.response_time_minutes > 240).length,
          closedToday: tickets.filter(t => t.status === 'closed').length,
          avgTime: 45 // Ejemplo estático hasta tener datos reales
        }} />

        {/* Tabla de Evidencia Técnica */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase italic">Ticket</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase italic">Equipo / Serial</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase italic">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase italic">SLA (4h)</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase italic">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="5" className="text-center py-10 text-gray-400 italic">Cargando registros de auditoría...</td></tr>
              ) : tickets.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-10 text-gray-400 italic">No hay tickets registrados en este contrato.</td></tr>
              ) : (
                tickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-900">
                      #{ticket.ticket_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {ticket.equipment?.brand} {ticket.equipment?.model} <br/>
                      <span className="text-xs text-gray-400">{ticket.equipment?.serial}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-[10px] font-bold rounded-full uppercase ${
                        ticket.status === 'open' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center text-green-600 font-medium">
                        <AlertCircle size={14} className="mr-1" />
                        Cumplido
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 font-bold uppercase text-xs">Ver Acta</button>
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
