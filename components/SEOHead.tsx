import { Metadata } from 'next';
import { clinicInfo } from '@/lib/clinicInfo';

interface SEOHeadProps {
  title?: string;
  description?: string;
  image?: string;
  keywords?: string;
  ogType?: 'website' | 'article' | 'profile';
  noindex?: boolean;
  canonicalPath?: string;
  structuredData?: object;
  locale?: string;
}

const resolveBaseUrl = (): string => {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin.replace(/\/?$/, '');
  }

  if (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/?$/, '');
  }

  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SITE_BASE_URL) {
    return import.meta.env.VITE_SITE_BASE_URL.replace(/\/?$/, '');
  }

  return 'https://saraivavision.com.br';
};

// Function to generate metadata for Next.js 15 App Router
export const generateSEOHead = ({
  title,
  description,
  image,
  keywords,
  ogType = 'website',
  noindex = false,
  canonicalPath = null,
  structuredData = null,
  locale = 'pt'
}: SEOHeadProps): Metadata => {
  const baseUrl = resolveBaseUrl();
  const currentPath = canonicalPath || '/';
  const canonicalUrl = canonicalPath ? `${baseUrl}${canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`}` : `${baseUrl}${currentPath}`;

  // Validate character limits for SEO
  const validatedTitle = title ?
    (title.length > 60 ? title.substring(0, 57) + '...' : title) :
    'Oftalmologista Caratinga/MG | Dr. Philipe Saraiva CRM 69.870';

  const validatedDescription = description ?
    (description.length > 155 ? description.substring(0, 152) + '...' : description) :
    'Clínica oftalmológica em Caratinga/MG: catarata, glaucoma, retina, lentes. Dr. Philipe Saraiva CRM-MG 69.870. Agende online ou WhatsApp!';

  // Generate optimized image URL for social sharing (1200x630)
  const getOptimizedOgImage = (): string => {
    if (image) return image;
    return `${baseUrl}/og-image-1200x630-optimized.jpg`;
  };

  // Generate site name based on language
  const siteName = locale === 'pt' ? 'Saraiva Vision - Oftalmologia' : 'Saraiva Vision - Ophthalmology';

  const ogImage = getOptimizedOgImage();

  const baseMetadata: Metadata = {
    title: validatedTitle,
    description: validatedDescription,
    keywords: keywords,
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: canonicalUrl,
      languages: {
        'pt-BR': canonicalPath?.startsWith('/en') ? canonicalPath.replace('/en', '') || '/' : currentPath,
        'pt': canonicalPath?.startsWith('/en') ? canonicalPath.replace('/en', '') || '/' : currentPath,
        'en': canonicalPath?.startsWith('/en') ? canonicalPath : `/en${currentPath}`,
        'x-default': canonicalPath?.startsWith('/en') ? canonicalPath.replace('/en', '') || '/' : currentPath,
      },
    },
    openGraph: {
      type: ogType,
      locale: locale === 'pt' ? 'pt_BR' : 'en_US',
      url: canonicalUrl,
      title: validatedTitle,
      description: validatedDescription,
      siteName: siteName,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${validatedTitle} - Clínica Saraiva Vision`,
          type: 'image/jpeg',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@saraivavisao',
      creator: '@saraivavisao',
      title: validatedTitle,
      description: validatedDescription,
      images: [ogImage],
    },
    // WhatsApp Business
      other: {
        'whatsapp:url': canonicalUrl,
        'whatsapp:title': validatedTitle,
        'whatsapp:description': validatedDescription,
        'whatsapp:image': ogImage,
        // Instagram Preview
        'og:article:author': 'Dr. Philipe Saraiva',
        'og:article:section': 'Medicina Oftalmológica',
        // Medical Practice Enhancement
        'medical-category': 'Oftalmologia',
        'specialty': 'Clínica Oftalmológica',
        'doctor-name': 'Dr. Philipe Saraiva',
        'crm': 'CRM-MG 69.870',
        // Additional Social Media Meta Tags
        'fb:app_id': '1134006230864956',
      },
    // App Icons
      icons: {
        icon: '/favicon.ico',
        apple: '/apple-touch-icon.png',
      },
    // Robots and Search Engine Directives
    robots: {
      index: !noindex,
      follow: !noindex,
      googleBot: {
        index: !noindex,
        follow: !noindex,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
    // Viewport and Mobile Optimization
    viewport: {
      width: 'device-width',
      initialScale: 1,
      maximumScale: 1,
      userScalable: false,
    },
    // Theme and Colors
    themeColor: '#3B82F6',
    colorScheme: 'light',
    // Verification and Analytics
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
      yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
    },
  };

  // Add structured data if provided
  if (structuredData) {
    baseMetadata.other = {
      ...baseMetadata.other,
      'application/ld+json': JSON.stringify(structuredData),
    };
  }

  return baseMetadata;
};

// Component for structured data injection (server component)
export const StructuredData = ({ data }: { data: object }) => {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data),
      }}
    />
  );
};

// Hook for client-side SEO updates (for dynamic content)
export const useSEOHead = (props: SEOHeadProps) => {
  // This hook can be used for client-side SEO updates
  // In Next.js App Router, most SEO should be handled via generateSEOHead
  // but this hook provides a way to update document title dynamically
  const updateDocumentTitle = (title: string) => {
    if (typeof window !== 'undefined') {
      document.title = title;
    }
  };

  return {
    updateDocumentTitle,
    metadata: generateSEOHead(props),
  };
};

export default generateSEOHead;