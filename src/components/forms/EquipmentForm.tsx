import React, { useState } from 'react';
import { Printer, Save } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

const EquipmentForm = ({ institutions }: { institutions: any[] }) => {
  const [formData, setFormData] = useState({
    brand: '', model: '', serial: '', institution_id: ''
  });

  const handleSave = async () => {
    const { error } = await supabase.from('equipment').insert([formData]);
    if (error) alert("Error: Verifique que el Serial no esté duplicado");
    else alert("Equipo registrado en el inventario");
  };

  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 max-w-md">
      <div className="flex items-center gap-3 mb-6 text-[#1B2559]">
        <Printer className="text-blue-600" />
        <h3 className="text-xl font-black italic uppercase">Registrar Equipo</h3>
      </div>
      <div className="space-y-4">
        <select 
          className="w-full p-3 bg-gray-50 rounded-xl outline-none text-xs font-bold"
          onChange={(e) => setFormData({...formData, institution_id: e.target.value})}
        >
          <option value="">Seleccione Empresa Destino</option>
          {institutions.map(inst => (
            <option key={inst.id} value={inst.id}>{inst.name}</option>
          ))}
        </select>
        <input 
          type="text" placeholder="Marca (Ej: RICOH)" 
          className="w-full p-3 bg-gray-50 rounded-xl outline-none text-sm"
          onChange={(e) => setFormData({...formData, brand: e.target.value})}
        />
        <input 
          type="text" placeholder="Modelo (Ej: IM C400)" 
          className="w-full p-3 bg-gray-50 rounded-xl outline-none text-sm"
          onChange={(e) => setFormData({...formData, model: e.target.value})}
        />
        <input 
          type="text" placeholder="Serial Único" 
          className="w-full p-3 bg-gray-50 rounded-xl outline-none text-sm font-mono"
          onChange={(e) => setFormData({...formData, serial: e.target.value})}
        />
        <button 
          onClick={handleSave}
          className="w-full bg-[#111C44] text-white p-3 rounded-xl font-black uppercase text-xs hover:bg-blue-600 transition-all"
        >
          Finalizar Carga de Equipo
        </button>
      </div>
    </div>
  );
};

export default EquipmentForm;
