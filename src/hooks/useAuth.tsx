import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

const AuthContext = createContext<any>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Función para verificar la sesión inicial de golpe
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          const { data } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();
          setRole(data?.role || null);
        }
      } catch (error) {
        console.error("Error inicializando Auth:", error);
      } finally {
        // ¡ESTO QUITA LA BOLITA SI O SI!
        setLoading(false);
      }
    };

    initializeAuth();

    // 2. Escucha cambios futuros (Login/Logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        const { data } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        setRole(data?.role || null);
      } else {
        setRole(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
