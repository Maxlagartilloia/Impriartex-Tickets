import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { 
  Building2, Plus, Edit, Trash2, 
  Search, Phone, Mail, MapPin, Loader2 
} from 'lucide-react';

export default function InstitutionsPage() {
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

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

  const filtered = institutions.filter(inst => 
    inst.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inst.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MainLayout title="Gestión de Clientes (Instituciones)">
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
        <button className="btn-primary-3d flex items-center gap-2">
          <Plus className="w-5 h-5" /> Nueva Institución
        </button>
      </div>

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
            <div key={inst.id} className="card-3d p-6 group">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                  <Building2 size={24} />
                </div>
                <div className="flex gap-2">
                  <button className="p-2 hover:bg-primary/10 rounded-lg text-primary transition-colors">
                    <Edit size={16} />
                  </button>
                </div>
              </div>
              
              <h3 className="text-lg font-bold mb-4 line-clamp-1">{inst.name}</h3>
              
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Mail size={14} className="text-accent" />
                  <span className="truncate">{inst.email || 'Sin correo'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-accent" />
                  <span>{inst.phone || 'Sin teléfono'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-accent" />
                  <span className="line-clamp-1">{inst.address || 'Sin dirección'}</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-border flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                <span>ID Sistema:</span>
                <code className="bg-muted px-2 py-1 rounded text-accent select-all">{inst.id.slice(0, 8)}...</code>
              </div>
            </div>
          ))
        )}
      </div>
    </MainLayout>
  );
}
