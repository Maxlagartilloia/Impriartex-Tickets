import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { 
  Building2, Plus, Edit, Trash2, 
  Search, Phone, Mail, MapPin, Loader2, X 
} from 'lucide-react';

export default function InstitutionsPage() {
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const { toast } = useToast();

  // Estado para el formulario de nueva institución
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
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
    const { error } = await supabase
      .from('institutions')
      .insert([form]);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Éxito', description: 'Institución registrada correctamente', variant: 'success' });
      setShowModal(false);
      setForm({ name: '', email: '', phone: '', address: '' }); // Limpiar formulario
      fetchTickets(); // Recargar lista
    }
  };

  const filtered = institutions.filter(inst => 
    inst.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inst.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MainLayout title="Gestión de Clientes (Instituciones)">
      {/* Barra de búsqueda y botón */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por nombre o correo..."
            className="input-enterprise pl-11"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="btn-primary-3d flex items-center gap-2 bg-[#facc15] text-[#0056b3] border-none"
        >
          <Plus className="w-5 h-5" /> Nueva Institución
        </button>
      </div>

      {/* Grid de instituciones */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full text-center py-20 text-muted-foreground">
            No se encontraron instituciones.
          </div>
        ) : (
          filtered.map((inst) => (
            <div key={inst.id} className="card-3d p-6 group border-t-4 border-[#0056b3]">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-2xl bg-[#0056b3]/10 flex items-center justify-center text-[#0056b3] group-hover:bg-[#0056b3] group-hover:text-white transition-all duration-300">
                  <Building2 size={24} />
                </div>
                <div className="flex gap-2">
                  <button className="p-2 hover:bg-[#0056b3]/10 rounded-lg text-[#0056b3] transition-colors">
                    <Edit size={16} />
                  </button>
                </div>
              </div>
              
              <h3 className="text-lg font-bold mb-4 line-clamp-1 uppercase text-[#0056b3]">{inst.name}</h3>
              
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Mail size={14} className="text-[#facc15]" />
                  <span className="truncate">{inst.email || 'Sin correo'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-[#facc15]" />
                  <span>{inst.phone || 'Sin teléfono'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-[#facc15]" />
                  <span className="line-clamp-1">{inst.address || 'Sin dirección'}</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-border flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                <span>ID Sistema:</span>
                <code className="bg-muted px-2 py-1 rounded text-[#0056b3] select-all">{inst.id.slice(0, 8)}</code>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL DE REGISTRO - LO QUE TE FALTABA */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white max-w-md w-full p-8 rounded-3xl shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-[#0056b3] uppercase tracking-tight">Nuevo Cliente</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-red-500"><X /></button>
            </div>
            
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Nombre Institución</label>
                <input 
                  type="text" 
                  required
                  className="w-full mt-1 px-4 py-3 rounded-xl border border-slate-200 focus:border-[#0056b3] outline-none transition-all"
                  placeholder="Ej. Escuela Central"
                  onChange={e => setForm({...form, name: e.target.value})}
                />
              </div>
              
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Correo Electrónico</label>
                <input 
                  type="email"
                  className="w-full mt-1 px-4 py-3 rounded-xl border border-slate-200 focus:border-[#0056b3] outline-none transition-all"
                  placeholder="cliente@correo.com"
                  onChange={e => setForm({...form, email: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Teléfono</label>
                  <input 
                    type="text"
                    className="w-full mt-1 px-4 py-3 rounded-xl border border-slate-200 focus:border-[#0056b3] outline-none transition-all"
                    placeholder="09..."
                    onChange={e => setForm({...form, phone: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Dirección</label>
                  <input 
                    type="text"
                    className="w-full mt-1 px-4 py-3 rounded-xl border border-slate-200 focus:border-[#0056b3] outline-none transition-all"
                    placeholder="Calle / Sector"
                    onChange={e => setForm({...form, address: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button 
                  type="submit"
                  className="flex-1 bg-[#0056b3] text-white font-bold px-4 py-3 rounded-xl shadow-lg hover:bg-[#004494] transition-all"
                >
                  GUARDAR CLIENTE
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
