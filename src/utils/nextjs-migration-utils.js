/**
 * Next.js Migration Utilities
 *
 * This file contains utilities to help with the migration from React + Vite to Next.js
 * These utilities provide compatibility layers and migration helpers.
 */

/**
 * Check if code is running on the client side
 * Useful for components that need different behavior in SSR vs client
 */
export const isClient = () => typeof window !== 'undefined';

/**
 * Check if code is running on the server side
 * Useful for server components and API routes
 */
export const isServer = () => typeof window === 'undefined';

/**
 * Safe window access that works in SSR
 * Returns undefined on server, actual window object on client
 */
export const safeWindow = () => {
  if (isClient()) {
    return window;
  }
  return undefined;
};

/**
 * Safe document access that works in SSR
 * Returns undefined on server, actual document object on client
 */
export const safeDocument = () => {
  if (isClient()) {
    return document;
  }
  return undefined;
};

/**
 * Safe localStorage access that works in SSR
 * Returns a mock object on server to prevent errors
 */
export const safeLocalStorage = () => {
  if (isClient()) {
    return window.localStorage;
  }
  return {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {},
  };
};

/**
 * Safe sessionStorage access that works in SSR
 * Returns a mock object on server to prevent errors
 */
export const safeSessionStorage = () => {
  if (isClient()) {
    return window.sessionStorage;
  }
  return {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {},
  };
};

/**
 * Dynamic import helper for Next.js
 * Provides a consistent interface for dynamic imports
 */
export const dynamicImport = (importFn, options = {}) => {
  const {
    error: ErrorComponent = ({ error }) => <div>Error: {error.message}</div>,
  } = options;

  // In Next.js, this would be replaced with next/dynamic
  // For now, return a React.lazy compatible function
  return React.lazy(() =>
    importFn().catch(error => {
      console.error('Dynamic import failed:', error);
      return {
        default: () => <ErrorComponent error={error} />
      };
    })
  );
};

/**
 * SEO metadata helper for Next.js migration
 * Converts react-helmet-async format to Next.js Metadata API format
 */
export const convertToNextMetadata = (helmetData) => {
  const metadata = {};

  if (helmetData.title) {
    metadata.title = helmetData.title;
  }

  if (helmetData.description || helmetData.meta?.find(m => m.name === 'description')?.content) {
    metadata.description = helmetData.description ||
      helmetData.meta.find(m => m.name === 'description').content;
  }

  if (helmetData.meta) {
    const openGraph = {};
    const twitter = {};

    helmetData.meta.forEach(meta => {
      if (meta.property?.startsWith('og:')) {
        const key = meta.property.replace('og:', '');
        openGraph[key] = meta.content;
      } else if (meta.name?.startsWith('twitter:')) {
        const key = meta.name.replace('twitter:', '');
        twitter[key] = meta.content;
      }
    });

    if (Object.keys(openGraph).length > 0) {
      metadata.openGraph = openGraph;
    }

    if (Object.keys(twitter).length > 0) {
      metadata.twitter = twitter;
    }
  }

  return metadata;
};

/**
 * Client-side only component wrapper
 * Renders children only on the client side
 * Useful for components that require browser APIs
 */
export const ClientOnly = ({ children, fallback = null }) => {
  const [hasMounted, setHasMounted] = React.useState(false);

  React.useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return fallback;
  }

  return children;
};

/**
 * Server-safe useEffect hook
 * Only runs on client side, preventing hydration mismatches
 */
export const useClientEffect = (effect, deps) => {
  React.useEffect(() => {
    if (isClient()) {
      return effect();
    }
  }, deps);
};

/**
 * Server-safe useLayoutEffect hook
 * Only runs on client side, preventing SSR issues
 */
export const useClientLayoutEffect = (effect, deps) => {
  React.useLayoutEffect(() => {
    if (isClient()) {
      return effect();
    }
  }, deps);
};

/**
 * Migration helper for event listeners
 * Safely adds/removes event listeners only on client
 */
export const useClientEventListener = (eventName, handler, element = window, options) => {
  React.useEffect(() => {
    if (!isClient() || !element) return;

    element.addEventListener(eventName, handler, options);

    return () => {
      element.removeEventListener(eventName, handler, options);
    };
  }, [eventName, handler, element, options]);
};

/**
 * API route compatibility layer
 * Helps convert Vercel API functions to Next.js API routes
 */
export const createApiHandler = (handlerMap) => {
  return async (request) => {
    const method = request.method.toUpperCase();

    if (handlerMap[method]) {
      try {
        // Convert Next.js Request to Vercel-style req/res
        const req = {
          method,
          body: await request.json().catch(() => null),
          query: Object.fromEntries(new URL(request.url).searchParams),
          headers: Object.fromEntries(request.headers),
          url: request.url,
        };

        let responseData = null;
        let statusCode = 200;
        let headers = {};

        const res = {
          status: (code) => {
            statusCode = code;
            return res;
          },
          json: (data) => {
            responseData = data;
            return res;
          },
          send: (data) => {
            responseData = data;
            return res;
          },
          setHeader: (key, value) => {
            headers[key] = value;
            return res;
          },
        };

        await handlerMap[method](req, res);

        return new Response(
          JSON.stringify(responseData),
          {
            status: statusCode,
            headers: {
              'Content-Type': 'application/json',
              ...headers,
            },
          }
        );
      } catch (error) {
        console.error('API handler error:', error);
        return new Response(
          JSON.stringify({ error: 'Internal server error' }),
          { status: 500 }
        );
      }
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405 }
    );
  };
};

/**
 * Environment detection for Next.js
 * Helps determine if running in development, preview, or production
 */
export const getNextEnvironment = () => {
  if (isServer()) {
    // Server-side environment detection
    return {
      isDevelopment: process.env.NODE_ENV === 'development',
      isProduction: process.env.NODE_ENV === 'production',
      isPreview: process.env.VERCEL_ENV === 'preview',
      isVercel: !!process.env.VERCEL,
      vercelEnv: process.env.VERCEL_ENV,
    };
  }

  // Client-side (limited info available)
  return {
    isDevelopment: false, // Assume production on client
    isProduction: true,
    isPreview: false,
    isVercel: false,
    vercelEnv: undefined,
  };
};

/**
 * Image optimization helper for Next.js migration
 * Prepares images for Next.js Image component
 */
export const optimizeImageProps = (src, options = {}) => {
  const {
    width,
    height,
    alt = '',
    priority = false,
    placeholder = 'empty',
    quality = 75,
    ...otherProps
  } = options;

  return {
    src,
    width,
    height,
    alt,
    priority,
    placeholder,
    quality,
    ...otherProps,
  };
};

/**
 * Link component compatibility layer
 * Helps migrate from react-router-dom Link to Next.js Link
 */
export const createCompatibleLink = (NextLink, ReactRouterLink) => {
  // During migration, this can switch between implementations
  const isNextJs = process.env.NEXT_RUNTIME === 'nodejs';

  return isNextJs ? NextLink : ReactRouterLink;
};