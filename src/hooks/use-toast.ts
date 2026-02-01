import { useState } from 'react';

interface ToastProps {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success';
}

export function useToast() {
  const toast = ({ title, description, variant = 'default' }: ToastProps) => {
    // Definimos el color según la identidad de la empresa
    const headerColor = variant === 'success' ? '🔵 IMPRIARTEX ÉXITO' : 
                        variant === 'destructive' ? '🔴 ERROR CRÍTICO' : 
                        '🟡 AVISO IMPRIARTEX';

    // Log para el desarrollador con estilo (se ve en la consola del navegador)
    console.log(`%c${headerColor}`, "color: #0056b3; font-weight: bold; font-size: 12px;");
    console.log(`${title}: ${description || ''}`);

    // Alerta visual para el usuario
    const emoji = variant === 'destructive' ? '⚠️' : variant === 'success' ? '✅' : 'ℹ️';
    alert(`${emoji} IMPRIARTEX SOPORTE\n\n${title}\n${description || ''}`);
  };

  return { toast };
}
