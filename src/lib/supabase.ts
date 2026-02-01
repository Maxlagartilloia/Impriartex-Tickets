import { createClient } from '@supabase/supabase-js';

// Intentamos obtener las variables desde el entorno (Netlify/Vite)
// Si no existen (desarrollo local), usa los strings que pongas aquí.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://tu-proyecto-id.supabase.co'; 
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'tu-clave-anon-publica-aqui';

if (!supabaseUrl || supabaseUrl === 'https://tu-proyecto-id.supabase.co') {
  console.warn("⚠️ Supabase URL no configurada correctamente.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
