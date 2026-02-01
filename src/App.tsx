import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { ProtectedRoute } from "./components/ProtectedRoute";

// 1. Importaciones de tus páginas
import Dashboard from "./pages/Dashboard";
import Tickets from "./pages/Tickets";
import Equipment from "./pages/Equipment";
import Institutions from "./pages/Institutions";
import Technicians from "./pages/Technicians";
import Reports from "./pages/Reports"; // <--- Esta es la nueva que agregamos
import Login from "./pages/Login";

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Ruta Pública: Login */}
          <Route path="/login" element={<Login />} />
          
          {/* Redirección Inicial: Si entras a la raíz, te manda al dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* Rutas Protegidas (Solo entran los que están logueados) */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/tickets" element={<ProtectedRoute><Tickets /></ProtectedRoute>} />
          <Route path="/equipment" element={<ProtectedRoute><Equipment /></ProtectedRoute>} />
          
          {/* Rutas Administrativas (Solo Supervisor) */}
          <Route path="/institutions" element={<ProtectedRoute><Institutions /></ProtectedRoute>} />
          <Route path="/technicians" element={<ProtectedRoute><Technicians /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
          
          {/* Error 404: Cualquier otra ruta te regresa al login */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
