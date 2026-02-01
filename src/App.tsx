import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

// Importa aquí tus páginas reales
import LoginPage from './pages/Login';
import DashboardPage from './pages/Dashboard';
import TicketsPage from './pages/Tickets';
import EquipmentPage from './pages/Equipment';
import InstitutionsPage from './pages/Institutions';
import TechniciansPage from './pages/Technicians';
import ReportsPage from './pages/Reports';

// COMPONENTE DE RUTA PROTEGIDA
function PrivateRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  // 1. Mientras carga, mostramos un spinner pequeño, no la pantalla completa bloqueada
  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50 text-[#0056b3]">
        <Loader2 className="animate-spin mb-4" size={48} />
        <p className="text-[10px] font-black uppercase tracking-[0.3em]">Sincronizando Acceso...</p>
      </div>
    );
  }

  // 2. Si no hay usuario, al Login de una
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Si hay roles permitidos y el tuyo no está, al Dashboard (o ruta segura)
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  const { role } = useAuth();

  return (
    <Routes>
      {/* RUTA PÚBLICA */}
      <Route path="/login" element={<LoginPage />} />

      {/* RUTA RAÍZ: Redirección automática según el Rol */}
      <Route 
        path="/" 
        element={
          <PrivateRoute>
            {role === 'supervisor' ? <Navigate to="/dashboard" replace /> : <Navigate to="/tickets" replace />}
          </PrivateRoute>
        } 
      />

      {/* RUTAS PRIVADAS - CRISS (SUPERVISOR) */}
      <Route path="/dashboard" element={<PrivateRoute allowedRoles={['supervisor']}><DashboardPage /></PrivateRoute>} />
      <Route path="/institutions" element={<PrivateRoute allowedRoles={['supervisor']}><InstitutionsPage /></PrivateRoute>} />
      <Route path="/technicians" element={<PrivateRoute allowedRoles={['supervisor']}><TechniciansPage /></PrivateRoute>} />
      <Route path="/reports" element={<PrivateRoute allowedRoles={['supervisor']}><ReportsPage /></PrivateRoute>} />

      {/* RUTAS COMPARTIDAS - TÉCNICOS Y SUPERVISOR */}
      <Route path="/tickets" element={<PrivateRoute allowedRoles={['supervisor', 'technician']}><TicketsPage /></PrivateRoute>} />
      <Route path="/equipment" element={<PrivateRoute allowedRoles={['supervisor', 'technician', 'client']}><EquipmentPage /></PrivateRoute>} />

      {/* 404 - Redirigir a la raíz */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
