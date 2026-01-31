// js/tickets.js - Gestión de Soporte y Auto-Asignación

let userProfile = null;

document.addEventListener('DOMContentLoaded', async () => {
    const { data: { user } } = await sb.auth.getUser();
    const { data: profile } = await sb.from('profiles').select('*').eq('id', user.id).single();
    userProfile = profile;

    if(profile.role !== 'client') document.getElementById('btnNewTicket').style.display = 'none';

    loadTickets();
});

async function loadTickets() {
    let query = sb.from('tickets').select('*, equipment(model, serial), institutions(name)');
    
    if(userProfile.role === 'client') query = query.eq('institution_id', userProfile.institution_id);
    if(userProfile.role === 'technician') query = query.eq('technician_id', userProfile.id);

    const { data: tickets } = await query.order('created_at', { ascending: false });
    renderTickets(tickets);
}

function renderTickets(tickets) {
    const grid = document.getElementById('ticketsGrid');
    grid.innerHTML = tickets.map(t => {
        const statusColors = { open: '#ef4444', progress: '#f59e0b', closed: '#10b981' };
        return `
            <div class="ticket-card" style="border-top-color: ${statusColors[t.status]}">
                <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
                    <span style="font-size:12px; font-weight:700; color:#94a3b8;">#${t.ticket_number}</span>
                    <span class="status-badge" style="background:${statusColors[t.status]}20; color:${statusColors[t.status]}">
                        ${t.status}
                    </span>
                </div>
                <h4 style="margin:5px 0;">${t.equipment?.model}</h4>
                <p style="font-size:12px; color:#64748b;">SN: ${t.equipment?.serial}</p>
                <p style="font-size:13px; background:#f8fafc; padding:10px; border-radius:6px;">${t.description}</p>
                <div style="font-size:11px; color:#94a3b8; border-top:1px solid #f1f5f9; padding-top:10px;">
                    <i class="fas fa-building"></i> ${t.institutions?.name}
                </div>
            </div>
        `;
    }).join('');
}

// LÓGICA DE AUTO-ASIGNACIÓN (ADN DEL SISTEMA)
async function openCreateModal() {
    // Cargar equipos de la institución del cliente
    const { data: equips } = await sb.from('equipment').select('id, model, serial').eq('institution_id', userProfile.institution_id);
    const select = document.getElementById('selectEquip');
    select.innerHTML = equips.map(e => `<option value="${e.id}">${e.model} - ${e.serial}</option>`).join('');
    
    document.getElementById('modalCreate').style.display = 'flex';
}

document.getElementById('formTicket').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // 1. Obtener el Técnico Fijo de la Institución (Auto-Asignación)
    const { data: inst } = await sb.from('institutions').select('technician_id').eq('id', userProfile.institution_id).single();

    const newTicket = {
        institution_id: userProfile.institution_id,
        equipment_id: document.getElementById('selectEquip').value,
        client_id: userProfile.id,
        technician_id: inst.technician_id, // Aquí ocurre la magia
        description: document.getElementById('txtDesc').value,
        status: 'open'
    };

    const { error } = await sb.from('tickets').insert([newTicket]);

    if(error) alert(error.message);
    else {
        alert("✅ Reporte enviado al técnico asignado.");
        closeModals();
        loadTickets();
    }
});

function closeModals() { document.querySelectorAll('.modal-overlay').forEach(m => m.style.display = 'none'); }
