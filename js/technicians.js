// js/technicians.js - GESTIÓN DE PERSONAL V8.0
document.addEventListener('DOMContentLoaded', () => {
    loadTechnicians();
});

async function loadTechnicians() {
    const { data: techs, error } = await sb
        .from('profiles')
        .select('*')
        .neq('role', 'client') // No mostramos clientes aquí
        .order('full_name');

    if (error) return console.error(error);

    const tbody = document.getElementById('techTable');
    tbody.innerHTML = techs.map(t => `
        <tr>
            <td><strong>${t.full_name}</strong></td>
            <td>${t.email}</td>
            <td>
                <span style="padding:4px 10px; border-radius:6px; font-size:11px; font-weight:800; background:#eff6ff; color:#1e40af;">
                    ${t.role.toUpperCase()}
                </span>
            </td>
            <td>
                <button onclick="deleteTech('${t.id}')" style="border:none; background:none; color:#ef4444; cursor:pointer;">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

document.getElementById('techForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    alert("Para registrar nuevos técnicos, asegúrate de que el usuario ya existe en Supabase Auth. Esta función vincula el perfil.");
    // Aquí iría la lógica de registro si usas una función Edge de Supabase
});

async function deleteTech(id) {
    if(confirm("¿Eliminar acceso a este técnico?")) {
        await sb.from('profiles').delete().eq('id', id);
        loadTechnicians();
    }
}
