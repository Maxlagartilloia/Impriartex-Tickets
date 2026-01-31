// js/security.js - PROTECCIÓN DE RUTAS Y ROLES IMPRIARTEX V8.0

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Verificar sesión activa
    const { data: { user }, error: authError } = await sb.auth.getUser();
    
    if (authError || !user) {
        console.log("Acceso no autorizado");
        if (!window.location.pathname.includes('index.html')) {
            window.location.href = 'index.html';
        }
        return;
    }

    // 2. Obtener Perfil y Rol
    const { data: profile, error: profError } = await sb
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (profError || !profile) {
        console.error("Error de perfil:", profError);
        return;
    }

    // 3. Inyectar Identidad en la Interfaz (Top Bar)
    const badge = document.getElementById('userBadge');
    if (badge) {
        badge.innerHTML = `<i class="fas fa-user-circle"></i> ${profile.full_name} <span style="font-size:9px; background:rgba(0,0,0,0.1); padding:2px 6px; border-radius:4px; margin-left:5px;">${profile.role.toUpperCase()}</span>`;
    }

    // 4. Control de Menú Administrativo
    const adminMenu = document.getElementById('adminMenu');
    if (adminMenu) {
        adminMenu.style.display = (profile.role === 'supervisor') ? 'block' : 'none';
    }

    // 5. Bloqueo Físico de URLs (RBAC)
    const path = window.location.pathname;
    const adminPages = ['institutions.html', 'technicians.html'];
    const isRestricted = adminPages.some(page => path.includes(page));

    if (isRestricted && profile.role !== 'supervisor') {
        alert("⛔ Acceso restringido. Redirigiendo al Dashboard...");
        window.location.href = 'dashboard.html';
    }
});

// Función de salida global
window.logout = async () => {
    await sb.auth.signOut();
    window.location.href = 'index.html';
};
