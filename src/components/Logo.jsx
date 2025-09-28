import React from 'react';
import { useTranslation } from 'react-i18next';

const Logo = ({ className = "", isWhite = false, alt: altProp }) => {
  const { t } = useTranslation();
  const logoUrl = "/img/logo-saraiva-vision.svg";
  const altText = altProp || t('common.logo_alt', 'Saraiva Vision Logo');

  return (
    <img
      src={logoUrl}
      alt={altText}
      className={`h-32 md:h-36 w-auto ${className} ${isWhite ? '' : ''}`}
      loading="eager"
      decoding="async"
      width="256"
      height="144"
      sizes="(min-width: 768px) 144px, 128px"
    />
  );
};

export default Logo;
