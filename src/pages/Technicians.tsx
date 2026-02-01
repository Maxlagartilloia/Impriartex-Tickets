import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { 
  Wrench, Plus, UserCheck, 
  Mail, Phone, Shield, Loader2 
} from 'lucide-react';

export default function TechniciansPage() {
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchTechnicians();
  }, []);

  const fetchTechnicians = async () => {
    setLoading(true);
    // Filtramos los perfiles que tienen el rol de técnico
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
  }

  return (
    <MainLayout title="Gestión de Técnicos">
      <div className="flex justify-between items-center mb-8">
        <p className="text-muted-foreground">Personal técnico autorizado para servicios.</p>
        <button className="btn-primary-3d flex items-center gap-2">
          <Plus size={18} /> Registrar Técnico
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex justify-center py-20"><Loader2 className="animate-spin text-primary" /></div>
        ) : technicians.length === 0 ? (
          <div className="col-span-full text-center py-20 text-muted-foreground">No hay técnicos registrados.</div>
        ) : (
          technicians.map((tech) => (
            <div key={tech.id} className="card-3d p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center text-accent">
                  <UserCheck size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{tech.full_name}</h3>
                  <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold uppercase">
                    {tech.specialty || 'Técnico General'}
                  </span>
                </div>
              </div>
              
              <div className="space-y-2 text-sm text-muted-foreground mb-6">
                <div className="flex items-center gap-2"><Mail size={14} /> {tech.email}</div>
                <div className="flex items-center gap-2"><Phone size={14} /> {tech.phone || 'Sin teléfono'}</div>
              </div>

              <div className="flex gap-2 border-t border-border pt-4">
                <button className="flex-1 py-2 rounded-lg bg-muted hover:bg-primary/10 text-primary text-xs font-bold transition-colors">
                  VER HISTORIAL
                </button>
                <button className="p-2 rounded-lg bg-muted text-muted-foreground hover:text-destructive transition-colors">
                  <Shield size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </MainLayout>
  );
}
