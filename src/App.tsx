import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '@/pages/Login';
import DashboardPage from '@/pages/Dashboard';
import TicketsPage from '@/pages/Tickets';
import EquipmentPage from '@/pages/Equipment';
import InstitutionsPage from '@/pages/Institutions';
import ReportsPage from '@/pages/Reports';

export default function App() {
  // Quitamos toda la lógica de "loading" y "user" por ahora
  // Solo queremos que la pantalla responda
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/tickets" element={<TicketsPage />} />
      <Route path="/equipment" element={<EquipmentPage />} />
      <Route path="/institutions" element={<InstitutionsPage />} />
      <Route path="/reports" element={<ReportsPage />} />
      
      {/* Si nada carga, que nos mande al login de una */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
