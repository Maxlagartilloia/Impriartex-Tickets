import React, { useState } from 'react';
import { Building2, Save } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

const ClientForm = () => {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');

  const handleSave = async () => {
    const { error } = await supabase
      .from('institutions')
      .insert([{ name, address }]);
    
    if (error) alert("Error al guardar cliente");
    else {
      alert("Cliente guardado con éxito");
      setName(''); setAddress('');
    }
  };

  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 max-w-md">
      <div className="flex items-center gap-3 mb-6 text-[#1B2559]">
        <Building2 className="text-blue-600" />
        <h3 className="text-xl font-black italic uppercase">Nuevo Cliente / Empresa</h3>
      </div>
      <div className="space-y-4">
        <input 
          type="text" placeholder="Nombre de la Empresa (Ej: GAD SD)" 
          className="w-full p-3 bg-gray-50 rounded-xl outline-none text-sm font-bold"
          value={name} onChange={(e) => setName(e.target.value)}
        />
        <input 
          type="text" placeholder="Dirección Principal" 
          className="w-full p-3 bg-gray-50 rounded-xl outline-none text-sm font-medium"
          value={address} onChange={(e) => setAddress(e.target.value)}
        />
        <button 
          onClick={handleSave}
          className="w-full bg-[#111C44] text-white p-3 rounded-xl font-black uppercase text-xs hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
        >
          <Save size={16} /> Guardar Empresa
        </button>
      </div>
    </div>
  );
};

export default ClientForm;
