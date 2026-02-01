import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

// IMPORTANTE: Verifica que estos nombres coincidan con tus archivos en src/pages/
import LoginPage from '@/pages/Login';
import DashboardPage from '@/pages/Dashboard';
import TicketsPage from '@/pages/Tickets';
import EquipmentPage from '@/pages/Equipment';
import InstitutionsPage from '@/pages/Institutions';
import ReportsPage from '@/pages/Reports';

export default function App() {
  const { user, role, loading } = useAuth();

  // 1. Si está cargando, mostramos el spinner sobre fondo azul
  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0056b3] text-white">
        <Loader2 className="animate-spin mb-4" size={50} />
        <p className="font-black uppercase tracking-widest text-[10px]">Cargando Sistema...</p>
      </div>
    );
  }

  // 2. Si NO hay usuario, solo puede ver el Login
  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <th Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // 3. Si hay usuario, habilitamos las rutas según el rol
  return (
    <Routes>
      <Route 
        path="/" 
        element={role === 'supervisor' ? <Navigate to="/dashboard" replace /> : <Navigate to="/tickets" replace />} 
      />

      {/* Rutas para Supervisor */}
      {role === 'supervisor' && (
        <>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/institutions" element={<InstitutionsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
        </>
      )}

      {/* Rutas para todos los logueados (Técnicos y Criss) */}
      <Route path="/tickets" element={<TicketsPage />} />
      <Route path="/equipment" element={<EquipmentPage />} />

      {/* Redirección por si entra a una ruta que no existe o no tiene permiso */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
