/*
 * Lightweight offline cache helpers for WordPress content.
 * These utilities provide safe no-op fallbacks when localStorage is unavailable
 * (e.g., during SSR or tests) while enabling offline resilience in the browser.
 */

const STORAGE_NAMESPACE = 'saraivavision_wp_offline';
const isBrowser = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const safeParse = (value) => {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch (error) {
    return null;
  }
};

const buildStorageKey = (key, priority = 'normal', namespace = 'wordpress') =>
  `${STORAGE_NAMESPACE}:${namespace}:${priority}:${key}`;

export const getCachedContent = (key, priority = 'normal', namespace = 'wordpress') => {
  if (!isBrowser) return null;
  const storageKey = buildStorageKey(key, priority, namespace);
  return safeParse(window.localStorage.getItem(storageKey));
};

export const setCachedContent = (
  key,
  data,
  priority = 'normal',
  namespace = 'wordpress',
  metadata = {}
) => {
  if (!isBrowser) return null;
  const storageKey = buildStorageKey(key, priority, namespace);
  const payload = {
    data,
    priority,
    namespace,
    timestamp: Date.now(),
    metadata
  };

  try {
    window.localStorage.setItem(storageKey, JSON.stringify(payload));
    return payload;
  } catch (error) {
    // Storage quota may be exceeded. Attempt best-effort cleanup and ignore.
    return null;
  }
};

export const prefetchCriticalContent = async () => {
  // Placeholder hook for future enhancements (e.g., background prefetching).
  return 0;
};

const nowIso = () => new Date().toISOString();

export const generateEnhancedFallbackContent = (contentType, options = {}) => {
  const baseMeta = {
    generatedAt: nowIso(),
    retryAfterSeconds: 300,
    contentType,
    options
  };

  switch (contentType) {
    case 'posts':
      return {
        posts: [
          {
            id: 'offline-post-1',
            title: 'Conteúdo temporariamente indisponível',
            slug: 'conteudo-temporariamente-indisponivel',
            excerpt:
              'Estamos atualizando o blog. Em instantes novos artigos estarão disponíveis.',
            content: '',
            date: nowIso(),
            featuredImage: null,
            author: { name: 'Equipe Saraiva Vision' },
            isFallback: true
          }
        ],
        fallbackMeta: {
          ...baseMeta,
          message: 'Exibindo conteúdo padrão até o CMS retornar.'
        }
      };

    case 'categories':
      return {
        categories: [
          { id: 1, name: 'Novidades', slug: 'novidades', count: 0 },
          { id: 2, name: 'Cuidados', slug: 'cuidados', count: 0 }
        ],
        fallbackMeta: {
          ...baseMeta,
          message: 'Categorias padrão exibidas enquanto o CMS é restabelecido.'
        }
      };

    case 'services':
      return {
        services: [],
        fallbackMeta: {
          ...baseMeta,
          message: 'Serviços indisponíveis temporariamente.'
        }
      };

    default:
      return {
        fallbackMeta: {
          ...baseMeta,
          message: 'Conteúdo indisponível temporariamente.'
        }
      };
  }
};

export default {
  getCachedContent,
  setCachedContent,
  prefetchCriticalContent,
  generateEnhancedFallbackContent
};
