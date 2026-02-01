import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { 
  Building2, Plus, Edit, Trash2, 
  Search, Phone, Mail, MapPin, Loader2, X, Key, Shield
} from 'lucide-react';

export default function InstitutionsPage() {
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const { toast } = useToast();

  // Estado para el formulario con el CÓDIGO DE ACCESO que pediste
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    client_code: '', // Este será su usuario de acceso
    password_plain: '' // Contraseña inicial (que luego se encripta en Auth)
  });

  useEffect(() => {
    fetchInstitutions();
  }, []);

  const fetchInstitutions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('institutions')
      .select('*')
      .order('name');

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      setInstitutions(data || []);
    }
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Registro en la tabla de Instituciones
    const { data: newInst, error: instError } = await supabase
      .from('institutions')
      .insert([{
        name: form.name,
        email: form.email,
        phone: form.phone,
        address: form.address,
        client_code: form.client_code
      }])
      .select();

    if (instError) {
      toast({ title: 'Error', description: instError.message, variant: 'destructive' });
      return;
    }

    // Nota para Criss: Aquí deberías disparar una Edge Function para crear el Auth User,
    // por ahora registramos la entidad.
    
    toast({ title: 'Éxito', description: `Cliente ${form.name} registrado con código ${form.client_code}`, variant: 'success' });
    setShowModal(false);
    setForm({ name: '', email: '', phone: '', address: '', client_code: '', password_plain: '' });
    fetchInstitutions();
  };

  const filtered = institutions.filter(inst => 
    inst.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inst.client_code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MainLayout title="Administración de Clientes / Entidades">
      {/* Barra Superior */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#0056b3]" />
          <input
            type="text"
            placeholder="Buscar por nombre o código de cliente..."
            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border border-slate-200 focus:border-[#0056b3] outline-none font-bold text-xs"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-[#facc15] text-[#0056b3] font-black px-6 py-4 rounded-2xl flex items-center gap-2 shadow-lg shadow-yellow-500/20 hover:bg-[#eab308] transition-all uppercase text-xs"
        >
          <Plus size={18} /> Registrar Nueva Entidad
        </button>
      </div>

      {/* Grid de Clientes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-[#0056b3]" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full text-center py-20 text-slate-400 font-bold uppercase text-xs border-2 border-dashed rounded-[2rem]">
            No hay clientes registrados en el sistema.
          </div>
        ) : (
          filtered.map((inst) => (
            <div key={inst.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 group hover:border-[#0056b3] transition-all">
              <div className="flex justify-between items-start mb-6">
                <div className="w-14 h-14 rounded-2xl bg-[#0056b3]/5 flex items-center justify-center text-[#0056b3] group-hover:bg-[#0056b3] group-hover:text-white transition-all">
                  <Building2 size={28} />
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[9px] font-black text-slate-400 uppercase mb-1">Código de Acceso</span>
                  <div className="bg-slate-100 px-3 py-1 rounded-lg font-black text-[#0056b3] text-xs select-all">
                    {inst.client_code || 'SIN_CODIGO'}
                  </div>
                </div>
              </div>
              
              <h3 className="text-lg font-black mb-4 uppercase text-slate-800 line-clamp-1">{inst.name}</h3>
              
              <div className="space-y-3 text-[11px] font-bold text-slate-500 mb-6">
                <div className="flex items-center gap-2">
                  <Mail size={14} className="text-[#facc15]" />
                  <span className="truncate">{inst.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-[#facc15]" />
                  <span>{inst.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-[#facc15]" />
                  <span className="line-clamp-1">{inst.address}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-slate-50">
                <button className="flex-1 bg-slate-50 text-slate-400 font-black py-2 rounded-xl text-[9px] uppercase hover:bg-[#0056b3] hover:text-white transition-all">
                  Ver Equipos
                </button>
                <button className="p-2 text-red-300 hover:text-red-500">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL: REGISTRO DE ENTIDAD Y ACCESO */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white max-w-2xl w-full p-10 rounded-[2.5rem] shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black text-[#0056b3] uppercase tracking-tighter italic">Nueva Entidad Cliente</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-300 hover:text-red-500 transition-colors"><X size={28} /></button>
            </div>
            
            <form onSubmit={handleCreate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-[#facc15] uppercase tracking-[0.2em] border-b pb-1">Datos de la Empresa</p>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Nombre Comercial</label>
                    <input type="text" required className="w-full mt-1 px-4 py-4 rounded-2xl bg-slate-50 border-none outline-none font-bold text-xs" placeholder="Ej. Banco Central" onChange={e => setForm({...form, name: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Dirección Física</label>
                    <input type="text" required className="w-full mt-1 px-4 py-4 rounded-2xl bg-slate-50 border-none outline-none font-bold text-xs" placeholder="Sector / Calle" onChange={e => setForm({...form, address: e.target.value})} />
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-[10px] font-black text-[#0056b3] uppercase tracking-[0.2em] border-b pb-1">Credenciales de Acceso</p>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1 flex items-center gap-1"><Key size={10}/> Código de Usuario</label>
                    <input type="text" required className="w-full mt-1 px-4 py-4 rounded-2xl bg-blue-50 border-none outline-none font-black text-xs text-[#0056b3] uppercase" placeholder="CLI-001" onChange={e => setForm({...form, client_code: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1 flex items-center gap-1"><Shield size={10}/> Contraseña Inicial</label>
                    <input type="password" required className="w-full mt-1 px-4 py-4 rounded-2xl bg-blue-50 border-none outline-none font-black text-xs text-[#0056b3]" placeholder="••••••••" onChange={e => setForm({...form, password_plain: e.target.value})} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Email de Contacto</label>
                  <input type="email" required className="w-full mt-1 px-4 py-4 rounded-2xl bg-slate-50 border-none outline-none font-bold text-xs" placeholder="admin@empresa.com" onChange={e => setForm({...form, email: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Teléfono</label>
                  <input type="text" required className="w-full mt-1 px-4 py-4 rounded-2xl bg-slate-50 border-none outline-none font-bold text-xs" placeholder="09..." onChange={e => setForm({...form, phone: e.target.value})} />
                </div>
              </div>

              <button type="submit" className="w-full bg-[#0056b3] text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-500/20 hover:bg-[#004494] transition-all mt-4 uppercase tracking-[0.2em] text-xs">
                DAR DE ALTA CLIENTE Y ACCESOS
              </button>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
