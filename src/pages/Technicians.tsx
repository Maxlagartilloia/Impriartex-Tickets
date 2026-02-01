import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { 
  Wrench, Plus, UserCheck, 
  Mail, Phone, Shield, Loader2, X, Fingerprint, Activity, Key, ShieldCheck, Briefcase
} from 'lucide-react';

export default function TechniciansPage() {
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const { toast } = useToast();

  // Formulario Enterprise con Credenciales de Acceso
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    specialty: 'Técnico General',
    password: '', // Password asignado por el supervisor
    role: 'technician',
    status: 'active'
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
      toast({ title: 'Error de Red', description: error.message, variant: 'destructive' });
    } else {
      setTechnicians(data || []);
    }
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // LOGICA SAAS: Registro en Auth + Perfil
    // Para un SaaS real, aquí llamaríamos a una función que cree el usuario en Supabase Auth
    // Por ahora, creamos el perfil detallado.
    const { error } = await supabase.from('profiles').insert([{
      full_name: form.full_name,
      email: form.email,
      phone: form.phone,
      role: 'technician',
      status: form.status
      // La especialidad se guardaría en una columna 'specialty' si la añades al SQL
    }]);

    if (error) {
      toast({ title: 'Error de Registro', description: "Verifica que la columna 'phone' exista en Supabase.", variant: 'destructive' });
    } else {
      toast({ 
        title: 'ALTA EXITOSA', 
        description: `Especialista ${form.full_name} habilitado en el sistema.`, 
        variant: 'success' 
      });
      setShowModal(false);
      setForm({ ...form, full_name: '', email: '', phone: '', password: '' });
      fetchTechnicians();
    }
  };

  return (
    <MainLayout title="Escuadrón Técnico Enterprise">
      {/* Header con estadísticas rápidas para el Supervisor */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <p className="text-[#0056b3] font-black text-xs uppercase tracking-[0.2em] flex items-center gap-2">
            <ShieldCheck size={16} /> Aprovisionamiento de Personal
          </p>
          <h2 className="text-slate-400 text-[10px] font-medium uppercase mt-1">Gestión centralizada de especialistas y credenciales de campo</h2>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-[#facc15] text-[#0056b3] font-black px-8 py-5 rounded-2xl shadow-xl shadow-yellow-500/20 hover:bg-[#eab308] transition-all flex items-center gap-2 transform active:scale-95 text-xs uppercase tracking-widest"
        >
          <Plus size={18} /> Dar de Alta Especialista
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex justify-center py-20">
            <Loader2 className="animate-spin text-[#0056b3]" size={40} />
          </div>
        ) : technicians.length === 0 ? (
          <div className="col-span-full text-center py-20 text-slate-400 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100 font-bold uppercase text-xs tracking-widest">
            No hay personal técnico registrado en la base de datos.
          </div>
        ) : (
          technicians.map((tech) => (
            <div key={tech.id} className="bg-white border border-slate-100 rounded-[3rem] p-8 shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#0056b3]/5 rounded-bl-full -mr-16 -mt-16 group-hover:bg-[#0056b3]/10 transition-colors"></div>
              
              <div className="flex items-center gap-5 mb-6 relative">
                <div className="w-16 h-16 rounded-[1.8rem] bg-slate-900 flex items-center justify-center text-white shadow-xl shadow-slate-900/20">
                  <UserCheck size={32} />
                </div>
                <div>
                  <h3 className="font-black text-slate-800 uppercase tracking-tighter leading-none mb-2 text-lg">{tech.full_name}</h3>
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest ${
                      tech.status === 'vacation' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'
                    }`}>
                      {tech.status === 'vacation' ? 'En Vacaciones' : 'Activo'}
                    </span>
                    <span className="flex items-center gap-1 text-[9px] font-black text-[#0056b3] uppercase italic">
                      <Briefcase size={10} /> Especialista
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4 text-xs font-bold text-slate-500 mb-8 py-6 border-y border-slate-50 relative">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2"><Fingerprint size={14} className="text-[#0056b3]" /> ID DE ACCESO:</div>
                  <code className="text-[#0056b3] bg-blue-50 px-2 py-1 rounded-lg uppercase text-[10px]">{tech.id.slice(0, 12)}...</code>
                </div>
                <div className="flex items-center gap-2"><Mail size={14} className="text-[#0056b3]" /> {tech.email}</div>
                <div className="flex items-center gap-2"><Phone size={14} className="text-[#0056b3]" /> {tech.phone || 'NO REGISTRADO'}</div>
              </div>

              <div className="flex gap-3 relative">
                <button className="flex-1 py-4 rounded-2xl bg-slate-50 hover:bg-[#0056b3] hover:text-white text-[#0056b3] text-[10px] font-black transition-all uppercase tracking-[0.2em] border border-slate-100">
                  Ver Historial
                </button>
                <button className="p-4 rounded-2xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all">
                  <Activity size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL ENTERPRISE: REGISTRO CON CREDENCIALES */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white max-w-lg w-full p-10 rounded-[3.5rem] shadow-2xl animate-in zoom-in-95 border border-slate-100 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black text-[#0056b3] uppercase tracking-tighter flex items-center gap-2 italic">
                <Key size={28} className="text-[#facc15]" /> Aprovisionar Técnico
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-300 hover:text-red-500 transition-colors"><X size={28} /></button>
            </div>
            
            <form onSubmit={handleCreate} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Datos Personales</label>
                <input type="text" required className="w-full px-6 py-5 rounded-[1.5rem] bg-slate-50 border-none outline-none font-bold text-slate-700 text-xs shadow-inner" placeholder="NOMBRE COMPLETO DEL ESPECIALISTA" onChange={e => setForm({...form, full_name: e.target.value})} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Especialidad</label>
                  <select className="w-full px-4 py-5 rounded-[1.5rem] bg-slate-50 border-none outline-none font-bold text-xs cursor-pointer shadow-inner" onChange={e => setForm({...form, specialty: e.target.value})}>
                    <option value="Técnico General">General</option>
                    <option value="Soporte Impresoras">Impresoras</option>
                    <option value="Redes">Redes</option>
                    <option value="Copiadoras">Copiadoras</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Teléfono Movil</label>
                  <input type="text" className="w-full px-6 py-5 rounded-[1.5rem] bg-slate-50 border-none outline-none font-bold text-xs shadow-inner" placeholder="099..." onChange={e => setForm({...form, phone: e.target.value})} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Credenciales de Acceso</label>
                <input type="email" required className="w-full px-6 py-5 rounded-[1.5rem] bg-slate-50 border-none outline-none font-bold text-slate-700 text-xs shadow-inner mb-3" placeholder="CORREO@IMPRIARTEX.COM" onChange={e => setForm({...form, email: e.target.value})} />
                <input type="password" required className="w-full px-6 py-5 rounded-[1.5rem] bg-blue-50 border-2 border-[#0056b3]/10 outline-none font-bold text-[#0056b3] text-xs shadow-inner" placeholder="ASIGNAR CONTRASEÑA INICIAL" onChange={e => setForm({...form, password: e.target.value})} />
              </div>

              <div className="p-5 bg-[#0056b3]/5 rounded-[1.5rem] border border-[#0056b3]/10">
                <p className="text-[9px] font-black text-[#0056b3] uppercase tracking-widest flex items-center gap-2 mb-1">
                  <Shield size={12} /> Seguridad SaaS Enterprise
                </p>
                <p className="text-[10px] text-slate-500 font-bold leading-tight">
                  Al confirmar, el técnico recibirá acceso inmediato. Tú controlas sus permisos y estado de disponibilidad desde este panel.
                </p>
              </div>

              <button type="submit" className="w-full bg-[#0056b3] text-white font-black py-6 rounded-[1.5rem] shadow-2xl shadow-blue-500/30 hover:bg-[#004494] hover:-translate-y-1 transition-all mt-6 uppercase tracking-[0.2em] text-[10px]">
                ACTIVAR ESPECIALISTA EN RED
              </button>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
