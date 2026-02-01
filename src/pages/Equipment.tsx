import { useEffect, useState, useRef } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { 
  Printer, Upload, FileSpreadsheet, Search, 
  Database, Loader2, Trash2 
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
    a.download = 'plantilla_inventario_impriartex.csv';
    a.click();
  };

  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n');
      
      const records = lines.slice(1).filter(line => line.trim()).map(line => {
        const values = line.split(',');
        return {
          marca: values[0]?.trim(),
          modelo: values[1]?.trim(),
          serie: values[2]?.trim(),
          serial_number: values[2]?.trim(),
          name: `${values[0]} ${values[1]}`, 
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
        toast({ title: "Carga Exitosa", description: `${records.length} equipos importados correctamente.`, variant: "success" });
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
    <MainLayout title="Gestión de Inventario Tecnológico">
      {/* HEADER CON BOTONES AMARILLOS */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h2 className="text-slate-500 font-bold uppercase text-xs tracking-widest text-[#0056b3]">Listado de Equipos</h2>
        <div className="flex gap-3">
          <button onClick={downloadCSVTemplate} className="bg-slate-800 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-bold text-xs hover:bg-slate-700 transition-all">
            <FileSpreadsheet size={18} /> DESCARGAR PLANTILLA
          </button>
          <button onClick={() => fileInputRef.current?.click()} className="bg-[#facc15] text-[#0056b3] px-4 py-2 rounded-xl flex items-center gap-2 font-black text-xs hover:bg-[#eab308] transition-all shadow-lg shadow-yellow-500/20">
            <Upload size={18} /> CARGA MASIVA CSV
          </button>
          <input type="file" ref={fileInputRef} className="hidden" accept=".csv" onChange={handleCSVUpload} />
        </div>
      </header>

      {/* BUSCADOR AZUL */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#0056b3]" size={20} />
          <input 
            type="text" 
            placeholder="Filtrar por serie, modelo o institución..." 
            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border border-transparent focus:border-[#0056b3] focus:bg-white outline-none transition-all font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* TABLA CORPORATIVA */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#0056b3] text-white">
                <th className="p-4 font-bold text-xs uppercase tracking-wider">Marca y Modelo</th>
                <th className="p-4 font-bold text-xs uppercase tracking-wider">Serie / IP</th>
                <th className="p-4 font-bold text-xs uppercase tracking-wider">Ubicación / Cliente</th>
                <th className="p-4 font-bold text-xs uppercase tracking-wider text-center">Estado</th>
                <th className="p-4 font-bold text-xs uppercase tracking-wider text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={5} className="text-center py-20"><Loader2 className="animate-spin mx-auto text-[#0056b3]" size={32} /></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-10 text-slate-400 font-medium">No se encontraron equipos.</td></tr>
              ) : (
                filtered.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="font-black text-[#0056b3] uppercase">{item.name}</div>
                      <div className="text-[10px] font-bold text-slate-400">{item.marca}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-mono text-xs font-bold bg-slate-100 px-2 py-1 rounded inline-block text-slate-700">{item.serial_number}</div>
                      <div className="text-[10px] text-slate-400 mt-1">{item.ip_address || 'Sin IP asignada'}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-700">{item.institution?.name || 'STOCK CENTRAL'}</div>
                      <div className="text-[10px] text-slate-400 uppercase">{item.ubicacion_macro}</div>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${item.status === 'operativo' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button className="p-2 text-red-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* REFERENCIA DE IDS PARA EL CSV */}
      <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="relative z-10">
          <h3 className="font-black flex items-center gap-2 mb-2 text-[#facc15] uppercase tracking-tight">
            <Database size={20} /> Guía de IDs para Carga Masiva
          </h3>
          <p className="text-slate-400 text-xs mb-6">Copia estos códigos en la columna <strong className="text-white">institution_id</strong> de tu archivo CSV para asignar equipos a cada cliente.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {institutions.map(inst => (
              <div key={inst.id} className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all">
                <span className="font-black text-[10px] uppercase block mb-1 text-slate-300">{inst.name}</span>
                <code className="text-[10px] text-[#facc15] font-mono select-all">{inst.id}</code>
              </div>
            ))}
          </div>
        </div>
        <Printer size={150} className="absolute -right-10 -bottom-10 text-white/5 rotate-12" />
      </div>
    </MainLayout>
  );
}
