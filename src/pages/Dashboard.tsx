import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { 
  Ticket as TicketIcon, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp,
  Filter
} from 'lucide-react';

export default function Dashboard() {
  const { role } = useAuth();
  const [stats, setStats] = useState({ open: 0, process: 0, closed: 0, sla: 0 });
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      let query = supabase.from('tickets').select('status, created_at, closed_at');

      if (dateFrom) query = query.gte('created_at', dateFrom);
      if (dateTo) query = query.lte('created_at', dateTo);

      const { data: tickets, error } = await query;

      if (error) throw error;

      if (tickets) {
        const open = tickets.filter(t => t.status === 'open').length;
        const process = tickets.filter(t => t.status === 'in_progress').length;
        const closed = tickets.filter(t => t.status === 'completed').length;
        
        // Cálculo de SLA (Cumplimiento) básico: Porcentaje de cerrados vs total
        const sla = tickets.length > 0 ? Math.round((closed / tickets.length) * 100) : 0;

        setStats({ open, process, closed, sla });
      }
    } catch (error) {
      console.error("Error al cargar dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const kpiCards = [
    { label: 'Tickets Abiertos', value: stats.open, icon: AlertCircle, color: 'text-destructive', bg: 'bg-destructive/10' },
    { label: 'En Proceso', value: stats.process, icon: Clock, color: 'text-warning', bg: 'bg-warning/10' },
    { label: 'Finalizados', value: stats.closed, icon: CheckCircle, color: 'text-success', bg: 'bg-success/10' },
    { label: 'Cumplimiento', value: `${stats.sla}%`, icon: TrendingUp, color: 'text-primary', bg: 'bg-primary/10' },
  ];

  return (
    <MainLayout title="Dashboard de Control">
      {/* Filtros de Fecha - Manteniendo el diseño de tu HTML */}
      <div className="card-3d p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Desde</label>
            <input 
              type="date" 
              className="input-enterprise" 
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Hasta</label>
            <input 
              type="date" 
              className="input-enterprise" 
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
          <button 
            onClick={fetchDashboardData}
            className="btn-primary-3d flex items-center justify-center gap-2"
          >
            <Filter size={18} /> Actualizar Datos
          </button>
        </div>
      </div>

      {/* KPI Cards Estilo Lovable 3D */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((kpi, idx) => (
          <div key={idx} className="kpi-card flex flex-col items-center justify-center text-center p-8">
            <div className={`w-14 h-14 rounded-2xl ${kpi.bg} flex items-center justify-center mb-4`}>
              <kpi.icon className={`w-8 h-8 ${kpi.color}`} />
            </div>
            <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              {kpi.label}
            </label>
            <div className={`text-4xl font-black mt-2 ${kpi.color}`}>
              {loading ? '...' : kpi.value}
            </div>
          </div>
        ))}
      </div>

      {/* Aquí puedes añadir gráficas de Chart.js más adelante */}
      <div className="mt-8 grid grid-cols-1 gap-6">
        <div className="card-3d p-6 min-h-[300px] flex items-center justify-center border-dashed border-2">
           <p className="text-muted-foreground italic">Espacio para gráficas de rendimiento mensual...</p>
        </div>
      </div>
    </MainLayout>
  );
}
