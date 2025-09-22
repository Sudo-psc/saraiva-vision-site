import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import '../../styles/instagramResponsiveGrid.css';

/**
 * InstagramResponsiveGrid - CSS Grid-based responsive layout component
 * Handles breakpoint management and touch gestures for mobile devices
 */
const InstagramResponsiveGrid = ({
    children,
    maxPosts = 4,
    layout = 'grid',
    enableTouchGestures = true,
    className = '',
    onLayoutChange = null,
    ...props
}) => {
    // Refs
    const gridRef = useRef(null);
    const resizeObserverRef = useRef(null);

    // Breakpoint definitions
    const breakpoints = {
        xs: 0,      // 0px and up
        sm: 640,    // 640px and up
        md: 768,    // 768px and up
        lg: 1024,   // 1024px and up
        xl: 1280,   // 1280px and up
        '2xl': 1536 // 1536px and up
    };

    // Get current breakpoint based on window width
    const getCurrentBreakpoint = useCallback((width) => {
        if (width >= breakpoints['2xl']) return '2xl';
        if (width >= breakpoints.xl) return 'xl';
        if (width >= breakpoints.lg) return 'lg';
        if (width >= breakpoints.md) return 'md';
        if (width >= breakpoints.sm) return 'sm';
        return 'xs';
    }, []);

    // State management with proper initial breakpoint
    const [currentBreakpoint, setCurrentBreakpoint] = useState(() => {
        if (typeof window !== 'undefined') {
            return getCurrentBreakpoint(window.innerWidth);
        }
        return 'lg';
    });
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);
    const [isScrolling, setIsScrolling] = useState(false);

    // Grid configuration for different breakpoints and post counts
    // Optimized for mobile-first responsive design
    const getGridConfig = useCallback((breakpoint, postCount) => {
        const configs = {
            1: {
                xs: 'grid-cols-1',
                sm: 'grid-cols-1',
                md: 'grid-cols-1',
                lg: 'grid-cols-1',
                xl: 'grid-cols-1',
                '2xl': 'grid-cols-1'
            },
            2: {
                xs: 'grid-cols-1',
                sm: 'grid-cols-2',
                md: 'grid-cols-2',
                lg: 'grid-cols-2',
                xl: 'grid-cols-2',
                '2xl': 'grid-cols-2'
            },
            3: {
                xs: 'grid-cols-1',
                sm: 'grid-cols-2',
                md: 'grid-cols-3',
                lg: 'grid-cols-3',
                xl: 'grid-cols-3',
                '2xl': 'grid-cols-3'
            },
            4: {
                xs: 'grid-cols-1',        // Single column on mobile for better readability
                sm: 'grid-cols-2',        // Two columns on small tablets
                md: 'grid-cols-2',        // Two columns on medium screens
                lg: 'grid-cols-4',        // Four columns on large screens
                xl: 'grid-cols-4',        // Four columns on extra large screens
                '2xl': 'grid-cols-4'      // Four columns on 2xl screens
            },
            5: {
                xs: 'grid-cols-1',
                sm: 'grid-cols-2',
                md: 'grid-cols-3',
                lg: 'grid-cols-4',
                xl: 'grid-cols-5',
                '2xl': 'grid-cols-5'
            },
            6: {
                xs: 'grid-cols-1',
                sm: 'grid-cols-2',
                md: 'grid-cols-3',
                lg: 'grid-cols-4',
                xl: 'grid-cols-6',
                '2xl': 'grid-cols-6'
            }
        };

        const postCountKey = Math.min(postCount, 6);
        return configs[postCountKey]?.[breakpoint] || configs[4][breakpoint];
    }, []);

    // Handle window resize
    const handleResize = useCallback(() => {
        if (!gridRef.current) return;

        const width = window.innerWidth;
        const newBreakpoint = getCurrentBreakpoint(width);

        if (newBreakpoint !== currentBreakpoint) {
            setCurrentBreakpoint(newBreakpoint);

            if (onLayoutChange) {
                onLayoutChange({
                    breakpoint: newBreakpoint,
                    width,
                    gridColumns: getGridConfig(newBreakpoint, maxPosts)
                });
            }
        }
    }, [currentBreakpoint, getCurrentBreakpoint, getGridConfig, maxPosts, onLayoutChange]);

    // Touch gesture handlers
    const handleTouchStart = useCallback((e) => {
        if (!enableTouchGestures) return;

        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    }, [enableTouchGestures]);

    const handleTouchMove = useCallback((e) => {
        if (!enableTouchGestures) return;

        setTouchEnd(e.targetTouches[0].clientX);

        // Detect if user is scrolling vertically vs horizontally
        const touchCurrent = e.targetTouches[0];
        if (touchStart !== null) {
            const deltaX = Math.abs(touchCurrent.clientX - touchStart);
            const deltaY = Math.abs(touchCurrent.clientY - (e.targetTouches[0].clientY || 0));

            setIsScrolling(deltaY > deltaX);
        }
    }, [enableTouchGestures, touchStart]);

    const handleTouchEnd = useCallback(() => {
        if (!enableTouchGestures || !touchStart || !touchEnd || isScrolling) return;

        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > 50;
        const isRightSwipe = distance < -50;

        if (isLeftSwipe || isRightSwipe) {
            // Emit swipe event for parent components to handle
            const swipeEvent = new CustomEvent('instagramSwipe', {
                detail: {
                    direction: isLeftSwipe ? 'left' : 'right',
                    distance: Math.abs(distance)
                },
                bubbles: true,
                cancelable: true
            });

            if (gridRef.current) {
                gridRef.current.dispatchEvent(swipeEvent);
            }
        }

        // Reset touch state
        setTouchStart(null);
        setTouchEnd(null);
        setIsScrolling(false);
    }, [enableTouchGestures, touchStart, touchEnd, isScrolling]);

    // Setup resize observer and initial layout
    useEffect(() => {
        // Initial breakpoint detection and layout change notification
        const initialWidth = typeof window !== 'undefined' ? window.innerWidth : 1024;
        const initialBreakpoint = getCurrentBreakpoint(initialWidth);

        // Update state immediately
        setCurrentBreakpoint(initialBreakpoint);

        if (onLayoutChange) {
            onLayoutChange({
                breakpoint: initialBreakpoint,
                width: initialWidth,
                gridColumns: getGridConfig(initialBreakpoint, maxPosts)
            });
        }

        if (!gridRef.current) return;

        // Setup ResizeObserver for more efficient resize detection
        if (window.ResizeObserver) {
            const resizeObserver = new ResizeObserver((entries) => {
                for (const entry of entries) {
                    const { width } = entry.contentRect;
                    const newBreakpoint = getCurrentBreakpoint(width);

                    if (newBreakpoint !== currentBreakpoint) {
                        setCurrentBreakpoint(newBreakpoint);

                        if (onLayoutChange) {
                            onLayoutChange({
                                breakpoint: newBreakpoint,
                                width,
                                gridColumns: getGridConfig(newBreakpoint, maxPosts)
                            });
                        }
                    }
                }
            });

            resizeObserver.observe(gridRef.current);
            resizeObserverRef.current = resizeObserver;

            return () => {
                if (resizeObserverRef.current) {
                    resizeObserverRef.current.disconnect();
                }
            };
        } else {
            // Fallback to window resize event
            window.addEventListener('resize', handleResize);
            return () => window.removeEventListener('resize', handleResize);
        }
    }, [getCurrentBreakpoint, getGridConfig, maxPosts, onLayoutChange]);

    // Get layout classes based on current layout type
    const getLayoutClasses = () => {
        const baseClasses = 'instagram-responsive-grid';

        switch (layout) {
            case 'carousel':
                return `${baseClasses} carousel flex overflow-x-auto pb-4 snap-x snap-mandatory`;

            case 'masonry':
                // CSS Grid masonry (experimental) or fallback to grid
                return `${baseClasses} masonry grid ${getGridConfig(currentBreakpoint, maxPosts)} auto-rows-max`;

            case 'grid':
            default:
                return `${baseClasses} grid ${getGridConfig(currentBreakpoint, maxPosts)}`;
        }
    };

    // Get responsive gap classes
    const getGapClasses = () => {
        switch (currentBreakpoint) {
            case 'xs':
            case 'sm':
                return 'gap-3';
            case 'md':
                return 'gap-4';
            case 'lg':
            case 'xl':
            case '2xl':
            default:
                return 'gap-6';
        }
    };

    // Animation variants for grid container
    const gridVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                duration: 0.3,
                staggerChildren: 0.1
            }
        }
    };

    // Child animation variants
    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.4,
                ease: "easeOut"
            }
        }
    };

    return (
        <motion.div
            ref={gridRef}
            className={`
                ${getLayoutClasses()} 
                ${getGapClasses()} 
                ${className}
                ${enableTouchGestures ? 'touch-pan-y select-none' : ''}
                w-full
                ${layout === 'carousel' ? 'scrollbar-hide' : ''}
            `}
            style={{
                // Optimize for touch devices
                WebkitTouchCallout: 'none',
                WebkitUserSelect: 'none',
                KhtmlUserSelect: 'none',
                MozUserSelect: 'none',
                msUserSelect: 'none',
                userSelect: 'none',
                // Improve scroll performance on mobile
                WebkitOverflowScrolling: 'touch',
                // Prevent zoom on double tap
                touchAction: enableTouchGestures ? 'pan-y' : 'auto'
            }}
            variants={gridVariants}
            initial="hidden"
            animate="visible"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            role="grid"
            aria-label="Instagram posts grid"
            data-breakpoint={currentBreakpoint}
            data-layout={layout}
            data-post-count={maxPosts}
            {...props}
        >
            {React.Children.map(children, (child, index) => (
                <motion.div
                    key={child.key || index}
                    variants={itemVariants}
                    className={`
                        ${layout === 'carousel' ? 'flex-shrink-0 snap-center' : ''}
                        ${layout === 'carousel' && currentBreakpoint === 'xs' ? 'w-80' : ''}
                        ${layout === 'carousel' && currentBreakpoint === 'sm' ? 'w-72' : ''}
                        ${layout === 'carousel' && ['md', 'lg', 'xl', '2xl'].includes(currentBreakpoint) ? 'w-64' : ''}
                    `}
                    role="gridcell"
                    aria-setsize={React.Children.count(children)}
                    aria-posinset={index + 1}
                >
                    {child}
                </motion.div>
            ))}
        </motion.div>
    );
};

export default InstagramResponsiveGrid;