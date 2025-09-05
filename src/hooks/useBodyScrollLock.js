import { useEffect, useRef } from 'react';

/**
 * Hook para bloquear scroll do body de forma limpa e confiável
 * Compatível com o sistema de scroll-fix-clean.css
 */
export function useBodyScrollLock(isLocked) {
  const scrollPositionRef = useRef(0);
  const isLockedRef = useRef(false);

  useEffect(() => {
    // Se o estado não mudou, não faz nada
    if (isLocked === isLockedRef.current) return;

    const body = document.body;

    if (isLocked && !isLockedRef.current) {
      // BLOQUEAR: Aplica classe que usa CSS limpo
      scrollPositionRef.current = window.pageYOffset;
      body.classList.add('scroll-locked');
      body.style.top = `-${scrollPositionRef.current}px`;
      isLockedRef.current = true;

    } else if (!isLocked && isLockedRef.current) {
      // DESBLOQUEAR: Remove classe e restaura posição
      body.classList.remove('scroll-locked');
      body.style.removeProperty('top');
      window.scrollTo(0, scrollPositionRef.current);
      isLockedRef.current = false;
    }

    // Cleanup function
    return () => {
      if (isLockedRef.current) {
        body.classList.remove('scroll-locked');
        body.style.removeProperty('top');
        isLockedRef.current = false;
      }
    };
  }, [isLocked]);

  // Retorna estado atual do bloqueio
  return isLockedRef.current;
}
