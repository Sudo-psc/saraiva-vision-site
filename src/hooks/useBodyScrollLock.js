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
    const docEl = document.documentElement;

    if (isLocked && !isLockedRef.current) {
      // BLOQUEAR: Calcula largura da scrollbar para evitar layout shift
      const scrollbarWidth = window.innerWidth - docEl.clientWidth;
      body.style.setProperty('--scrollbar-width', `${Math.max(0, scrollbarWidth)}px`);
      // Não fixa o body (evita quebrar position: fixed dos filhos)
      body.classList.add('scroll-locked');
      isLockedRef.current = true;

    } else if (!isLocked && isLockedRef.current) {
      // DESBLOQUEAR: Remove classe e propriedades auxiliares
      body.classList.remove('scroll-locked');
      body.style.removeProperty('--scrollbar-width');
      body.style.overflow = '';
      isLockedRef.current = false;
    }

    // Cleanup function
    return () => {
      if (isLockedRef.current) {
        body.classList.remove('scroll-locked');
        body.style.removeProperty('--scrollbar-width');
        body.style.overflow = '';
        isLockedRef.current = false;
      }
    };
  }, [isLocked]);

  // Retorna estado atual do bloqueio
  return isLockedRef.current;
}
