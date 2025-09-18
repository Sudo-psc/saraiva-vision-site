import { useEffect, useRef } from 'react';

/**
 * Hook para bloquear scroll do body de forma limpa e confiável
 * Compatível com o sistema de scroll-fix-clean.css
 * Não usa position:fixed para evitar quebrar widgets
 */
// Module-scoped lock counter to support multiple concurrent lockers
let __bodyScrollLockCount = 0;

export function useBodyScrollLock(isLocked) {
  const isLockedRef = useRef(false);
  const scrollPositionRef = useRef(0);

  useEffect(() => {
    if (typeof document === 'undefined') return () => {};
    const body = document.body;
    const docEl = document.documentElement;

    const lock = () => {
      if (isLockedRef.current) return;
      // Salva posição atual (apenas na primeira aquisição deste hook)
      scrollPositionRef.current = window.pageYOffset;

      // Incrementa contador global
      __bodyScrollLockCount = Math.max(0, __bodyScrollLockCount) + 1;

      // Se transição de 0 -> 1, aplica lock visual/global
      if (__bodyScrollLockCount === 1) {
        const scrollbarWidth = Math.max(0, window.innerWidth - docEl.clientWidth);
        body.style.setProperty('--scrollbar-width', `${scrollbarWidth}px`);
        body.classList.add('scroll-locked');
      }

      isLockedRef.current = true;
    };

    const unlock = () => {
      if (!isLockedRef.current) return;
      isLockedRef.current = false;

      // Decrementa contador global
      __bodyScrollLockCount = Math.max(0, __bodyScrollLockCount - 1);

      // Se transição para 0, remove lock e restaura posição
      if (__bodyScrollLockCount === 0) {
        body.classList.remove('scroll-locked');
        body.style.removeProperty('--scrollbar-width');
        // Restaura posição de scroll do momento da primeira aquisição
        try { window.scrollTo(0, scrollPositionRef.current); } catch (_) {}
      }
    };

    // Sync estado atual
    if (isLocked) lock(); else unlock();

    // Cleanup: garante liberação caso componente desmonte ainda travado
    return () => {
      if (isLockedRef.current) {
        unlock();
      }
    };
  }, [isLocked]);

  return isLockedRef.current;
}
