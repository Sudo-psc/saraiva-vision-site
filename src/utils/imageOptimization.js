/**
 * Enhanced Image Optimization System for Saraiva Vision Medical Platform
 * CFM/LGPD compliant image handling with healthcare-specific optimizations
 * Implements advanced lazy loading, intelligent preloading, and performance optimizations
 */

// Enhanced configuration for medical images
const MEDICAL_IMAGE_CONFIG = {
  // Critical clinic images for immediate loading
  critical: {
    logo: '/img/logo_prata.webp',
    drPhilipe: '/img/drphilipe_perfil-1280w.webp',
    heroBackground: '/img/hero-1920w.webp',
    clinicFacade: '/img/clinic_facade.webp'
  },

  // Quality settings for medical compliance
  quality: {
    // Medical diagnostic images require highest quality
    diagnostic: 95,
    // Professional photos and clinic images
    professional: 90,
    // General content
    content: 85,
    // Thumbnails
    thumbnail: 75
  },

  // Responsive breakpoints optimized for medical content
  breakpoints: {
    mobile: 320,
    tablet: 768,
    desktop: 1024,
    large: 1920,
    ultra: 2560
  },

  // Format priorities for medical compliance
  formats: {
    modern: ['avif', 'webp'],
    fallback: ['jpg', 'png'],
    medical: ['webp', 'jpg'] // Medical images prioritize compatibility
  }
};

// Critical images that must be preloaded (above the fold)
const PRELOAD_IMAGES = [
  MEDICAL_IMAGE_CONFIG.critical.heroBackground,
  MEDICAL_IMAGE_CONFIG.critical.drPhilipe,
  MEDICAL_IMAGE_CONFIG.critical.clinicFacade,
  MEDICAL_IMAGE_CONFIG.critical.logo
];

// Enhanced lazy loading with medical compliance and retry logic
class ImageLazyLoader {
  constructor(options = {}) {
    this.options = {
      rootMargin: '100px 0px', // Increased margin for medical content
      threshold: 0.01,
      retryAttempts: 3,
      retryDelay: 1000,
      preserveMedicalQuality: true,
      enableWebP: true,
      enableAVIF: true,
      ...options
    };

    this.imageObserver = null;
    this.loadedImages = new Set();
    this.retryMap = new Map();
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
      img.src = '/img/placeholder.svg';
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

// Advanced medical image validation
export function validateMedicalImage(file) {
  return new Promise((resolve) => {
    const result = {
      valid: true,
      errors: [],
      warnings: [],
      recommendations: []
    };

    // Check file size (max 10MB for medical images)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      result.valid = false;
      result.errors.push('Image size exceeds 10MB limit for medical content');
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      result.valid = false;
      result.errors.push(`Invalid file type: ${file.type}. Allowed types: ${allowedTypes.join(', ')}`);
    }

    // Check dimensions for medical clarity
    const img = new Image();
    img.onload = () => {
      const minDimensions = { width: 800, height: 600 };

      if (img.width < minDimensions.width || img.height < minDimensions.height) {
        result.warnings.push(
          `Image dimensions (${img.width}x${img.height}) are below recommended minimum (${minDimensions.width}x${minDimensions.height}) for medical clarity`
        );
      }

      // Check aspect ratio
      const aspectRatio = img.width / img.height;
      if (aspectRatio < 0.5 || aspectRatio > 2) {
        result.warnings.push(
          'Unusual aspect ratio may affect medical image presentation'
        );
      }

      // Format recommendations
      if (file.type === 'image/png' && file.size > 1024 * 1024) {
        result.recommendations.push(
          'Consider using WebP or JPEG format for better compression of large images'
        );
      }

      resolve(result);
    };

    img.onerror = () => {
      result.valid = false;
      result.errors.push('Failed to load image for validation');
      resolve(result);
    };

    img.src = URL.createObjectURL(file);
  });
}

// Get optimal image format for browser support
export function getOptimalFormat() {
  if (typeof window === 'undefined') {
    return 'fallback';
  }

  try {
    const canvas = document.createElement('canvas');

    // Check AVIF support first (best compression)
    const avifSupport = canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0;
    if (avifSupport) {
      return 'avif';
    }

    // Check WebP support (good compression)
    const webpSupport = canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    if (webpSupport) {
      return 'webp';
    }

    return 'fallback';
  } catch {
    return 'fallback';
  }
}

// Calculate optimal dimensions for different device types
export function calculateOptimalDimensions(originalWidth, originalHeight, deviceType = 'desktop') {
  const breakpoints = {
    mobile: 375,
    tablet: 768,
    desktop: 1024,
    large: 1920
  };

  const maxWidth = breakpoints[deviceType] || breakpoints.desktop;

  // Don't upscale small images
  if (originalWidth <= maxWidth) {
    return {
      width: originalWidth,
      height: originalHeight,
      resized: false
    };
  }

  // Calculate new dimensions maintaining aspect ratio
  const aspectRatio = originalWidth / originalHeight;
  const newWidth = Math.min(originalWidth, maxWidth);
  const newHeight = Math.round(newWidth / aspectRatio);

  return {
    width: newWidth,
    height: newHeight,
    resized: true
  };
}

// Generate progressive loading strategy
export function generateLoadingStrategy(src, options = {}) {
  const { isSlowConnection = false, saveData = false } = options;

  // Base strategy with multiple quality levels
  const strategy = {
    type: 'progressive',
    steps: [
      { quality: 20, blur: 30 },
      { quality: 40, blur: 15 },
      { quality: 70, blur: 5 },
      { quality: 95, blur: 0 }
    ],
    fallback: { quality: 75 }
  };

  // Adapt to slow connections
  if (isSlowConnection) {
    strategy.steps = strategy.steps.slice(0, 3);
    strategy.fallback.quality = 60;
  }

  // Adapt to save data mode
  if (saveData) {
    strategy.steps = strategy.steps.slice(0, 2);
    strategy.fallback.quality = 50;
  }

  return strategy;
}

// Generate placeholder data URI
export function generatePlaceholder(width = 1, height = 1, color = '#f3f4f6') {
  if (typeof document === 'undefined') {
    return '';
  }

  try {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, width, height);

    return canvas.toDataURL('image/webp', 0.1);
  } catch {
    return '';
  }
}

