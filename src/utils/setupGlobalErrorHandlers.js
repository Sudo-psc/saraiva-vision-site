// Lightweight global handlers to reduce noise from browser extensions
// and ad blockers while preserving real app errors for debugging.
export function setupGlobalErrorHandlers(options = {}) {
  const { suppressExtensionNoise = true } = options;

  const isExtensionNoise = (message = '', source = '') => {
    if (!suppressExtensionNoise) return false;
    const msg = String(message || '');
    const src = String(source || '');
    return (
      // Chrome extension messaging noise
      msg.includes('runtime.lastError') ||
      msg.includes('A listener indicated an asynchronous response') ||
      msg.includes('Could not establish') ||
      // Ad blockers blocking trackers/telemetry
      msg.includes('ERR_BLOCKED_BY_CLIENT') ||
      // Any error originating from an extension URL
      src.startsWith('chrome-extension://')
    );
  };

  // Suppress known noisy errors from extensions/ad-blockers
  window.addEventListener('error', (event) => {
    try {
      if (isExtensionNoise(event?.message, event?.filename)) {
        event.preventDefault?.();
      }
    } catch (_) {
      // no-op
    }
  });

  // Prevent Promise rejections from extensions from bubbling
  window.addEventListener('unhandledrejection', (event) => {
    try {
      const reason = event?.reason;
      const message = reason?.message || String(reason || '');
      if (isExtensionNoise(message)) {
        event.preventDefault?.();
      }
    } catch (_) {
      // no-op
    }
  });
}

