import { useEffect, useState, useRef } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { 
  Printer, Upload, FileSpreadsheet, Search, 
  Database, Loader2, Edit3, X, ArrowLeftRight, AlertTriangle, Gauge
} from 'lucide-react';

export default function EquipmentPage() {
  const [equipment, setEquipment] = useState<any[]>([]);
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Límite Enterprise para alerta de mantenimiento (puedes cambiarlo a 50k o 100k)
  const LIMIT_MAINTENANCE = 100000;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    // Modificamos el select para que traiga el contador_bn del último ticket cerrado
    const { data: eqData } = await supabase
      .from('equipment')
      .select('*, institution:institutions(name), tickets(counter_bn_final)')
      .order('created_at', { ascending: false });
    
    const { data: instData } = await supabase
      .from('institutions')
      .select('id, name');

    if (eqData) setEquipment(eqData);
    if (instData) setInstitutions(instData);
    setLoading(false);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase
      .from('equipment')
      .update({
        status: selectedItem.status,
        institution_id: selectedItem.institution_id,
        physical_location: selectedItem.physical_location,
        location_details: selectedItem.location_details
      })
      .eq('id', selectedItem.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Actualizado", description: "Movimiento de inventario registrado.", variant: "success" });
      setShowEditModal(false);
      fetchData();
    }
  };

  const downloadCSVTemplate = () => {
    const headers = "brand,model,serial,ip_address,physical_location,location_details,institution_id,status\n";
    const example = "Ricoh,MP 301,ABC123456,192.168.1.50,Edificio Central,Sistemas,ID_AQUI,operativo";
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
          brand: values[0]?.trim(),
          model: values[1]?.trim(),
          serial: values[2]?.trim(),
          ip_address: values[3]?.trim() || null,
          physical_location: values[4]?.trim(),
          location_details: values[5]?.trim() || null,
          institution_id: values[6]?.trim() || null,
          status: values[7]?.trim() || 'operativo'
        };
      });
      const { error } = await supabase.from('equipment').insert(records);
      if (error) toast({ title: "Error en carga", description: error.message, variant: "destructive" });
      else {
        toast({ title: "Carga Exitosa", description: `${records.length} equipos importados.` });
        fetchData();
      }
    };
    reader.readAsText(file);
  };

  const filtered = equipment.filter(e => 
    e.serial?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.institution?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MainLayout title="Gestión de Activos e Inventario">
      <header className="flex flex-col sm:flex-row justify-between items-end gap-4 mb-8">
        <div>
          <h2 className="text-[#0056b3] font-black uppercase text-xl tracking-tighter italic">Consola de Inventario</h2>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Control total de stock y vida útil de equipos</p>
        </div>
        <div className="flex gap-3">
          <button onClick={downloadCSVTemplate} className="bg-slate-800 text-white px-5 py-3 rounded-2xl flex items-center gap-2 font-bold text-[10px] hover:bg-slate-700 transition-all uppercase tracking-widest">
            <FileSpreadsheet size={16} /> Plantilla
          </button>
          <button onClick={() => fileInputRef.current?.click()} className="bg-[#facc15] text-[#0056b3] px-5 py-3 rounded-2xl flex items-center gap-2 font-black text-[10px] hover:bg-[#eab308] transition-all shadow-xl shadow-yellow-500/20 uppercase tracking-widest">
            <Upload size={16} /> Carga Masiva
          </button>
          <input type="file" ref={fileInputRef} className="hidden" accept=".csv" onChange={handleCSVUpload} />
        </div>
      </header>

      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 mb-8">
        <div className="relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#0056b3]" size={20} />
          <input 
            type="text" 
            placeholder="Buscar por serie (S/N), modelo o empresa..." 
            className="w-full pl-14 pr-6 py-5 rounded-[1.5rem] bg-slate-50 border-none outline-none font-bold text-xs"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#0056b3] text-white">
                <th className="p-6 font-black text-[10px] uppercase tracking-widest">Marca / Modelo</th>
                <th className="p-6 font-black text-[10px] uppercase tracking-widest">Serie e IP</th>
                <th className="p-6 font-black text-[10px] uppercase tracking-widest">Vida Útil / Contadores</th>
                <th className="p-6 font-black text-[10px] uppercase tracking-widest text-center">Estado</th>
                <th className="p-6 font-black text-[10px] uppercase tracking-widest text-center">Gestión</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-bold">
              {loading ? (
                <tr><td colSpan={5} className="text-center py-20"><Loader2 className="animate-spin mx-auto text-[#0056b3]" size={32} /></td></tr>
              ) : (
                filtered.map(item => {
                  // Lógica de Mantenimiento Preventivo
                  const lastCounter = item.tickets?.[0]?.counter_bn_final || 0;
                  const wearPercentage = Math.min((lastCounter / LIMIT_MAINTENANCE) * 100, 100);
                  const isCritical = lastCounter >= LIMIT_MAINTENANCE;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="p-6">
                        <div className="font-black text-[#0056b3] uppercase text-xs">{item.model}</div>
                        <div className="text-[10px] font-bold text-slate-400">{item.brand}</div>
                      </td>
                      <td className="p-6">
                        <div className="font-mono text-[10px] font-black bg-blue-50 text-[#0056b3] px-2 py-1 rounded-lg inline-block uppercase tracking-tighter">{item.serial}</div>
                        <div className="text-[10px] text-slate-400 mt-1">{item.ip_address || 'Sin IP'}</div>
                      </td>
                      <td className="p-6">
                        <div className="flex flex-col gap-1 w-32">
                          <div className="flex justify-between text-[9px] uppercase font-black">
                            <span className={isCritical ? "text-red-500" : "text-slate-400"}>
                              {lastCounter.toLocaleString()} pts
                            </span>
                            <span className={isCritical ? "text-red-500" : "text-[#0056b3]"}>{Math.round(wearPercentage)}%</span>
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-500 ${isCritical ? 'bg-red-500' : 'bg-[#0056b3]'}`} 
                              style={{ width: `${wearPercentage}%` }}
                            />
                          </div>
                          {isCritical && (
                            <div className="flex items-center gap-1 text-[8px] text-red-500 animate-pulse uppercase">
                              <AlertTriangle size={10} /> Requiere Mantenimiento
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-6 text-center">
                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                          item.status === 'operativo' ? 'bg-emerald-100 text-emerald-700' : 
                          item.status === 'chatarra' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="p-6 text-center">
                        <button 
                          onClick={() => { setSelectedItem(item); setShowEditModal(true); }}
                          className="p-3 bg-slate-100 text-slate-400 rounded-2xl hover:bg-[#0056b3] hover:text-white transition-all shadow-sm"
                        >
                          <Edit3 size={16} />
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showEditModal && selectedItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white max-w-lg w-full p-10 rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 border border-slate-100">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-black text-[#0056b3] uppercase tracking-tighter italic flex items-center gap-2">
                <ArrowLeftRight size={24} className="text-[#facc15]" /> Mover / Editar Activo
              </h3>
              <button onClick={() => setShowEditModal(false)} className="text-slate-300 hover:text-red-500 transition-colors"><X size={28} /></button>
            </div>
            
            <form onSubmit={handleUpdate} className="space-y-6">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-6">
                <p className="text-[9px] font-black text-slate-400 uppercase mb-1 tracking-widest">Equipo Seleccionado</p>
                <p className="font-black text-[#0056b3] uppercase text-sm">{selectedItem.model} ({selectedItem.serial})</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Asignar a Empresa</label>
                  <select 
                    className="w-full mt-1 px-4 py-4 rounded-2xl bg-slate-50 border-none outline-none font-bold text-xs cursor-pointer"
                    value={selectedItem.institution_id || ''}
                    onChange={e => setSelectedItem({...selectedItem, institution_id: e.target.value})}
                  >
                    <option value="">STOCK CENTRAL</option>
                    {institutions.map(inst => (
                      <option key={inst.id} value={inst.id}>{inst.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Estado Operativo</label>
                  <select 
                    className="w-full mt-1 px-4 py-4 rounded-2xl bg-slate-50 border-none outline-none font-bold text-xs cursor-pointer"
                    value={selectedItem.status}
                    onChange={e => setSelectedItem({...selectedItem, status: e.target.value})}
                  >
                    <option value="operativo">OPERATIVO</option>
                    <option value="almacen">EN ALMACÉN</option>
                    <option value="chatarra">DE BAJA / CHATARRA</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ubicación (Edificio)</label>
                  <input type="text" className="w-full mt-1 px-4 py-4 rounded-2xl bg-slate-50 border-none outline-none font-bold text-xs" value={selectedItem.physical_location || ''} onChange={e => setSelectedItem({...selectedItem, physical_location: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Detalle (Dpto/Oficina)</label>
                  <input type="text" className="w-full mt-1 px-4 py-4 rounded-2xl bg-slate-50 border-none outline-none font-bold text-xs" value={selectedItem.location_details || ''} onChange={e => setSelectedItem({...selectedItem, location_details: e.target.value})} />
                </div>
              </div>

              <button type="submit" className="w-full bg-[#0056b3] text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-500/20 hover:bg-[#004494] transition-all mt-4 uppercase tracking-[0.2em] text-xs">
                PROCESAR CAMBIO DE INVENTARIO
              </button>
            </form>
          </div>
        </div>
      )}

      {/* DIRECTORIO DE IDS */}
      <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden">
        <div className="relative z-10">
          <h3 className="font-black flex items-center gap-2 mb-2 text-[#facc15] uppercase tracking-tight italic">
            <Database size={20} /> Directorio de IDs para Carga Masiva
          </h3>
          <p className="text-slate-400 text-[10px] mb-8 font-bold uppercase tracking-widest">Utiliza estos códigos en tu CSV para asignar equipos a cada cliente</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {institutions.map(inst => (
              <div key={inst.id} className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all group">
                <span className="font-black text-[9px] uppercase block mb-1 text-slate-400 group-hover:text-[#facc15] transition-colors">{inst.name}</span>
                <code className="text-[10px] text-[#facc15] font-mono select-all">{inst.id}</code>
              </div>
            ))}
          </div>
        </div>
        <Printer size={200} className="absolute -right-10 -bottom-10 text-white/5 rotate-12" />
      </div>
    </MainLayout>
  );
}
