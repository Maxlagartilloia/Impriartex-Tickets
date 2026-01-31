// js/institutions.js - Lógica de Clientes y Asignación Técnica

document.addEventListener('DOMContentLoaded', async () => {
    await loadTechnicians();
    await loadInstitutions();
});

// Cargar técnicos en el select para asignar
async function loadTechnicians() {
    const { data: techs } = await sb.from('profiles').select('id, full_name').eq('role', 'technician');
    const select = document.getElementById('techSelect');
    select.innerHTML = '<option value="">-- Seleccionar Técnico --</option>';
    techs.forEach(t => {
        select.innerHTML += `<option value="${t.id}">${t.full_name}</option>`;
    });
}

// Cargar lista de instituciones
async function loadInstitutions() {
    const { data: insts } = await sb.from('institutions').select(`
        *,
        technician:profiles!institutions_technician_id_fkey(full_name)
    `).order('name');

    const tbody = document.getElementById('instTable');
    tbody.innerHTML = insts.map(i => `
        <tr>
            <td><strong>${i.name}</strong></td>
            <td>${i.address || '---'}</td>
            <td><i class="fas fa-user-wrench" style="color:#64748b"></i> ${i.technician?.full_name || 'No asignado'}</td>
            <td>
                <button onclick="deleteInst('${i.id}')" class="btn-del"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

// Guardar nueva institución
document.getElementById('instForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('instName').value;
    const address = document.getElementById('instAddress').value;
    const technician_id = document.getElementById('techSelect').value;

    const { error } = await sb.from('institutions').insert([{ name, address, technician_id }]);

    if (error) alert("Error: " + error.message);
    else {
        alert("✅ Institución registrada");
        document.getElementById('instForm').reset();
        loadInstitutions();
    }
});

async function deleteInst(id) {
    if (confirm("¿Eliminar esta institución? Se perderán sus equipos vinculados.")) {
        await sb.from('institutions').delete().eq('id', id);
        loadInstitutions();
    }
}
