import { useEffect, useRef } from 'react';

// Locks body scroll when `active` is true, preventing double-scroll
// and layout shifts by preserving the current scroll position.
export default function useBodyScrollLock(active) {
  const scrollYRef = useRef(0);

  useEffect(() => {
    const { body, documentElement } = document;

    if (active) {
      // Preserve current scroll position
      scrollYRef.current = window.scrollY || window.pageYOffset || 0;

      // Apply lock styles
      body.style.overflow = 'hidden';
      body.style.position = 'fixed';
      body.style.top = `-${scrollYRef.current}px`;
      body.style.left = '0';
      body.style.right = '0';
      body.style.width = '100%';
      body.style.touchAction = 'none';
      body.style.overscrollBehavior = 'contain';

      // Prevent iOS rubber banding by also updating html
      if (documentElement) {
        documentElement.style.overscrollBehaviorY = 'none';
      }
    } else {
      // Unlock styles and restore scroll position
      const y = scrollYRef.current;
      body.style.overflow = '';
      body.style.position = '';
      body.style.top = '';
      body.style.left = '';
      body.style.right = '';
      body.style.width = '';
      body.style.touchAction = '';
      body.style.overscrollBehavior = '';
      if (documentElement) {
        documentElement.style.overscrollBehaviorY = '';
      }
      // Restore scroll after styles reset to avoid jump
      if (y) window.scrollTo(0, y);
    }

    return () => {
      // Ensure unlock on unmount
      if (active) {
        const y = scrollYRef.current;
        body.style.overflow = '';
        body.style.position = '';
        body.style.top = '';
        body.style.left = '';
        body.style.right = '';
        body.style.width = '';
        body.style.touchAction = '';
        body.style.overscrollBehavior = '';
        if (documentElement) {
          documentElement.style.overscrollBehaviorY = '';
        }
        if (y) window.scrollTo(0, y);
      }
    };
  }, [active]);
}

