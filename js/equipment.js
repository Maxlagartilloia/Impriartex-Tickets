// js/equipment.js - GESTIÓN DE INVENTARIO E IMPORTACIÓN V8.0

// ==========================================
// 1. INICIALIZACIÓN
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    loadEquipment();
});

// ==========================================
// 2. CARGA Y RENDERIZADO DE TABLA
// ==========================================
async function loadEquipment() {
    const { data: equips, error } = await sb
        .from('equipment')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error cargando inventario:", error);
        return;
    }
    renderTable(equips);
}

function renderTable(data) {
    const tbody = document.getElementById('equipTable');
    
    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:40px; color:#94a3b8;">Inventario vacío. Use "Carga Masiva" para empezar.</td></tr>';
        return;
    }

    tbody.innerHTML = data.map(eq => `
        <tr>
            <td>
                <div style="font-weight:700;">${eq.brand}</div>
                <div style="font-size:12px; color:#64748b;">${eq.model}</div>
            </td>
            <td style="font-family:monospace; font-weight:600;">${eq.serial}</td>
            <td><span class="badge-ip">${eq.ip_address || '---'}</span></td>
            <td>${eq.physical_location || '---'}</td>
            <td style="font-size:11px;">${eq.location_details || '---'}</td>
            <td><span class="status-pill">Activo</span></td>
            <td style="text-align:right;">
                <button onclick="deleteEquip('${eq.id}')" style="background:none; border:none; color:#cbd5e1; cursor:pointer;"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

// ==========================================
// 3. IMPORTACIÓN MASIVA (CSV)
// ==========================================

// FUNCIÓN PARA GENERAR PLANTILLA OFICIAL
window.downloadCSVTemplate = () => {
    // Encabezados según el prompt maestro y el mapeo de Supabase
    const headers = ["Ubicacion_Macro", "Modelo", "Marca", "Serie", "IP_Address", "Ubicacion_Detalle", "ID_Institucion_UUID"];
    const example = ["PLANTA BAJA", "IM C400", "RICOH", "SERIE_EJEMPLO", "192.168.1.10", "OFICINA 1", "pegar-aqui-uuid-del-cliente"];
    
    const csvContent = headers.join(",") + "\n" + example.join(",");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    
    link.setAttribute("href", url);
    link.setAttribute("download", "Plantilla_Inventario_Impriartex.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

// FUNCIÓN PARA PROCESAR EL ARCHIVO SUBIDO
async function processCSV(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
        const text = e.target.result;
        const rows = text.split('\n').slice(1); // Omitimos la cabecera
        
        let success = 0;
        let fail = 0;

        for (let row of rows) {
            const col = row.split(',');
            if (col.length < 7) continue; // Fila incompleta

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
        
        alert(`📊 Proceso Completado:\n✅ ${success} Equipos cargados\n❌ ${fail} Errores`);
        loadEquipment();
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset input
}

// ==========================================
// 4. UTILIDADES
// ==========================================
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
