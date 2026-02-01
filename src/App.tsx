import React, { useEffect, useState } from 'react';
import { supabase } from './lib/supabaseClient';
import Dashboard from './pages/Dashboard';
import ClientForm from './components/forms/ClientForm';
import EquipmentForm from './components/forms/EquipmentForm';
import CreateTicketForm from './components/forms/CreateTicketForm'; // IMPORTANTE
import { Ticket } from './types';
import { PlusCircle, X, Ticket as TicketIcon } from 'lucide-react';

const App: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para controlar qué ventana está abierta
  const [activeModal, setActiveModal] = useState<'client' | 'equipment' | 'ticket' | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: ticketData } = await supabase
      .from('tickets')
      .select('*, equipment(brand, model, serial)')
      .order('created_at', { ascending: false });
    
    const { data: instData } = await supabase.from('institutions').select('*').order('name');

    setTickets(ticketData || []);
    setInstitutions(instData || []);
    setLoading(false);
  };

  const closeModal = () => {
    setActiveModal(null);
    fetchData(); // Recarga los datos al cerrar cualquier formulario
  };

  return (
    <div className="relative min-h-screen">
      {/* Botones de Acción Global */}
      <div className="fixed top-6 right-8 z-50 flex gap-3">
        <button onClick={() => setActiveModal('ticket')} className="bg-green-600 text-white px-5 py-2.5 rounded-2xl font-black text-[10px] shadow-xl hover:scale-105 transition-all flex items-center gap-2 uppercase tracking-tighter">
          <TicketIcon size={16} /> Crear Ticket
        </button>
        <button onClick={() => setActiveModal('client')} className="bg-blue-600 text-white px-5 py-2.5 rounded-2xl font-black text-[10px] shadow-xl hover:scale-105 transition-all flex items-center gap-2 uppercase tracking-tighter">
          <PlusCircle size={16} /> Nuevo Cliente
        </button>
        <button onClick={() => setActiveModal('equipment')} className="bg-[#111C44] text-white px-5 py-2.5 rounded-2xl font-black text-[10px] shadow-xl hover:scale-105 transition-all flex items-center gap-2 uppercase tracking-tighter">
          <PlusCircle size={16} /> Nuevo Equipo
        </button>
      </div>

      <Dashboard tickets={tickets} loading={loading} />

      {/* Ventana Modal Universal */}
      {activeModal && (
        <div className="fixed inset-0 bg-[#0b1437]/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg">
            <button onClick={closeModal} className="absolute -top-12 right-0 text-white hover:text-red-400 flex items-center gap-1 font-black text-xs">
              <X size={24} /> CERRAR
            </button>
            
            {activeModal === 'client' && <ClientForm />}
            {activeModal === 'equipment' && <EquipmentForm institutions={institutions} />}
            {activeModal === 'ticket' && <CreateTicketForm onClose={closeModal} />}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
