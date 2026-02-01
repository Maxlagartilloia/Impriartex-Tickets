import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, role, loading } = useAuth();

  // 1. Mientras el sistema verifica quién eres
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground font-medium">Verificando acceso técnico...</p>
        </div>
      </div>
    );
  }

  // 2. Si no has iniciado sesión, te manda al login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 3. Si el usuario no tiene el permiso (rol) necesario para esa página
  if (allowedRoles && role && !allowedRoles.includes(role)) {
    console.warn("Acceso denegado: Rol insuficiente.");
    return <Navigate to="/dashboard" replace />;
  }

  // 4. Si todo está bien, muestra la página
  return <>{children}</>;
}
