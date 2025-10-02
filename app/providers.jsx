'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { HelmetProvider } from 'react-helmet-async';
import ScrollToTop from '@/components/ScrollToTop.jsx';
import { Toaster } from '@/components/ui/toaster.jsx';
import CTAModal from '@/components/CTAModal.jsx';
import StickyCTA from '@/components/StickyCTA.jsx';
import CookieManager from '@/components/CookieManager.jsx';
import ServiceWorkerUpdateNotification from '@/components/ServiceWorkerUpdateNotification.jsx';
import Navbar from '@/components/Navbar.jsx';
import ErrorBoundary from '@/components/ErrorBoundary.jsx';
import Accessibility from '@/components/Accessibility.jsx';
import LocalBusinessSchema from '@/components/LocalBusinessSchema.jsx';
import { WidgetProvider } from '@/utils/widgetManager.jsx';
import { initErrorTracking } from '@/utils/errorTracking.js';
import { initializeAnalytics, trackPageView, trackWebVitals } from '@/utils/analytics';
import { onCLS, onINP, onFCP, onLCP, onTTFB } from 'web-vitals';
import '@/i18n';

function setupGlobalHandlers() {
  const handleError = (event) => {
    const details = {
      message: event.message || 'Unknown error',
      filename: event.filename || 'Unknown file',
      lineno: event.lineno || 0,
      colno: event.colno || 0,
      error: event.error
        ? {
            name: event.error.name,
            message: event.error.message,
            stack: event.error.stack,
          }
        : null,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };
    console.error('Global error:', details);
    if (window.gtag) {
      window.gtag('event', 'exception', {
        description: `${details.message} at ${details.filename}:${details.lineno}`,
        fatal: false,
      });
    }
  };

  const handleRejection = (event) => {
    const details = {
      reason: event.reason
        ? {
            name: event.reason.name,
            message: event.reason.message,
            stack: event.reason.stack,
          }
        : String(event.reason),
      timestamp: new Date().toISOString(),
      url: window.location.href,
    };
    console.error('Unhandled promise rejection:', details);
    if (window.gtag) {
      window.gtag('event', 'exception', {
        description: `Unhandled rejection: ${details.reason}`,
        fatal: false,
      });
    }
  };

  window.addEventListener('error', handleError);
  window.addEventListener('unhandledrejection', handleRejection);

  return () => {
    window.removeEventListener('error', handleError);
    window.removeEventListener('unhandledrejection', handleRejection);
  };
}

export default function Providers({ children }) {
  const pathname = usePathname();

  useEffect(() => {
    document.documentElement.lang = 'pt-BR';
    const removeHandlers = setupGlobalHandlers();
    try {
      initErrorTracking();
    } catch (error) {
      console.warn('Failed to initialize error tracking:', error);
    }
    if (process.env.NEXT_PUBLIC_GA_ID) {
      try {
        initializeAnalytics();
      } catch (error) {
        console.warn('Failed to initialize analytics:', error);
      }
    }
    const sendToAnalytics = (metric) => {
      try {
        trackWebVitals(metric);
      } catch (error) {
        console.warn('Failed to track web vital:', error);
      }
    };
    if (process.env.NODE_ENV === 'production') {
      onCLS(sendToAnalytics);
      onINP(sendToAnalytics);
      onFCP(sendToAnalytics);
      onLCP(sendToAnalytics);
      onTTFB(sendToAnalytics);
    }
    return () => {
      removeHandlers();
    };
  }, []);

  useEffect(() => {
    if (pathname) {
      try {
        trackPageView(pathname);
      } catch (error) {
        console.warn('Failed to track page view:', error);
      }
    }
  }, [pathname]);

  return (
    <HelmetProvider>
      <LocalBusinessSchema />
      <WidgetProvider>
        <div id="app-content">
          <Navbar />
          <ScrollToTop />
          <ErrorBoundary>{children}</ErrorBoundary>
        </div>
        <Toaster />
        <CTAModal />
        <StickyCTA />
        <CookieManager />
        <ServiceWorkerUpdateNotification />
        <Accessibility />
      </WidgetProvider>
    </HelmetProvider>
  );
}
