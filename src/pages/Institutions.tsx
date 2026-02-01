import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { 
  Building2, Plus, Edit, Trash2, 
  Search, Phone, Mail, MapPin, Loader2, X, Key, Shield,
  UserCog, Globe, ClipboardList, Briefcase
} from 'lucide-react';

export default function InstitutionsPage() {
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [technicians, setTechnicians] = useState<any[]>([]); // Para el selector de técnicos
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const { toast } = useToast();

  // Formulario Expandido Enterprise
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    contract_manager: '', // Persona responsable
    client_code: '', 
    password_plain: '',
    technician_id: '' // Técnico titular asignado
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    // Traemos instituciones con el nombre del técnico asignado (Join)
    const { data: instData } = await supabase
      .from('institutions')
      .select('*, technician:profiles!technician_id(full_name)')
      .order('name');

    // Traemos la lista de técnicos para el selector del Supervisor
    const { data: techData } = await supabase
      .from('profiles')
      .select('id, full_name')
      .eq('role', 'technician');

    if (instData) setInstitutions(instData);
    if (techData) setTechnicians(techData);
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { error } = await supabase
      .from('institutions')
      .insert([{
        name: form.name,
        email: form.email,
        phone: form.phone,
        address: form.address,
        city: form.city,
        contract_manager: form.contract_manager,
        client_code: form.client_code,
        technician_id: form.technician_id || null
      }]);

    if (error) {
      toast({ title: 'Error Enterprise', description: "Revisa que las columnas city y contract_manager existan en la DB.", variant: 'destructive' });
    } else {
      toast({ title: 'Contrato Habilitado', description: `Entidad ${form.name} activa con técnico asignado.`, variant: 'success' });
      setShowModal(false);
      setForm({ name: '', email: '', phone: '', address: '', city: '', contract_manager: '', client_code: '', password_plain: '', technician_id: '' });
      fetchData();
    }
  };

  const filtered = institutions.filter(inst => 
    inst.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inst.client_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inst.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MainLayout title="Gestión de Contratos Enterprise">
      {/* Barra de Búsqueda y Acción */}
      <div className="flex flex-col sm:flex-row gap-4 mb-10">
        <div className="relative flex-1">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#0056b3]" />
          <input
            type="text"
            placeholder="Buscar por cliente, ciudad o código..."
            className="w-full pl-14 pr-6 py-5 rounded-[1.5rem] bg-white border border-slate-100 shadow-sm focus:border-[#0056b3] outline-none font-bold text-xs transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-[#0056b3] text-white font-black px-10 py-5 rounded-[1.5rem] flex items-center gap-3 shadow-xl shadow-blue-500/20 hover:bg-[#004494] transition-all uppercase text-[10px] tracking-widest"
        >
          <Plus size={20} /> Nuevo Contrato Interprise
        </button>
      </div>

      {/* Grid de Clientes con Información Detallada */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {loading ? (
          <div className="col-span-full flex justify-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-[#0056b3]" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full text-center py-20 text-slate-400 font-black uppercase text-xs border-4 border-dashed rounded-[3rem] border-slate-50">
            No se encuentran contratos activos con esos criterios.
          </div>
        ) : (
          filtered.map((inst) => (
            <div key={inst.id} className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-50 group hover:border-[#0056b3] hover:shadow-2xl transition-all relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#facc15]/10 rounded-bl-[4rem] flex items-center justify-center">
                 <Globe size={20} className="text-[#0056b3] ml-4 -mt-4" />
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-[1.5rem] bg-[#0056b3] flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
                  <Building2 size={32} />
                </div>
                <div>
                  <h3 className="text-lg font-black uppercase text-slate-800 tracking-tighter leading-none mb-2">{inst.name}</h3>
                  <span className="text-[9px] bg-blue-50 text-[#0056b3] px-3 py-1 rounded-full font-black uppercase tracking-widest">
                    ID: {inst.client_code || 'S/N'}
                  </span>
                </div>
              </div>

              <div className="space-y-4 text-[11px] font-bold text-slate-500 mb-8 py-6 border-y border-slate-50">
                <div className="flex items-center gap-3">
                  <UserCog size={16} className="text-[#0056b3]" />
                  <p className="uppercase tracking-tight"><span className="text-slate-400">Responsable:</span> {inst.contract_manager || 'No asignado'}</p>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin size={16} className="text-[#0056b3]" />
                  <p className="uppercase tracking-tight"><span className="text-slate-400">Ciudad:</span> {inst.city || 'Desconocida'}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Phone size={16} className="text-[#0056b3]" />
                  <p className="uppercase tracking-tight">{inst.phone}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Briefcase size={16} className="text-[#facc15]" />
                  <div className="flex flex-col">
                    <span className="text-[9px] text-slate-400 uppercase">Técnico Titular:</span>
                    <span className="text-[#0056b3] font-black uppercase">{inst.technician?.full_name || 'SIN TÉCNICO ASIGNADO'}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button className="flex-1 bg-slate-900 text-white font-black py-4 rounded-2xl text-[10px] uppercase tracking-widest hover:bg-[#0056b3] transition-all">
                  Gestionar Activos
                </button>
                <button className="p-4 bg-slate-50 text-slate-400 rounded-2xl hover:text-red-500 hover:bg-red-50 transition-all">
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL: FORMULARIO ENTERPRISE COMPLETO */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white max-w-4xl w-full p-12 rounded-[3.5rem] shadow-2xl animate-in zoom-in-95 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-3xl font-black text-[#0056b3] uppercase tracking-tighter italic flex items-center gap-3">
                <ClipboardList size={32} className="text-[#facc15]" /> Alta de Contrato SaaS
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-300 hover:text-red-500 transition-colors"><X size={32} /></button>
            </div>
            
            <form onSubmit={handleCreate} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Sección Datos de la Empresa */}
                <div className="space-y-5">
                  <p className="text-[10px] font-black text-[#facc15] uppercase tracking-[0.3em] border-b-2 border-slate-50 pb-2">Información de Contrato</p>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Nombre de la Institución</label>
                    <input type="text" required className="w-full mt-2 px-6 py-5 rounded-[1.5rem] bg-slate-50 border-none outline-none font-bold text-xs" placeholder="Ej. Municipio de Shushufindi" onChange={e => setForm({...form, name: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Administrador / Responsable</label>
                    <input type="text" required className="w-full mt-2 px-6 py-5 rounded-[1.5rem] bg-slate-50 border-none outline-none font-bold text-xs" placeholder="Nombre de la persona a cargo" onChange={e => setForm({...form, contract_manager: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Ciudad</label>
                      <input type="text" required className="w-full mt-2 px-6 py-5 rounded-[1.5rem] bg-slate-50 border-none outline-none font-bold text-xs" placeholder="Ciudad" onChange={e => setForm({...form, city: e.target.value})} />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Teléfono</label>
                      <input type="text" required className="w-full mt-2 px-6 py-5 rounded-[1.5rem] bg-slate-50 border-none outline-none font-bold text-xs" placeholder="PBX / Celular" onChange={e => setForm({...form, phone: e.target.value})} />
                    </div>
                  </div>
                </div>

                {/* Sección Credenciales y Técnico */}
                <div className="space-y-5">
                  <p className="text-[10px] font-black text-[#0056b3] uppercase tracking-[0.3em] border-b-2 border-slate-50 pb-2">Acceso y Soporte Asignado</p>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2 flex items-center gap-1"><Key size={10}/> Código de Cliente (Usuario)</label>
                    <input type="text" required className="w-full mt-2 px-6 py-5 rounded-[1.5rem] bg-blue-50 border-none outline-none font-black text-xs text-[#0056b3] uppercase" placeholder="CLI-SHU-01" onChange={e => setForm({...form, client_code: e.target.value})} />
                  </div>
                  
                  {/* SELECTOR DE TÉCNICO TITULAR (La pieza que faltaba) */}
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2 flex items-center gap-1"><Briefcase size={10}/> Técnico Especialista Asignado</label>
                    <select 
                      required
                      className="w-full mt-2 px-6 py-5 rounded-[1.5rem] bg-blue-50 border-none outline-none font-black text-xs text-[#0056b3] cursor-pointer"
                      onChange={e => setForm({...form, technician_id: e.target.value})}
                    >
                      <option value="">Selecciona un Especialista...</option>
                      {technicians.map(tech => (
                        <option key={tech.id} value={tech.id}>{tech.full_name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2 flex items-center gap-1"><Shield size={10}/> Email Corporativo</label>
                    <input type="email" required className="w-full mt-2 px-6 py-5 rounded-[1.5rem] bg-slate-50 border-none outline-none font-bold text-xs" placeholder="correo@entidad.com" onChange={e => setForm({...form, email: e.target.value})} />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Dirección Completa / Referencias</label>
                <textarea required className="w-full mt-2 px-6 py-5 rounded-[1.5rem] bg-slate-50 border-none outline-none font-bold text-xs h-24 resize-none" placeholder="Calles principales y referencias de oficina" onChange={e => setForm({...form, address: e.target.value})} />
              </div>

              <button type="submit" className="w-full bg-[#0056b3] text-white font-black py-6 rounded-[2rem] shadow-2xl shadow-blue-500/40 hover:bg-[#004494] hover:-translate-y-1 transition-all mt-4 uppercase tracking-[0.3em] text-[10px]">
                HABILITAR CONTRATO Y ASIGNAR TÉCNICO
              </button>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
