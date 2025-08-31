import { useEffect } from 'react';

// Hook para gerenciar preload de recursos de forma inteligente
export const useResourcePreload = (resources, condition = true) => {
  useEffect(() => {
    if (!condition || typeof window === 'undefined') return;
    
    const preloadedLinks = [];
    
    resources.forEach(resource => {
      // Verificar se o recurso já foi precarregado
      const existing = document.querySelector(`link[href="${resource.href}"]`);
      if (existing) return;
      
      const link = document.createElement('link');
      link.rel = resource.as === 'image' ? 'preload' : 'modulepreload';
      link.as = resource.as;
      link.href = resource.href;
      
      if (resource.media) link.media = resource.media;
      if (resource.fetchpriority) link.fetchPriority = resource.fetchpriority;
      if (resource.crossorigin) link.crossOrigin = resource.crossorigin;
      
      document.head.appendChild(link);
      preloadedLinks.push(link);
    });
    
    // Cleanup function
    return () => {
      preloadedLinks.forEach(link => {
        if (link.parentNode) {
          link.parentNode.removeChild(link);
        }
      });
    };
  }, [resources, condition]);
};

// Hook específico para preload de imagens críticas
export const useCriticalImagePreload = (imageUrl, condition = true) => {
  useResourcePreload([{
    href: imageUrl,
    as: 'image',
    fetchpriority: 'high'
  }], condition);
};

// Hook para preload de imagens do hero apenas na homepage
export const useHeroImagePreload = () => {
  const isHomePage = typeof window !== 'undefined' && 
    (window.location.pathname === '/' || window.location.pathname === '/index.html');
  
  useCriticalImagePreload(
    '/img/hero.png',
    isHomePage
  );
};