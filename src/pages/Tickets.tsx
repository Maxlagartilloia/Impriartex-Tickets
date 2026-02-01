import { useEffect, useState, useRef } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import html2pdf from 'html2pdf.js';
import { Ticket as TicketIcon, Tools, FileText, X, Eye, Download, Loader2 } from 'lucide-react';

export default function TicketsPage() {
  const { user, isSupervisor } = useAuth();
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

    if (data) setTickets(data);
    setLoading(false);
  };

  const handleCloseTicket = async (e: React.FormEvent) => {
    e.preventDefault();
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
      toast({ title: "Ticket cerrado", description: "El servicio ha sido registrado con éxito." });
      setShowAttendModal(false);
      fetchTickets();
    }
  };

  const exportPDF = (ticket: any) => {
    const element = document.getElementById(`pdf-content-${ticket.id}`);
    const opt = {
      margin: 10,
      filename: `Reporte_${ticket.ticket_number}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
  };

  return (
    <MainLayout title="Centro de Gestión de Servicios">
      {/* KPIs Superiores - Idéntico a tu diseño */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card-3d border-l-4 border-destructive p-6 text-center">
          <label className="text-muted-foreground font-bold">Abiertos</label>
          <div className="text-3xl font-black">{tickets.filter(t => t.status === 'open').length}</div>
        </div>
        <div className="card-3d border-l-4 border-warning p-6 text-center">
          <label className="text-muted-foreground font-bold">En Proceso</label>
          <div className="text-3xl font-black">{tickets.filter(t => t.status === 'in_progress').length}</div>
        </div>
        <div className="card-3d border-l-4 border-success p-6 text-center">
          <label className="text-muted-foreground font-bold">Finalizados</label>
          <div className="text-3xl font-black">{tickets.filter(t => t.status === 'completed').length}</div>
        </div>
      </div>

      <div className="card-3d overflow-hidden">
        <div className="p-6 border-b border-border flex justify-between items-center">
          <h3 className="font-bold flex items-center gap-2 text-lg"><TicketIcon className="text-primary" /> Tickets de Servicio</h3>
        </div>
        
        <table className="table-enterprise">
          <thead>
            <tr>
              <th>Fecha / Cliente</th>
              <th>Equipo / Falla</th>
              <th>Estado</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="text-center py-10"><Loader2 className="animate-spin mx-auto" /></td></tr>
            ) : (
              tickets.map(ticket => (
                <tr key={ticket.id}>
                  <td>
                    <div className="font-bold">{new Date(ticket.created_at).toLocaleDateString()}</div>
                    <div className="text-xs text-muted-foreground">{ticket.institution?.name}</div>
                  </td>
                  <td>
                    <div className="font-medium">{ticket.equipment?.name || 'Genérico'}</div>
                    <div className="text-xs italic text-destructive">{ticket.title}</div>
                  </td>
                  <td>
                    <span className={`status-badge status-${ticket.status}`}>
                      {ticket.status === 'open' ? 'Abierto' : ticket.status === 'in_progress' ? 'En Proceso' : 'Finalizado'}
                    </span>
                  </td>
                  <td className="flex gap-2">
                    {ticket.status !== 'completed' ? (
                      <button 
                        onClick={() => { setSelectedTicket(ticket); setShowAttendModal(true); }}
                        className="p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary hover:text-white transition-all"
                        title="Atender"
                      >
                        <Tools size={18} />
                      </button>
                    ) : (
                      <button 
                        onClick={() => exportPDF(ticket)}
                        className="p-2 bg-success/10 text-success rounded-lg hover:bg-success hover:text-white transition-all"
                        title="Descargar Reporte"
                      >
                        <Download size={18} />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de Atención (Cierre de Ticket) */}
      {showAttendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="card-3d max-w-lg w-full p-6 animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold flex items-center gap-2"><Tools className="text-primary" /> Atender Servicio</h3>
              <button onClick={() => setShowAttendModal(false)}><X /></button>
            </div>
            <form onSubmit={handleCloseTicket} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold">Diagnóstico Técnico</label>
                <textarea 
                  className="input-enterprise h-24" 
                  required 
                  onChange={e => setForm({...form, diagnosis: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Solución Aplicada</label>
                <textarea 
                  className="input-enterprise h-24" 
                  required
                  onChange={e => setForm({...form, solution: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Contador B/N</label>
                  <input type="number" className="input-enterprise" required onChange={e => setForm({...form, cntBW: parseInt(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Contador Color</label>
                  <input type="number" className="input-enterprise" required onChange={e => setForm({...form, cntColor: parseInt(e.target.value)})} />
                </div>
              </div>
              <button type="submit" className="btn-primary-3d w-full mt-4">Finalizar y Cerrar Ticket</button>
            </form>
          </div>
        </div>
      )}

      {/* Contenedor Oculto para Generación de PDF */}
      {tickets.map(t => (
        <div key={`pdf-${t.id}`} id={`pdf-content-${t.id}`} style={{ display: 'none' }}>
           <div style={{ padding: '40px', fontFamily: 'sans-serif' }}>
              <h1 style={{ textAlign: 'center', color: '#1e293b' }}>IMPRIARTEX - REPORTE TÉCNICO</h1>
              <hr />
              <p><strong>Nro Ticket:</strong> {t.ticket_number}</p>
              <p><strong>Cliente:</strong> {t.institution?.name}</p>
              <p><strong>Equipo:</strong> {t.equipment?.name} (S/N: {t.equipment?.serial_number})</p>
              <p><strong>Diagnóstico:</strong> {t.diagnosis}</p>
              <p><strong>Solución:</strong> {t.solution}</p>
              <div style={{ marginTop: '50px', borderTop: '1px solid #000', width: '200px', textAlign: 'center' }}>
                Firma del Técnico
              </div>
           </div>
        </div>
      ))}
    </MainLayout>
  );
}
