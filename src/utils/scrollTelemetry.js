/**
 * Telemetria de Scroll - Monitor de preventDefault
 * Monitora quando preventDefault é chamado em eventos de scroll
 */

class ScrollTelemetry {
  constructor() {
    this.preventDefaultCalls = 0;
    this.wheelBlocked = 0;
    this.touchBlocked = 0;
    this.scrollBlocked = 0;
    this.initialized = false;
    this.startTime = Date.now();
    this.debug = false;
  }

  init() {
    if (this.initialized) return;
    
    // Intercepta preventDefault para eventos relacionados a scroll
    this.patchPreventDefault();
    
    // Adiciona listener para detectar passive violations
    this.detectPassiveViolations();
    
    this.initialized = true;
    
    if (this.debug) {
      console.log('🔍 ScrollTelemetry inicializada');
    }
  }

  patchPreventDefault() {
    const originalPreventDefault = Event.prototype.preventDefault;
    const telemetry = this;
    
    Event.prototype.preventDefault = function() {
      // Rastreia preventDefault apenas para eventos de scroll
      if (this.type === 'wheel' || 
          this.type === 'mousewheel' || 
          this.type === 'touchmove' || 
          this.type === 'touchstart' || 
          this.type === 'scroll') {
        
        telemetry.preventDefaultCalls++;
        
        switch(this.type) {
          case 'wheel':
          case 'mousewheel':
            telemetry.wheelBlocked++;
            break;
          case 'touchmove':
          case 'touchstart':
            telemetry.touchBlocked++;
            break;
          case 'scroll':
            telemetry.scrollBlocked++;
            break;
        }
        
        if (telemetry.debug) {
          console.warn(`⚠️ preventDefault() chamado em ${this.type}`, {
            target: this.target?.tagName || 'unknown',
            className: this.target?.className || '',
            currentTarget: this.currentTarget?.tagName || 'unknown'
          });
        }
      }
      
      return originalPreventDefault.call(this);
    };
  }

  detectPassiveViolations() {
    // Detecta violations de passive listener
    const originalAddEventListener = EventTarget.prototype.addEventListener;
    const telemetry = this;
    
    EventTarget.prototype.addEventListener = function(type, listener, options) {
      if (['wheel', 'mousewheel', 'touchmove', 'touchstart'].includes(type)) {
        const isPassive = typeof options === 'object' ? options.passive : false;
        
        if (!isPassive && telemetry.debug) {
          console.warn(`⚠️ Non-passive listener registered for ${type}`, {
            element: this.tagName || this.constructor.name,
            options
          });
        }
      }
      
      return originalAddEventListener.call(this, type, listener, options);
    };
  }

  getMetrics() {
    const uptime = Date.now() - this.startTime;
    
    return {
      preventDefaultCalls: this.preventDefaultCalls,
      wheelBlocked: this.wheelBlocked,
      touchBlocked: this.touchBlocked,
      scrollBlocked: this.scrollBlocked,
      uptimeMs: uptime,
      avgPreventDefaultPerMinute: (this.preventDefaultCalls / (uptime / 60000)).toFixed(2)
    };
  }

  shouldAlert() {
    // Alerta se há muitos preventDefault calls
    const metrics = this.getMetrics();
    return metrics.avgPreventDefaultPerMinute > 10; // Threshold configurável
  }

  reset() {
    this.preventDefaultCalls = 0;
    this.wheelBlocked = 0;
    this.touchBlocked = 0;
    this.scrollBlocked = 0;
    this.startTime = Date.now();
  }

  enableDebug() {
    this.debug = true;
  }

  disableDebug() {
    this.debug = false;
  }
}

// Instância singleton
const scrollTelemetry = new ScrollTelemetry();

// Auto-inicializa em desenvolvimento
if (import.meta.env?.DEV) {
  scrollTelemetry.enableDebug();
  scrollTelemetry.init();
}

export default scrollTelemetry;

// Utilidades de conveniência
export const getScrollMetrics = () => scrollTelemetry.getMetrics();
export const resetScrollTelemetry = () => scrollTelemetry.reset();
export const initScrollTelemetry = () => scrollTelemetry.init();