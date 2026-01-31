// js/equipment.js - Gestión de Inventario e Importación CSV

document.addEventListener('DOMContentLoaded', () => {
    loadEquipment();
});

// 1. CARGAR INVENTARIO COMPLETO
async function loadEquipment() {
    const { data: equips, error } = await sb
        .from('equipment')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error cargando equipos:", error);
        return;
    }
    renderTable(equips);
}

function renderTable(data) {
    const tbody = document.getElementById('equipTable');
    tbody.innerHTML = data.map(eq => `
        <tr>
            <td><strong>${eq.brand}</strong> ${eq.model}</td>
            <td style="font-weight:600; color:#0f172a;">${eq.serial}</td>
            <td><span class="badge-ip">${eq.ip_address || '---'}</span></td>
            <td style="font-size:11px; color:#94a3b8;">${eq.institution_id}</td>
            <td>${eq.physical_location}</td>
            <td>${eq.location_details || '---'}</td>
            <td><span style="color:#10b981; font-weight:700;">● ACTIVO</span></td>
        </tr>
    `).join('');
}

// 2. PROCESAR CSV (Basado en tu estructura de Google Sheets)
async function handleCSV(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
        const content = e.target.result;
        const rows = content.split('\n').slice(1); // Ignorar cabecera
        let success = 0;
        let errors = 0;

        for (let row of rows) {
            const col = row.split(',');
            if (col.length < 7) continue;

            // MAPEADO ESTRICTO SEGÚN TU EXCEL:
            // Col A: physical_location | Col B: model | Col C: brand | Col D: serial
            // Col E: ip_address | Col F: location_details | Col G: institution_id
            const { error } = await sb.from('equipment').insert([{
                physical_location: col[0].trim(),
                model: col[1].trim(),
                brand: col[2].trim(),
                serial: col[3].trim(),
                ip_address: col[4].trim(),
                location_details: col[5].trim(),
                institution_id: col[6].trim()
            }]);

            if (error) {
                console.error(`Error en serie ${col[3]}:`, error.message);
                errors++;
            } else {
                success++;
            }
        }
        alert(`Importación finalizada:\n✅ ${success} Equipos cargados\n❌ ${errors} Errores (ver consola)`);
        loadEquipment();
    };
    reader.readAsText(file);
}

// 3. BUSCADOR TIEMPO REAL
function filterEquipment() {
    const term = document.getElementById('searchInput').value.toLowerCase();
    const rows = document.querySelectorAll('#equipTable tr');
    rows.forEach(row => {
        const text = row.innerText.toLowerCase();
        row.style.display = text.includes(term) ? '' : 'none';
    });
}
