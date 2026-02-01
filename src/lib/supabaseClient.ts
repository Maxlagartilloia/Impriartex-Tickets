import { createClient } from '@supabase/supabase-js';

// Estas son las llaves que Netlify leerá de su panel de configuración
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("ADVERTENCIA DE AUDITORÍA: Faltan las llaves de configuración de Supabase.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
