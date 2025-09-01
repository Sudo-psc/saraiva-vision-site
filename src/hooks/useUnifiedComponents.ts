// Custom hooks for unified component interfaces
import { useState, useEffect, useCallback, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';
import { AnimationConfig, MediaContent } from '@/types/components';
import { debounce, throttle } from '@/utils/componentUtils';

// Hook for managing component animation preferences
export const useAnimationConfig = (config?: Partial<AnimationConfig>) => {
  const prefersReducedMotion = useReducedMotion();
  
  const animationConfig: AnimationConfig = {
    reduceMotion: prefersReducedMotion || config?.reduceMotion || false,
    staggerChildren: config?.staggerChildren || 0.05,
    viewport: config?.viewport || { once: true, margin: '50px' },
    choreography: config?.choreography || 'entrance',
    duration: config?.duration || 0.55,
    delay: config?.delay || 0,
    easing: config?.easing || 'easeOut'
  };

  return animationConfig;
};

// Hook for managing media loading states
export const useMediaLoader = (media?: MediaContent) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLElement>(null);

  // Intersection observer for lazy loading
  useEffect(() => {
    if (!media?.lazy || !elementRef.current) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: '120px' }
    );

    observer.observe(elementRef.current);
    return () => observer.disconnect();
  }, [media?.lazy]);

  // Media loading handlers
  const handleLoad = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
  }, []);

  const handleError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
  }, []);

  return {
    isLoading,
    hasError,
    isVisible,
    elementRef,
    handleLoad,
    handleError
  };
};

// Hook for carousel functionality
export const useCarousel = <T>(
  items: T[],
  options: {
    autoPlay?: boolean;
    autoPlaySpeed?: number;
    dragToScroll?: boolean;
    wheelToScroll?: boolean;
    gap?: number;
  } = {}
) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const pauseRef = useRef(false);
  const rafRef = useRef<number>();
  const dragStartXRef = useRef(0);
  const scrollStartRef = useRef(0);
  const cardWidthRef = useRef(320);

  // Measure card width for scroll calculations
  const measure = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const first = el.querySelector('[data-card]') as HTMLElement;
    if (first) {
      const style = window.getComputedStyle(first);
      const width = first.getBoundingClientRect().width;
      const marginRight = parseFloat(style.marginRight) || (options.gap || 24);
      cardWidthRef.current = width + marginRight;
    }
  }, [options.gap]);

  // Scroll to specific index
  const scrollToIndex = useCallback((index: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    pauseRef.current = true;
    el.scrollTo({ 
      left: index * cardWidthRef.current, 
      behavior: 'smooth' 
    });
    setTimeout(() => { pauseRef.current = false; }, 3000);
  }, []);

  // Scroll by amount (for arrow navigation)
  const scrollByAmount = useCallback((direction: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    const delta = el.clientWidth * 0.8 * direction;
    const max = el.scrollWidth - el.clientWidth;
    const next = Math.max(0, Math.min(el.scrollLeft + delta, max));
    el.scrollTo({ left: next, behavior: 'smooth' });
  }, []);

  // Update current index based on scroll position
  const updateIndex = useCallback(
    throttle(() => {
      const el = scrollerRef.current;
      if (!el) return;
      const raw = Math.round(el.scrollLeft / cardWidthRef.current);
      const clamped = Math.max(0, Math.min(items.length - 1, raw));
      setCurrentIndex(clamped);
    }, 100),
    [items.length]
  );

  // Drag handlers
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (!options.dragToScroll) return;
    const el = scrollerRef.current;
    if (!el) return;
    
    setIsDragging(true);
    pauseRef.current = true;
    dragStartXRef.current = e.clientX;
    scrollStartRef.current = el.scrollLeft;
    
    try { 
      el.setPointerCapture(e.pointerId); 
    } catch (_) {}
  }, [options.dragToScroll]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging || !options.dragToScroll) return;
    const el = scrollerRef.current;
    if (!el) return;
    
    const dx = e.clientX - dragStartXRef.current;
    el.scrollLeft = scrollStartRef.current - dx;
    e.preventDefault();
  }, [isDragging, options.dragToScroll]);

  const endDrag = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    setTimeout(() => { pauseRef.current = false; }, 800);
  }, [isDragging]);

  // Wheel handler for horizontal scrolling
  const onWheel = useCallback((e: React.WheelEvent) => {
    if (!options.wheelToScroll) return;
    const el = scrollerRef.current;
    if (!el) return;
    
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      el.scrollLeft += e.deltaY;
      e.preventDefault();
    }
  }, [options.wheelToScroll]);

  // Auto-play functionality
  useEffect(() => {
    if (!options.autoPlay || pauseRef.current) return;
    
    const el = scrollerRef.current;
    if (!el) return;
    
    let last = performance.now();
    const speed = options.autoPlaySpeed || 0.18;
    
    const tick = (now: number) => {
      const dt = now - last;
      last = now;
      
      if (!pauseRef.current) {
        const max = el.scrollWidth - el.clientWidth;
        const next = Math.min(max, el.scrollLeft + dt * speed);
        el.scrollLeft = next;
        
        if (next >= max) {
          pauseRef.current = true;
        }
      }
      
      rafRef.current = requestAnimationFrame(tick);
    };
    
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [options.autoPlay, options.autoPlaySpeed]);

  // Keyboard navigation
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        scrollByAmount(1);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        scrollByAmount(-1);
      }
    };
    
    el.addEventListener('keydown', handler);
    return () => el.removeEventListener('keydown', handler);
  }, [scrollByAmount]);

  // Scroll event listener
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    
    const handleScroll = () => {
      updateIndex();
      const max = el.scrollWidth - el.clientWidth;
      if (el.scrollLeft >= max) {
        el.scrollLeft = max;
      }
    };
    
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [updateIndex]);

  // Pause/resume handlers
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    
    const pause = () => { pauseRef.current = true; };
    const resume = () => { pauseRef.current = false; };
    
    el.addEventListener('mouseenter', pause);
    el.addEventListener('mouseleave', resume);
    el.addEventListener('focusin', pause);
    el.addEventListener('focusout', resume);
    el.addEventListener('pointerdown', pause);
    
    const handleMouseUp = () => setTimeout(resume, 1200);
    window.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      el.removeEventListener('mouseenter', pause);
      el.removeEventListener('mouseleave', resume);
      el.removeEventListener('focusin', pause);
      el.removeEventListener('focusout', resume);
      el.removeEventListener('pointerdown', pause);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // Measure on mount and resize
  useEffect(() => {
    measure();
    const debouncedMeasure = debounce(measure, 250);
    window.addEventListener('resize', debouncedMeasure);
    return () => window.removeEventListener('resize', debouncedMeasure);
  }, [measure]);

  return {
    scrollerRef,
    currentIndex,
    isDragging,
    scrollToIndex,
    scrollByAmount,
    measure,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: endDrag,
      onPointerCancel: endDrag,
      onMouseLeave: endDrag,
      onWheel
    }
  };
};

