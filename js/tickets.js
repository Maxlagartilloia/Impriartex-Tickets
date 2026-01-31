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
// 5. SECCIÓN REPORTES: GENERAR PDF PREMIUM
// ==========================================
window.downloadPDF = async (ticketId) => {
    console.log("🖨️ Iniciando generación de PDF para:", ticketId);

    // 1. Obtener datos completos del Ticket con sus relaciones
    const { data: t, error } = await sb
        .from('tickets')
        .select(`
            *,
            equipment (*),
            institutions (*),
            technician:profiles!technician_id(full_name)
        `)
        .eq('id', ticketId)
        .single();

    if (error) {
        alert("Error al recuperar datos para el PDF: " + error.message);
        return;
    }

    // 2. Llenar la plantilla HTML oculta (La que pusimos en tickets.html)
    document.getElementById('pdf-ticket-num').innerText = "#" + t.ticket_number;
    document.getElementById('pdf-date').innerText = new Date(t.created_at).toLocaleDateString();
    document.getElementById('pdf-inst').innerText = t.institutions?.name || 'S/N';
    document.getElementById('pdf-equip').innerText = `${t.equipment?.brand || ''} ${t.equipment?.model || ''}`;
    document.getElementById('pdf-serial-print').innerText = t.equipment?.serial || 'S/N';
    document.getElementById('pdf-loc').innerText = `${t.equipment?.physical_location || ''} - ${t.equipment?.location_details || ''}`;
    document.getElementById('pdf-tech').innerText = t.technician?.full_name || 'Técnico Asignado';
    document.getElementById('pdf-desc').innerText = t.description || '';
    document.getElementById('pdf-solution').innerText = `DIAGNÓSTICO: ${t.diagnosis || 'N/A'}\n\nSOLUCIÓN: ${t.solution || 'N/A'}`;
    document.getElementById('pdf-bw').innerText = t.equipment?.counter_bw || 0;
    document.getElementById('pdf-col').innerText = t.equipment?.counter_color || 0;

    // 3. Configuración del motor html2pdf
    const element = document.getElementById('pdf-content');
    const opt = {
        margin:       0,
        filename:     `Reporte_Impriartex_T${t.ticket_number}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, letterRendering: true },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // 4. Ejecutar conversión y descarga
    const container = document.getElementById('pdf-template-container');
    container.style.display = 'block'; // Mostrar temporalmente para captura

    html2pdf().set(opt).from(element).save().then(() => {
        container.style.display = 'none'; // Volver a ocultar
        console.log("✅ PDF generado con éxito");
    }).catch(err => {
        console.error("Error html2pdf:", err);
        container.style.display = 'none';
    });
};
