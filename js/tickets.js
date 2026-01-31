// js/tickets.js - SISTEMA INTEGRADO V8.0

let userProfile = null;

// ==========================================
// 1. INICIALIZACIÓN
// ==========================================
document.addEventListener('DOMContentLoaded', async () => {
    const { data: { user } } = await sb.auth.getUser();
    const { data: profile } = await sb.from('profiles').select('*').eq('id', user.id).single();
    userProfile = profile;

    // Mostrar botón solo a clientes
    if(profile.role === 'client') document.getElementById('btnNewTicket').style.display = 'block';

    loadTickets();
});

// ==========================================
// 2. LÓGICA DE CARGA Y RENDER (TABLA/GRID)
// ==========================================
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
        // Lógica de botones según rol
        let btnAccion = '';
        if(userProfile.role === 'technician' && t.status !== 'closed') {
            btnAccion = `<button onclick="openAttendModal('${t.id}', '${t.equipment_id}', '${t.equipment?.model}')" style="background:var(--accent); color:white; border:none; padding:5px 10px; border-radius:5px; cursor:pointer;">Atender</button>`;
        }
        if(t.status === 'closed') {
            btnAccion = `<button onclick="downloadPDF('${t.id}')" style="background:var(--closed); color:white; border:none; padding:5px 10px; border-radius:5px; cursor:pointer;"><i class="fas fa-file-pdf"></i> PDF</button>`;
        }

        return `
            <div class="ticket-card">
                <h4>${t.equipment?.model}</h4>
                <p>${t.description}</p>
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span class="status-badge">${t.status}</span>
                    ${btnAccion}
                </div>
            </div>
        `;
    }).join('');
}

// ==========================================
// 3. SECCIÓN CLIENTE: CREAR TICKETS
// ==========================================
window.openCreateModal = async () => {
    const { data: equips } = await sb.from('equipment').select('id, model, serial').eq('institution_id', userProfile.institution_id);
    document.getElementById('selectEquip').innerHTML = equips.map(e => `<option value="${e.id}">${e.model}</option>`).join('');
    document.getElementById('modalCreate').style.display = 'flex';
};

document.getElementById('formTicket').addEventListener('submit', async (e) => {
    e.preventDefault();
    const { data: inst } = await sb.from('institutions').select('technician_id').eq('id', userProfile.institution_id).single();
    const newTicket = {
        institution_id: userProfile.institution_id,
        equipment_id: document.getElementById('selectEquip').value,
        client_id: userProfile.id,
        technician_id: inst.technician_id,
        description: document.getElementById('txtDesc').value,
        status: 'open'
    };
    await sb.from('tickets').insert([newTicket]);
    location.reload();
});

// ==========================================
// 4. SECCIÓN TÉCNICO: ATENDER TICKETS
// ==========================================
window.openAttendModal = (tId, eId, model) => {
    document.getElementById('attendTicketId').value = tId;
    document.getElementById('attendEquipId').value = eId;
    document.getElementById('modalAttend').style.display = 'flex';
};

document.getElementById('formAttend').addEventListener('submit', async (e) => {
    e.preventDefault();
    const tId = document.getElementById('attendTicketId').value;
    const eId = document.getElementById('attendEquipId').value;
    
    await sb.from('tickets').update({ 
        diagnosis: document.getElementById('txtDiagnosis').value, 
        status: 'closed' 
    }).eq('id', tId);
    
    await sb.from('equipment').update({ 
        counter_bw: parseInt(document.getElementById('cntBW').value) 
    }).eq('id', eId);

    location.reload();
});

// ==========================================
// 5. SECCIÓN REPORTES: GENERAR PDF
// ==========================================
window.downloadPDF = async (ticketId) => {
    // Aquí pegaremos la función que inyecta datos en el HTML oculto y guarda el PDF
    alert("Generando PDF para el ticket: " + ticketId);
};

// Utilidad
window.closeModals = () => document.querySelectorAll('.modal-overlay').forEach(m => m.style.display = 'none');
