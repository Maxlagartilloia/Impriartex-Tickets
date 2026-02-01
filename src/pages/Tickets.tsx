import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import html2pdf from 'html2pdf.js';
import { Ticket as TicketIcon, Tools, X, Download, Loader2 } from 'lucide-react';

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

    // Temporalmente mostrar para capturar
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
      {/* KPIs Superiores */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-card/50 backdrop-blur-md border-l-4 border-destructive p-6 rounded-xl border border-white/5">
          <label className="text-muted-foreground font-bold block mb-1">Abiertos</label>
          <div className="text-3xl font-black">{tickets.filter(t => t.status === 'open').length}</div>
        </div>
        <div className="bg-card/50 backdrop-blur-md border-l-4 border-warning p-6 rounded-xl border border-white/5">
          <label className="text-muted-foreground font-bold block mb-1">En Proceso</label>
          <div className="text-3xl font-black">{tickets.filter(t => t.status === 'in_progress').length}</div>
        </div>
        <div className="bg-card/50 backdrop-blur-md border-l-4 border-success p-6 rounded-xl border border-white/5">
          <label className="text-muted-foreground font-bold block mb-1">Finalizados</label>
          <div className="text-3xl font-black">{tickets.filter(t => t.status === 'completed').length}</div>
        </div>
      </div>

      <div className="bg-card/30 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm">
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <h3 className="font-bold flex items-center gap-2 text-lg text-white">
            <TicketIcon className="text-primary" /> Tickets de Servicio
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-slate-400 text-xs uppercase tracking-wider">
                <th className="p-4">Fecha / Cliente</th>
                <th className="p-4">Equipo / Falla</th>
                <th className="p-4">Estado</th>
                <th className="p-4 text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={4} className="text-center py-20"><Loader2 className="animate-spin mx-auto text-primary" /></td></tr>
              ) : tickets.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-10 text-muted-foreground">No hay tickets registrados.</td></tr>
              ) : (
                tickets.map(ticket => (
                  <tr key={ticket.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-slate-100">{new Date(ticket.created_at).toLocaleDateString()}</div>
                      <div className="text-xs text-muted-foreground">{ticket.institution?.name}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-slate-200">{ticket.equipment?.name || 'Genérico'}</div>
                      <div className="text-xs italic text-destructive/80 font-semibold">{ticket.title}</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        ticket.status === 'open' ? 'bg-destructive/20 text-destructive border border-destructive/20' : 
                        ticket.status === 'in_progress' ? 'bg-warning/20 text-warning border border-warning/20' : 
                        'bg-success/20 text-success border border-success/20'
                      }`}>
                        {ticket.status === 'open' ? 'Abierto' : ticket.status === 'in_progress' ? 'En Proceso' : 'Finalizado'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        {ticket.status !== 'completed' ? (
                          <button 
                            onClick={() => { setSelectedTicket(ticket); setShowAttendModal(true); }}
                            className="p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary hover:text-white transition-all shadow-lg shadow-primary/10"
                            title="Atender"
                          >
                            <Tools size={18} />
                          </button>
                        ) : (
                          <button 
                            onClick={() => exportPDF(ticket)}
                            className="p-2 bg-success/10 text-success rounded-lg hover:bg-success hover:text-white transition-all shadow-lg shadow-success/10"
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
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-white/10 max-w-lg w-full p-8 rounded-3xl shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black flex items-center gap-2 text-white">
                <Tools className="text-primary" /> ATENDER SERVICIO
              </h3>
              <button onClick={() => setShowAttendModal(false)} className="text-slate-400 hover:text-white"><X /></button>
            </div>
            <form onSubmit={handleCloseTicket} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Diagnóstico Técnico</label>
                <textarea 
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-slate-200 focus:border-primary outline-none transition-all h-24" 
                  required 
                  onChange={e => setForm({...form, diagnosis: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Solución Aplicada</label>
                <textarea 
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-slate-200 focus:border-primary outline-none transition-all h-24" 
                  required
                  onChange={e => setForm({...form, solution: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Contador B/N</label>
                  <input type="number" className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-slate-200 focus:border-primary outline-none" required onChange={e => setForm({...form, cntBW: parseInt(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Contador Color</label>
                  <input type="number" className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-slate-200 focus:border-primary outline-none" required onChange={e => setForm({...form, cntColor: parseInt(e.target.value)})} />
                </div>
              </div>
              <button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 transition-all transform hover:scale-[1.02]">
                FINALIZAR Y CERRAR TICKET
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Contenedor Oculto para PDF */}
      <div className="hidden">
        {tickets.map(t => (
          <div key={`pdf-${t.id}`} id={`pdf-content-${t.id}`} className="bg-white text-black p-10" style={{ width: '210mm' }}>
              <div className="flex justify-between items-start border-b-2 border-slate-900 pb-5 mb-5">
                <div>
                  <h1 className="text-2xl font-black">IMPRIARTEX</h1>
                  <p className="text-sm">SOPORTE TÉCNICO ESPECIALIZADO</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">REPORTE DE SERVICIO</p>
                  <p className="text-xs">Ticket: #{t.ticket_number || t.id.slice(0,8)}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-10 mb-8">
                <div>
                  <h4 className="font-bold border-b border-slate-200 mb-2">DATOS DEL CLIENTE</h4>
                  <p className="text-sm"><strong>Institución:</strong> {t.institution?.name}</p>
                  <p className="text-sm"><strong>Fecha Reporte:</strong> {new Date(t.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <h4 className="font-bold border-b border-slate-200 mb-2">DATOS DEL EQUIPO</h4>
                  <p className="text-sm"><strong>Equipo:</strong> {t.equipment?.name}</p>
                  <p className="text-sm"><strong>S/N:</strong> {t.equipment?.serial_number}</p>
                </div>
              </div>

              <div className="mb-8">
                <h4 className="font-bold border-b border-slate-200 mb-2 text-destructive">FALLA REPORTADA</h4>
                <p className="text-sm p-4 bg-slate-50 rounded italic">"{t.title}"</p>
              </div>

              <div className="grid grid-cols-1 gap-6 mb-10">
                <div className="p-4 border border-slate-200 rounded">
                  <h4 className="font-bold mb-2">DIAGNÓSTICO TÉCNICO</h4>
                  <p className="text-sm whitespace-pre-wrap">{t.diagnosis}</p>
                </div>
                <div className="p-4 border border-slate-200 rounded">
                  <h4 className="font-bold mb-2">SOLUCIÓN APLICADA</h4>
                  <p className="text-sm whitespace-pre-wrap">{t.solution}</p>
                </div>
              </div>

              <div className="flex justify-between mt-20">
                <div className="text-center w-64 border-t border-slate-900 pt-2">
                  <p className="text-xs font-bold">FIRMA TÉCNICO RESPONSABLE</p>
                </div>
                <div className="text-center w-64 border-t border-slate-900 pt-2">
                  <p className="text-xs font-bold">RECIBIDO CONFORME (CLIENTE)</p>
                </div>
              </div>
          </div>
        ))}
      </div>
    </MainLayout>
  );
}
