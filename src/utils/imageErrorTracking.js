import { env } from '@/utils/env';
/**
 * Tracking de erros de imagem
 */

export function trackImageError(errorData) {
  const payload = {
    event: 'image_load_error',
    timestamp: new Date().toISOString(),
    url: errorData.url,
    format: errorData.format,
    referer: window.location.href,
    userAgent: navigator.userAgent,
    screen: `${window.screen.width}x${window.screen.height}`,
    viewport: `${window.innerWidth}x${window.innerHeight}`
  };
  
  // Google Analytics
  if (window.gtag) {
    window.gtag('event', 'image_load_error', {
      event_category: 'Image',
      event_label: payload.url,
      format: payload.format,
      non_interaction: true
    });
  }
  
  // PostHog (se disponível)
  if (window.posthog) {
    window.posthog.capture('image_load_error', payload);
  }
  
  // Log estruturado
  console.warn('[ImageErrorTracking]', JSON.stringify(payload));
  
  // Opcional: enviar para endpoint custom
  if (env.PROD) {
    fetch('/api/telemetry/image-error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(() => {}); // Fail silently
  }
}

export function trackSEONormalization(post) {
  const payload = {
    event: 'seo_normalized',
    postId: post.id,
    postSlug: post.slug,
    keywordsType: typeof post.seo?.keywords,
    hasKeywords: Boolean(post.seo?.keywords),
    timestamp: new Date().toISOString()
  };
  
  if (window.posthog) {
    window.posthog.capture('seo_normalized', payload);
  }
  
  console.info('[SEOTracking]', JSON.stringify(payload));
}