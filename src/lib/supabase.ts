import { createClient } from '@supabase/supabase-js';

// En producción (Netlify), estas variables DEBEN estar en el panel de control
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Verificación de seguridad: Si faltan las llaves, avisamos en consola para saber qué pasa
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "❌ ERROR: Faltan las variables de entorno de Supabase. " +
    "Asegúrate de configurar VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en Netlify."
  );
}

export const supabase = createClient(
  supabaseUrl || '', 
  supabaseAnonKey || ''
);
