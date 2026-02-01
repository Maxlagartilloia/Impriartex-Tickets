import React, { useState } from 'react';
import { Camera, CheckCircle2, MapPin } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

const TechnicianAction = ({ ticketId, onComplete }: { ticketId: string, onComplete: () => void }) => {
  const [loading, setLoading] = useState(false);
  const [obs, setObs] = useState('');

  const handleArrival = async () => {
    // Registra hora de llegada exacta para auditoría de SLA
    await supabase.from('tickets').update({ arrival_time: new Date().toISOString(), status: 'in_progress' }).eq('id', ticketId);
    alert("Llegada registrada. El contador de SLA se ha detenido.");
  };

  const handleClose = async () => {
    if (!obs) return alert("Debe ingresar observaciones técnicas");
    setLoading(true);
    const { error } = await supabase.from('tickets').update({ 
      status: 'closed',
      closed_at: new Date().toISOString(),
      technical_observations: obs
    }).eq('id', ticketId);
    
    if (!error) {
      alert("Ticket Cerrado Exitosamente");
      onComplete();
    }
    setLoading(false);
  };

  return (
    <div className="bg-white p-6 rounded-3xl shadow-xl border-2 border-blue-500">
      <h3 className="text-lg font-black uppercase mb-4 italic">Panel de Ejecución Técnica</h3>
      <div className="space-y-4">
        <button onClick={handleArrival} className="w-full bg-orange-500 text-white p-4 rounded-2xl font-bold flex items-center justify-center gap-2">
          <MapPin size={20} /> REGISTRAR LLEGADA (INICIO)
        </button>

        <div className="grid grid-cols-2 gap-2">
           <div className="h-32 bg-gray-100 rounded-2xl flex flex-col items-center justify-center border-2 border-dashed border-gray-300">
             <Camera className="text-gray-400" />
             <span className="text-[10px] font-bold">FOTO ANTES</span>
           </div>
           <div className="h-32 bg-gray-100 rounded-2xl flex flex-col items-center justify-center border-2 border-dashed border-gray-300">
             <Camera className="text-gray-400" />
             <span className="text-[10px] font-bold">FOTO DESPUÉS</span>
           </div>
        </div>

        <textarea 
          placeholder="Informe técnico del servicio..." 
          className="w-full p-4 bg-gray-50 rounded-2xl text-sm outline-none border border-gray-200"
          value={obs} onChange={(e) => setObs(e.target.value)}
        />

        <button onClick={handleClose} className="w-full bg-green-600 text-white p-4 rounded-2xl font-black uppercase shadow-lg">
          Finalizar y Enviar al Cliente
        </button>
      </div>
    </div>
  );
};

export default TechnicianAction;
