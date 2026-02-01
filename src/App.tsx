import React, { useEffect, useState } from 'react';
import { supabase } from './lib/supabaseClient';
import Dashboard from './pages/Dashboard';
import ClientForm from './components/forms/ClientForm';
import EquipmentForm from './components/forms/EquipmentForm';
import { Ticket } from './types';
import { PlusCircle, X } from 'lucide-react';

const App: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showClientForm, setShowClientForm] = useState(false);
  const [showEquipForm, setShowEquipForm] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Cargar Tickets
      const { data: ticketData } = await supabase
        .from('tickets')
        .select('*, equipment(brand, model, serial)')
        .order('created_at', { ascending: false });
      
      // Cargar Empresas para los formularios
      const { data: instData } = await supabase
        .from('institutions')
        .select('*')
        .order('name');

      setTickets(ticketData || []);
      setInstitutions(instData || []);
    } catch (err) {
      console.error("Error cargando datos:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#F8F9FD]">
      {/* Botones Flotantes de Gestión Superior */}
      <div className="fixed top-6 right-32 z-50 flex gap-2">
        <button 
          onClick={() => setShowClientForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2"
        >
          <PlusCircle size={16} /> NUEVA EMPRESA
        </button>
        <button 
          onClick={() => setShowEquipForm(true)}
          className="bg-[#111C44] text-white px-4 py-2 rounded-xl font-bold text-xs shadow-lg hover:bg-slate-800 transition-all flex items-center gap-2"
        >
          <PlusCircle size={16} /> NUEVO EQUIPO
        </button>
      </div>

      {/* Pantalla Principal */}
      <Dashboard tickets={tickets} loading={loading} />

      {/* Modales (Ventanas Emergentes) para los Formularios */}
      {(showClientForm || showEquipForm) && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="relative bg-white rounded-3xl p-2">
            <button 
              onClick={() => { setShowClientForm(false); setShowEquipForm(false); fetchData(); }}
              className="absolute -top-4 -right-4 bg-red-500 text-white p-2 rounded-full shadow-xl hover:bg-red-600 transition-all"
            >
              <X size={20} />
            </button>
            
            {showClientForm && <ClientForm />}
            {showEquipForm && <EquipmentForm institutions={institutions} />}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
