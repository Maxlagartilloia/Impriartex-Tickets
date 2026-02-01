export interface Equipment {
  id: string;
  brand: string;
  model: string;
  serial: string;
  ip_address?: string;
  physical_location?: string;
}

export interface Ticket {
  id: string;
  ticket_number: number;
  created_at: string;
  arrival_time?: string;
  closed_at?: string;
  status: 'open' | 'assigned' | 'in_progress' | 'closed';
  priority: 'Crítica' | 'Alta' | 'Media' | 'Baja';
  request_type: string;
  equipment?: Equipment;
  response_time_minutes?: number;
}
