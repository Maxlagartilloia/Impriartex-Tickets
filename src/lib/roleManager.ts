export type UserRole = 'ADMIN' | 'TECHNICIAN' | 'CLIENT';

export const canCreateTicket = (role: UserRole) => role === 'CLIENT' || role === 'ADMIN';
export const canAssignTechnician = (role: UserRole) => role === 'ADMIN';
export const canCloseTicket = (role: UserRole) => role === 'TECHNICIAN' || role === 'ADMIN';

// Filtro de base de datos por rol
export const getSecurityFilter = (user: any) => {
  if (user.role === 'CLIENT') return { institution_id: user.institution_id };
  if (user.role === 'TECHNICIAN') return { technician_id: user.id };
  return {}; // Admin ve todo
};
