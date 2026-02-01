import { useState } from 'react';

interface ToastProps {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success';
}

export function useToast() {
  const toast = ({ title, description, variant = 'default' }: ToastProps) => {
    const emoji = variant === 'destructive' ? '❌' : variant === 'success' ? '✅' : 'ℹ️';
    // Esto mostrará una alerta en el navegador mientras el sistema carga
    alert(`${emoji} ${title}\n${description || ''}`);
  };

  return { toast };
}
