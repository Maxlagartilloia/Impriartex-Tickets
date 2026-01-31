// js/institutions.js - GESTIÓN DE CLIENTES V8.0

// ==========================================
// 3. ACCIONES (GUARDAR Y ELIMINAR)
// ==========================================
document.getElementById('instForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const btn = e.target.querySelector('button');
    btn.disabled = true;
    btn.innerText = "Guardando...";

    // CAPTURA DE DATOS CON NUEVOS CAMPOS ENTERPRISE
    const newInst = {
        name: document.getElementById('instName').value,
        address: document.getElementById('instAddress').value,
        contact_name: document.getElementById('instContact').value, // Nuevo: Nombre Admin
        contact_phone: document.getElementById('instPhone').value, // Nuevo: Teléfono Admin
        technician_id: document.getElementById('techSelect').value
    };

    const { error } = await sb.from('institutions').insert([newInst]);

    if(error) {
        alert("Error al guardar: " + error.message);
    } else {
        alert("✅ Institución y Contacto registrados correctamente.");
        e.target.reset();
        await loadInstitutions();
    }
    
    btn.disabled = false;
    btn.innerText = "Guardar Cliente";
});;

// ==========================================
// 2. CARGA DE DATOS (TÉCNICOS Y CLIENTES)
// ==========================================
async function loadTechnicians() {
    const { data: techs } = await sb
        .from('profiles')
        .select('id, full_name')
        .eq('role', 'technician')
        .order('full_name');

    const select = document.getElementById('techSelect');
    select.innerHTML = '<option value="">-- Seleccionar Técnico --</option>';
    
    techs.forEach(t => {
        select.innerHTML += `<option value="${t.id}">${t.full_name}</option>`;
    });
}

async function loadInstitutions() {
    const { data: insts } = await sb
        .from('institutions')
        .select('*, technician:profiles!technician_id(full_name)')
        .order('name');

    const tbody = document.getElementById('instTable');
    tbody.innerHTML = insts.map(i => `
        <tr>
            <td>
                <div style="font-weight: 700; color: #1e293b;">${i.name}</div>
                <div style="font-family: monospace; font-size: 10px; color: #94a3b8;">ID: ${i.id.substring(0,8)}...</div>
            </td>
            <td>
                <div style="font-size: 13px;"><i class="fas fa-map-marker-alt" style="color:#94a3b8;"></i> ${i.address || '---'}</div>
                <div style="font-size: 13px; color: #3b82f6;"><i class="fas fa-user-tie"></i> ${i.contact_name || '---'} | ${i.contact_phone || ''}</div>
            </td>
            <td>
                <span style="font-weight: 600; color: #475569;"><i class="fas fa-user-check" style="color:#10b981;"></i> ${i.technician?.full_name || 'PENDIENTE'}</span>
            </td>
            <td>
                <button onclick="deleteInst('${i.id}')" style="border:none; background:none; color:#cbd5e1; cursor:pointer;"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}
// Utilidad para copiar al portapapeles
window.copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
        alert("ID Copiado: " + text + "\nYa puedes pegarlo en tu archivo Excel.");
    });
};

// ==========================================
// 3. ACCIONES (GUARDAR Y ELIMINAR)
// ==========================================
document.getElementById('instForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const btn = e.target.querySelector('button');
    btn.disabled = true;
    btn.innerText = "Guardando...";

    const newInst = {
        name: document.getElementById('instName').value,
        address: document.getElementById('instAddress').value,
        technician_id: document.getElementById('techSelect').value
    };

    const { error } = await sb.from('institutions').insert([newInst]);

    if(error) {
        alert("Error al guardar: " + error.message);
    } else {
        alert("✅ Institución registrada exitosamente.");
        e.target.reset();
        await loadInstitutions();
    }
    
    btn.disabled = false;
    btn.innerText = "Guardar Cliente";
});

async function deleteInst(id) {
    if(confirm("⚠️ ¿Estás seguro? Al eliminar el cliente se borrarán sus equipos e historial de tickets.")) {
        const { error } = await sb.from('institutions').delete().eq('id', id);
        if(error) alert(error.message);
        else loadInstitutions();
    }
}
