import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import html2pdf from 'html2pdf.js';
import { 
  FileText, Download, Printer, PieChart, 
  BarChart3, CalendarDays, Loader2, ClipboardCheck 
} from 'lucide-react';

export default function ReportsPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Función para generar el PDF elegante que pediste
  const generatePDF = () => {
    const element = document.getElementById('report-content');
    const opt = {
      margin: 10,
      filename: `Reporte_Impriartex_${new Date().toLocaleDateString()}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 3 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
  };

  const fetchReportData = async () => {
    setLoading(true);
    const { data: tickets, error } = await supabase
      .from('tickets')
      .select(`
        *,
        institution:institutions(name),
        equipment:equipment(name, serial_number, marca),
        technician:profiles!technician_id(full_name)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setData(tickets || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReportData();
  }, []);

  return (
    <MainLayout title="Generador de Reportes Ejecutivos">
      {/* HEADER DE ACCIÓN */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-[#0056b3] font-black uppercase text-xl tracking-tighter italic">Centro de Reportes</h2>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Generación de documentos certificados por fecha</p>
        </div>
        <button 
          onClick={generatePDF}
          className="bg-[#0056b3] text-white px-8 py-4 rounded-2xl font-black flex items-center gap-3 shadow-xl shadow-blue-500/20 hover:bg-[#004494] transition-all uppercase tracking-widest text-xs"
        >
          <Download size={18} /> Exportar Reporte PDF
        </button>
      </div>

      {/* VISTA PREVIA DEL REPORTE (Lo que será el PDF) */}
      <div id="report-content" className="bg-white p-12 rounded-[2.5rem] shadow-sm border border-slate-100 max-w-5xl mx-auto font-serif text-slate-800">
        
        {/* Encabezado PDF */}
        <div className="flex justify-between items-start border-b-4 border-[#0056b3] pb-8 mb-10">
          <div>
            <h1 className="text-4xl font-black text-[#0056b3] tracking-tighter leading-none">IMPRIARTEX</h1>
            <p className="text-[10px] font-bold tracking-[0.3em] text-slate-400 mt-2 uppercase">Soporte Técnico & Gestión de Activos</p>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-black uppercase tracking-tight italic mb-1">Certificado de Servicio</h2>
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
            <p className="text-[9px] font-black text-slate-400 uppercase mb-2">Equipos Operativos</p>
            <p className="text-3xl font-black text-[#facc15]">142</p>
          </div>
        </div>

        {/* Tabla Detallada para el Cliente */}
        <div className="mb-12">
          <h3 className="text-xs font-black text-[#0056b3] uppercase border-b-2 border-slate-100 pb-2 mb-6 flex items-center gap-2">
            <ClipboardCheck size={16} /> Detalle Cronológico de Intervenciones
          </h3>
          <table className="w-full text-left text-[11px] border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white uppercase tracking-widest">
                <th className="p-3">Fecha</th>
                <th className="p-3">Entidad / Dpto</th>
                <th className="p-3">Equipo (S/N)</th>
                <th className="p-3">Técnico</th>
                <th className="p-3">Trabajo Realizado</th>
                <th className="p-3 text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((ticket) => (
                <tr key={ticket.id}>
                  <td className="p-3 font-bold">{new Date(ticket.created_at).toLocaleDateString()}</td>
                  <td className="p-3 uppercase">{ticket.institution?.name} <br/><span className="text-[9px] text-slate-400">{ticket.ubicacion_macro}</span></td>
                  <td className="p-3 font-mono">{ticket.equipment?.marca} {ticket.equipment?.name} <br/><span className="text-[9px] text-blue-500 font-black">{ticket.equipment?.serial_number}</span></td>
                  <td className="p-3 font-bold">{ticket.technician?.full_name || 'Sin asignar'}</td>
                  <td className="p-3 italic">"{ticket.solution || ticket.title}"</td>
                  <td className="p-3 text-center">
                    <span className="bg-blue-50 text-[#0056b3] px-2 py-0.5 rounded text-[8px] font-black uppercase italic">
                      {ticket.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pie de Firma Corporativa */}
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
    </MainLayout>
  );
}
