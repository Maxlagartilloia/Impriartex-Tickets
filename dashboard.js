// js/dashboard.js - Motor de Datos Impriartex

let userProfile = null;

document.addEventListener('DOMContentLoaded', async () => {
    const { data: { user } } = await sb.auth.getUser();
    
    // Obtener perfil para conocer el Rol
    const { data: profile } = await sb.from('profiles').select('*').eq('id', user.id).single();
    userProfile = profile;

    // UI por Rol
    document.getElementById('userRole').innerText = profile.role.toUpperCase();
    if(profile.role === 'supervisor') {
        document.getElementById('adminMenu').style.display = 'block';
    }

    // Fechas por defecto (Mes actual)
    const now = new Date();
    document.getElementById('dateTo').valueAsDate = now;
    document.getElementById('dateFrom').valueAsDate = new Date(now.getFullYear(), now.getMonth(), 1);

    loadDashboardData();
});

async function loadDashboardData() {
    const from = document.getElementById('dateFrom').value;
    const to = document.getElementById('dateTo').value;

    let query = sb.from('tickets').select(`
        *,
        institutions(name),
        equipment(model)
    `)
    .gte('created_at', from)
    .lte('created_at', to + 'T23:59:59');

    // Filtros de seguridad (ADN del sistema)
    if(userProfile.role === 'client') {
        query = query.eq('institution_id', userProfile.institution_id);
    } else if(userProfile.role === 'technician') {
        query = query.eq('technician_id', userProfile.id);
    }

    const { data: tickets, error } = await query.order('created_at', { ascending: false });

    if(!error) renderDashboard(tickets);
}

function renderDashboard(tickets) {
    const open = tickets.filter(t => t.status === 'open').length;
    const progress = tickets.filter(t => t.status === 'progress').length;
    const closed = tickets.filter(t => t.status === 'closed').length;
    const total = tickets.length;

    document.getElementById('openCount').innerText = open;
    document.getElementById('processCount').innerText = progress;
    document.getElementById('closedCount').innerText = closed;
    
    const sla = total > 0 ? Math.round((closed / total) * 100) : 0;
    document.getElementById('slaPerc').innerText = sla + "%";

    const tbody = document.getElementById('ticketTable');
    tbody.innerHTML = tickets.map(t => `
        <tr>
            <td>#${t.ticket_number}</td>
            <td>${new Date(t.created_at).toLocaleDateString()}</td>
            <td>${t.institutions?.name || '---'}</td>
            <td>${t.equipment?.model || '---'}</td>
            <td><span class="status status-${t.status}">${t.status.toUpperCase()}</span></td>
        </tr>
    `).join('');
}
