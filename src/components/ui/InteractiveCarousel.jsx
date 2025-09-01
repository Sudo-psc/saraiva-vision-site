import React, { forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useCarousel, useAccessibility } from '@/hooks/useUnifiedComponents';
import { cn } from '@/utils/componentUtils';

/**
 * Enhanced InteractiveCarousel component with drag, wheel, keyboard navigation
 * Implements comprehensive accessibility and performance optimizations
 */
const InteractiveCarousel = forwardRef(({
  // Data Management
  items,
  renderItem,
  keyExtractor,
  
  // Layout Configuration
  gap = 24,
  cardWidth = 'responsive',
  minWidth = 260,
  maxWidth = 320,
  
  // Interaction Modes
  dragToScroll = true,
  wheelToScroll = true,
  keyboardNav = true,
  touchSwipe = true,
  autoPlay = false,
  autoPlaySpeed = 0.18,
  
  // Navigation Controls
  showArrows = true,
  showIndicators = true,
  arrowPosition = 'outside',
  indicatorStyle = 'dots',
  
  // Snap Configuration
  snapMode = 'start',
  snapForce = 'proximity',
  
  // Visual Effects
  fadeEdges = true,
  parallaxEffect = false,
  perspective3D = false,
  
  // Performance
  lazyLoad = true,
  virtualScroll = false,
  preloadAdjacent = 1,
  
  // Accessibility
  'aria-label': ariaLabel,
  announceChanges = false,
  respectReducedMotion = true,
  focusTrapModal = false,
  
  // Event Handlers
  onScroll,
  onItemClick,
  onBoundaryReach,
  
  // HTML props
  className,
  ...props
}, ref) => {
  const { t } = useTranslation();
  
  // Carousel functionality
  const {
    scrollerRef,
    currentIndex,
    isDragging,
    scrollToIndex,
    scrollByAmount,
    handlers
  } = useCarousel(items, {
    autoPlay,
    autoPlaySpeed,
    dragToScroll,
    wheelToScroll,
    gap
  });

  // Accessibility features
  const {
    announce,
    announcementText,
    shouldReduceMotion,
    accessibilityProps
  } = useAccessibility({
    announceChanges,
    respectReducedMotion
  });

  // Handle scroll events
  React.useEffect(() => {
    if (onScroll) {
      onScroll(currentIndex);
    }
    
    if (announceChanges) {
      const current = items[currentIndex];
      if (current) {
        const itemName = typeof current === 'object' && current.title 
          ? current.title 
          : `Item ${currentIndex + 1}`;
        announce(`Navegando para ${itemName}`);
      }
    }
  }, [currentIndex, onScroll, announceChanges, announce, items]);

  // Handle boundary reach
  React.useEffect(() => {
    if (!onBoundaryReach) return;
    
    if (currentIndex === 0) {
      onBoundaryReach('start');
    } else if (currentIndex === items.length - 1) {
      onBoundaryReach('end');
    }
  }, [currentIndex, onBoundaryReach, items.length]);

  // Handle item click
  const handleItemClick = (item, index) => {
    if (onItemClick) {
      onItemClick(item, index);
    }
  };

  // Container classes
  const containerClasses = cn(
    'relative',
    {
      'perspective-1000': perspective3D
    },
    className
  );

  // Scroller classes
  const scrollerClasses = cn(
    'flex overflow-x-auto scroll-smooth scroll-container',
    {
      // Snap configuration
      'snap-x': snapMode !== 'none',
      'snap-mandatory': snapForce === 'mandatory',
      'snap-proximity': snapForce === 'proximity',
      
      // Hide scrollbars
      'scrollbar-none': true,
      
      // Drag behavior
      'cursor-grab': dragToScroll && !isDragging,
      'cursor-grabbing': dragToScroll && isDragging,
      'select-none': dragToScroll,
      
      // Touch behavior
      'touch-pan-x': touchSwipe,
      'overscroll-x-contain': true,
      
      // Perspective
      'perspective-1000': perspective3D,
      
      // Reduce motion
      'motion-reduce:transform-none': shouldReduceMotion
    }
  );

  // Gap styles
  const gapStyle = { gap: `${gap}px` };

  // Arrow classes
  const arrowClasses = cn(
    'flex items-center justify-center w-11 h-11 rounded-full bg-white/80 hover:bg-white shadow-lg ring-1 ring-slate-200 backdrop-blur transition-all focus:outline-none focus:ring-2 focus:ring-blue-500',
    {
      'absolute top-1/2 -translate-y-1/2 z-20': arrowPosition === 'outside' || arrowPosition === 'overlay',
      'hidden md:flex': arrowPosition === 'outside',
      'opacity-0 group-hover:opacity-100': arrowPosition === 'overlay'
    }
  );

  return (
    <div 
      ref={ref}
      className={containerClasses}
      aria-label={ariaLabel || t('ui.carousel', 'Carrossel')}
      role="region"
      {...accessibilityProps}
      {...props}
    >
      {/* Navigation Arrows */}
      {showArrows && (
        <>
          <button
            type="button"
            aria-label={t('ui.previous', 'Anterior')}
            onClick={() => scrollByAmount(-1)}
            className={cn(arrowClasses, 'left-0')}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="w-5 h-5 text-slate-700" />
          </button>

          <button
            type="button"
            aria-label={t('ui.next', 'Próximo')}
            onClick={() => scrollByAmount(1)}
            className={cn(arrowClasses, 'right-0')}
            disabled={currentIndex === items.length - 1}
          >
            <ChevronRight className="w-5 h-5 text-slate-700" />
          </button>
        </>
      )}

      {/* Fade edges */}
      {fadeEdges && (
        <>
          <div className="pointer-events-none absolute left-0 top-0 h-full w-16 bg-gradient-to-r from-slate-50 via-slate-50/80 to-transparent z-10" />
          <div className="pointer-events-none absolute right-0 top-0 h-full w-16 bg-gradient-to-l from-slate-50 via-slate-50/80 to-transparent z-10" />
        </>
      )}

      {/* Carousel Content */}
      <motion.div
        ref={scrollerRef}
        className={scrollerClasses}
        style={gapStyle}
        tabIndex={keyboardNav ? 0 : -1}
        layout="position"
        {...handlers}
      >
        <AnimatePresence mode="popLayout">
          {items.map((item, index) => {
            const key = keyExtractor(item);
            const shouldRender = !virtualScroll || 
              Math.abs(index - currentIndex) <= preloadAdjacent;

            if (!shouldRender) {
              return (
                <div 
                  key={key}
                  className="flex-shrink-0"
                  style={{ 
                    width: cardWidth === 'fixed' ? `${maxWidth}px` : undefined,
                    minWidth: `${minWidth}px`,
                    maxWidth: `${maxWidth}px`
                  }}
                />
              );
            }

            const itemClasses = cn(
              'flex-shrink-0',
              {
                [`snap-${snapMode}`]: snapMode !== 'none',
                'motion-reduce:transform-none': shouldReduceMotion
              }
            );

            const itemStyles = {
              width: cardWidth === 'fixed' ? `${maxWidth}px` : undefined,
              minWidth: `${minWidth}px`,
              maxWidth: `${maxWidth}px`
            };

            return (
              <motion.div
                key={key}
                className={itemClasses}
                style={itemStyles}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ 
                  delay: index * 0.05,
                  duration: shouldReduceMotion ? 0.01 : 0.3
                }}
                onClick={() => handleItemClick(item, index)}
                data-focusable
                data-index={index}
              >
                {renderItem(item, index)}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {/* Indicators */}
      {showIndicators && (
        <div 
          className="flex justify-center gap-2 mt-8" 
          aria-label={t('ui.carousel_navigation', 'Navegação do carrossel')}
          role="tablist"
        >
          {items.map((_, index) => {
            const isActive = index === currentIndex;
            
            if (indicatorStyle === 'dots') {
              return (
                <button
                  key={index}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-label={t('ui.go_to_item', { 
                    index: index + 1, 
                    defaultValue: `Ir para item ${index + 1}` 
                  })}
                  onClick={() => scrollToIndex(index)}
                  className={cn(
                    'w-3 h-3 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500',
                    {
                      'bg-blue-600 scale-110 shadow': isActive,
                      'bg-slate-300 hover:bg-slate-400': !isActive
                    }
                  )}
                />
              );
            }

            if (indicatorStyle === 'lines') {
              return (
                <button
                  key={index}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-label={t('ui.go_to_item', { 
                    index: index + 1, 
                    defaultValue: `Ir para item ${index + 1}` 
                  })}
                  onClick={() => scrollToIndex(index)}
                  className={cn(
                    'h-1 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500',
                    {
                      'bg-blue-600 w-8': isActive,
                      'bg-slate-300 hover:bg-slate-400 w-4': !isActive
                    }
                  )}
                />
              );
            }

            return null;
          })}
        </div>
      )}

      {/* Screen reader announcements */}
      {announcementText && (
        <div 
          className="sr-only" 
          aria-live="polite" 
          aria-atomic="true"
        >
          {announcementText}
        </div>
      )}

      {/* Focus trap for modal behavior */}
      {focusTrapModal && (
        <>
          <div 
            tabIndex={0} 
            onFocus={() => {
              const lastFocusable = scrollerRef.current?.querySelector('[data-focusable]:last-child');
              if (lastFocusable) lastFocusable.focus();
            }}
          />
          <div 
            tabIndex={0} 
            onFocus={() => {
              const firstFocusable = scrollerRef.current?.querySelector('[data-focusable]:first-child');
              if (firstFocusable) firstFocusable.focus();
            }}
          />
        </>
      )}
    </div>
  );
});

InteractiveCarousel.displayName = 'InteractiveCarousel';

export default InteractiveCarousel;