// Validate image accessibility
export function validateImageAccessibility(img) {
  const report = {
    score: 100,
    issues: [],
    recommendations: []
  };

  // Check alt text
  if (!img.alt || img.alt.trim() === '') {
    report.score -= 50;
    report.issues.push({
      type: 'error',
      message: 'Missing alt text - required for accessibility'
    });
  }

  // Check image size
  if (img.naturalWidth < 200 || img.naturalHeight < 200) {
    report.score -= 20;
    report.issues.push({
      type: 'warning',
      message: 'Image is too small for effective medical visualization'
    });
  }

  // Check loading attribute for performance
  if (!img.loading) {
    report.recommendations.push('Consider adding loading="lazy" for better performance');
  }

  // Check for responsive images
  if (!img.srcset && !img.closest('picture')) {
    report.recommendations.push('Consider using srcset or picture elements for responsive images');
  }

  return report;
}

// Performance monitoring for medical images
export class MedicalImagePerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.startTime = performance.now();
  }

  trackImageLoad(img, name) {
    const loadStart = performance.now();

    const onLoad = () => {
      const loadTime = performance.now() - loadStart;
      this.metrics.set(name, {
        loadTime: Math.round(loadTime),
        size: img.naturalWidth * img.naturalHeight,
        type: this.getImageType(img.src),
        responsive: !!img.srcset || !!img.closest('picture'),
        lazy: img.loading === 'lazy'
      });

      img.removeEventListener('load', onLoad);
      img.removeEventListener('error', onError);
    };

    const onError = () => {
      this.metrics.set(name, {
        loadTime: performance.now() - loadStart,
        error: true,
        type: 'error'
      });

      img.removeEventListener('load', onLoad);
      img.removeEventListener('error', onError);
    };

    img.addEventListener('load', onLoad);
    img.addEventListener('error', onError);
  }

  getImageType(src) {
    if (src.includes('.webp')) return 'webp';
    if (src.includes('.avif')) return 'avif';
    if (src.includes('.jpg') || src.includes('.jpeg')) return 'jpg';
    if (src.includes('.png')) return 'png';
    return 'unknown';
  }

  getReport() {
    const metrics = Array.from(this.metrics.values());

    if (metrics.length === 0) {
      return { status: 'no_data', recommendations: ['No images loaded yet'] };
    }

    const successful = metrics.filter(m => !m.error);
    const failed = metrics.filter(m => m.error);

    const avgLoadTime = successful.length > 0
      ? successful.reduce((sum, m) => sum + m.loadTime, 0) / successful.length
      : 0;

    const modernFormats = successful.filter(m => m.type === 'webp' || m.type === 'avif');
    const responsiveImages = successful.filter(m => m.responsive);
    const lazyImages = successful.filter(m => m.lazy);

    const recommendations = [];

    if (avgLoadTime > 2000) {
      recommendations.push({
        type: 'performance',
        message: 'Consider optimizing images or implementing better compression',
        priority: 'high'
      });
    }

    if (modernFormats.length / successful.length < 0.8) {
      recommendations.push({
        type: 'format',
        message: 'Convert more images to WebP or AVIF format for better compression',
        priority: 'medium'
      });
    }

    if (responsiveImages.length / successful.length < 0.7) {
      recommendations.push({
        type: 'responsive',
        message: 'Implement responsive images with srcset or picture elements',
        priority: 'medium'
      });
    }

    return {
      total: metrics.length,
      successful: successful.length,
      failed: failed.length,
      averageLoadTime: Math.round(avgLoadTime),
      modernFormatUsage: Math.round((modernFormats.length / successful.length) * 100),
      responsiveImageUsage: Math.round((responsiveImages.length / successful.length) * 100),
      lazyLoadingUsage: Math.round((lazyImages.length / successful.length) * 100),
      performance: avgLoadTime < 1000 ? 'excellent' :
                   avgLoadTime < 2000 ? 'good' :
                   avgLoadTime < 3000 ? 'fair' : 'poor',
      recommendations
    };
  }
}

