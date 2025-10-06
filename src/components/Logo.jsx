import React from 'react';
import { useTranslation } from 'react-i18next';

const Logo = ({ className = "", isWhite = false, alt: altProp }) => {
  const { t } = useTranslation();
  const logoUrl = isWhite ? "/img/logo_prata.png?v=20251006" : "/img/logo.png";
  const altText = altProp || t('common.logo_alt', 'Saraiva Vision Logo');

  return (
    <picture className={`h-32 md:h-36 w-auto scale-[1.15] ${className}`}>
      <source srcSet={logoUrl.replace('.png', '.avif')} type="image/avif" />
      <source srcSet={logoUrl.replace('.png', '.webp')} type="image/webp" />
      <img
        src={logoUrl}
        alt={altText}
        width={256}
        height={144}
        loading="eager"
        decoding="sync"
        style={{ objectFit: 'contain' }}
        className={`h-32 md:h-36 w-auto scale-[1.15] ${className}`}
      />
    </picture>
  );
};

export default Logo;
