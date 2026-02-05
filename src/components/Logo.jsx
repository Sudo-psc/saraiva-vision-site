import React from 'react';
import { useTranslation } from 'react-i18next';

const Logo = ({ className = "", isWhite = false, alt: altProp }) => {
  const { t } = useTranslation();
  const altText = altProp || t('common.logo_alt', 'Saraiva Vision Logo');

  // Use responsive images for better performance
  const responsiveBase = isWhite ? "/img/responsive/logo_prata" : "/img/logo";

  return (
    <picture className={`h-16 lg:h-20 xl:h-24 2xl:h-28 w-auto ${className}`}>
      {/* Responsive AVIF sources */}
      {isWhite && (
        <source
          srcSet="/img/responsive/logo_prata-112.avif 112w, /img/responsive/logo_prata-224.avif 224w, /img/responsive/logo_prata-300.avif 300w"
          sizes="(min-width: 1280px) 224px, (min-width: 1024px) 160px, 112px"
          type="image/avif"
        />
      )}
      {/* Responsive WebP sources */}
      {isWhite && (
        <source
          srcSet="/img/responsive/logo_prata-112.webp 112w, /img/responsive/logo_prata-224.webp 224w, /img/responsive/logo_prata-300.webp 300w"
          sizes="(min-width: 1280px) 224px, (min-width: 1024px) 160px, 112px"
          type="image/webp"
        />
      )}
      {/* Fallback for non-white logo or older browsers */}
      {!isWhite && (
        <>
          <source srcSet="/img/logo.avif" type="image/avif" />
          <source srcSet="/img/logo.webp" type="image/webp" />
        </>
      )}
      <img
        src={isWhite ? "/img/responsive/logo_prata-224.webp" : "/img/logo.png"}
        alt={altText}
        width={224}
        height={224}
        loading="eager"
        decoding="sync"
        fetchpriority="high"
        style={{ objectFit: 'contain' }}
        className={`h-16 lg:h-20 xl:h-24 2xl:h-28 w-auto ${className}`}
      />
    </picture>
  );
};

export default Logo;
