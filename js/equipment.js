// js/equipment.js - GESTIÓN DE INVENTARIO E IMPORTACIÓN V9.0 (COMPLETO)

// ==========================================
// 1. INICIALIZACIÓN
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    loadEquipment();
    loadIdReferences(); // Carga la lista de ayuda para el CSV
    
    // Escuchadores de eventos
    const searchInput = document.getElementById('searchInput');
    if(searchInput) searchInput.addEventListener('input', filterTable);

    const csvInput = document.getElementById('csvInput');
    if(csvInput) csvInput.addEventListener('change', processCSV);
});

// ==========================================
// 2. CARGA Y RENDERIZADO DE TABLA
// ==========================================
async function loadEquipment() {
    // Traemos los equipos y el nombre de la institución relacionada
    const { data: equips, error } = await sb
        .from('equipment')
        .select('*, institutions(name)')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error cargando inventario:", error);
        return;
    }
    renderTable(equips);
}

function renderTable(data) {
    const tbody = document.getElementById('equipTable');
    if (!tbody) return;
    
    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:40px; color:#94a3b8;">Inventario vacío. Use "Carga Masiva" para empezar.</td></tr>';
        return;
    }

    tbody.innerHTML = data.map(eq => `
        <tr>
            <td>
                <div style="font-weight:700; color:#1e293b;">${eq.brand} ${eq.model}</div>
                <div style="font-size:11px; color:#64748b;">Añadido: ${new Date(eq.created_at).toLocaleDateString()}</div>
            </td>
            <td>
                <span class="id-badge" style="font-family:monospace; background:#f1f5f9; padding:2px 6px; border-radius:4px;">${eq.serial}</span>
                <div style="font-size:12px; color:#3b82f6; margin-top:4px;"><i class="fas fa-network-wired"></i> ${eq.ip_address || 'Sin IP'}</div>
            </td>
            <td>
                <div style="font-weight:600;">${eq.institutions?.name || 'No asignado'}</div>
                <div style="font-size:12px; color:#64748b;">${eq.physical_location || ''} ${eq.location_details ? ' - ' + eq.location_details : ''}</div>
            </td>
            <td>
                <span style="background:#dcfce7; color:#166534; padding:4px 10px; border-radius:6px; font-size:11px; font-weight:700;">ACTIVO</span>
            </td>
            <td style="text-align:right;">
                <button onclick="deleteEquip('${eq.id}')" style="background:none; border:none; color:#ef4444; cursor:pointer; font-size:16px;">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// ==========================================
// 3. IMPORTACIÓN MASIVA (CSV)
// ==========================================

// Función para procesar el archivo subido por Alex
async function processCSV(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
        const text = e.target.result;
        const rows = text.split('\n').slice(1); // Omitir cabecera
        
        let success = 0;
        let fail = 0;

        for (let row of rows) {
            const col = row.split(',');
            if (col.length < 7 || !col[6].trim()) continue; // Fila incompleta o sin ID de institución

            const { error } = await sb.from('equipment').insert([{
                physical_location: col[0].trim(),
                model:             col[1].trim(),
                brand:             col[2].trim(),
                serial:            col[3].trim(),
                ip_address:        col[4].trim(),
                location_details:  col[5].trim(),
                institution_id:    col[6].trim() // Este es el UUID que vincula al cliente
            }]);

            if (error) {
                console.error("Error en fila:", error);
                fail++;
            } else {
                success++;
            }
        }
        
        alert(`📊 Resultado de Importación:\n✅ ${success} Equipos cargados correctamente\n❌ ${fail} Filas con error`);
        loadEquipment();
    };
    reader.readAsText(file);
    event.target.value = ''; // Resetear para permitir subir el mismo archivo si se corrige
}

// ==========================================
// 4. UTILIDADES Y AYUDA (PARA ALEX)
// ==========================================

// Filtro de búsqueda rápida
function filterTable() {
    const term = document.getElementById('searchInput').value.toLowerCase();
    const rows = document.querySelectorAll('#equipTable tr');
    rows.forEach(row => {
        row.style.display = row.innerText.toLowerCase().includes(term) ? '' : 'none';
    });
}

// Eliminar equipo
async function deleteEquip(id) {
    if(confirm("¿Estás seguro de eliminar este equipo del inventario?")) {
        const { error } = await sb.from('equipment').delete().eq('id', id);
        if(!error) loadEquipment();
    }
}

// Esta función carga los IDs de las instituciones para que Alex los copie al CSV
async function loadIdReferences() {
    const { data: insts } = await sb.from('institutions').select('id, name').order('name');
    const container = document.getElementById('idReferenceList'); // Debe existir este ID en el HTML
    
    if(!container) return;

    container.innerHTML = insts.map(i => `
        <div style="background:#f8fafc; padding:12px; border-radius:10px; border:1px solid #e2e8f0; margin-bottom:10px;">
            <div style="font-size:12px; font-weight:800; color:var(--primary);">${i.name}</div>
            <div style="display:flex; align-items:center; justify-content:space-between; margin-top:5px;">
                <code style="font-size:10px; color:#3b82f6;">${i.id}</code>
                <button onclick="copyToClipboard('${i.id}')" style="border:none; background:var(--accent); color:white; border-radius:4px; padding:2px 8px; cursor:pointer; font-size:10px;">Copiar</button>
            </div>
        </div>
    `).join('');
}

// Función auxiliar para copiar el ID al portapapeles
window.copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
        alert("ID Copiado: " + text + "\nPégalo en la columna ID_Institucion_UUID de tu CSV.");
    });
};
