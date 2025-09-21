// Error Tracking Configuration
// Initialize Sentry for production error monitoring

// Helper function to safely import Sentry
async function loadSentry() {
  try {
    const module = await import('@sentry/react');
    return module;
  } catch (error) {
    console.warn('Sentry module not available:', error.message);
    return null;
  }
}

export function initErrorTracking() {
  // Only initialize in production and browser environment
  if (process.env.NODE_ENV !== 'production' || typeof window === 'undefined') {
    return;
  }

  // Use setTimeout to defer the import until after the initial bundle load
  setTimeout(async () => {
    try {
      const Sentry = await loadSentry();
      if (!Sentry) return;

      Sentry.init({
        dsn: process.env.REACT_APP_SENTRY_DSN || process.env.VITE_SENTRY_DSN,
        tracesSampleRate: 1.0,
        environment: process.env.VERCEL_ENV || 'production',
        release: process.env.VERCEL_GIT_COMMIT_SHA || '1.0.0',
        // Capture console errors and unhandled promise rejections
        beforeSend: (event) => {
          // Filter out development errors
          if (event.exception) {
            console.error('Error captured by Sentry:', event.exception);
          }
          return event;
        },
      });

      console.log('✅ Sentry error tracking initialized');
    } catch (error) {
      console.warn('Failed to initialize error tracking:', error);
    }
  }, 100);
}

// Utility function to manually capture errors
export async function captureError(error, context = {}) {
  if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined') {
    try {
      const Sentry = await loadSentry();
      if (Sentry) {
        Sentry.captureException(error, {
          tags: {
            component: context.component || 'unknown',
            action: context.action || 'unknown',
          },
          extra: context,
        });
      }
    } catch (e) {
      console.error('Failed to capture error:', e);
    }
  } else {
    console.error('Error captured (dev mode):', error, context);
  }
}

// Utility function to capture user feedback
export async function captureUserFeedback(feedback) {
  if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined') {
    try {
      const Sentry = await loadSentry();
      if (Sentry) {
        Sentry.captureMessage(`User Feedback: ${feedback}`, 'info');
      }
    } catch (e) {
      console.warn('Failed to capture feedback:', e);
    }
  }
}