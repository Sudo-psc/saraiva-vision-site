import React, { useState, useCallback, useEffect } from 'react';
import { useInView } from 'framer-motion';

const OptimizedImage = ({
    src,
    alt,
    width,
    height,
    className = '',
    loading = 'lazy',
    sizes,
    priority = false,
    fetchPriority = 'auto',
    webpSrc,
    avifSrc,
    fallbackSrc,
    placeholderSrc,
    objectFit = 'cover',
    // Optional styles for the container if explicit sizing is needed
    containerStyle,
    ...props
}) => {
    const [hasLoaded, setHasLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [displayedSrc, setDisplayedSrc] = useState(src);
    const [attemptedFallback, setAttemptedFallback] = useState(false);
    const imgRef = React.useRef(null);
    const isInView = useInView(imgRef, { once: true, margin: '100px' });

    useEffect(() => {
        // Reset when src prop changes
        setDisplayedSrc(src);
        setHasLoaded(false);
        setHasError(false);
        setAttemptedFallback(false);
    }, [src]);

    const handleLoad = useCallback(() => {
        setHasLoaded(true);
        setHasError(false);
    }, []);

    const handleError = useCallback(() => {
        if (!attemptedFallback && fallbackSrc && fallbackSrc !== displayedSrc) {
            // Try fallback
            setAttemptedFallback(true);
            setDisplayedSrc(fallbackSrc);
            setHasLoaded(false);
            setHasError(false);
        } else {
            // If no fallback or fallback failed, show error state
            setHasError(true);
            setHasLoaded(true); // Prevent loading spinner from showing indefinitely
        }
    }, [attemptedFallback, fallbackSrc, displayedSrc]);

    // Generate optimized sources with automatic format conversion
    const generateSources = () => {
        const sources = [];

        // Auto-generate AVIF srcset from main src
        if (src && !avifSrc && !src.startsWith('data:')) {
            const avifSrcSet = generateSrcSet(src, 'avif');
            if (avifSrcSet) {
                sources.push(
                    <source key="avif-auto" srcSet={avifSrcSet} type="image/avif" sizes={sizes} />
                );
            }
        } else if (avifSrc) {
            sources.push(
                <source key="avif" srcSet={avifSrc} type="image/avif" sizes={sizes} />
            );
        }

        // Auto-generate WEBP srcset from main src
        if (src && !webpSrc && !src.startsWith('data:')) {
            const webpSrcSet = generateSrcSet(src, 'webp');
            if (webpSrcSet) {
                sources.push(
                    <source key="webp-auto" srcSet={webpSrcSet} type="image/webp" sizes={sizes} />
                );
            }
        } else if (webpSrc) {
            sources.push(
                <source key="webp" srcSet={webpSrc} type="image/webp" sizes={sizes} />
            );
        }

        return sources;
    };

    // Auto-generate responsive srcsets for different formats
    const generateSrcSet = (baseSrc, format) => {
        if (!baseSrc || baseSrc.startsWith('data:')) return '';

        try {
            const breakpoints = [480, 768, 1024, 1200, 1600];

            if (baseSrc.includes('unsplash.com')) {
                return breakpoints
                    .map(w => `${baseSrc}&w=${w}&q=75&fm=${format} ${w}w`)
                    .join(', ');
            }

            if (baseSrc.includes('googleapis.com') || baseSrc.includes('storage.googleapis.com')) {
                const separator = baseSrc.includes('?') ? '&' : '?';
                return breakpoints
                    .map(w => `${baseSrc}${separator}format=${format}&width=${w}&quality=75 ${w}w`)
                    .join(', ');
            }
        } catch (error) {
            console.warn('Error generating srcset:', error);
        }

        return '';
    };

    // Don't load if not in view and not priority
    const shouldLoad = priority || isInView;

    return (
        <div
            ref={imgRef}
            className={`relative overflow-hidden ${className}`}
            // Let parent control layout; only apply explicit containerStyle when provided
            style={containerStyle}
        >
            {/* Loading placeholder */}
            {!hasLoaded && shouldLoad && (
                <>
                    {placeholderSrc ? (
                        <img
                            src={placeholderSrc}
                            alt=""
                            aria-hidden="true"
                            className="absolute inset-0 w-full h-full object-cover blur-md scale-105 opacity-80"
                            decoding="async"
                        />
                    ) : (
                        <div className="absolute inset-0 bg-slate-200 animate-pulse">
                            <div className="w-full h-full bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 animate-pulse" />
                        </div>
                    )}
                </>
            )}

            {/* Error fallback */}
            {hasError && (
                <div className="absolute inset-0 bg-slate-100 flex items-center justify-center text-slate-400">
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                </div>
            )}

            {/* Optimized image with multiple formats */}
            {shouldLoad && !hasError && (
                <picture>
                    {generateSources()}
                    <img
                        src={displayedSrc}
                        alt={alt}
                        width={width}
                        height={height}
                        loading={priority ? 'eager' : loading}
                        fetchpriority={priority ? 'high' : fetchPriority}
                        decoding="async"
                        sizes={sizes}
                        onLoad={handleLoad}
                        onError={handleError}
                        className={`w-full h-full object-${objectFit} transition-opacity duration-300 ${hasLoaded ? 'opacity-100' : 'opacity-0'}`}
                        {...props}
                    />
                </picture>
            )}
        </div>
    );
};

export default OptimizedImage;
