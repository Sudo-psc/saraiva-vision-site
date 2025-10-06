import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    ExternalLink,
    Play,
    Calendar,
    User
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import OptimizedImage from './OptimizedImage';
import useInstagramPerformance from '../../hooks/useInstagramPerformance';
import useInstagramAccessibility from '../../hooks/useInstagramAccessibility';
import useAccessibilityPreferences from '../../hooks/useAccessibilityPreferences';
import useInstagramAccessibilityEnhanced from '../../hooks/useInstagramAccessibilityEnhanced';

/**
 * InstagramPost - Individual post display component
 * Features image optimization, lazy loading, caption truncation, and accessibility
 */
const InstagramPost = ({
    post,
    onClick = null,
    enableLazyLoading = true,
    enableAccessibility = true,
    maxCaptionLength = 120,
    showUsername = true,
    showTimestamp = true,
    showMediaType = true,
    className = '',
    tabIndex = 0,
    'aria-setsize': ariaSetSize,
    'aria-posinset': ariaPosInSet
}) => {
    // State management
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [isVisible, setIsVisible] = useState(!enableLazyLoading);
    const [captionExpanded, setCaptionExpanded] = useState(false);

    // Performance optimization hook
    const {
        getImageLoadingState,
        getOptimizedImageUrl: getOptimizedImageUrlFromHook,
        preloadImage
    } = useInstagramPerformance({
        enableLazyLoading,
        enableImageOptimization: true,
        enablePerformanceMonitoring: true
    });

    // Accessibility hook
    const {
        generatePostDescription,
        generateAriaLabel,
        announce
    } = useInstagramAccessibility({
        enableKeyboardNavigation: enableAccessibility,
        enableScreenReader: enableAccessibility,
        announceUpdates: enableAccessibility
    });

    // Accessibility preferences hook
    const {
        getAccessibilityClasses,
        getAccessibilityStyles,
        getAnimationConfig,
        shouldReduceMotion,
        isHighContrast,
        getAccessibleColors,
        getFocusStyles
    } = useAccessibilityPreferences();

    // Enhanced Instagram accessibility hook
    const {
        instagramHighContrast,
        instagramReducedMotion,
        getInstagramHighContrastColors,
        getInstagramAnimationConfig,
        getInstagramAccessibilityClasses,
        getInstagramAccessibilityStyles,
        getInstagramFocusStyles,
        shouldDisableInstagramFeature
    } = useInstagramAccessibilityEnhanced({
        enableHighContrast: enableAccessibility,
        enableReducedMotion: enableAccessibility,
        enableSystemDetection: true
    });

    // Refs
    const imageRef = useRef(null);
    const containerRef = useRef(null);
    const observerRef = useRef(null);

    // Validate post data
    if (!post || !post.id) {
        return null;
    }

    const {
        id,
        caption = '',
        media_type = 'IMAGE',
        media_url,
        thumbnail_url,
        permalink,
        timestamp,
        username = 'saraivavision',
        fallback = false
    } = post;

    // Intersection Observer for lazy loading
    useEffect(() => {
        if (!enableLazyLoading || isVisible) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setIsVisible(true);
                        observer.disconnect();
                    }
                });
            },
            {
                rootMargin: '50px',
                threshold: 0.1
            }
        );

        if (containerRef.current) {
            observer.observe(containerRef.current);
            observerRef.current = observer;
        }

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, [enableLazyLoading, isVisible]);

    // Image optimization and format selection
    const getOptimizedImageUrl = (url, width = 400) => {
        if (!url) return null;

        // If it's already optimized or a placeholder, return as-is
        if (url.includes('placeholder') || url.includes('data:')) {
            return url;
        }

        try {
            const urlObj = new URL(url);

            // For Instagram URLs, add size parameters if supported
            if (urlObj.hostname.includes('cdninstagram.com') || urlObj.hostname.includes('fbcdn.net')) {
                urlObj.searchParams.set('_nc_ht', urlObj.hostname);
                urlObj.searchParams.set('_nc_cat', '1');
                // Instagram doesn't support custom sizing, so return original
                return url;
            }

            return url;
        } catch (error) {
            console.warn('Invalid image URL:', url);
            return url;
        }
    };

    // Get display image URL with fallbacks
    const getDisplayImageUrl = () => {
        if (imageError) {
            return '/img/placeholder.svg';
        }

        if (media_type === 'VIDEO' && thumbnail_url) {
            return getOptimizedImageUrl(thumbnail_url);
        }

        if (media_url) {
            return getOptimizedImageUrl(media_url);
        }

        return '/img/placeholder.svg';
    };

    // Format caption with proper truncation and hashtag handling
    const formatCaption = (text, maxLength, expanded = false) => {
        if (!text) return '';

        // Clean up text
        const cleanText = text
            .replace(/\s+/g, ' ')
            .trim();

        if (expanded || cleanText.length <= maxLength) {
            return cleanText;
        }

        const truncated = cleanText.substring(0, maxLength);
        const lastSpace = truncated.lastIndexOf(' ');
        const cutPoint = lastSpace > maxLength * 0.8 ? lastSpace : maxLength;

        return truncated.substring(0, cutPoint) + '...';
    };

    // Format timestamp with proper localization
    const formatTimestamp = (dateString) => {
        if (!dateString) return '';

        try {
            const date = new Date(dateString);

            // Return relative time for recent posts, absolute for older ones
            const daysDiff = (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24);

            if (daysDiff < 7) {
                return formatDistanceToNow(date, {
                    addSuffix: true,
                    locale: ptBR
                });
            } else {
                return format(date, 'dd/MM/yyyy', { locale: ptBR });
            }
        } catch (error) {
            console.warn('Invalid timestamp:', dateString);
            return '';
        }
    };

    // Handle image load events
    const handleImageLoad = () => {
        setImageLoaded(true);
    };

    const handleImageError = () => {
        setImageError(true);
        setImageLoaded(true);
    };

    // Handle post click
    const handleClick = (event) => {
        // Prevent click when expanding caption
        if (event.target.closest('.caption-toggle')) {
            return;
        }

        // Announce action for screen readers
        if (enableAccessibility) {
            announce(`Opening Instagram post by ${username} in new tab`);
        }

        if (onClick) {
            onClick(post);
        } else if (permalink) {
            window.open(permalink, '_blank', 'noopener,noreferrer');
        }
    };

    // Handle keyboard navigation
    const handleKeyDown = (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleClick(event);
        }
    };

    // Toggle caption expansion
    const toggleCaption = (event) => {
        event.stopPropagation();
        const newExpanded = !captionExpanded;
        setCaptionExpanded(newExpanded);

        // Announce caption state change
        if (enableAccessibility) {
            announce(newExpanded ? 'Caption expanded' : 'Caption collapsed');
        }
    };

    // Check if caption needs truncation
    const needsTruncation = caption.length > maxCaptionLength;
    const displayCaption = formatCaption(caption, maxCaptionLength, captionExpanded);

    // Animation variants with accessibility support
    const animationConfig = getInstagramAnimationConfig();
    const cardVariants = instagramReducedMotion || shouldDisableInstagramFeature('hoverEffects') ? {
        hidden: { opacity: 1 },
        visible: { opacity: 1 },
        hover: { opacity: 1 }
    } : {
        hidden: { opacity: 0, y: 20, scale: 0.95 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                duration: animationConfig.duration,
                ease: animationConfig.ease
            }
        },
        hover: shouldDisableInstagramFeature('scaleAnimations') ? {
            opacity: 1
        } : {
            y: -2,
            scale: 1.01,
            transition: {
                duration: 0.2,
                ease: animationConfig.ease
            }
        }
    };

    const imageVariants = shouldReduceMotion() ? {
        loading: { opacity: 1 },
        loaded: { opacity: 1 }
    } : {
        loading: { opacity: 0, scale: 1.1 },
        loaded: {
            opacity: 1,
            scale: 1,
            transition: {
                duration: animationConfig.duration,
                ease: animationConfig.ease
            }
        }
    };

    return (
        <motion.article
            ref={containerRef}
            className={`
        instagram-post group relative bg-white rounded-xl shadow-md overflow-hidden 
        border border-gray-100 hover:border-gray-200 hover:shadow-lg
        focus:outline-none transition-all duration-300 cursor-pointer
        ${getInstagramAccessibilityClasses()} ${className}
        ${instagramReducedMotion ? 'reduced-motion' : ''}
        ${instagramHighContrast ? 'high-contrast' : ''}
      `}
            style={{
                ...getInstagramAccessibilityStyles(),
                ...(instagramHighContrast ? {
                    backgroundColor: getInstagramHighContrastColors()?.postBg,
                    color: getInstagramHighContrastColors()?.postText,
                    borderColor: getInstagramHighContrastColors()?.postBorder,
                    ...getInstagramFocusStyles()
                } : {}),
                ...(instagramReducedMotion ? {
                    transition: 'none',
                    transform: 'none'
                } : {})
            }}
            variants={cardVariants}
            initial={instagramReducedMotion ? false : "hidden"}
            animate={instagramReducedMotion ? false : "visible"}
            whileHover={instagramReducedMotion || shouldDisableInstagramFeature('hoverEffects') ? false : "hover"}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            tabIndex={tabIndex}
            role="article"
            aria-label={generateAriaLabel('post', { post })}
            aria-describedby={`post-${id}-description post-${id}-content`}
            aria-setsize={ariaSetSize}
            aria-posinset={ariaPosInSet}
        >
            {/* Optimized Image Container */}
            <div className="relative aspect-square overflow-hidden bg-gray-100">
                <OptimizedImage
                    src={getDisplayImageUrl()}
                    alt={
                        enableAccessibility
                            ? `Instagram ${media_type.toLowerCase().replace('_', ' ')}: ${formatCaption(caption, 100) || `Post by ${username}`}`
                            : ''
                    }
                    className={`w-full h-full object-cover ${instagramReducedMotion || shouldDisableInstagramFeature('imageHover')
                            ? ''
                            : 'transition-all duration-300 group-hover:scale-105'
                        } ${instagramHighContrast ? 'high-contrast-image' : ''}`}
                    style={instagramHighContrast ? {
                        border: `1px solid ${getInstagramHighContrastColors()?.postBorder}`,
                        filter: 'contrast(1.2) brightness(1.1)'
                    } : {}}
                    enableLazyLoading={enableLazyLoading}
                    enableFormatOptimization={true}
                    enableProgressiveLoading={true}
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    quality={85}
                    role="img"
                    aria-describedby={enableAccessibility ? `post-${id}-image-desc` : undefined}
                    aria-labelledby={enableAccessibility ? `post-${id}-title` : undefined}
                />

                {/* Hidden image description for screen readers */}
                {enableAccessibility && (
                    <>
                        <div id={`post-${id}-image-desc`} className="sr-only">
                            {media_type === 'VIDEO' ? 'Video thumbnail' :
                                media_type === 'CAROUSEL_ALBUM' ? 'Photo album preview' : 'Photo'}
                            {caption && ` showing: ${formatCaption(caption, 150)}`}
                        </div>
                        <div id={`post-${id}-title`} className="sr-only">
                            Instagram post by {username}
                        </div>
                    </>
                )}

                {/* Media type indicator */}
                {showMediaType && media_type === 'VIDEO' && (
                    <div
                        className="absolute top-3 right-3 bg-black/70 text-white px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm flex items-center gap-1"
                        role="img"
                        aria-label="Video content indicator"
                    >
                        <Play className="w-3 h-3" aria-hidden="true" />
                        <span>VIDEO</span>
                    </div>
                )}

                {/* Carousel indicator */}
                {showMediaType && media_type === 'CAROUSEL_ALBUM' && (
                    <div
                        className="absolute top-3 right-3 bg-black/70 text-white px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm"
                        role="img"
                        aria-label="Photo album indicator"
                    >
                        <span>ALBUM</span>
                    </div>
                )}

                {/* Fallback indicator */}
                {fallback && (
                    <div
                        className="absolute top-3 left-3 bg-orange-500/90 text-white px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm"
                        role="img"
                        aria-label="Demo content indicator"
                    >
                        DEMO
                    </div>
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all duration-300" />

                {/* External link icon */}
                <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-white/90 p-2 rounded-full shadow-lg backdrop-blur-sm">
                        <ExternalLink className="w-4 h-4 text-gray-700" />
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                {/* Header with username and timestamp */}
                {(showUsername || showTimestamp) && (
                    <header className="flex items-center justify-between mb-3 text-sm text-gray-600">
                        {showUsername && (
                            <div className="flex items-center gap-2">
                                <User className="w-4 h-4" aria-hidden="true" />
                                <span className="font-medium" role="text">@{username}</span>
                            </div>
                        )}

                        {showTimestamp && timestamp && (
                            <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" aria-hidden="true" />
                                <time
                                    dateTime={timestamp}
                                    className="text-xs"
                                    aria-label={`Posted ${formatTimestamp(timestamp)}`}
                                >
                                    {formatTimestamp(timestamp)}
                                </time>
                            </div>
                        )}
                    </header>
                )}

                {/* Caption */}
                {caption && (
                    <div className="text-gray-800 text-sm leading-relaxed">
                        <p
                            id={`post-${id}-description`}
                            role="text"
                            aria-label={enableAccessibility ? `Post caption: ${displayCaption}` : undefined}
                        >
                            {displayCaption}
                        </p>

                        {needsTruncation && (
                            <button
                                className="caption-toggle mt-1 text-cyan-600 hover:text-cyan-700 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 focus:rounded px-1"
                                onClick={toggleCaption}
                                aria-expanded={captionExpanded}
                                aria-label={generateAriaLabel('expand-caption', { expanded: captionExpanded })}
                                aria-controls={`post-${id}-description`}
                                type="button"
                                aria-describedby={`caption-toggle-${id}-help`}
                            >
                                {captionExpanded ? 'Show less' : 'Show more'}
                                {enableAccessibility && (
                                    <span id={`caption-toggle-${id}-help`} className="sr-only">
                                        {captionExpanded ? 'Collapse caption text' : 'Expand to read full caption'}
                                    </span>
                                )}
                            </button>
                        )}
                    </div>
                )}

                {/* Comprehensive accessibility information */}
                {enableAccessibility && (
                    <div id={`post-${id}-content`} className="sr-only">
                        <p>
                            {generatePostDescription(post)}
                            {ariaPosInSet && ariaSetSize && ` Post ${ariaPosInSet} of ${ariaSetSize}.`}
                            {' '}Press Enter or Space to open on Instagram in new tab.
                            {needsTruncation && ' Press Tab to access caption expand button.'}
                        </p>
                    </div>
                )}
            </div>

            {/* Focus outline for accessibility */}
            <div className="absolute inset-0 ring-2 ring-blue-500 ring-opacity-0 focus-within:ring-opacity-100 rounded-xl transition-all duration-200 pointer-events-none" />
        </motion.article>
    );
};

export default InstagramPost;