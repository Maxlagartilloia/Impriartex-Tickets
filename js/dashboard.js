// js/dashboard.js - SISTEMA DE CONTROL INTELIGENTE V8.0

let userProfile = null;

// ==========================================
// 1. INICIALIZACIÓN Y ROLES
// ==========================================
document.addEventListener('DOMContentLoaded', async () => {
    const { data: { user } } = await sb.auth.getUser();
    const { data: profile } = await sb.from('profiles').select('*').eq('id', user.id).single();
    userProfile = profile;

    // Configurar Interfaz por Rol
    document.getElementById('pageTitle').innerText = `Dashboard ${profile.role.toUpperCase()}`;
    document.getElementById('userBadge').innerText = profile.full_name;
    
    if(profile.role === 'supervisor') {
        document.getElementById('adminMenu').style.display = 'block';
    }

    // Fechas por defecto (Mes en curso)
    const now = new Date();
    document.getElementById('dateTo').valueAsDate = now;
    document.getElementById('dateFrom').valueAsDate = new Date(now.getFullYear(), now.getMonth(), 1);

    initDashboard();
});

// ==========================================
// 2. MOTOR DE DATOS (KPIs)
// ==========================================
async function initDashboard() {
    const from = document.getElementById('dateFrom').value;
    const to = document.getElementById('dateTo').value + 'T23:59:59';

    let query = sb.from('tickets').select('status, created_at, institution_id, technician_id');

    // Filtros de Seguridad Atómicos
    if(userProfile.role === 'client') query = query.eq('institution_id', userProfile.institution_id);
    if(userProfile.role === 'technician') query = query.eq('technician_id', userProfile.id);

    const { data: tickets, error } = await query.gte('created_at', from).lte('created_at', to);

    if (error) return console.error(error);

    renderKPIs(tickets);
    renderRoleSpecificContent(tickets);
}

function renderKPIs(tickets) {
    const open = tickets.filter(t => t.status === 'open').length;
    const process = tickets.filter(t => t.status === 'progress').length;
    const closed = tickets.filter(t => t.status === 'closed').length;
    const total = tickets.length;

    document.getElementById('kpi-open').innerText = open;
    document.getElementById('kpi-process').innerText = process;
    document.getElementById('kpi-closed').innerText = closed;
    
    const sla = total > 0 ? Math.round((closed / total) * 100) : 0;
    document.getElementById('kpi-sla').innerText = sla + "%";
}

// ==========================================
// 3. CONTENIDO ESPECÍFICO POR ROL
// ==========================================
function renderRoleSpecificContent(tickets) {
    const container = document.getElementById('dynamicContent');
    
    if(userProfile.role === 'supervisor') {
        container.innerHTML = `
            <div class="card">
                <h3 class="kpi-label">Auditoría de Servicios Recientes</h3>
                <p style="color:#64748b; font-size:13px;">Mostrando los últimos tickets generados en el rango de fecha.</p>
                </div>
        `;
    } else {
        container.innerHTML = `
            <div class="card" style="text-align:center;">
                <h3 class="kpi-label">Resumen de Actividad</h3>
                <p>Bienvenido al portal de Impriartex. Use el menú lateral para gestionar sus servicios.</p>
            </div>
        `;
    }
}
