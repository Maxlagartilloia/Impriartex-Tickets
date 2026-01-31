// js/tickets.js - SISTEMA INTEGRADO V9.0 (VERSIÓN COMPLETA)

let userProfile = null;

// ==========================================
// 1. INICIALIZACIÓN Y SEGURIDAD
// ==========================================
document.addEventListener('DOMContentLoaded', async () => {
    const { data: { user } } = await sb.auth.getUser();
    if (!user) {
        window.location.href = 'index.html';
        return;
    }

    // Obtenemos el perfil completo del usuario logueado
    const { data: profile } = await sb.from('profiles').select('*').eq('id', user.id).single();
    userProfile = profile;

    // Solo los clientes ven el botón de "Crear Ticket"
    const btnNew = document.getElementById('btnNewTicket');
    if(btnNew) {
        btnNew.style.display = profile.role === 'client' ? 'block' : 'none';
    }

    loadTickets();
});

// ==========================================
// 2. CARGA DE DATOS Y KPIs
// ==========================================
async function loadTickets() {
    // Consulta relacional completa para traer nombres de instituciones y técnicos
    let query = sb.from('tickets').select(`
        *,
        equipment(model, serial, brand, counter_bw, counter_color, physical_location, location_details),
        institutions(name, address),
        technician:profiles!technician_id(full_name)
    `);
    
    // Filtros de privacidad por Rol
    if(userProfile.role === 'client') {
        query = query.eq('institution_id', userProfile.institution_id);
    } else if(userProfile.role === 'technician') {
        query = query.eq('technician_id', userProfile.id);
    }
    // El Supervisor (Alex) ve todos los tickets por defecto

    const { data: tickets, error } = await query.order('created_at', { ascending: false });
    
    if (error) {
        console.error("Error cargando tickets:", error);
        return;
    }

    updateKPIs(tickets);
    renderTickets(tickets);
}

function updateKPIs(tickets) {
    const open = tickets.filter(t => t.status === 'open').length;
    const process = tickets.filter(t => t.status === 'progress').length;
    const closed = tickets.filter(t => t.status === 'closed').length;

    if(document.getElementById('count-open')) document.getElementById('count-open').innerText = open;
    if(document.getElementById('count-process')) document.getElementById('count-process').innerText = process;
    if(document.getElementById('count-closed')) document.getElementById('count-closed').innerText = closed;
}

// ==========================================
// 3. RENDERIZADO DE LA INTERFAZ
// ==========================================
function renderTickets(tickets) {
    const tbody = document.getElementById('ticketTable');
    if (!tbody) return;

    tbody.innerHTML = tickets.map(t => {
        let btnAccion = '';
        
        // Lógica de botones según estado y rol
        if(t.status === 'closed') {
            btnAccion = `<button onclick="downloadPDF('${t.id}')" class="btn-primary" style="background:#475569;"><i class="fas fa-file-pdf"></i> Reporte</button>`;
        } else if (userProfile.role !== 'client') {
            btnAccion = `<button onclick="openAttendModal('${t.id}', '${t.equipment_id}', '${t.equipment?.model}')" class="btn-primary">Atender</button>`;
        } else {
            btnAccion = `<span style="color:#94a3b8; font-size:12px;">En espera</span>`;
        }

        return `
            <tr>
                <td>
                    <div style="font-weight:700;">#${t.ticket_number || '---'}</div>
                    <div style="font-size:12px; color:#64748b;">${new Date(t.created_at).toLocaleDateString()}</div>
                </td>
                <td>
                    <div style="font-weight:600;">${t.institutions?.name || 'Cliente'}</div>
                    <div style="font-size:12px; color:#3b82f6;">${t.equipment?.model || 'Equipo'} - ${t.equipment?.serial || ''}</div>
                </td>
                <td>
                    <div style="font-size:13px; color:#ef4444; font-weight:600;">${t.description}</div>
                </td>
                <td>
                    <span style="padding:4px 10px; border-radius:6px; font-size:11px; font-weight:800; text-transform:uppercase; 
                    background:${t.status === 'closed' ? '#dcfce7' : '#fee2e2'}; 
                    color:${t.status === 'closed' ? '#166534' : '#991b1b'};">
                        ${t.status === 'open' ? 'Abierto' : (t.status === 'progress' ? 'En Proceso' : 'Finalizado')}
                    </span>
                </td>
                <td style="text-align:right;">${btnAccion}</td>
            </tr>
        `;
    }).join('');
}

// ==========================================
// 4. GESTIÓN DE SERVICIO (MODALES)
// ==========================================
window.openAttendModal = (tId, eId, model) => {
    // Estas funciones deben estar conectadas a los IDs de los inputs en tu modal de tickets.html
    const modal = document.getElementById('modalAttend');
    if(modal) {
        document.getElementById('attendTicketId').value = tId;
        document.getElementById('attendEquipId').value = eId;
        modal.style.display = 'flex';
    }
};

// Cierre de ticket por parte del Técnico
async function finalizarServicio(e) {
    const tId = document.getElementById('attendTicketId').value;
    const eId = document.getElementById('attendEquipId').value;
    
    const { error: tErr } = await sb.from('tickets').update({ 
        diagnosis: document.getElementById('txtDiagnosis').value,
        solution: document.getElementById('txtSolution').value,
        status: 'closed' 
    }).eq('id', tId);
    
    const { error: eErr } = await sb.from('equipment').update({ 
        counter_bw: parseInt(document.getElementById('cntBW').value),
        counter_color: parseInt(document.getElementById('cntColor').value)
    }).eq('id', eId);

    if(!tErr && !eErr) {
        alert("✅ Servicio finalizado y reporte generado.");
        location.reload();
    }
}

// ==========================================
// 5. GENERACIÓN DE REPORTES PDF
// ==========================================
window.downloadPDF = async (ticketId) => {
    const { data: t } = await sb.from('tickets').select(`
        *,
        equipment (*),
        institutions (*),
        technician:profiles!technician_id(full_name)
    `).eq('id', ticketId).single();

    // Mapeo de datos a la plantilla oculta del PDF
    document.getElementById('pdf-ticket-num').innerText = "#" + t.ticket_number;
    document.getElementById('pdf-date').innerText = new Date(t.created_at).toLocaleDateString();
    document.getElementById('pdf-inst').innerText = t.institutions?.name;
    document.getElementById('pdf-equip').innerText = t.equipment?.brand + " " + t.equipment?.model;
    document.getElementById('pdf-tech').innerText = t.technician?.full_name;
    document.getElementById('pdf-solution').innerText = t.solution;

    const element = document.getElementById('pdf-content');
    const opt = {
        margin: 10,
        filename: `Reporte_${t.ticket_number}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
};
