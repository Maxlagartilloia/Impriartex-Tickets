import React, { useState, useMemo } from 'react';
import { FileBarChart, Download, Calendar, Filter, AlertCircle, CheckCircle } from 'lucide-react';
import { Ticket } from '../../types';

interface ReportProps {
  tickets: Ticket[];
}

const AuditReports: React.FC<ReportProps> = ({ tickets }) => {
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  // Lógica de Métricas Reales de Auditoría
  const metrics = useMemo(() => {
    const filtered = tickets.filter(t => {
      if (!dateRange.start || !dateRange.end) return true;
      const date = new Date(t.created_at);
      return date >= new Date(dateRange.start) && date <= new Date(dateRange.end);
    });

    const total = filtered.length;
    const closed = filtered.filter(t => t.status === 'closed').length;
    const slaViolations = filtered.filter(t => (t.response_time_minutes || 0) > 240).length; // > 4 horas
    const complianceRate = total > 0 ? ((total - slaViolations) / total) * 100 : 100;

    return { total, closed, slaViolations, complianceRate, filtered };
  }, [tickets, dateRange]);

  return (
    <div className="space-y-6">
      {/* Selector de Rango de Fechas (Diario, Semanal, Mensual) */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-wrap items-end gap-4">
        <div className="flex-1 min-w-[200px]">
          <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block tracking-widest">Rango de Auditoría</label>
          <div className="flex gap-2">
            <input 
              type="date" 
              className="w-full p-3 bg-gray-50 rounded-xl text-sm font-bold outline-none border-2 border-transparent focus:border-blue-500"
              onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
            />
            <input 
              type="date" 
              className="w-full p-3 bg-gray-50 rounded-xl text-sm font-bold outline-none border-2 border-transparent focus:border-blue-500"
              onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
            />
          </div>
        </div>
        <button className="bg-[#111C44] text-white px-6 py-3 rounded-xl font-black text-xs uppercase flex items-center gap-2 hover:bg-blue-600 transition-all">
          <Download size={18} /> Exportar Acta A4
        </button>
      </div>

      {/* Grid de Métricas Reales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-50">
          <p className="text-[10px] font-black text-gray-400 uppercase italic">Eficiencia de SLA</p>
          <h4 className={`text-2xl font-black mt-1 ${metrics.complianceRate < 90 ? 'text-red-600' : 'text-green-600'}`}>
            {metrics.complianceRate.toFixed(1)}%
          </h4>
        </div>
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-50">
          <p className="text-[10px] font-black text-gray-400 uppercase italic">Tickets en el Periodo</p>
          <h4 className="text-2xl font-black text-[#1B2559] mt-1">{metrics.total}</h4>
        </div>
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-50">
          <p className="text-[10px] font-black text-red-400 uppercase italic">Incumplimientos (4h)</p>
          <h4 className="text-2xl font-black text-red-600 mt-1">{metrics.slaViolations}</h4>
        </div>
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-50">
          <p className="text-[10px] font-black text-green-400 uppercase italic">Servicios Cerrados</p>
          <h4 className="text-2xl font-black text-green-600 mt-1">{metrics.closed}</h4>
        </div>
      </div>

      {/* Lista de Resultados del Reporte */}
      <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-gray-50">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase">
            <tr>
              <th className="p-4">Fecha</th>
              <th className="p-4">Ticket</th>
              <th className="p-4">Cliente</th>
              <th className="p-4">Técnico</th>
              <th className="p-4">Estado SLA</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-sm">
            {metrics.filtered.map(t => (
              <tr key={t.id} className="hover:bg-blue-50/30">
                <td className="p-4 font-medium">{new Date(t.created_at).toLocaleDateString()}</td>
                <td className="p-4 font-bold text-blue-600">#{t.ticket_number}</td>
                <td className="p-4 font-bold text-slate-700">GAD SD</td> {/* Esto vendrá de la relación */}
                <td className="p-4 text-gray-500 italic">Asignado</td>
                <td className="p-4">
                  {(t.response_time_minutes || 0) > 240 ? (
                    <span className="flex items-center gap-1 text-red-600 font-black text-[10px]"><AlertCircle size={12}/> FUERA DE SLA</span>
                  ) : (
                    <span className="flex items-center gap-1 text-green-600 font-black text-[10px]"><CheckCircle size={12}/> CUMPLIDO</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuditReports;
