import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

const AuthContext = createContext<any>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Función ultra-defensiva para obtener el rol
  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      // Si hay error o no hay data, devolvemos 'client' para no bloquear la app
      if (error || !data) {
        console.warn("Perfil no encontrado o error de red. Asignando rol básico.");
        return 'client'; 
      }
      return data.role;
    } catch (err) {
      console.error("Error crítico al obtener rol:", err);
      return 'client'; 
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      // Timeout de seguridad: Si en 5 segundos no hay respuesta, soltamos la pantalla
      const safetyTimer = setTimeout(() => {
        if (loading) setLoading(false);
      }, 5000);

      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setUser(session.user);
          const userRole = await fetchUserRole(session.user.id);
          setRole(userRole);
        } else {
          setUser(null);
          setRole(null);
        }
      } catch (error) {
        console.error("Fallo en inicialización Auth:", error);
      } finally {
        clearTimeout(safetyTimer);
        setLoading(false);
      }
    };

    initializeAuth();

    // Escucha de eventos de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`Evento Detectado: ${event}`);
      
      if (session?.user) {
        setUser(session.user);
        const userRole = await fetchUserRole(session.user.id);
        setRole(userRole);
      } else {
        setUser(null);
        setRole(null);
      }
      
      // Aseguramos que SIGNED_IN o SIGNED_OUT quiten el loading
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'INITIAL_SESSION') {
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