// Hook for managing accessibility features
export const useAccessibility = (options: {
  announceChanges?: boolean;
  focusTrap?: boolean;
  respectReducedMotion?: boolean;
} = {}) => {
  const [announcementText, setAnnouncementText] = useState('');
  const prefersReducedMotion = useReducedMotion();
  
  const announce = useCallback((text: string) => {
    if (!options.announceChanges) return;
    setAnnouncementText(text);
    setTimeout(() => setAnnouncementText(''), 1000);
  }, [options.announceChanges]);

  const shouldReduceMotion = options.respectReducedMotion ? prefersReducedMotion : false;

  return {
    announce,
    announcementText,
    shouldReduceMotion,
    accessibilityProps: {
      'aria-live': options.announceChanges ? 'polite' as const : undefined,
      'aria-atomic': options.announceChanges ? true : undefined
    }
  };
};

// Hook for managing component focus
export const useFocusManagement = (containerRef: React.RefObject<HTMLElement>) => {
  const [focusedIndex, setFocusedIndex] = useState(-1);
  
  const focusItem = useCallback((index: number) => {
    const container = containerRef.current;
    if (!container) return;
    
    const items = container.querySelectorAll('[data-focusable]');
    const item = items[index] as HTMLElement;
    
    if (item) {
      item.focus();
      setFocusedIndex(index);
    }
  }, [containerRef]);

  const nextItem = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const items = container.querySelectorAll('[data-focusable]');
    const nextIndex = Math.min(focusedIndex + 1, items.length - 1);
    focusItem(nextIndex);
  }, [containerRef, focusedIndex, focusItem]);

  const previousItem = useCallback(() => {
    const nextIndex = Math.max(focusedIndex - 1, 0);
    focusItem(nextIndex);
  }, [focusedIndex, focusItem]);

  return {
    focusedIndex,
    focusItem,
    nextItem,
    previousItem
  };
};