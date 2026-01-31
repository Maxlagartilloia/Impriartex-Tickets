// js/technicians.js - GESTIÓN DE PERSONAL V8.0

// ==========================================
// 1. INICIALIZACIÓN
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    loadStaff();
});

// ==========================================
// 2. CARGA DE PERSONAL
// ==========================================
async function loadStaff() {
    // Consultamos perfiles que no sean clientes
    const { data: staff, error } = await sb
        .from('profiles')
        .select('*')
        .neq('role', 'client')
        .order('full_name');

    if (error) {
        console.error("Error cargando personal:", error);
        return;
    }
    renderStaff(staff);
}

function renderStaff(staff) {
    const container = document.getElementById('techList');
    
    if (staff.length === 0) {
        container.innerHTML = '<p style="color:#94a3b8;">No hay personal técnico registrado aún.</p>';
        return;
    }

    container.innerHTML = staff.map(person => {
        // Generar iniciales para el avatar
        const initials = person.full_name ? person.full_name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase() : '??';
        
        return `
            <div class="tech-card">
                <div class="avatar">${initials}</div>
                <div style="flex:1;">
                    <div style="font-weight:700; color:var(--primary);">${person.full_name}</div>
                    <div style="font-size:12px; color:#64748b; margin-bottom:5px;">${person.email}</div>
                    <span class="role-badge" style="${person.role === 'supervisor' ? 'background:#e0e7ff; color:#4338ca;' : ''}">
                        ${person.role === 'technician' ? 'Técnico' : 'Supervisor'}
                    </span>
                </div>
            </div>
        `;
    }).join('');
}
