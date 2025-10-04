'use client';

import { useState, useEffect } from 'react';
import { PersonaType } from '@/middleware/config/personas.config';

export function usePersona() {
  const [currentPersona, setCurrentPersona] = useState<PersonaType>(PersonaType.DEFAULT);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const personaFromCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('persona_hint='))
      ?.split('=')[1];
    
    if (personaFromCookie && Object.values(PersonaType).includes(personaFromCookie as PersonaType)) {
      setCurrentPersona(personaFromCookie as PersonaType);
    }
    
    setIsLoading(false);
  }, []);
  
  const setPersona = (persona: PersonaType) => {
    setCurrentPersona(persona);
    
    document.cookie = `persona_hint=${persona}; path=/; max-age=${60 * 60 * 24 * 30}; ${
      process.env.NODE_ENV === 'production' ? 'secure; ' : ''
    }samesite=strict`;
  };
  
  return { currentPersona, isLoading, setPersona };
}
