// --- FUNCIONES DE ATENCIÓN TÉCNICA (AGREGAR A TICKETS.JS) ---

// 1. Abrir Modal de Atención (Solo para Técnicos)
window.openAttendModal = (ticketId, equipId, info) => {
    document.getElementById('attendTicketId').value = ticketId;
    document.getElementById('attendEquipId').value = equipId;
    document.getElementById('attendInfo').innerText = "Equipo: " + info;
    
    // Poner hora actual de salida por defecto
    const now = new Date();
    document.getElementById('departureTime').value = now.getHours().toString().padStart(2, '0') + ":" + now.getMinutes().toString().padStart(2, '0');
    
    document.getElementById('modalAttend').style.display = 'flex';
};

// 2. Procesar el Cierre del Ticket
document.getElementById('formAttend').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const tId = document.getElementById('attendTicketId').value;
    const eId = document.getElementById('attendEquipId').value;
    const status = document.getElementById('selStatus').value;

    // A. Actualizar el Ticket
    const ticketUpdates = {
        diagnosis: document.getElementById('txtDiagnosis').value,
        solution: document.getElementById('txtSolution').value,
        spare_parts: document.getElementById('txtSpares').value,
        status: status,
        departure_time: new Date().toISOString() // Grabamos timestamp real
    };

    // B. Actualizar los Contadores del Equipo (Persistencia de Datos)
    const equipUpdates = {
        counter_bw: parseInt(document.getElementById('cntBW').value),
        counter_color: parseInt(document.getElementById('cntColor').value)
    };

    const { error: err1 } = await sb.from('tickets').update(ticketUpdates).eq('id', tId);
    const { error: err2 } = await sb.from('equipment').update(equipUpdates).eq('id', eId);

    if (err1 || err2) {
        alert("Error al guardar: " + (err1?.message || err2?.message));
    } else {
        alert("✅ Servicio registrado y contadores actualizados.");
        closeModals();
        loadTickets();
    }
});

// Modificamos el render original para que el técnico vea el botón de atender
// Busca la función renderTickets anterior y asegúrate de que incluya este botón si el rol es técnico:
/*
   if(userProfile.role === 'technician' && t.status !== 'closed') {
      actionBtn = `<button onclick="openAttendModal('${t.id}', '${t.equipment_id}', '${t.equipment?.model}')" class="btn-primary" style="font-size:12px; padding:8px;">Atender Ticket</button>`;
   }
*/
