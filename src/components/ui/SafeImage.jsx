import React, { useState } from 'react';
import { ImageIcon } from 'lucide-react';

const SafeImage = ({ 
  src, 
  alt, 
  className, 
  fallbackSrc = null,
  ...props 
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  // Default fallback image for medical content
  const defaultFallback = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjBGOUZGIi8+CjxwYXRoIGQ9Ik0xODAgMTIwSDIyMFYxNDBIMjQwVjE4MEgyMjBWMjAwSDE4MFYxODBIMTYwVjE0MEgxODBWMTIwWiIgZmlsbD0iIzBFQTVFOSIvPgo8L3N2Zz4K';

  if (hasError) {
    if (fallbackSrc && fallbackSrc !== src) {
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
        src={src}
        alt={alt}
        className={`${className} ${isLoading ? 'hidden' : 'block'}`}
        onError={handleError}
        onLoad={handleLoad}
        loading="lazy"
        {...props}
      />
    </>
  );
};

export default SafeImage;
