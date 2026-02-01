import React, { useState, useEffect } from 'react';
import { Ticket as TicketIcon, Save, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

const CreateTicketForm = ({ onClose }: { onClose: () => void }) => {
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [equipments, setEquipments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    institution_id: '',
    equipment_id: '',
    request_type: 'Correctivo',
    priority: 'Media',
    description: ''
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    const { data } = await supabase.from('institutions').select('*').order('name');
    setInstitutions(data || []);
  };

  const loadEquipments = async (instId: string) => {
    const { data } = await supabase.from('equipment').select('*').eq('institution_id', instId);
    setEquipments(data || []);
  };

  const handleSave = async () => {
    if (!formData.equipment_id || !formData.description) {
      alert("Por favor complete los campos obligatorios");
      return;
    }
    setLoading(true);
    const { error } = await supabase.from('tickets').insert([formData]);
    if (error) alert("Error al crear ticket: " + error.message);
    else {
      alert("Ticket Creado Exitosamente");
      onClose();
    }
    setLoading(false);
  };

  return (
    <div className="bg-white p-8 rounded-3xl shadow-2xl border border-gray-100 max-w-lg w-full">
      <div className="flex items-center gap-3 mb-6 text-[#111C44]">
        <div className="p-2 bg-blue-100 rounded-lg text-blue-600"><TicketIcon size={24} /></div>
        <h3 className="text-2xl font-black italic uppercase tracking-tighter">Nueva Solicitud de Soporte</h3>
      </div>

      <div className="space-y-5">
        <div>
          <label className="text-[10px] font-black text-gray-400 uppercase ml-1">1. Seleccionar Cliente / Entidad</label>
          <select 
            className="w-full p-4 bg-gray-50 rounded-2xl outline-none text-sm font-bold border-2 border-transparent focus:border-blue-500 transition-all"
            onChange={(e) => {
              setFormData({...formData, institution_id: e.target.value});
              loadEquipments(e.target.value);
            }}
          >
            <option value="">Seleccione Empresa...</option>
            {institutions.map(inst => <option key={inst.id} value={inst.id}>{inst.name}</option>)}
          </select>
        </div>

        <div>
          <label className="text-[10px] font-black text-gray-400 uppercase ml-1">2. Seleccionar Equipo Afectado</label>
          <select 
            disabled={!formData.institution_id}
            className="w-full p-4 bg-gray-50 rounded-2xl outline-none text-sm font-bold border-2 border-transparent focus:border-blue-500 disabled:opacity-50"
            onChange={(e) => setFormData({...formData, equipment_id: e.target.value})}
          >
            <option value="">Seleccione Equipo (Serial)...</option>
            {equipments.map(eq => (
              <option key={eq.id} value={eq.id}>{eq.brand} {eq.model} - {eq.serial}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Tipo</label>
            <select 
              className="w-full p-4 bg-gray-50 rounded-2xl outline-none text-sm font-bold"
              onChange={(e) => setFormData({...formData, request_type: e.target.value})}
            >
              <option>Correctivo</option>
              <option>Preventivo</option>
              <option>Suministros</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Prioridad (SLA)</label>
            <select 
              className="w-full p-4 bg-gray-50 rounded-2xl outline-none text-sm font-bold text-red-600"
              onChange={(e) => setFormData({...formData, priority: e.target.value})}
            >
              <option>Baja</option>
              <option>Media</option>
              <option>Alta</option>
              <option>Crítica</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Descripción de la Falla</label>
          <textarea 
            className="w-full p-4 bg-gray-50 rounded-2xl outline-none text-sm min-h-[100px]"
            placeholder="Ej: La impresora no enciende o tiene código de error SC-542..."
            onChange={(e) => setFormData({...formData, description: e.target.value})}
          ></textarea>
        </div>

        <button 
          onClick={handleSave}
          disabled={loading}
          className="w-full bg-[#111C44] text-white p-4 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20"
        >
          {loading ? "Registrando..." : <><Save size={18} /> Generar Ticket de Auditoría</>}
        </button>
      </div>
    </div>
  );
};

export default CreateTicketForm;
