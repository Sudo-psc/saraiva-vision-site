// Simple Error Tracking Configuration - Sentry REMOVED due to module conflicts
// This provides basic console error logging without external dependencies

export function initErrorTracking() {
  // Only initialize in production and browser environment
  if (import.meta.env.MODE !== 'production' || typeof window === 'undefined') {
    return;
  }

  console.log('🔒 Error tracking initialized (console logging only)');

  // Add global error handler for uncaught errors
  if (typeof window !== 'undefined') {
    window.addEventListener('error', (event) => {
      console.error('🚨 Uncaught error:', event.error);
    });

    window.addEventListener('unhandledrejection', (event) => {
      console.error('🚨 Unhandled promise rejection:', event.reason);
    });
  }
}

// Utility function to manually capture errors
export async function captureError(error, context = {}) {
  if (import.meta.env.MODE === 'production' && typeof window !== 'undefined') {
    console.error('📝 Error captured:', error, context);
  } else {
    console.error('Error captured (dev mode):', error, context);
  }
}

// Utility function to capture user feedback
export async function captureUserFeedback(feedback) {
  if (import.meta.env.MODE === 'production' && typeof window !== 'undefined') {
    console.info('💬 User feedback:', feedback);
  }
}