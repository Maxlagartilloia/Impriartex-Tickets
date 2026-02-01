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
    role: 'technician' // Siempre técnico por defecto aquí
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
    // Nota: En Supabase, para crear un usuario con Auth se requiere otra lógica, 
    // aquí lo insertamos en 'profiles' asumiendo que ya tiene cuenta o es solo registro interno.
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
    <MainLayout title="Gestión de Técnicos">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <p className="text-slate-500 font-medium">Personal técnico autorizado para servicios Impriartex.</p>
        <button 
          onClick={() => setShowModal(true)}
          className="btn-primary-3d flex items-center gap-2 bg-[#facc15] text-[#0056b3] border-none font-black px-6 py-3 rounded-xl shadow-lg hover:bg-[#eab308] transition-all"
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
          <div className="col-span-full text-center py-20 text-slate-400 bg-white rounded-3xl border border-dashed">
            No hay técnicos registrados actualmente.
          </div>
        ) : (
          technicians.map((tech) => (
            <div key={tech.id} className="card-3d p-6 group border-t-4 border-[#0056b3]">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-[#0056b3]/10 flex items-center justify-center text-[#0056b3] group-hover:bg-[#0056b3] group-hover:text-white transition-all duration-300">
                  <UserCheck size={28} />
                </div>
                <div>
                  <h3 className="font-black text-slate-800 uppercase tracking-tight">{tech.full_name}</h3>
                  <span className="text-[10px] bg-[#facc15] text-[#0056b3] px-2 py-0.5 rounded-full font-black uppercase">
                    {tech.specialty || 'Técnico General'}
                  </span>
                </div>
              </div>
              
              <div className="space-y-3 text-sm text-slate-500 mb-6 py-4 border-y border-slate-50">
                <div className="flex items-center gap-2">
                  <Mail size={14} className="text-[#0056b3]" /> 
                  <span className="truncate">{tech.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-[#0056b3]" /> 
                  <span>{tech.phone || 'Sin teléfono'}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-[#0056b3] hover:text-white text-[#0056b3] text-[10px] font-black transition-all uppercase tracking-widest">
                  Ver Historial
                </button>
                <button className="p-2 rounded-xl bg-slate-100 text-slate-400 hover:text-[#facc15] transition-colors">
                  <Shield size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL DE REGISTRO */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white max-w-md w-full p-8 rounded-3xl shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-[#0056b3] uppercase tracking-tight">Nuevo Técnico</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-red-500 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Nombre Completo</label>
                <input 
                  type="text" required
                  className="w-full mt-1 px-4 py-3 rounded-xl border border-slate-200 focus:border-[#0056b3] outline-none"
                  placeholder="Ej. Juan Pérez"
                  onChange={e => setForm({...form, full_name: e.target.value})}
                />
              </div>
              
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Correo Electrónico</label>
                <input 
                  type="email" required
                  className="w-full mt-1 px-4 py-3 rounded-xl border border-slate-200 focus:border-[#0056b3] outline-none"
                  placeholder="tecnico@impriartex.com"
                  onChange={e => setForm({...form, email: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Teléfono</label>
                  <input 
                    type="text"
                    className="w-full mt-1 px-4 py-3 rounded-xl border border-slate-200 focus:border-[#0056b3] outline-none"
                    placeholder="09..."
                    onChange={e => setForm({...form, phone: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Especialidad</label>
                  <select 
                    className="w-full mt-1 px-4 py-3 rounded-xl border border-slate-200 focus:border-[#0056b3] outline-none bg-white"
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
                className="w-full bg-[#0056b3] text-white font-black px-4 py-4 rounded-xl shadow-lg hover:bg-[#004494] transition-all mt-6 uppercase tracking-widest"
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
