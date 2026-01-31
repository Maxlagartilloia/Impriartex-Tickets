// js/supabase.js - CONEXIÓN MAESTRA IMPRIARTEX V8.0

// 1. Configuración de Credenciales
const SUPABASE_URL = 'https://hhrqbatetzpwdhdovgjs.supabase.co';
const SUPABASE_KEY = 'sb_publishable_Sf30BJgoL725IQ_g5UiFEA_MOH9YZcu'; // Tu Anon Key pública

// 2. Inicialización del Cliente Global
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// 3. Exportación para uso en otros scripts
window.sb = sb;

console.log("🚀 Impriartex: Conexión con Supabase establecida correctamente.");
