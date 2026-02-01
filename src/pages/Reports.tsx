import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { 
  FileText, Download, Printer, PieChart, 
  BarChart3, CalendarDays, Loader2, ClipboardCheck 
} from 'lucide-react';

export default function ReportsPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // FUNCIÓN CORREGIDA: Usa el motor nativo para evitar bloqueos CSP
  const generatePDF = () => {
    toast({ 
      title: "Generando Reporte", 
      description: "Se abrirá la ventana de impresión. Selecciona 'Guardar como PDF'." 
    });
    window.print();
  };

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const { data: tickets, error } = await supabase
        .from('tickets')
        .select(`
          *,
          institution:institutions(name),
          equipment:equipment(brand, model, serial),
          technician:profiles!technician_id(full_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setData(tickets || []);
    } catch (err: any) {
      toast({ 
        title: "Error de conexión", 
        description: "No se pudieron obtener los datos para el reporte.", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, []);

  return (
    <MainLayout title="Generador de Reportes Ejecutivos">
      {/* HEADER DE ACCIÓN */}
      <div className="flex justify-between items-center mb-10 no-print">
        <div>
          <h2 className="text-[#0056b3] font-black uppercase text-xl tracking-tighter italic leading-none">Centro de Reportes</h2>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Generación de documentos certificados por fecha</p>
        </div>
        <button 
          onClick={generatePDF}
          className="bg-[#0056b3] text-white px-8 py-4 rounded-2xl font-black flex items-center gap-3 shadow-xl shadow-blue-500/20 hover:bg-[#004494] transition-all uppercase tracking-widest text-xs"
        >
          <Download size={18} /> Exportar Reporte PDF
        </button>
      </div>

      {/* VISTA PREVIA DEL REPORTE */}
      <div id="report-content" className="bg-white p-12 rounded-[2.5rem] shadow-sm border border-slate-100 max-w-5xl mx-auto font-serif text-slate-800 print:m-0 print:p-0 print:border-none print:shadow-none">
        
        {/* Encabezado PDF */}
        <div className="flex justify-between items-start border-b-4 border-[#0056b3] pb-8 mb-10">
          <div>
            <h1 className="text-4xl font-black text-[#0056b3] tracking-tighter leading-none">IMPRIARTEX</h1>
            <p className="text-[10px] font-bold tracking-[0.3em] text-slate-400 mt-2 uppercase">Soporte Técnico & Gestión de Activos</p>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-black uppercase tracking-tight italic mb-1 text-slate-700">Certificado de Servicio</h2>
            <p className="text-[10px] font-bold text-slate-500 uppercase">Periodo: {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {/* Resumen Ejecutivo */}
        <div className="grid grid-cols-3 gap-8 mb-12">
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-center">
            <p className="text-[9px] font-black text-slate-400 uppercase mb-2">Total Atenciones</p>
            <p className="text-3xl font-black text-[#0056b3]">{data.length}</p>
          </div>
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-center">
            <p className="text-[9px] font-black text-slate-400 uppercase mb-2">Efectividad SLA</p>
            <p className="text-3xl font-black text-emerald-600">98.2%</p>
          </div>
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-center">
            <p className="text-[9px] font-black text-slate-400 uppercase mb-2">Fecha Emisión</p>
            <p className="text-xl font-black text-slate-700 uppercase">{new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {/* Tabla Detallada */}
        <div className="mb-12">
          <h3 className="text-xs font-black text-[#0056b3] uppercase border-b-2 border-slate-100 pb-2 mb-6 flex items-center gap-2">
            <ClipboardCheck size={16} /> Detalle Cronológico de Intervenciones
          </h3>
          <table className="w-full text-left text-[10px] border-collapse uppercase">
            <thead>
              <tr className="bg-slate-900 text-white tracking-widest font-black">
                <th className="p-3">Fecha</th>
                <th className="p-3">Entidad / Cliente</th>
                <th className="p-3">Equipo (S/N)</th>
                <th className="p-3">Técnico</th>
                <th className="p-3">Trabajo Realizado</th>
                <th className="p-3 text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-bold">
              {loading ? (
                <tr><td colSpan={6} className="text-center py-10"><Loader2 className="animate-spin mx-auto text-[#0056b3]" /></td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-10 text-slate-400 uppercase text-[10px]">Sin datos registrados</td></tr>
              ) : (
                data.map((ticket) => (
                  <tr key={ticket.id} className="text-slate-700">
                    <td className="p-3">{new Date(ticket.created_at).toLocaleDateString()}</td>
                    <td className="p-3">{ticket.institution?.name}</td>
                    <td className="p-3">
                      <span className="text-[#0056b3]">{ticket.equipment?.brand} {ticket.equipment?.model}</span><br/>
                      <span className="text-[9px] text-slate-400 font-mono">SN: {ticket.equipment?.serial}</span>
                    </td>
                    <td className="p-3">{ticket.technician?.full_name || 'N/A'}</td>
                    <td className="p-3 italic">"{ticket.solution || ticket.description}"</td>
                    <td className="p-3 text-center">
                      <span className="bg-blue-50 text-[#0056b3] px-2 py-0.5 rounded text-[8px] font-black uppercase italic">
                        {ticket.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Firmas */}
        <div className="mt-24 flex justify-between gap-20">
          <div className="flex-1 border-t-2 border-slate-900 pt-4 text-center">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-900">Criss Lombeida</p>
            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Supervisor de Operaciones</p>
          </div>
          <div className="flex-1 border-t-2 border-slate-900 pt-4 text-center">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-900">Sello de Calidad</p>
            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Impriartex S.A.</p>
          </div>
        </div>
      </div>

      {/* CSS para impresión limpia */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .print\:m-0 { margin: 0 !important; }
          .print\:p-0 { padding: 0 !important; }
        }
      `}</style>
    </MainLayout>
  );
}
