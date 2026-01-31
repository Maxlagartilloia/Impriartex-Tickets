// js/technicians.js - Gestión de Equipo para Alex Loor

document.addEventListener('DOMContentLoaded', () => {
    loadTechnicians();
});

// 1. Cargar lista de técnicos y supervisores
async function loadTechnicians() {
    const { data: techs, error } = await sb
        .from('profiles')
        .select('*')
        .neq('role', 'client') // Excluimos a los clientes de esta lista
        .order('full_name');

    const tbody = document.getElementById('techTable');
    
    if (error) {
        console.error("Error:", error);
        return;
    }

    tbody.innerHTML = techs.map(t => `
        <tr>
            <td><strong>${t.full_name}</strong></td>
            <td>${t.email || '---'}</td>
            <td>
                <span class="${t.role === 'supervisor' ? 'badge-sup' : 'badge-tech'}">
                    ${t.role.toUpperCase()}
                </span>
            </td>
            <td>
                <button onclick="deleteTech('${t.id}')" style="border:none; background:none; color:#cbd5e1; cursor:pointer;">
                    <i class="fas fa-trash"></i>
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
