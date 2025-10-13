import React from 'react';

interface ResponsiveImageProps {
  basePath: string;  // e.g., "/Blog/capa-lentes-premium-catarata-optimized"
  alt: string;
  sizes?: string;
  className?: string;
  loading?: 'lazy' | 'eager';
}

/**
 * Responsive image with AVIF → WebP → JPEG fallback
 * Generates srcset for multiple resolutions (480w, 768w, 1200w)
 *
 * Solves: 404 errors on AVIF images by providing automatic fallback chain
 *
 * @author Dr. Philipe Saraiva Cruz
 */
export const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  basePath,
  alt,
  sizes = '(max-width: 768px) 100vw, 50vw',
  className,
  loading = 'lazy'
}) => {
  // Generate srcset for different formats
  const avifSrcSet = `
    ${basePath}-480w.avif 480w,
    ${basePath}-768w.avif 768w,
    ${basePath}-1200w.avif 1200w
  `.trim();

  const webpSrcSet = `
    ${basePath}-480w.webp 480w,
    ${basePath}-768w.webp 768w,
    ${basePath}-1200w.webp 1200w
  `.trim();

  const jpegSrcSet = `
    ${basePath}-480w.jpg 480w,
    ${basePath}-768w.jpg 768w,
    ${basePath}-1200w.jpg 1200w
  `.trim();

  return (
    <picture>
      {/* AVIF - Modern browsers with best compression */}
      <source
        type="image/avif"
        srcSet={avifSrcSet}
        sizes={sizes}
      />

      {/* WebP - Fallback for older browsers */}
      <source
        type="image/webp"
        srcSet={webpSrcSet}
        sizes={sizes}
      />

      {/* JPEG - Universal fallback */}
      <source
        type="image/jpeg"
        srcSet={jpegSrcSet}
        sizes={sizes}
      />

      {/* Default img for non-picture browsers */}
      <img
        src={`${basePath}.jpg`}
        alt={alt}
        className={className}
        loading={loading}
        decoding="async"
      />
    </picture>
  );
};
