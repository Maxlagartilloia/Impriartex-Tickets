import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
// Eliminamos html2pdf para cumplir con la política de seguridad (CSP)
import { 
  FileText, Download, Printer, PieChart, 
  BarChart3, CalendarDays, Loader2, ClipboardCheck 
} from 'lucide-react';

export default function ReportsPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // FUNCIÓN CORREGIDA: Usa el motor nativo de impresión para máxima seguridad
  const generatePDF = () => {
    toast({ 
      title: "Generando Reporte", 
      description: "Se abrirá la ventana de impresión. Selecciona 'Guardar como PDF' en destino." 
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
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, []);

  // LÓGICA ENTERPRISE: Cálculos automáticos de facturación y SLA
  const totalBN = data.reduce((acc, t) => acc + (t.counter_bn_final || 0), 0);
  const totalColor = data.reduce((acc, t) => acc + (t.counter_color_final || 0), 0);
  const slaReal = data.length > 0 
    ? Math.round((data.filter(t => t.status === 'completed').length / data.length) * 100) 
    : 0;

  return (
    <MainLayout title="Generador de Reportes Ejecutivos">
      {/* HEADER DE ACCIÓN - No se imprime */}
      <div className="flex justify-between items-center mb-10 no-print">
        <div>
          <h2 className="text-[#0056b3] font-black uppercase text-xl tracking-tighter italic leading-none flex items-center gap-2">
            <BarChart3 size={24} /> Centro de Inteligencia
          </h2>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Generación de documentos certificados y métricas de consumo</p>
        </div>
        <button 
          onClick={generatePDF}
          className="bg-[#0056b3] text-white px-8 py-4 rounded-2xl font-black flex items-center gap-3 shadow-xl shadow-blue-500/20 hover:bg-[#004494] transition-all uppercase tracking-widest text-xs"
        >
          <Download size={18} /> Exportar Reporte PDF
        </button>
      </div>

      {/* DOCUMENTO CERTIFICADO - Lo que el cliente ve en el PDF */}
      <div id="report-content" className="bg-white p-12 rounded-[3rem] shadow-sm border border-slate-100 max-w-5xl mx-auto font-serif text-slate-800 print:m-0 print:p-0 print:border-none print:shadow-none">
        
        <div className="flex justify-between items-start border-b-4 border-[#0056b3] pb-8 mb-10">
          <div>
            <h1 className="text-4xl font-black text-[#0056b3] tracking-tighter leading-none italic">IMPRIARTEX</h1>
            <p className="text-[10px] font-bold tracking-[0.3em] text-slate-400 mt-2 uppercase">Soporte Técnico & Gestión de Activos SaaS</p>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-black uppercase tracking-tight italic mb-1 text-slate-700">Certificado de Servicio Consolidado</h2>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Emisión: {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {/* MÉTRICAS CLAVE PARA EL CLIENTE */}
        <div className="grid grid-cols-4 gap-6 mb-12">
          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 text-center">
            <p className="text-[9px] font-black text-slate-400 uppercase mb-2 italic">Atenciones</p>
            <p className="text-3xl font-black text-slate-800">{data.length}</p>
          </div>
          <div className="bg-[#0056b3] p-6 rounded-3xl text-white text-center shadow-lg shadow-blue-500/20">
            <p className="text-[9px] font-black uppercase mb-2 italic opacity-80">Efectividad SLA</p>
            <p className="text-3xl font-black">{slaReal}%</p>
          </div>
          <div className="bg-slate-900 p-6 rounded-3xl text-white text-center">
            <p className="text-[9px] font-black text-[#facc15] uppercase mb-2 italic">Total B/N</p>
            <p className="text-2xl font-black text-[#facc15]">{totalBN.toLocaleString()}</p>
          </div>
          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 text-center">
            <p className="text-[9px] font-black text-slate-400 uppercase mb-2 italic">Total Color</p>
            <p className="text-2xl font-black text-[#0056b3]">{totalColor.toLocaleString()}</p>
          </div>
        </div>

        <div className="mb-12">
          <h3 className="text-xs font-black text-[#0056b3] uppercase border-b-2 border-slate-100 pb-2 mb-6 flex items-center gap-2 tracking-widest">
            <ClipboardCheck size={18} className="text-[#facc15]" /> Detalle Cronológico de Intervenciones
          </h3>
          <table className="w-full text-left text-[10px] border-collapse uppercase">
            <thead>
              <tr className="bg-slate-900 text-white tracking-widest font-black italic">
                <th className="p-4 rounded-l-xl">Fecha</th>
                <th className="p-4">Entidad / Cliente</th>
                <th className="p-4">Equipo (S/N)</th>
                <th className="p-4">Contadores (B/N - C)</th>
                <th className="p-4">Técnico</th>
                <th className="p-4 text-center rounded-r-xl">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-bold">
              {loading ? (
                <tr><td colSpan={6} className="text-center py-20"><Loader2 className="animate-spin mx-auto text-[#0056b3]" size={32} /></td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-20 text-slate-400 italic">No se registran datos en este periodo</td></tr>
              ) : (
                data.map((ticket) => (
                  <tr key={ticket.id} className="text-slate-700 hover:bg-slate-50 transition-colors">
                    <td className="p-4">{new Date(ticket.created_at).toLocaleDateString()}</td>
                    <td className="p-4">{ticket.institution?.name}</td>
                    <td className="p-4">
                      <span className="text-[#0056b3]">{ticket.equipment?.brand} {ticket.equipment?.model}</span><br/>
                      <span className="text-[9px] text-slate-400 font-mono italic">SN: {ticket.equipment?.serial}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="text-slate-800">{ticket.counter_bn_final?.toLocaleString() || 0}</span>
                        <span className="text-[#0056b3]">{ticket.counter_color_final?.toLocaleString() || 0}</span>
                      </div>
                    </td>
                    <td className="p-4 italic text-slate-900">{ticket.technician?.full_name || 'N/A'}</td>
                    <td className="p-4 text-center">
                      <span className="bg-blue-50 text-[#0056b3] px-3 py-1 rounded-full text-[8px] font-black uppercase italic">
                        {ticket.status === 'completed' ? 'Cerrado' : 'Pendiente'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-32 flex justify-between gap-20">
          <div className="flex-1 border-t-2 border-slate-900 pt-4 text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900">Criss Lombeida</p>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Supervisor de Operaciones - Impriartex</p>
          </div>
          <div className="flex-1 border-t-2 border-slate-900 pt-4 text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900">Sello de Calidad SaaS</p>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Garantía de Soporte Técnico</p>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; margin: 0; padding: 0; }
          #report-content { border: none !important; shadow: none !important; max-width: 100% !important; }
        }
      `}</style>
    </MainLayout>
  );
}
