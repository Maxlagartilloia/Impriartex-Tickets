// js/technicians.js - Gestión de Equipo para Alex Loor

document.addEventListener('DOMContentLoaded', () => {
    loadTechnicians();
});

async function loadTechnicians() {
    const { data: techs, error } = await sb
        .from('profiles')
        .select('*')
        .neq('role', 'client')
        .order('full_name');

    const tbody = document.getElementById('techTable');
    if (error) return;

    tbody.innerHTML = techs.map(t => `
        <tr>
            <td><strong>${t.full_name}</strong></td>
            <td>${t.email || '---'}</td>
            <td>
                <span style="padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; background: ${t.role === 'supervisor' ? '#fef3c7' : '#eff6ff'}; color: ${t.role === 'supervisor' ? '#92400e' : '#1e40af'};">
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

// 2. Registrar nuevo técnico (Acción de Alex)
document.getElementById('techForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('btnSave');
    
    btn.disabled = true;
    btn.innerText = "Registrando...";

    const name = document.getElementById('techName').value;
    const email = document.getElementById('techEmail').value;

    // PASO PROFESIONAL: 
    // Primero, creamos el perfil con un ID generado aleatoriamente para esta prueba.
    // (En un sistema SaaS real, aquí se dispara una invitación por correo)
    
   // Reemplaza la parte del "insert" en tu js/technicians.js
const { error } = await sb.from('profiles').insert([
    { 
        id: crypto.randomUUID(), // Genera un ID nuevo y único
        full_name: name, 
        email: email, 
        role: 'technician' 
    }
]);
    if (error) {
        alert("Error al registrar: " + error.message);
    } else {
        alert("✅ Técnico '" + name + "' registrado exitosamente.");
        e.target.reset();
        await loadTechnicians();
    }

    btn.disabled = false;
    btn.innerText = "Crear Técnico";
});
// Función para cerrar sesión
function logout() {
    sb.auth.signOut().then(() => {
        window.location.href = 'index.html';
    });
}
