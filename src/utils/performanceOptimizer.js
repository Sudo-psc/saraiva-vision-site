// Utilitários para otimização de performance e Core Web Vitals

// Lazy loading de imagens com intersection observer
export const lazyLoadImages = () => {
  if (!('IntersectionObserver' in window)) {
    // Fallback para navegadores sem suporte
    const images = document.querySelectorAll('img[data-src]');
    images.forEach(img => {
      img.src = img.dataset.src;
      img.removeAttribute('data-src');
    });
    return;
  }
  
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
        img.classList.remove('lazy');
        observer.unobserve(img);
      }
    });
  }, {
    rootMargin: '50px 0px',
    threshold: 0.01
  });
  
  const images = document.querySelectorAll('img[data-src]');
  images.forEach(img => imageObserver.observe(img));
};

// Preload de recursos críticos
export const preloadCriticalResources = () => {
  const criticalResources = [
    'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2',
    '/images/hero-bg.webp',
    '/images/logo.svg'
  ];
  
  criticalResources.forEach(resource => {
    const link = document.createElement('link');
    link.rel = 'preload';
    
    if (resource.includes('.woff')) {
      link.as = 'font';
      link.type = 'font/woff2';
      link.crossOrigin = 'anonymous';
    } else if (resource.includes('.webp') || resource.includes('.jpg')) {
      link.as = 'image';
    } else if (resource.includes('.css')) {
      link.as = 'style';
    }
    
    link.href = resource;
    document.head.appendChild(link);
  });
};

// Otimizador de layout shift (CLS)
export const preventLayoutShift = () => {
  // Definir dimensões para containers de imagens
  const images = document.querySelectorAll('img:not([width]):not([height])');
  images.forEach(img => {
    // Adicionar dimensões padrão se não definidas
    if (!img.width) img.width = img.naturalWidth || 400;
    if (!img.height) img.height = img.naturalHeight || 300;
  });
  
  // Reservar espaço para fontes web
  if (!document.querySelector('style[data-font-fallback]')) {
    const style = document.createElement('style');
    style.setAttribute('data-font-fallback', 'true');
    style.textContent = `
      @font-face {
        font-family: 'Inter';
        font-display: swap;
        src: local('Arial'), local('Helvetica');
      }
    `;
    document.head.appendChild(style);
  }
};

// Monitor de performance Web Vitals
export const monitorWebVitals = () => {
  if (typeof window === 'undefined') return;
  
  // Função para enviar métricas (adaptar conforme analytics usado)
  const sendToAnalytics = (metric) => {
    // Google Analytics 4
    if (window.gtag) {
      window.gtag('event', metric.name, {
        event_category: 'Web Vitals',
        event_label: metric.id,
        value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
        non_interaction: true
      });
    }
    
    // Console para desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Web Vital:', metric);
    }
  };
  
  // Monitorar FCP (First Contentful Paint)
  const fcpObserver = new PerformanceObserver((entryList) => {
    for (const entry of entryList.getEntries()) {
      if (entry.name === 'first-contentful-paint') {
        sendToAnalytics({
          name: 'FCP',
          value: entry.startTime,
          id: generateUniqueId()
        });
      }
    }
  });
  
  try {
    fcpObserver.observe({ entryTypes: ['paint'] });
  } catch (e) {
    // Silenciosamente falha se não suportado
  }
  
  // Monitorar LCP (Largest Contentful Paint)
  const lcpObserver = new PerformanceObserver((entryList) => {
    const entries = entryList.getEntries();
    const lastEntry = entries[entries.length - 1];
    
    sendToAnalytics({
      name: 'LCP',
      value: lastEntry.startTime,
      id: generateUniqueId()
    });
  });
  
  try {
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
  } catch (e) {
    // Silenciosamente falha se não suportado
  }
  
  // Monitorar CLS (Cumulative Layout Shift)
  let clsValue = 0;
  let clsEntries = [];
  
  const clsObserver = new PerformanceObserver((entryList) => {
    for (const entry of entryList.getEntries()) {
      if (!entry.hadRecentInput) {
        clsValue += entry.value;
        clsEntries.push(entry);
      }
    }
  });
  
  try {
    clsObserver.observe({ entryTypes: ['layout-shift'] });
  } catch (e) {
    // Silenciosamente falha se não suportado
  }
  
  // Enviar CLS quando a página estiver sendo descarregada
  addEventListener('beforeunload', () => {
    sendToAnalytics({
      name: 'CLS',
      value: clsValue,
      id: generateUniqueId()
    });
  });
};

// Otimizador de recursos críticos
export const optimizeCriticalRenderingPath = () => {
  // Inlinear CSS crítico
  const criticalCSS = `
    body { 
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      line-height: 1.6;
      margin: 0;
    }
    .hero-section {
      min-height: 100vh;
      display: flex;
      align-items: center;
    }
    .nav-bar {
      position: fixed;
      top: 0;
      width: 100%;
      z-index: 50;
    }
  `;
  
  if (!document.querySelector('style[data-critical]')) {
    const style = document.createElement('style');
    style.setAttribute('data-critical', 'true');
    style.textContent = criticalCSS;
    document.head.appendChild(style);
  }
};

// Utilidade para gerar ID único
const generateUniqueId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Debounce para otimizar eventos de scroll/resize
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Inicializar todas as otimizações
export const initPerformanceOptimizations = () => {
  // Executar quando DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      lazyLoadImages();
      preventLayoutShift();
      monitorWebVitals();
      optimizeCriticalRenderingPath();
    });
  } else {
    lazyLoadImages();
    preventLayoutShift();
    monitorWebVitals();
    optimizeCriticalRenderingPath();
  }
  
  // Preload recursos críticos imediatamente
  preloadCriticalResources();
};