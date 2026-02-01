import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import html2pdf from 'html2pdf.js';
// CORRECCIÓN CLAVE: Se cambió 'Tools' por 'Wrench' para que Netlify no falle
import { Ticket as TicketIcon, Wrench, X, Download, Loader2 } from 'lucide-react';

export default function TicketsPage() {
  const { role } = useAuth();
  const { toast } = useToast();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para los Modales
  const [showAttendModal, setShowAttendModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  
  // Formulario de Cierre de Ticket
  const [form, setForm] = useState({
    diagnosis: '',
    solution: '',
    cntBW: 0,
    cntColor: 0
  });

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('tickets')
      .select(`
        *,
        institution:institutions(name),
        equipment:equipment(name, serial_number)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: "Error", description: "No se pudieron cargar los tickets", variant: "destructive" });
    } else {
      setTickets(data || []);
    }
    setLoading(false);
  };

  const handleCloseTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;

    const { error } = await supabase
      .from('tickets')
      .update({
        status: 'completed',
        diagnosis: form.diagnosis,
        solution: form.solution,
        counter_bn_final: form.cntBW,
        counter_color_final: form.cntColor,
        closed_at: new Date().toISOString()
      })
      .eq('id', selectedTicket.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Ticket cerrado", description: "El servicio ha sido registrado con éxito.", variant: "success" });
      setShowAttendModal(false);
      fetchTickets();
    }
  };

  const exportPDF = (ticket: any) => {
    const element = document.getElementById(`pdf-content-${ticket.id}`);
    if (!element) return;

    // Mostrar para capturar
    element.style.display = 'block';

    const opt = {
      margin: 10,
      filename: `Reporte_${ticket.ticket_number || 'S-N'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save().then(() => {
      element.style.display = 'none';
    });
  };

  return (
    <MainLayout title="Centro de Gestión de Servicios">
      {/* KPIs Superiores con colores corporativos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-red-500">
          <label className="text-slate-400 font-black text-[10px] uppercase tracking-widest block mb-1">Abiertos</label>
          <div className="text-3xl font-black text-slate-800">{tickets.filter(t => t.status === 'open').length}</div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-[#facc15]">
          <label className="text-slate-400 font-black text-[10px] uppercase tracking-widest block mb-1">En Proceso</label>
          <div className="text-3xl font-black text-slate-800">{tickets.filter(t => t.status === 'in_progress').length}</div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-[#0056b3]">
          <label className="text-slate-400 font-black text-[10px] uppercase tracking-widest block mb-1">Finalizados</label>
          <div className="text-3xl font-black text-slate-800">{tickets.filter(t => t.status === 'completed').length}</div>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-black flex items-center gap-2 text-lg text-[#0056b3] uppercase tracking-tight">
            <TicketIcon size={20} /> Tickets de Servicio
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0056b3] text-white text-[10px] uppercase tracking-widest">
                <th className="p-4">Fecha / Cliente</th>
                <th className="p-4">Equipo / Falla</th>
                <th className="p-4">Estado</th>
                <th className="p-4 text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={4} className="text-center py-20"><Loader2 className="animate-spin mx-auto text-[#0056b3]" size={32} /></td></tr>
              ) : tickets.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-10 text-slate-400 font-bold uppercase text-xs">No hay tickets registrados.</td></tr>
              ) : (
                tickets.map(ticket => (
                  <tr key={ticket.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="font-black text-slate-700">{new Date(ticket.created_at).toLocaleDateString()}</div>
                      <div className="text-[10px] font-bold text-[#0056b3] uppercase">{ticket.institution?.name}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-600 uppercase text-xs">{ticket.equipment?.name || 'Genérico'}</div>
                      <div className="text-[10px] italic text-red-500 font-bold uppercase">{ticket.title}</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${
                        ticket.status === 'open' ? 'bg-red-100 text-red-600' : 
                        ticket.status === 'in_progress' ? 'bg-amber-100 text-amber-700' : 
                        'bg-blue-100 text-[#0056b3]'
                      }`}>
                        {ticket.status === 'open' ? 'Abierto' : ticket.status === 'in_progress' ? 'En Proceso' : 'Finalizado'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        {ticket.status !== 'completed' ? (
                          <button 
                            onClick={() => { setSelectedTicket(ticket); setShowAttendModal(true); }}
                            className="p-2 bg-[#facc15] text-[#0056b3] rounded-xl hover:bg-[#eab308] transition-all shadow-md shadow-yellow-500/10"
                            title="Atender"
                          >
                            <Wrench size={18} />
                          </button>
                        ) : (
                          <button 
                            onClick={() => exportPDF(ticket)}
                            className="p-2 bg-[#0056b3] text-white rounded-xl hover:bg-[#004494] transition-all shadow-md shadow-blue-500/10"
                            title="Descargar Reporte"
                          >
                            <Download size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Atención */}
      {showAttendModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white max-w-lg w-full p-8 rounded-3xl shadow-2xl animate-in zoom-in-95 border border-slate-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black flex items-center gap-2 text-[#0056b3] uppercase tracking-tighter">
                <Wrench size={24} /> ATENDER SERVICIO
              </h3>
              <button onClick={() => setShowAttendModal(false)} className="text-slate-400 hover:text-red-500 transition-colors"><X size={24} /></button>
            </div>
            <form onSubmit={handleCloseTicket} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Diagnóstico Técnico</label>
                <textarea 
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-700 focus:border-[#0056b3] focus:bg-white outline-none transition-all h-24 font-medium" 
                  required 
                  onChange={e => setForm({...form, diagnosis: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Solución Aplicada</label>
                <textarea 
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-700 focus:border-[#0056b3] focus:bg-white outline-none transition-all h-24 font-medium" 
                  required
                  onChange={e => setForm({...form, solution: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contador B/N</label>
                  <input type="number" className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-700 focus:border-[#0056b3] outline-none" required onChange={e => setForm({...form, cntBW: parseInt(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contador Color</label>
                  <input type="number" className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-700 focus:border-[#0056b3] outline-none" required onChange={e => setForm({...form, cntColor: parseInt(e.target.value)})} />
                </div>
              </div>
              <button type="submit" className="w-full bg-[#0056b3] hover:bg-[#004494] text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-500/20 transition-all uppercase tracking-widest mt-4">
                FINALIZAR Y CERRAR TICKET
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Contenedor Oculto para PDF Corporativo */}
      <div className="hidden">
        {tickets.map(t => (
          <div key={`pdf-${t.id}`} id={`pdf-content-${t.id}`} className="bg-white text-slate-900 p-12" style={{ width: '210mm' }}>
              <div className="flex justify-between items-start border-b-4 border-[#0056b3] pb-6 mb-8">
                <div>
                  <h1 className="text-3xl font-black text-[#0056b3] tracking-tighter leading-none">IMPRIARTEX</h1>
                  <p className="text-[10px] font-bold tracking-[0.2em] text-slate-400 mt-1">SOPORTE TÉCNICO ESPECIALIZADO</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-xl uppercase tracking-tight italic">REPORTE TÉCNICO</p>
                  <p className="text-[10px] font-bold text-slate-500">TICKET: #{t.ticket_number || t.id.slice(0,8).toUpperCase()}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-12 mb-10">
                <div className="space-y-1">
                  <h4 className="text-[10px] font-black text-[#0056b3] uppercase border-b border-slate-100 pb-1 mb-2">Información del Cliente</h4>
                  <p className="text-xs"><strong>CLIENTE:</strong> {t.institution?.name}</p>
                  <p className="text-xs"><strong>FECHA:</strong> {new Date(t.created_at).toLocaleString()}</p>
                </div>
                <div className="space-y-1">
                  <h4 className="text-[10px] font-black text-[#0056b3] uppercase border-b border-slate-100 pb-1 mb-2">Detalles del Equipo</h4>
                  <p className="text-xs"><strong>MODELO:</strong> {t.equipment?.name}</p>
                  <p className="text-xs"><strong>SERIE:</strong> {t.equipment?.serial_number}</p>
                </div>
              </div>

              <div className="mb-10 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <h4 className="text-[10px] font-black text-red-600 uppercase mb-2">Incidencia Reportada</h4>
                <p className="text-sm font-bold italic text-slate-700">"{t.title}"</p>
              </div>

              <div className="grid grid-cols-1 gap-8 mb-16">
                <div>
                  <h4 className="text-[10px] font-black text-[#0056b3] uppercase mb-2">Diagnóstico del Técnico</h4>
                  <div className="text-sm text-slate-600 bg-white border border-slate-100 p-4 rounded-xl min-h-[100px] whitespace-pre-wrap">{t.diagnosis}</div>
                </div>
                <div>
                  <h4 className="text-[10px] font-black text-[#0056b3] uppercase mb-2">Solución Técnica Aplicada</h4>
                  <div className="text-sm text-slate-600 bg-white border border-slate-100 p-4 rounded-xl min-h-[100px] whitespace-pre-wrap">{t.solution}</div>
                </div>
              </div>

              <div className="flex justify-between mt-32 gap-20">
                <div className="text-center flex-1 border-t-2 border-slate-900 pt-4">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-900">Firma Técnico Autorizado</p>
                </div>
                <div className="text-center flex-1 border-t-2 border-slate-900 pt-4">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-900">Recibido Conforme (Cliente)</p>
                </div>
              </div>
          </div>
        ))}
      </div>
    </MainLayout>
  );
}
