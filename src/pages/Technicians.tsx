import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { 
  Wrench, Plus, UserCheck, 
  Mail, Phone, Shield, Loader2, X, Fingerprint, Activity
} from 'lucide-react';

export default function TechniciansPage() {
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const { toast } = useToast();

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    specialty: 'Técnico General',
    employee_id: '', // Código de acceso para el técnico
    role: 'technician'
  });

  useEffect(() => {
    fetchTechnicians();
  }, []);

  const fetchTechnicians = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'technician')
      .order('full_name');

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      setTechnicians(data || []);
    }
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Insertamos al técnico con su ID de empleado para el login
    const { error } = await supabase.from('profiles').insert([{
      ...form,
      status: 'active' // Por defecto entra como activo para recibir tickets
    }]);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Éxito', description: `Técnico ${form.full_name} habilitado con ID: ${form.employee_id}`, variant: 'success' });
      setShowModal(false);
      setForm({ full_name: '', email: '', phone: '', specialty: 'Técnico General', employee_id: '', role: 'technician' });
      fetchTechnicians();
    }
  };

  return (
    <MainLayout title="Gestión de Equipo Técnico">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.2em]">Operatividad de Campo</p>
          <h2 className="text-slate-400 text-[10px] font-medium uppercase mt-1">Supervisión de técnicos y asignaciones automáticas</h2>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-[#facc15] text-[#0056b3] font-black px-6 py-4 rounded-2xl shadow-xl shadow-yellow-500/20 hover:bg-[#eab308] transition-all flex items-center gap-2 transform active:scale-95 text-xs uppercase"
        >
          <Plus size={18} /> Dar de Alta Técnico
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex justify-center py-20">
            <Loader2 className="animate-spin text-[#0056b3]" size={40} />
          </div>
        ) : technicians.length === 0 ? (
          <div className="col-span-full text-center py-20 text-slate-400 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100 font-bold uppercase text-xs tracking-widest">
            No hay personal técnico registrado.
          </div>
        ) : (
          technicians.map((tech) => (
            <div key={tech.id} className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#0056b3]/5 rounded-bl-full -mr-16 -mt-16 group-hover:bg-[#0056b3]/10 transition-colors"></div>
              
              <div className="flex items-center gap-5 mb-6 relative">
                <div className="w-16 h-16 rounded-[1.5rem] bg-[#0056b3] flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
                  <UserCheck size={32} />
                </div>
                <div>
                  <h3 className="font-black text-slate-800 uppercase tracking-tighter leading-none mb-2">{tech.full_name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] bg-[#facc15] text-[#0056b3] px-2 py-0.5 rounded-full font-black uppercase tracking-widest">
                      {tech.specialty}
                    </span>
                    <span className="flex items-center gap-1 text-[9px] font-black text-emerald-500 uppercase italic">
                      <Activity size={10} /> {tech.status || 'Activo'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3 text-xs font-bold text-slate-500 mb-8 py-6 border-y border-slate-50 relative">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2"><Fingerprint size={14} className="text-[#0056b3]" /> ID EMPLEADO:</div>
                  <code className="text-[#0056b3] bg-blue-50 px-2 py-1 rounded-lg uppercase">{tech.employee_id || 'S/N'}</code>
                </div>
                <div className="flex items-center gap-2"><Mail size={14} className="text-[#0056b3]" /> {tech.email}</div>
                <div className="flex items-center gap-2"><Phone size={14} className="text-[#0056b3]" /> {tech.phone || 'N/A'}</div>
              </div>

              <div className="flex gap-3 relative">
                <button className="flex-1 py-4 rounded-2xl bg-slate-50 hover:bg-[#0056b3] hover:text-white text-[#0056b3] text-[10px] font-black transition-all uppercase tracking-[0.2em] border border-slate-100">
                  Ver Historial
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL DE REGISTRO CON LÓGICA DE ACCESO */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white max-w-md w-full p-10 rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 border border-slate-100">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-black text-[#0056b3] uppercase tracking-tighter flex items-center gap-2 italic">
                <Wrench size={24} className="text-[#facc15]" /> Alta de Personal
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-300 hover:text-red-500 transition-colors"><X size={28} /></button>
            </div>
            
            <form onSubmit={handleCreate} className="space-y-5">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre y Apellido</label>
                <input type="text" required className="w-full mt-1 px-4 py-4 rounded-2xl bg-slate-50 border-none outline-none font-bold text-slate-700" placeholder="Nombre completo" onChange={e => setForm({...form, full_name: e.target.value})} />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ID Único de Empleado (Usuario)</label>
                <input type="text" required className="w-full mt-1 px-4 py-4 rounded-2xl bg-blue-50 border-none outline-none font-black text-[#0056b3] uppercase" placeholder="TEC-001" onChange={e => setForm({...form, employee_id: e.target.value})} />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Especialidad</label>
                  <select className="w-full mt-1 px-4 py-4 rounded-2xl bg-slate-50 border-none outline-none font-bold text-xs cursor-pointer" onChange={e => setForm({...form, specialty: e.target.value})}>
                    <option value="Técnico General">General</option>
                    <option value="Soporte Impresoras">Impresoras</option>
                    <option value="Redes">Redes</option>
                    <option value="Copiadoras">Copiadoras</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Teléfono</label>
                  <input type="text" className="w-full mt-1 px-4 py-4 rounded-2xl bg-slate-50 border-none outline-none font-bold text-slate-700" placeholder="09..." onChange={e => setForm({...form, phone: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Correo Laboral</label>
                <input type="email" required className="w-full mt-1 px-4 py-4 rounded-2xl bg-slate-50 border-none outline-none font-bold text-slate-700" placeholder="tecnico@impriartex.com" onChange={e => setForm({...form, email: e.target.value})} />
              </div>

              <button type="submit" className="w-full bg-[#0056b3] text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-500/20 hover:bg-[#004494] transition-all mt-6 uppercase tracking-[0.2em] text-xs">
                HABILITAR TÉCNICO
              </button>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
