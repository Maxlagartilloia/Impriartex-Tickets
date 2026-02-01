import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { ProtectedRoute } from "./components/ProtectedRoute";

// Importaciones de tus páginas (Asegúrate de que la primera letra sea Mayúscula)
import Dashboard from "./pages/Dashboard";
import Tickets from "./pages/Tickets";
import Equipment from "./pages/Equipment";
import Institutions from "./pages/Institutions"; // Agregado
import Technicians from "./pages/Technicians"; // Agregado
import Login from "./pages/Login";

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        {/* Ruta Pública */}
        <Route path="/login" element={<Login />} />
        
        {/* Redirección Inicial */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* Rutas Protegidas (Requieren Login) */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/tickets" element={<ProtectedRoute><Tickets /></ProtectedRoute>} />
        <Route path="/equipment" element={<ProtectedRoute><Equipment /></ProtectedRoute>} />
        
        {/* Rutas de Administración (Protegidas) */}
        <Route path="/institutions" element={<ProtectedRoute><Institutions /></ProtectedRoute>} />
        <Route path="/technicians" element={<ProtectedRoute><Technicians /></ProtectedRoute>} />
        
        {/* Captura de errores / 404 */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);

export default App;
