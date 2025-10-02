import { env } from '@/utils/env';
// Simple Error Tracking Configuration - Sentry REMOVED due to module conflicts
// This provides basic console error logging without external dependencies

export function initErrorTracking() {
  // Only initialize in production and browser environment
  if (env.MODE !== 'production' || typeof window === 'undefined') {
    return;
  }

  console.log('🔒 Error tracking initialized (console logging only)');

  // Add global error handler for uncaught errors
  if (typeof window !== 'undefined') {
    window.addEventListener('error', (event) => {
      // Filter out third-party errors and known safe errors
      if (shouldIgnoreError(event.error, event.message, event.filename)) {
        return;
      }
      console.error('🚨 Uncaught error:', event.error);
    });

    window.addEventListener('unhandledrejection', (event) => {
      // Filter out third-party promise rejections
      if (shouldIgnoreError(event.reason)) {
        return;
      }
      console.error('🚨 Unhandled promise rejection:', event.reason);
    });
  }
}

/**
 * Filter out known safe/third-party errors
 */
function shouldIgnoreError(error, message, filename) {
  if (!error && !message) return true;

  const errorMsg = (error?.message || message || '').toLowerCase();
  const errorName = (error?.name || '').toLowerCase();
  const file = (filename || '').toLowerCase();

  // Ignore third-party script errors
  if (message === 'Script error.' && !filename) return true;

  // Ignore Google Analytics/GTM errors
  if (file.includes('googletagmanager') || file.includes('google-analytics')) return true;
  if (file.includes('gtag') || file.includes('gtm.js')) return true;

  // Ignore Meta Pixel errors
  if (file.includes('facebook') || file.includes('fbevents')) return true;

  // Ignore InvalidStateError from analytics (Safari)
  if (errorName === 'invalidstateerror') return true;
  if (errorMsg.includes('invalid state')) return true;

  // Ignore network errors from analytics
  if (errorMsg.includes('failed to fetch') && file.includes('analytics')) return true;

  // Ignore ResizeObserver errors (browser optimization, not real errors)
  if (errorMsg.includes('resizeobserver')) return true;

  return false;
}

// Utility function to manually capture errors
export async function captureError(error, context = {}) {
  if (env.MODE === 'production' && typeof window !== 'undefined') {
    console.error('📝 Error captured:', error, context);
  } else {
    console.error('Error captured (dev mode):', error, context);
  }
}

// Utility function to capture user feedback
export async function captureUserFeedback(feedback) {
  if (env.MODE === 'production' && typeof window !== 'undefined') {
    console.info('💬 User feedback:', feedback);
  }
}