'use client';

import { useMemo } from 'react';
import { usePersona } from './usePersona';
import { MICROCOPY_LIBRARY } from '@/lib/microcopy/variants.config';
import { PersonaType } from '@/middleware/config/personas.config';

export function useMicrocopy(id: string, fallback?: string): string {
  const { currentPersona } = usePersona();
  
  const selectedVariant = useMemo(() => {
    const microcopy = MICROCOPY_LIBRARY.find(m => m.id === id);
    
    if (!microcopy) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Microcopy variant not found: ${id}`);
      }
      return fallback || '';
    }
    
    return microcopy.variants[currentPersona] || 
           microcopy.variants[PersonaType.DEFAULT] ||
           fallback ||
           '';
  }, [id, currentPersona, fallback]);
  
  return selectedVariant;
}

export function useMicrocopyBatch(ids: string[]): Record<string, string> {
  const { currentPersona } = usePersona();
  
  return useMemo(() => {
    return ids.reduce((acc, id) => {
      const microcopy = MICROCOPY_LIBRARY.find(m => m.id === id);
      acc[id] = microcopy?.variants[currentPersona] || '';
      return acc;
    }, {} as Record<string, string>);
  }, [ids, currentPersona]);
}
