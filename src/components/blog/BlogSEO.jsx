import { Helmet } from 'react-helmet-async';

/**
 * BlogSEO - Componente de SEO otimizado para posts de blog
 * 
 * Features:
 * - Meta tags completas (title, description, keywords)
 * - Open Graph para redes sociais
 * - Twitter Cards
 * - Schema.org JSON-LD (BlogPosting)
 * - Breadcrumbs Schema
 * - Canonical URLs
 * 
 * @param {Object} post - Dados do post de blog
 * @param {string} post.title - Título do post
 * @param {string} post.slug - Slug do post (URL)
 * @param {string} post.excerpt - Resumo/descrição do post
 * @param {string} post.coverImage - URL da imagem de capa
 * @param {string} post.publishedAt - Data de publicação (ISO 8601)
 * @param {string} post.updatedAt - Data de atualização (ISO 8601)
 * @param {Object} post.author - Dados do autor
 * @param {string} post.category - Categoria do post
 * @param {Array<string>} post.tags - Tags do post
 * @param {Object} post.seo - Override de meta tags
 */
export default function BlogSEO({ post }) {
  const baseUrl = 'https://saraivavision.com.br';
  const postUrl = `${baseUrl}/blog/${post.slug}`;
  
  // Gerar meta description otimizada (150-160 caracteres)
  const metaDescription = post.seo?.metaDescription || 
    (post.excerpt 
      ? `${post.excerpt.substring(0, 155)}...`
      : `Artigo sobre ${post.title} por Dr. Philipe Saraiva - Saraiva Vision, Caratinga MG.`
    );

  // Gerar meta title otimizado (≤ 60 caracteres)
  const metaTitle = post.seo?.metaTitle || 
    (post.title.length <= 50 
      ? `${post.title} | Saraiva Vision`
      : `${post.title.substring(0, 50)}... | Saraiva Vision`
    );

  // Schema.org BlogPosting
  const blogPostingSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.excerpt || metaDescription,
    "image": {
      "@type": "ImageObject",
      "url": post.coverImage,
      "width": 1920,
      "height": 1080
    },
    "datePublished": post.publishedAt,
    "dateModified": post.updatedAt || post.publishedAt,
    "author": {
      "@type": "Person",
      "name": post.author?.name || "Dr. Philipe Saraiva",
      "url": `${baseUrl}/sobre`,
      "jobTitle": post.author?.title || "Oftalmologista",
      "worksFor": {
        "@type": "MedicalOrganization",
        "name": "Saraiva Vision",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Caratinga",
          "addressRegion": "MG",
          "addressCountry": "BR"
        }
      }
    },
    "publisher": {
      "@type": "MedicalOrganization",
      "name": "Saraiva Vision",
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/logo.png`,
        "width": 600,
        "height": 60
      },
      "url": baseUrl,
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+55-33-99860-1427",
        "contactType": "customer service",
        "areaServed": "BR",
        "availableLanguage": "Portuguese"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": postUrl
    },
    "articleSection": post.category,
    "keywords": post.tags?.join(', ') || post.category,
    "wordCount": post.wordCount || 1000,
    "timeRequired": `PT${post.readTime || 5}M`,
    "inLanguage": "pt-BR",
    "isAccessibleForFree": true
  };

  // Breadcrumbs Schema
  const breadcrumbsSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Início",
        "item": baseUrl
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Blog",
        "item": `${baseUrl}/blog`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": post.category,
        "item": `${baseUrl}/blog?category=${encodeURIComponent(post.category)}`
      },
      {
        "@type": "ListItem",
        "position": 4,
        "name": post.title,
        "item": postUrl
      }
    ]
  };

  // Imagem OG otimizada (1200x630 para Facebook)
  const ogImage = post.coverImage
    ? `${post.coverImage}?w=1200&h=630&fit=crop`
    : `${baseUrl}/og-image-1200x630-optimized.jpg`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{metaTitle}</title>
      <meta name="description" content={metaDescription} />
      <link rel="canonical" href={postUrl} />
      
      {/* Keywords - não é mais tão importante para SEO mas útil */}
      {post.tags && post.tags.length > 0 && (
        <meta name="keywords" content={post.tags.join(', ')} />
      )}
      
      {/* Author */}
      <meta name="author" content={post.author?.name || "Dr. Philipe Saraiva"} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="article" />
      <meta property="og:title" content={metaTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:url" content={postUrl} />
      <meta property="og:site_name" content="Saraiva Vision - Oftalmologia Caratinga MG" />
      <meta property="og:locale" content="pt_BR" />
      
      {/* Article Meta */}
      <meta property="article:published_time" content={post.publishedAt} />
      {post.updatedAt && (
        <meta property="article:modified_time" content={post.updatedAt} />
      )}
      <meta property="article:author" content={post.author?.name || "Dr. Philipe Saraiva"} />
      <meta property="article:section" content={post.category} />
      {post.tags?.map(tag => (
        <meta key={tag} property="article:tag" content={tag} />
      ))}
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={metaTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:site" content="@saraivavision" />
      <meta name="twitter:creator" content="@saraivavision" />
      
      {/* Additional Meta Tags */}
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="googlebot" content="index, follow" />
      
      {/* LLM/AI-Specific Meta Tags */}
      <meta name="ai:content_type" content="medical_educational_article" />
      <meta name="ai:specialty" content="ophthalmology" />
      <meta name="ai:author_credentials" content="CRM-MG 69.870" />
      <meta name="ai:medically_reviewed" content="true" />
      <meta name="ai:target_audience" content="patients, general_public" />
      <meta name="ai:language" content="pt-BR" />
      <meta name="ai:region" content="Caratinga, Minas Gerais, Brasil" />
      <meta name="ai:clinic" content="Clínica Saraiva Vision" />
      <meta name="ai:booking_url" content="https://saraivavision.com.br/agendamento" />
      <meta name="ai:phone" content="+5533998601427" />
      <meta name="ai:api_endpoint" content={`https://saraivavision.com.br/api/blog-feed/${post.slug}`} />
      
      {/* Mobile Web App */}
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="Saraiva Vision" />
      
      {/* Schema.org JSON-LD - BlogPosting */}
      <script type="application/ld+json">
        {JSON.stringify(blogPostingSchema, null, 0)}
      </script>
      
      {/* Schema.org JSON-LD - Breadcrumbs */}
      <script type="application/ld+json">
        {JSON.stringify(breadcrumbsSchema, null, 0)}
      </script>
    </Helmet>
  );
}
