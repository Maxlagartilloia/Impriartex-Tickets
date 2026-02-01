import { useEffect, useState, useRef } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { 
  Printer, Upload, FileSpreadsheet, Search, 
  Database, Cpu, Info, Loader2, Trash2 
} from 'lucide-react';

export default function EquipmentPage() {
  const [equipment, setEquipment] = useState<any[]>([]);
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: eqData } = await supabase
      .from('equipment')
      .select('*, institution:institutions(name)');
    
    const { data: instData } = await supabase
      .from('institutions')
      .select('id, name');

    if (eqData) setEquipment(eqData);
    if (instData) setInstitutions(instData);
    setLoading(false);
  };

  const downloadCSVTemplate = () => {
    const headers = "marca,modelo,serie,ip_address,ubicacion_macro,ubicacion_detalle,institution_id,status\n";
    const example = "Epson,L5190,X7Y8Z9,192.168.1.50,Oficina Central,Planta Baja,ID_AQUI,operativo";
    const blob = new Blob([headers + example], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'plantilla_inventario.csv';
    a.click();
  };

  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      
      const records = lines.slice(1).filter(line => line.trim()).map(line => {
        const values = line.split(',');
        return {
          marca: values[0]?.trim(),
          modelo: values[1]?.trim(),
          serie: values[2]?.trim(),
          serial_number: values[2]?.trim(), // Mapeo a DB
          name: `${values[0]} ${values[1]}`, // Nombre combinado
          ip_address: values[3]?.trim() || null,
          ubicacion_macro: values[4]?.trim(),
          ubicacion_detalle: values[5]?.trim() || null,
          institution_id: values[6]?.trim() || null,
          status: values[7]?.trim() || 'operativo'
        };
      });

      const { error } = await supabase.from('equipment').insert(records);
      if (error) {
        toast({ title: "Error en carga", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Carga Exitosa", description: `${records.length} equipos importados.` });
        fetchData();
      }
    };
    reader.readAsText(file);
  };

  const filtered = equipment.filter(e => 
    e.serial_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.institution?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MainLayout title="Gestión de Equipos e Inventario">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h2 className="text-muted-foreground font-medium">Inventario Tecnológico</h2>
        <div className="flex gap-3">
          <button onClick={downloadCSVTemplate} className="btn-primary-3d bg-slate-700 flex items-center gap-2">
            <FileSpreadsheet size={18} /> Plantilla
          </button>
          <button onClick={() => fileInputRef.current?.click()} className="btn-primary-3d flex items-center gap-2">
            <Upload size={18} /> Carga Masiva
          </button>
          <input type="file" ref={fileInputRef} className="hidden" accept=".csv" onChange={handleCSVUpload} />
        </div>
      </header>

      {/* Buscador */}
      <div className="card-3d p-6 mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
          <input 
            type="text" 
            placeholder="Filtrar por serie, modelo o institución..." 
            className="input-enterprise pl-12"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Tabla */}
      <div className="card-3d overflow-hidden mb-8">
        <table className="table-enterprise">
          <thead>
            <tr>
              <th>Marca y Modelo</th>
              <th>Serie / IP</th>
              <th>Ubicación / Cliente</th>
              <th>Estado</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center py-10"><Loader2 className="animate-spin mx-auto" /></td></tr>
            ) : (
              filtered.map(item => (
                <tr key={item.id}>
                  <td>
                    <div className="font-bold">{item.name}</div>
                    <div className="text-xs text-muted-foreground">{item.marca}</div>
                  </td>
                  <td>
                    <div className="font-mono text-primary">{item.serial_number}</div>
                    <div className="text-xs text-muted-foreground">{item.ip_address || 'Sin IP'}</div>
                  </td>
                  <td>
                    <div className="font-medium">{item.institution?.name || 'Stock'}</div>
                    <div className="text-xs text-muted-foreground">{item.ubicacion_macro}</div>
                  </td>
                  <td>
                    <span className={`status-badge ${item.status === 'operativo' ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'}`}>
                      {item.status}
                    </span>
                  </td>
                  <td>
                    <button className="p-2 text-destructive hover:bg-destructive/10 rounded-lg">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Referencia de IDs para CSV */}
      <div className="card-3d p-6">
        <h3 className="font-bold flex items-center gap-2 mb-4"><Database size={18} className="text-accent" /> Referencia de IDs para CSV</h3>
        <p className="text-sm text-muted-foreground mb-4">Usa estos IDs en la columna <strong>institution_id</strong> de tu CSV:</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {institutions.map(inst => (
            <div key={inst.id} className="p-3 bg-muted/50 rounded-lg border border-border flex flex-col">
              <span className="font-bold text-xs uppercase">{inst.name}</span>
              <code className="text-[10px] text-accent mt-1 select-all cursor-pointer">{inst.id}</code>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
