import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useConfig } from '@/config';
import { Toaster } from '@/components/ui/toaster.jsx';
import CTAModal from '@/components/CTAModal.jsx';
import StickyCTA from '@/components/StickyCTA.jsx';
import CookieManager from '@/components/CookieManager.jsx';
import ServiceWorkerUpdateNotification from '@/components/ServiceWorkerUpdateNotification.jsx';
import Accessibility from '@/components/Accessibility.jsx';

/**
 * Render enabled UI widgets into a dedicated DOM container via a React portal, deferring initial render when lazy loading is enabled.
 *
 * The component creates or reuses a container element with id "deferred-widgets", builds a list of widgets based on feature flags in the application config, and portals those widgets into the container once readiness is reached.
 *
 * @returns {React.ReactPortal|null} A portal rendering the enabled widgets into the "#deferred-widgets" container, or `null` if the container is not yet available, readiness is not reached, or no widgets are enabled.
 */
function DeferredWidgets() {
  const config = useConfig();
  const [container, setContainer] = useState(null);
  const [ready, setReady] = useState(!config.features.lazyWidgets);

  useEffect(() => {
    const existing = document.getElementById('deferred-widgets');
    if (existing) {
      setContainer(existing);
      return;
    }
    const element = document.createElement('div');
    element.setAttribute('id', 'deferred-widgets');
    document.body.appendChild(element);
    setContainer(element);
  }, []);

  useEffect(() => {
    if (!config.features.lazyWidgets) {
      setReady(true);
      return;
    }
    const schedule = typeof window.requestIdleCallback === 'function'
      ? window.requestIdleCallback
      : (cb) => window.setTimeout(cb, 0);
    const cancel = typeof window.cancelIdleCallback === 'function'
      ? window.cancelIdleCallback
      : window.clearTimeout;
    const handle = schedule(() => setReady(true));
    return () => cancel(handle);
  }, [config.features.lazyWidgets]);

  const widgets = useMemo(() => {
    const items = [];
    if (config.widgets.toaster?.enabled) {
      items.push(<Toaster key="toaster" />);
    }
    if (config.widgets.ctaModal?.enabled) {
      items.push(<CTAModal key="cta-modal" />);
    }
    if (config.widgets.stickyCta?.enabled) {
      items.push(<StickyCTA key="sticky-cta" />);
    }
    if (config.widgets.cookieManager?.enabled) {
      items.push(<CookieManager key="cookie-manager" />);
    }
    if (config.widgets.serviceWorkerNotification?.enabled) {
      items.push(<ServiceWorkerUpdateNotification key="sw-update" />);
    }
    if (config.widgets.accessibility?.enabled) {
      items.push(<Accessibility key="accessibility" />);
    }
    return items;
  }, [config]);

  if (!container || !ready || widgets.length === 0) {
    return null;
  }

  return createPortal(widgets, container);
}

export default DeferredWidgets;