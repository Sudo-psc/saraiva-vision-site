import { useEffect, useState } from 'react';

const DeferredGTM = ({ gtmId, idleTimeout = 2500 }) => {
  const [LoadedComponent, setLoadedComponent] = useState(null);

  useEffect(() => {
    if (!gtmId || typeof window === 'undefined') return;

    let cancelled = false;
    let idleId;
    let timeoutId;

    const loadComponent = () => {
      if (cancelled) return;

      import('./GoogleTagManager.jsx')
        .then((module) => {
          if (!cancelled) {
            setLoadedComponent(() => module.default);
          }
        })
        .catch((error) => {
          console.error('Failed to load GoogleTagManager:', error);
        });
    };

    const scheduleIdle = () => {
      if ('requestIdleCallback' in window) {
        idleId = window.requestIdleCallback(loadComponent, { timeout: idleTimeout });
      } else {
        timeoutId = window.setTimeout(loadComponent, idleTimeout);
      }
    };

    const events = ['mousedown', 'touchstart', 'keydown', 'scroll'];
    const handleInteraction = () => {
      loadComponent();
    };

    events.forEach((event) => {
      window.addEventListener(event, handleInteraction, { passive: true, once: true });
    });

    scheduleIdle();

    return () => {
      cancelled = true;
      events.forEach((event) => {
        window.removeEventListener(event, handleInteraction);
      });
      if (idleId && 'cancelIdleCallback' in window) {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [gtmId, idleTimeout]);

  if (!LoadedComponent) return null;

  const Component = LoadedComponent;
  return <Component gtmId={gtmId} />;
};

export default DeferredGTM;
