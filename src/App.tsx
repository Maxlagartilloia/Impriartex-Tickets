import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

import LoginPage from '@/pages/Login';
import DashboardPage from '@/pages/Dashboard';
import TicketsPage from '@/pages/Tickets';
import EquipmentPage from '@/pages/Equipment';
import InstitutionsPage from '@/pages/Institutions';
import ReportsPage from '@/pages/Reports';

export default function App() {
  const { user, role, loading } = useAuth();

  // Si está cargando, mostramos un loader visible
  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0056b3]">
        <Loader2 className="animate-spin text-white" size={48} />
        <p className="text-white text-[10px] font-black uppercase tracking-[0.3em] mt-4">Cargando Sistema...</p>
      </div>
    );
  }

  // Si NO hay usuario, solo permitimos Login
  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // Si HAY usuario logueado
  return (
    <Routes>
      <Route path="/" element={role === 'supervisor' ? <Navigate to="/dashboard" replace /> : <Navigate to="/tickets" replace />} />
      
      {/* Rutas Criss (Supervisor) */}
      {role === 'supervisor' && (
        <>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/institutions" element={<InstitutionsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
        </>
      )}

      {/* Rutas Técnicos y Supervisor */}
      <Route path="/tickets" element={<TicketsPage />} />
      <Route path="/equipment" element={<EquipmentPage />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
