import React, { useEffect, useState } from 'react';
import { supabase } from './lib/supabaseClient';
import Dashboard from './pages/Dashboard';
import { Ticket } from './types';

const App: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Función para obtener tickets con trazabilidad total
    const getAuditData = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('tickets')
          .select(`
            *,
            equipment (
              brand,
              model,
              serial
            )
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setTickets(data || []);
      } catch (err) {
        console.error("Error en la verificación de datos:", err);
      } finally {
        setLoading(false);
      }
    };

    getAuditData();
  }, []);

  return (
    <div className="App">
      <Dashboard tickets={tickets} loading={loading} />
    </div>
  );
};

export default App;
