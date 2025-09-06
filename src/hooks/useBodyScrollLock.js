import { useEffect, useRef } from 'react';

/**
 * Hook para bloquear scroll do body de forma limpa e confiável
 * Compatível com o sistema de scroll-fix-clean.css
 * Não usa position:fixed para evitar quebrar widgets
 */
export function useBodyScrollLock(isLocked) {
  const isLockedRef = useRef(false);
  const scrollPositionRef = useRef(0);

  useEffect(() => {
    if (typeof document === 'undefined') return () => { };
    if (isLocked === isLockedRef.current) return;

    const body = document.body;
    const docEl = document.documentElement;

    if (isLocked && !isLockedRef.current) {
      // Salva posição atual
      scrollPositionRef.current = window.pageYOffset;

      // Calcula largura da scrollbar para evitar layout shift
      const scrollbarWidth = Math.max(0, window.innerWidth - docEl.clientWidth);
      body.style.setProperty('--scrollbar-width', `${scrollbarWidth}px`);

      // Aplica lock sem position:fixed (mantém widgets funcionando)
      body.classList.add('scroll-locked');
      isLockedRef.current = true;

    } else if (!isLocked && isLockedRef.current) {
      // Remove lock
      body.classList.remove('scroll-locked');
      body.style.removeProperty('--scrollbar-width');

      // Restaura posição de scroll
      window.scrollTo(0, scrollPositionRef.current);
      isLockedRef.current = false;
    }

    return () => {
      if (isLockedRef.current) {
        body.classList.remove('scroll-locked');
        body.style.removeProperty('--scrollbar-width');
        isLockedRef.current = false;
      }
    };
  }, [isLocked]);

  return isLockedRef.current;
}
