import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { 
  Wrench, Plus, UserCheck, 
  Mail, Phone, Shield, Loader2, X 
} from 'lucide-react';

export default function TechniciansPage() {
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const { toast } = useToast();

  // Estado para el formulario de nuevo técnico
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    specialty: 'Técnico General',
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
    const { error } = await supabase.from('profiles').insert([form]);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Éxito', description: 'Técnico registrado correctamente', variant: 'success' });
      setShowModal(false);
      setForm({ full_name: '', email: '', phone: '', specialty: 'Técnico General', role: 'technician' });
      fetchTechnicians();
    }
  };

  return (
    <MainLayout title="Gestión de Técnicos Autorizados">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Personal Operativo Impriartex</p>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-[#facc15] text-[#0056b3] font-black px-6 py-3 rounded-xl shadow-lg hover:bg-[#eab308] transition-all flex items-center gap-2 transform active:scale-95"
        >
          <Plus size={18} /> REGISTRAR TÉCNICO
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex justify-center py-20">
            <Loader2 className="animate-spin text-[#0056b3]" size={40} />
          </div>
        ) : technicians.length === 0 ? (
          <div className="col-span-full text-center py-20 text-slate-400 bg-white rounded-3xl border-2 border-dashed border-slate-100 font-bold uppercase text-xs">
            No hay técnicos registrados actualmente.
          </div>
        ) : (
          technicians.map((tech) => (
            <div key={tech.id} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#0056b3]/5 rounded-bl-full -mr-10 -mt-10 group-hover:bg-[#0056b3]/10 transition-colors"></div>
              
              <div className="flex items-center gap-4 mb-6 relative">
                <div className="w-14 h-14 rounded-2xl bg-[#0056b3] flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                  <UserCheck size={28} />
                </div>
                <div>
                  <h3 className="font-black text-slate-800 uppercase tracking-tighter leading-none mb-1">{tech.full_name}</h3>
                  <span className="text-[9px] bg-[#facc15] text-[#0056b3] px-2 py-0.5 rounded-full font-black uppercase tracking-widest">
                    {tech.specialty || 'Técnico General'}
                  </span>
                </div>
              </div>
              
              <div className="space-y-3 text-sm text-slate-500 mb-6 py-4 border-y border-slate-50 relative">
                <div className="flex items-center gap-2 font-medium">
                  <Mail size={14} className="text-[#0056b3]" /> 
                  <span className="truncate">{tech.email}</span>
                </div>
                <div className="flex items-center gap-2 font-medium">
                  <Phone size={14} className="text-[#0056b3]" /> 
                  <span>{tech.phone || 'Sin teléfono'}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2 relative">
                <button className="flex-1 py-3 rounded-xl bg-slate-50 hover:bg-[#0056b3] hover:text-white text-[#0056b3] text-[10px] font-black transition-all uppercase tracking-widest border border-slate-100 hover:border-[#0056b3]">
                  Ver Historial
                </button>
                <button className="p-3 rounded-xl bg-slate-50 text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all border border-slate-100">
                  <Shield size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL DE REGISTRO */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white max-w-md w-full p-8 rounded-[2rem] shadow-2xl animate-in zoom-in-95 border border-slate-100">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-black text-[#0056b3] uppercase tracking-tighter flex items-center gap-2">
                <Wrench size={24} className="text-[#facc15]" /> Nuevo Técnico
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-300 hover:text-red-500 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleCreate} className="space-y-5">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre Completo</label>
                <input 
                  type="text" required
                  className="w-full mt-1 px-4 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-[#0056b3] focus:bg-white outline-none font-bold text-slate-700 transition-all"
                  placeholder="Ej. Juan Pérez"
                  onChange={e => setForm({...form, full_name: e.target.value})}
                />
              </div>
              
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Correo Electrónico</label>
                <input 
                  type="email" required
                  className="w-full mt-1 px-4 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-[#0056b3] focus:bg-white outline-none font-bold text-slate-700 transition-all"
                  placeholder="tecnico@impriartex.com"
                  onChange={e => setForm({...form, email: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Teléfono</label>
                  <input 
                    type="text"
                    className="w-full mt-1 px-4 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-[#0056b3] focus:bg-white outline-none font-bold text-slate-700 transition-all"
                    placeholder="09..."
                    onChange={e => setForm({...form, phone: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Especialidad</label>
                  <select 
                    className="w-full mt-1 px-4 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-[#0056b3] outline-none font-bold text-slate-700 transition-all cursor-pointer"
                    onChange={e => setForm({...form, specialty: e.target.value})}
                  >
                    <option value="Técnico General">General</option>
                    <option value="Soporte Impresoras">Impresoras</option>
                    <option value="Redes y Conectividad">Redes</option>
                  </select>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-[#0056b3] text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-500/20 hover:bg-[#004494] transition-all mt-6 uppercase tracking-[0.2em] text-xs"
              >
                REGISTRAR TÉCNICO
              </button>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
