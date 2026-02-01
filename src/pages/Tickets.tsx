import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import html2pdf from 'html2pdf.js';
import { 
  Ticket as TicketIcon, Wrench, X, Download, Loader2, 
  Timer, Settings2, Save, ClipboardList 
} from 'lucide-react';

export default function TicketsPage() {
  const { user, role } = useAuth();
  const { toast } = useToast();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showAttendModal, setShowAttendModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  
  const [form, setForm] = useState({
    diagnosis: '',
    solution: '',
    spare_parts: '', 
    toner_status: 'No cambiado', 
    arrival_time: '', 
    departure_time: '', 
    cntBW: 0,
    cntColor: 0
  });

  useEffect(() => {
    fetchTickets();
  }, [role, user]);

  const fetchTickets = async () => {
    setLoading(true);
    let query = supabase.from('tickets').select(`
      *,
      institution:institutions(name),
      equipment:equipment(model, serial)
    `);

    if (role === 'technician') query = query.eq('technician_id', user.id);
    if (role === 'client') query = query.eq('client_id', user.id);

    const { data, error } = await query.order('created_at', { ascending: false });

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

    // Usamos los nombres exactos de tu JSON de Supabase
    const { error } = await supabase
      .from('tickets')
      .update({
        status: 'completed',
        diagnosis: form.diagnosis,
        solution: form.solution,
        spare_parts: form.spare_parts,
        toner_status: form.toner_status,
        arrival_time: form.arrival_time ? new Date().toISOString().split('T')[0] + 'T' + form.arrival_time + ':00Z' : null,
        departure_time: form.departure_time ? new Date().toISOString().split('T')[0] + 'T' + form.departure_time + ':00Z' : null,
        counter_bn_final: form.cntBW,
        counter_color_final: form.cntColor,
      })
      .eq('id', selectedTicket.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Servicio Finalizado", description: "Reporte guardado correctamente.", variant: "success" });
      setShowAttendModal(false);
      fetchTickets();
    }
  };

  const exportPDF = (ticket: any) => {
    const element = document.getElementById(`pdf-content-${ticket.id}`);
    if (!element) return;
    element.style.display = 'block';
    const opt = {
      margin: 10,
      filename: `Reporte_Impriartex_${ticket.ticket_number}.pdf`,
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-red-500">
          <label className="text-slate-400 font-black text-[10px] uppercase tracking-widest block mb-1">Pendientes</label>
          <div className="text-3xl font-black text-slate-800">{tickets.filter(t => t.status === 'open').length}</div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-[#facc15]">
          <label className="text-slate-400 font-black text-[10px] uppercase tracking-widest block mb-1">En Atención</label>
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
              ) : (
                tickets.map(ticket => (
                  <tr key={ticket.id} className="hover:bg-slate-50 transition-colors text-xs">
                    <td className="p-4">
                      <div className="font-black text-slate-700">{new Date(ticket.created_at).toLocaleDateString()}</div>
                      <div className="font-bold text-[#0056b3] uppercase">{ticket.institution?.name}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-600 uppercase">{ticket.equipment?.model || 'S/M'}</div>
                      <div className="italic text-red-500 font-bold uppercase">{ticket.description}</div>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${
                        ticket.status === 'open' ? 'bg-red-100 text-red-600' : 
                        ticket.status === 'completed' ? 'bg-blue-100 text-[#0056b3]' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {ticket.status === 'open' ? 'Abierto' : ticket.status === 'completed' ? 'Cerrado' : 'Proceso'}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                        {ticket.status !== 'completed' && role !== 'client' ? (
                          <button onClick={() => { setSelectedTicket(ticket); setShowAttendModal(true); }} className="p-2 bg-[#facc15] text-[#0056b3] rounded-xl"><Wrench size={18} /></button>
                        ) : (
                          <button onClick={() => exportPDF(ticket)} className="p-2 bg-[#0056b3] text-white rounded-xl"><Download size={18} /></button>
                        )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAttendModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white max-w-2xl w-full p-8 rounded-[2rem] shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-[#0056b3] uppercase italic flex items-center gap-2">
                <Settings2 size={24} className="text-[#facc15]" /> Cerrar Reporte Técnico
              </h3>
              <button onClick={() => setShowAttendModal(false)} className="text-slate-400 hover:text-red-500"><X size={28} /></button>
            </div>

            <form onSubmit={handleCloseTicket} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border">
                  <label className="text-[10px] font-black text-slate-400 uppercase block mb-2">Hora Llegada</label>
                  <input type="time" required className="bg-transparent font-black text-[#0056b3] w-full" onChange={e => setForm({...form, arrival_time: e.target.value})} />
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border">
                  <label className="text-[10px] font-black text-slate-400 uppercase block mb-2">Hora Salida</label>
                  <input type="time" required className="bg-transparent font-black text-[#0056b3] w-full" onChange={e => setForm({...form, departure_time: e.target.value})} />
                </div>
              </div>

              <textarea placeholder="Diagnóstico..." className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-xs h-24" required onChange={e => setForm({...form, diagnosis: e.target.value})} />
              <textarea placeholder="Solución..." className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-xs h-24" required onChange={e => setForm({...form, solution: e.target.value})} />

              <div className="p-6 bg-blue-50/50 rounded-2xl border border-blue-100">
                <p className="text-[10px] font-black text-[#0056b3] uppercase mb-4 flex items-center gap-2"><ClipboardList size={14}/> Insumos</p>
                <div className="flex items-center gap-4 mb-4">
                  <input type="checkbox" id="toner_rep" className="w-5 h-5" onChange={e => setForm({...form, toner_status: e.target.checked ? 'Cambiado' : 'No cambiado'})} />
                  <label htmlFor="toner_rep" className="text-xs font-black uppercase">¿Cambio de Tóner?</label>
                </div>
                <input type="text" placeholder="Repuestos (Ej: Rodillo, Pickup...)" className="w-full p-4 bg-white border rounded-xl font-bold text-xs" onChange={e => setForm({...form, spare_parts: e.target.value})} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <input type="number" placeholder="Contador B/N" className="p-4 bg-slate-50 rounded-2xl font-black text-[#0056b3]" required onChange={e => setForm({...form, cntBW: parseInt(e.target.value)})} />
                <input type="number" placeholder="Contador Color" className="p-4 bg-slate-50 rounded-2xl font-black text-[#0056b3]" required onChange={e => setForm({...form, cntColor: parseInt(e.target.value)})} />
              </div>

              <button type="submit" className="w-full bg-[#0056b3] text-white font-black py-5 rounded-2xl uppercase text-xs flex items-center justify-center gap-2">
                <Save size={18} /> GUARDAR REPORTE FINAL
              </button>
            </form>
          </div>
        </div>
      )}

      {/* REPORTE PDF */}
      <div className="hidden">
        {tickets.map(t => (
          <div key={`pdf-${t.id}`} id={`pdf-content-${t.id}`} className="bg-white text-slate-900 p-12" style={{ width: '210mm' }}>
              <div className="flex justify-between items-start border-b-4 border-[#0056b3] pb-6 mb-8">
                <div><h1 className="text-3xl font-black text-[#0056b3]">IMPRIARTEX</h1><p className="text-[10px] uppercase font-bold text-slate-400">Soporte Técnico</p></div>
                <div className="text-right"><p className="font-black text-xl italic uppercase">Reporte Técnico</p><p className="text-[10px] font-bold">Ticket: #{t.ticket_number}</p></div>
              </div>
              <div className="grid grid-cols-2 gap-12 mb-8 text-xs font-bold uppercase">
                <div><p>Cliente: {t.institution?.name}</p><p>Ubicación: {t.physical_location || 'S/D'}</p></div>
                <div><p>Equipo: {t.equipment?.model}</p><p>S/N: {t.equipment?.serial}</p></div>
              </div>
              <div className="space-y-6">
                <div className="p-4 bg-slate-50 rounded-xl border"><h4 className="text-[10px] font-black text-[#0056b3] uppercase mb-2">Diagnóstico</h4><p className="text-[11px]">{t.diagnosis}</p></div>
                <div className="p-4 bg-slate-50 rounded-xl border"><h4 className="text-[10px] font-black text-[#0056b3] uppercase mb-2">Solución</h4><p className="text-[11px]">{t.solution}</p></div>
                <div className="p-4 border border-blue-100 rounded-xl"><h4 className="text-[10px] font-black text-[#0056b3] uppercase mb-2">Insumos</h4><p className="text-[11px]">Tóner: {t.toner_status}</p><p className="text-[11px]">Repuestos: {t.spare_parts || 'Ninguno'}</p></div>
              </div>
              <div className="flex justify-between mt-32"><div className="text-center w-64 border-t-2 border-slate-900 pt-2 text-[9px] font-black uppercase">Firma Técnico</div><div className="text-center w-64 border-t-2 border-slate-900 pt-2 text-[9px] font-black uppercase">Firma Cliente</div></div>
          </div>
        ))}
      </div>
    </MainLayout>
  );
}
