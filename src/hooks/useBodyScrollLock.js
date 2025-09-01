import { useEffect, useRef } from 'react';

/**
 * Hook para bloquear scroll do body de forma confiável
 * Compatível com o sistema de scroll-fix.css
 */
export function useBodyScrollLock(isLocked) {
  const scrollPositionRef = useRef(0);
  const isLockedRef = useRef(false);

  useEffect(() => {
    // Se o estado não mudou, não faz nada
    if (isLocked === isLockedRef.current) return;

    const body = document.body;
    
    if (isLocked && !isLockedRef.current) {
      // BLOQUEAR: Salva posição atual e aplica scroll-locked
      scrollPositionRef.current = window.pageYOffset;
      
      // Aplica classe CSS que trabalha com scroll-fix.css
      body.classList.add('scroll-locked');
      body.style.top = `-${scrollPositionRef.current}px`;
      
      isLockedRef.current = true;
      
    } else if (!isLocked && isLockedRef.current) {
      // DESBLOQUEAR: Remove classe e restaura posição
      body.classList.remove('scroll-locked');
      body.style.position = '';
      body.style.top = '';
      body.style.width = '';
      body.style.overflow = '';
      
      // Restaura scroll position suavemente
      window.scrollTo(0, scrollPositionRef.current);
      
      isLockedRef.current = false;
    }

    // Cleanup function
    return () => {
      if (isLockedRef.current) {
        body.classList.remove('scroll-locked');
        body.style.position = '';
        body.style.top = '';
        body.style.width = '';
        body.style.overflow = '';
        window.scrollTo(0, scrollPositionRef.current);
        isLockedRef.current = false;
      }
    };
  }, [isLocked]);

  // Retorna estado atual do bloqueio
  return isLockedRef.current;
}

