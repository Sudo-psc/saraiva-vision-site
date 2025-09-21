/**
 * Sistema de Otimização de Imagens para Saraiva Vision
 * Implementa lazy loading, preload inteligente e otimizações de performance
 */

// Configuração de imagens críticas da clínica
const CRITICAL_IMAGES = {
  logo: '/img/logo-saraiva-vision.png',
  drPhilipe: '/img/drphilipe_perfil.png',
  heroBackground: '/img/hero-clinica.jpg'
};

// Imagens que devem ser precarregadas (above the fold)
const PRELOAD_IMAGES = [
  CRITICAL_IMAGES.logo,
  CRITICAL_IMAGES.heroBackground
];

// Lazy loading com Intersection Observer
class ImageLazyLoader {
  constructor(options = {}) {
    this.options = {
      rootMargin: '50px 0px', // Carrega 50px antes de entrar na viewport
      threshold: 0.01,
      ...options
    };
    
    this.imageObserver = null;
    this.init();
  }

  init() {
    if ('IntersectionObserver' in window) {
      this.imageObserver = new IntersectionObserver(
        this.handleIntersection.bind(this),
        this.options
      );
    }
  }

  handleIntersection(entries, observer) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        this.loadImage(img);
        observer.unobserve(img);
      }
    });
  }

  loadImage(img) {
    // Carrega a imagem real
    const src = img.dataset.src;
    const srcset = img.dataset.srcset;
    
    if (!src) return;

    // Cria uma nova imagem para precarregar
    const tempImg = new Image();
    
    tempImg.onload = () => {
      // Aplica fade-in suave
      img.style.opacity = '0';
      img.src = src;
      
      if (srcset) {
        img.srcset = srcset;
      }
      
      // Remove blur placeholder
      img.classList.remove('blur-load');
      
      // Fade in
      requestAnimationFrame(() => {
        img.style.transition = 'opacity 0.3s ease-in-out';
        img.style.opacity = '1';
      });
      
      // Dispara evento customizado
      img.dispatchEvent(new CustomEvent('lazyloaded'));
    };
    
    tempImg.onerror = () => {
      console.error('Erro ao carregar imagem:', src);
      // Usa imagem fallback
      img.src = '/img/placeholder-medical.png';
    };
    
    tempImg.src = src;
  }

  observe(images) {
    if (!this.imageObserver) {
      // Fallback para navegadores sem suporte
      images.forEach(img => this.loadImage(img));
      return;
    }
    
    images.forEach(img => {
      if (img.dataset.src) {
        // Adiciona placeholder blur enquanto carrega
        img.classList.add('blur-load');
        this.imageObserver.observe(img);
      }
    });
  }

  disconnect() {
    if (this.imageObserver) {
      this.imageObserver.disconnect();
    }
  }
}

// Preload de imagens críticas
export function preloadCriticalImages() {
  PRELOAD_IMAGES.forEach(src => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    
    // Adiciona tipo se for webp
    if (src.endsWith('.webp')) {
      link.type = 'image/webp';
    }
    
    document.head.appendChild(link);
  });
}

// Progressive Image Loading
export class ProgressiveImage {
  constructor(smallSrc, largeSrc) {
    this.smallSrc = smallSrc;
    this.largeSrc = largeSrc;
    this.element = null;
  }

  load(imgElement) {
    this.element = imgElement;
    
    // Carrega imagem pequena primeiro (blur)
    const smallImg = new Image();
    smallImg.src = this.smallSrc;
    
    smallImg.onload = () => {
      this.element.src = this.smallSrc;
      this.element.classList.add('progressive-image-blur');
      
      // Carrega imagem grande
      const largeImg = new Image();
      largeImg.src = this.largeSrc;
      
      largeImg.onload = () => {
        this.element.src = this.largeSrc;
        this.element.classList.remove('progressive-image-blur');
        this.element.classList.add('progressive-image-loaded');
      };
    };
  }
}

// Otimização de imagens do carousel de serviços
export function optimizeServiceImages() {
  const serviceImages = document.querySelectorAll('.service-card img');
  
  serviceImages.forEach(img => {
    // Adiciona loading="lazy" nativo
    img.loading = 'lazy';
    
    // Define dimensões para evitar layout shift
    if (!img.width && img.dataset.width) {
      img.width = img.dataset.width;
    }
    if (!img.height && img.dataset.height) {
      img.height = img.dataset.height;
    }
  });
}

// Detecta formato de imagem suportado
export function getSupportedImageFormat() {
  const webpSupport = document.createElement('canvas').toDataURL('image/webp').indexOf('data:image/webp') === 0;
  const avifSupport = document.createElement('canvas').toDataURL('image/avif').indexOf('data:image/avif') === 0;
  
  if (avifSupport) return 'avif';
  if (webpSupport) return 'webp';
  return 'jpg';
}

// Gera URL otimizada para imagem
export function getOptimizedImageUrl(baseUrl, options = {}) {
  const {
    width,
    height,
    quality = 85,
    format = getSupportedImageFormat()
  } = options;
  
  // Se for URL externa (CDN), adiciona parâmetros de otimização
  if (baseUrl.includes('storage.googleapis.com') || baseUrl.includes('cloudinary')) {
    let optimizedUrl = baseUrl;
    
    if (width) optimizedUrl += `?w=${width}`;
    if (height) optimizedUrl += `&h=${height}`;
    if (quality) optimizedUrl += `&q=${quality}`;
    if (format) optimizedUrl += `&fm=${format}`;
    
    return optimizedUrl;
  }
  
  // Para imagens locais, retorna o path com formato otimizado
  return baseUrl.replace(/\.(jpg|jpeg|png)$/i, `.${format}`);
}

// CSS para blur loading
export const imageOptimizationStyles = `
  .blur-load {
    filter: blur(10px);
    transition: filter 0.3s;
  }
  
  .progressive-image-blur {
    filter: blur(20px);
    transition: filter 0.5s;
  }
  
  .progressive-image-loaded {
    filter: blur(0);
  }
  
  /* Placeholder para imagens médicas */
  .medical-image-placeholder {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    position: relative;
  }
  
  .medical-image-placeholder::before {
    content: '🏥';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 3rem;
    opacity: 0.3;
  }
`;

// Inicializa o sistema de otimização
let lazyLoader = null;

export function initImageOptimization() {
  // Injeta estilos
  const style = document.createElement('style');
  style.textContent = imageOptimizationStyles;
  document.head.appendChild(style);
  
  // Precarrega imagens críticas
  preloadCriticalImages();
  
  // Inicializa lazy loading
  lazyLoader = new ImageLazyLoader();
  
  // Observa todas as imagens com data-src
  const lazyImages = document.querySelectorAll('img[data-src]');
  lazyLoader.observe(lazyImages);
  
  // Otimiza imagens de serviços
  optimizeServiceImages();
  
  // Monitora novas imagens adicionadas dinamicamente
  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node.nodeName === 'IMG' && node.dataset.src) {
          lazyLoader.observe([node]);
        }
      });
    });
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  console.log('Sistema de otimização de imagens iniciado - Clínica Saraiva Vision');
}

// Cleanup
export function destroyImageOptimization() {
  if (lazyLoader) {
    lazyLoader.disconnect();
    lazyLoader = null;
  }
}

// Auto-inicializa quando o DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initImageOptimization);
} else {
  initImageOptimization();
}

export default {
  initImageOptimization,
  destroyImageOptimization,
  getOptimizedImageUrl,
  getSupportedImageFormat,
  ProgressiveImage
};