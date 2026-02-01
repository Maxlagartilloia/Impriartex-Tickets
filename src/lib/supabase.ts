import { createClient } from '@supabase/supabase-js';

// Reemplaza los valores de abajo con los que aparecen en tu panel de Supabase
// (Settings -> API)
const supabaseUrl = 'https://tu-proyecto-id.supabase.co'; 
const supabaseAnonKey = 'tu-clave-anon-publica-aqui';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
