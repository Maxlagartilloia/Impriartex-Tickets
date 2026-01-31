// js/equipment.js - GESTIÓN DE INVENTARIO V9.0

document.addEventListener('DOMContentLoaded', () => {
    loadEquipment();
    loadIdReferences(); // Para que Alex copie los IDs de las instituciones
    
    // Escuchador para búsqueda en tiempo real
    document.getElementById('searchInput').addEventListener('input', filterTable);
    
    // Escuchador para carga masiva
    document.getElementById('csvInput').addEventListener('change', processCSV);
});

async function loadEquipment() {
    const { data: equips, error } = await sb
        .from('equipment')
        .select('*, institutions(name)')
        .order('created_at', { ascending: false });

    if (error) return console.error("Error:", error);
    renderTable(equips);
}

function renderTable(data) {
    const tbody = document.getElementById('equipTable');
    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:40px; color:#94a3b8;">Sin equipos. Use "Carga Masiva".</td></tr>';
        return;
    }

    tbody.innerHTML = data.map(eq => `
        <tr>
            <td>
                <div style="font-weight:700; color:#1e293b;">${eq.brand} ${eq.model}</div>
                <div style="font-size:11px; color:#64748b;">Agregado: ${new Date(eq.created_at).toLocaleDateString()}</div>
            </td>
            <td>
                <span class="id-badge">${eq.serial}</span>
                <div style="font-size:12px; color:#3b82f6; margin-top:4px;"><i class="fas fa-network-wired"></i> ${eq.ip_address || 'Sin IP'}</div>
            </td>
            <td>
                <div style="font-weight:600;">${eq.institutions?.name || 'No asignado'}</div>
                <div style="font-size:12px; color:#64748b;">${eq.physical_location || ''} - ${eq.location_details || ''}</div>
            </td>
            <td><span style="background:#dcfce7; color:#166534; padding:4px 10px; border-radius:6px; font-size:11px; font-weight:700;">ACTIVO</span></td>
            <td>
                <button onclick="deleteEquip('${eq.id}')" style="background:none; border:none; color:#ef4444; cursor:pointer; font-size:16px;">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

async function processCSV(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
        const text = e.target.result;
        const rows = text.split('\n').slice(1);
        let success = 0; let fail = 0;

        for (let row of rows) {
            const col = row.split(',');
            if (col.length < 7) continue;

            const { error } = await sb.from('equipment').insert([{
                physical_location: col[0].trim(),
                model:             col[1].trim(),
                brand:             col[2].trim(),
                serial:            col[3].trim(),
                ip_address:        col[4].trim(),
                location_details:  col[5].trim(),
                institution_id:    col[6].trim()
            }]);
            if (error) fail++; else success++;
        }
        alert(`📊 Carga Masiva:\n✅ ${success} Éxitos\n❌ ${fail} Errores`);
        loadEquipment();
    };
    reader.readAsText(file);
}

function filterTable() {
    const term = document.getElementById('searchInput').value.toLowerCase();
    const rows = document.querySelectorAll('#equipTable tr');
    rows.forEach(row => {
        row.style.display = row.innerText.toLowerCase().includes(term) ? '' : 'none';
    });
}

async function deleteEquip(id) {
    if(confirm("¿Eliminar equipo definitivamente?")) {
        await sb.from('equipment').delete().eq('id', id);
        loadEquipment();
    }
}
