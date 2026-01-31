// js/supabase.js - CONEXIÓN MAESTRA INTEGRADA (IMPRIARTEX V8.0)

// Credenciales integradas del proyecto
const LOCAL_URL = 'https://hhrqbatetzpwdhdovgjs.supabase.co';
const LOCAL_KEY = 'sb_publishable_Sf30BJgoL725IQ_g5UiFEA_MOH9YZcu';

// Lógica de detección: Usa variables de Netlify si existen, de lo contrario usa las locales
const SUPABASE_URL = window.env?.SUPABASE_URL || LOCAL_URL;
const SUPABASE_KEY = window.env?.SUPABASE_KEY || LOCAL_KEY;

// Inicialización del Cliente Global
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Exportación para uso en todo el ecosistema de la App
window.sb = sb;

console.log("🚀 Impriartex: Conexión Enterprise establecida con Supabase");