// Global performance monitor instance
export const medicalImageMonitor = new MedicalImagePerformanceMonitor();

// Generate responsive image sources for medical content
export function generateResponsiveSources(basePath, options = {}) {
  const {
    breakpoints = MEDICAL_IMAGE_CONFIG.breakpoints,
    quality = MEDICAL_IMAGE_CONFIG.quality.content,
    preserveMedicalQuality = false
  } = options;

  const medicalQuality = preserveMedicalQuality ?
    MEDICAL_IMAGE_CONFIG.quality.diagnostic : quality;

  const sources = {};

  // Generate WebP sources
  sources.webp = {
    srcSet: Object.entries(breakpoints)
      .map(([name, width]) => `${basePath}-${width}w.webp ${width}w`)
      .join(', '),
    sizes: generateSizesString(breakpoints),
    type: 'image/webp'
  };

  // Generate AVIF sources
  sources.avif = {
    srcSet: Object.entries(breakpoints)
      .map(([name, width]) => `${basePath}-${width}w.avif ${width}w`)
      .join(', '),
    sizes: generateSizesString(breakpoints),
    type: 'image/avif'
  };

  // Generate fallback JPG sources
  sources.fallback = {
    srcSet: Object.entries(breakpoints)
      .map(([name, width]) => `${basePath}-${width}w.jpg ${width}w`)
      .join(', '),
    sizes: generateSizesString(breakpoints)
  };

  return sources;
}

// Generate sizes string for responsive images
function generateSizesString(breakpoints) {
  const sizes = [];

  if (breakpoints.mobile) {
    sizes.push(`(max-width: ${breakpoints.tablet - 1}px) ${breakpoints.mobile}px`);
  }

  if (breakpoints.tablet) {
    sizes.push(`(max-width: ${breakpoints.desktop - 1}px) ${breakpoints.tablet}px`);
  }

  if (breakpoints.desktop) {
    sizes.push(`(max-width: ${breakpoints.large - 1}px) ${breakpoints.desktop}px`);
  }

  sizes.push(`${breakpoints.large}px`);

  return sizes.join(', ');
}

// Enhanced preload for critical medical images
export function preloadCriticalMedicalImages() {
  PRELOAD_IMAGES.forEach(src => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;

    // Add type based on format
    if (src.endsWith('.webp')) {
      link.type = 'image/webp';
    } else if (src.endsWith('.avif')) {
      link.type = 'image/avif';
    }

    // Add high priority for medical content
    link.setAttribute('importance', 'high');

    document.head.appendChild(link);
  });
}

export default {
  initImageOptimization,
  destroyImageOptimization,
  getOptimizedImageUrl,
  getSupportedImageFormat,
  ProgressiveImage,
  validateMedicalImage,
  MedicalImagePerformanceMonitor,
  medicalImageMonitor,
  generateResponsiveSources,
  preloadCriticalMedicalImages,
  MEDICAL_IMAGE_CONFIG
};