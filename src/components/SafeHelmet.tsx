import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SafeHelmetProps {
  title?: string | null;
  description?: string | null;
  keywords?: string | null;
  image?: string | null;
  url?: string | null;
  type?: string;
  children?: React.ReactNode;
}

const DEFAULT_TITLE = 'Saraiva Vision - Oftalmologia em Caratinga, MG';
const DEFAULT_DESCRIPTION = 'Clínica oftalmológica especializada com Dr. Philipe Saraiva Cruz (CRM-MG 69.870). Atendimento humanizado e tecnologia de ponta em Caratinga, MG.';
const DEFAULT_IMAGE = 'https://saraivavision.com.br/og-image.jpg';

/**
 * Safe wrapper for Helmet that ensures all values are valid strings
 * Prevents: "Helmet expects a string as a child of <title>"
 *
 * @author Dr. Philipe Saraiva Cruz
 */
export const SafeHelmet: React.FC<SafeHelmetProps> = ({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  children
}) => {
  // Ensure title is always a non-empty string
  const safeTitle = React.useMemo(() => {
    if (!title || typeof title !== 'string' || title.trim() === '') {
      return DEFAULT_TITLE;
    }
    return title.trim();
  }, [title]);

  // Ensure description is always a non-empty string
  const safeDescription = React.useMemo(() => {
    if (!description || typeof description !== 'string' || description.trim() === '') {
      return DEFAULT_DESCRIPTION;
    }
    return description.trim();
  }, [description]);

  // Safe image URL
  const safeImage = image && typeof image === 'string' && image.trim() !== ''
    ? image.trim()
    : DEFAULT_IMAGE;

  // Safe URL
  const safeUrl = url && typeof url === 'string' && url.trim() !== ''
    ? url.trim()
    : 'https://saraivavision.com.br';

  return (
    <Helmet>
      <title>{safeTitle}</title>
      <meta name="description" content={safeDescription} />
      {keywords && typeof keywords === 'string' && keywords.trim() !== '' && (
        <meta name="keywords" content={keywords.trim()} />
      )}

      {/* Open Graph */}
      <meta property="og:title" content={safeTitle} />
      <meta property="og:description" content={safeDescription} />
      <meta property="og:image" content={safeImage} />
      <meta property="og:url" content={safeUrl} />
      <meta property="og:type" content={type} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={safeTitle} />
      <meta name="twitter:description" content={safeDescription} />
      <meta name="twitter:image" content={safeImage} />

      {children}
    </Helmet>
  );
};
