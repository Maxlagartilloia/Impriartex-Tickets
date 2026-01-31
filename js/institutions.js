// js/institutions.js - GESTIÓN DE CLIENTES V8.0

// ==========================================
// 1. INICIALIZACIÓN
// ==========================================
document.addEventListener('DOMContentLoaded', async () => {
    // Verificar que solo el Supervisor use este módulo
    const { data: { user } } = await sb.auth.getUser();
    const { data: profile } = await sb.from('profiles').select('role').eq('id', user.id).single();
    
    if(profile.role !== 'supervisor') {
        window.location.href = 'dashboard.html';
        return;
    }

    await loadTechnicians();
    await loadInstitutions();
});

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
    const { data: insts, error } = await sb
        .from('institutions')
        .select(`*, technician:profiles!institutions_technician_id_fkey(full_name)`)
        .order('name');

    const tbody = document.getElementById('instTable');
    
    tbody.innerHTML = insts.map(i => `
        <tr>
            <td>
                <div style="font-weight:700;">${i.name}</div>
                <div style="display:flex; align-items:center; gap:5px; margin-top:5px;">
                    <code style="font-size:10px; background:#f1f5f9; padding:2px 5px; border-radius:4px; color:#64748b;">${i.id}</code>
                    <button onclick="copyToClipboard('${i.id}')" style="border:none; background:none; cursor:pointer; color:var(--accent); font-size:12px;" title="Copiar ID para CSV">
                        <i class="fas fa-copy"></i>
                    </button>
                </div>
            </td>
            <td>${i.address || '---'}</td>
            <td><i class="fas fa-user-wrench" style="color:var(--accent);"></i> ${i.technician?.full_name || 'Sin asignar'}</td>
            <td style="text-align:right;">
                <button onclick="deleteInst('${i.id}')" style="background:none; border:none; color:#cbd5e1; cursor:pointer;"><i class="fas fa-trash"></i></button>
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
