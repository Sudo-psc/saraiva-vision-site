import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

/**
 * OptimizedImage - Componente de imagem com lazy loading e suporte a formatos modernos
 *
 * Features:
 * - Lazy loading com Intersection Observer
 * - Progressive loading (AVIF → WebP → fallback)
 * - Placeholder blur enquanto carrega
 * - Dimensões explícitas para evitar layout shift
 * - Suporte a srcset para imagens responsivas
 *
 * @example
 * <OptimizedImage
 *   src="/Blog/capa-catarata.png"
 *   alt="Cirurgia de Catarata"
 *   width={800}
 *   height={600}
 *   className="rounded-lg"
 * />
 */
export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  loading = 'lazy',
  priority = false,
  objectFit = 'cover',
  onLoad,
  ...props
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority); // Se priority=true, carregar imediatamente
  const imgRef = useRef(null);

  // Intersection Observer para lazy loading
  useEffect(() => {
    if (priority || isInView) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '50px', // Carregar 50px antes de entrar na viewport
        threshold: 0.01
      }
    );

    const currentRef = imgRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [priority, isInView]);

  // Gerar caminhos para formatos modernos
  const getImageSources = () => {
    if (!src) return { avif: null, webp: null, fallback: src };

    // Check if URL is from Sanity CDN
    const isSanityUrl = src.includes('cdn.sanity.io');

    if (isSanityUrl) {
      // For Sanity CDN, use format parameter (fm)
      // Note: Sanity supports WebP but not AVIF (returns 400)
      const hasParams = src.includes('?');
      const separator = hasParams ? '&' : '?';

      return {
        avif: null, // Sanity CDN doesn't support AVIF format
        webp: `${src}${separator}fm=webp`,
        fallback: src
      };
    }

    // For local images, change extension
    const basePath = src.substring(0, src.lastIndexOf('.'));

    return {
      avif: `${basePath}.avif`,
      webp: `${basePath}.webp`,
      fallback: src
    };
  };

  const sources = getImageSources();

  // Handler de carregamento
  const handleLoad = (e) => {
    setIsLoaded(true);
    if (onLoad) onLoad(e);
  };

  // Estilos para placeholder e transição
  const containerStyle = {
    position: 'relative',
    width: width || '100%',
    height: height || 'auto',
    overflow: 'hidden',
    backgroundColor: '#f0f0f0'
  };

  const imgStyle = {
    width: '100%',
    height: '100%',
    objectFit,
    transition: 'opacity 0.3s ease-in-out',
    opacity: isLoaded ? 1 : 0
  };

  const placeholderStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: '#e0e0e0',
    backgroundImage: 'linear-gradient(90deg, #e0e0e0 0%, #f0f0f0 50%, #e0e0e0 100%)',
    backgroundSize: '200% 100%',
    animation: isLoaded ? 'none' : 'shimmer 1.5s infinite',
    opacity: isLoaded ? 0 : 1,
    transition: 'opacity 0.3s ease-in-out'
  };

  return (
    <div ref={imgRef} style={containerStyle} className={className}>
      {/* Placeholder animado */}
      <div style={placeholderStyle} />

      {/* Imagem otimizada com fallbacks progressivos */}
      {isInView && (
        <picture>
          {/* AVIF - Melhor compressão (até 50% menor que WebP) */}
          <source srcSet={sources.avif} type="image/avif" />

          {/* WebP - Boa compressão com suporte amplo (95%+) */}
          <source srcSet={sources.webp} type="image/webp" />

          {/* Fallback - PNG/JPEG original */}
          <img
            src={sources.fallback}
            alt={alt}
            width={width}
            height={height}
            loading={priority ? 'eager' : loading}
            decoding={priority ? 'sync' : 'async'}
            onLoad={handleLoad}
            style={imgStyle}
            {...props}
          />
        </picture>
      )}

      <style>{`
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </div>
  );
}

OptimizedImage.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  className: PropTypes.string,
  loading: PropTypes.oneOf(['lazy', 'eager']),
  priority: PropTypes.bool,
  objectFit: PropTypes.oneOf(['cover', 'contain', 'fill', 'none', 'scale-down']),
  onLoad: PropTypes.func
};
