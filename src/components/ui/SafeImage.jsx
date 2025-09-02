import React, { useState, useRef, useEffect } from 'react';
import { ImageIcon } from 'lucide-react';

const SafeImage = ({
  src,
  alt,
  className,
  fallbackSrc = null,
  tryAlternatives = true,
  ...props
}) => {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const triedRef = useRef(new Set());

  useEffect(() => {
    setCurrentSrc(src);
    setHasError(false);
    setIsLoading(true);
    triedRef.current = new Set();
  }, [src]);

  const buildSlugCandidate = (original) => {
    if (!original) return original;
    try {
      // Remove query/hash
      const clean = original.split(/[?#]/)[0];
      const parts = clean.split('/');
      const file = parts.pop();
      if (!file) return original;
      const dotIdx = file.lastIndexOf('.');
      const base = dotIdx > -1 ? file.slice(0, dotIdx) : file;
      const ext = dotIdx > -1 ? file.slice(dotIdx) : '';
      const slugBase = base
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .replace(/[^a-zA-Z0-9]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .toLowerCase();
      return [...parts, slugBase + ext].join('/');
    } catch {
      return original;
    }
  };

  const extensionAlternatives = (original) => {
    const exts = ['.png', '.jpeg', '.jpg', '.avif', '.webp'];
    const clean = original.split(/[?#]/)[0];
    const dot = clean.lastIndexOf('.');
    const base = dot > -1 ? clean.slice(0, dot) : clean;
    return exts.map(e => base + e);
  };

  const attemptNextAlternative = () => {
    if (!tryAlternatives) return false;
    const attempted = triedRef.current;
    const candidates = [];

    // 1. Slugified filename
    const slug = buildSlugCandidate(src);
    if (slug && slug !== src) candidates.push(slug);

    // 2. Different extensions for original
    extensionAlternatives(src).forEach(c => candidates.push(c));
    // 3. Different extensions for slug
    if (slug && slug !== src) {
      extensionAlternatives(slug).forEach(c => candidates.push(c));
    }

    for (const c of candidates) {
      if (!attempted.has(c)) {
        attempted.add(c);
        setCurrentSrc(c);
        setHasError(false);
        setIsLoading(true);
        return true;
      }
    }
    return false;
  };

  const handleError = () => {
    if (attemptNextAlternative()) return; // Tentou alternativa
    setHasError(true);
    setIsLoading(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  // Default fallback image for medical content
  const defaultFallback = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjBGOUZGIi8+CjxwYXRoIGQ9Ik0xODAgMTIwSDIyMFYxNDBIMjQwVjE4MEgyMjBWMjAwSDE4MFYxODBIMTYwVjE0MEgxODBWMTIwWiIgZmlsbD0iIzBFQTVFOSIvPgo8L3N2Zz4K';

  if (hasError) {
    if (fallbackSrc && fallbackSrc !== currentSrc) {
      return (
        <SafeImage
          src={fallbackSrc}
          alt={alt}
          className={className}
          fallbackSrc={defaultFallback}
          {...props}
        />
      );
    }

    return (
      <div
        className={`${className} flex items-center justify-center bg-slate-100 text-slate-400`}
        {...props}
      >
        <div className="text-center">
          <ImageIcon size={48} className="mx-auto mb-2 opacity-50" />
          <p className="text-sm">Imagem não disponível</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {isLoading && (
        <div
          className={`${className} flex items-center justify-center bg-slate-100 animate-pulse`}
          {...props}
        >
          <div className="text-slate-400">
            <ImageIcon size={32} className="animate-pulse" />
          </div>
        </div>
      )}
      <img
        {...props}
        src={currentSrc}
        alt={alt}
        className={`${className} ${isLoading ? 'hidden' : 'block'}`}
        onError={(e) => {
          try { props.onError && props.onError(e); } catch (_) { }
          handleError(e);
        }}
        onLoad={(e) => {
          try { props.onLoad && props.onLoad(e); } catch (_) { }
          handleLoad(e);
        }}
        loading="lazy"
      />
    </>
  );
};

export default SafeImage;
