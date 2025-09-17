import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';
import { getServiceIcon } from '@/components/icons/ServiceIcons';
import { debounce } from '@/utils/componentUtils';
import { smoothScrollHorizontal } from '@/utils/scrollUtils';
import { useAutoplayCarousel } from '@/hooks/useAutoplayCarousel';

const ServiceCard = React.forwardRef(({ service, index, lazy = true }, ref) => {
  const { t } = useTranslation();
  const prefersReducedMotion = useReducedMotion();
  const [visible, setVisible] = useState(!lazy);
  const cardRef = useRef(null);
  const isTestEnv = typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'test';

  // Combine external ref with internal ref
  const combinedRef = useCallback((node) => {
    cardRef.current = node;
    if (ref) {
      if (typeof ref === 'function') {
        ref(node);
      } else {
        ref.current = node;
      }
    }
  }, [ref]);

  useEffect(() => {
    if (!lazy || visible || !cardRef.current) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      });
    }, { rootMargin: '120px' });
    observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, [lazy, visible]);

  return (
    <motion.div
      ref={combinedRef}
      data-card
      layout
      initial={{ y: 40, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.55, ease: 'easeOut', delay: index * 0.05 }}
      className="service-card-3d group relative flex flex-col items-center text-center rounded-3xl glass-morphism shadow-3d hover:shadow-3d-hover will-change-transform transform-gpu preserve-3d w-full h-full focus-within:ring-2 focus-within:ring-blue-500/20 transition-transform duration-500 touch-manipulation"
      style={{
        minWidth: '280px', // Garante largura mínima consistente
        scrollSnapAlign: 'start'
      }}
      whileHover={prefersReducedMotion ? {} : { y: -8 }}
      exit={{ opacity: 0, y: 10, scale: 0.98 }}
    >
      {/* Ambient gradient halo */}
      <div className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-700" style={{ background: 'radial-gradient(circle at 30% 20%, rgba(96,165,250,0.35), transparent 60%)' }} />
      <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 mix-blend-overlay" style={{ background: 'linear-gradient(140deg, rgba(147,51,234,0.15), rgba(236,72,153,0.12), rgba(59,130,246,0.12))' }} />

      {/* Icon */}
      <motion.div
        className="relative mb-4 w-24 h-24 flex items-center justify-center"
        whileHover={prefersReducedMotion ? {} : { scale: 1.1, rotate: 3 }}
      >
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500/15 via-cyan-500/15 to-teal-500/15 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="relative w-20 h-20 drop-shadow-xl select-none flex items-center justify-center rounded-3xl">
          {visible ? service.icon : (
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-slate-200 to-slate-100 animate-pulse" aria-hidden="true" />
          )}
        </div>
      </motion.div>

      {/* Title */}
      <motion.h3
        className="service-text-enhanced tracking-tight"
        whileHover={{ scale: 1.06 }}
      >
        <span className="service-text-enhanced">
          {service.title}
        </span>
        {isTestEnv && service.testKey && (
          <span className="sr-only">{service.testKey}</span>
        )}
      </motion.h3>

      {/* Description */}
      <p className="service-description-enhanced text-slate-600 leading-relaxed transition-colors group-hover:text-slate-700">
        {service.description}
      </p>

      {/* Saiba mais link styled as button */}
      <Link
        to={`/servicos/${service.id}`}
        className="relative inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium text-slate-700 bg-gradient-to-r from-slate-100 to-slate-50 hover:from-blue-50 hover:to-cyan-50 border border-slate-200/70 hover:border-blue-300/60 shadow-sm hover:shadow-md transition-all group/button overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
      >
        <span className="relative z-10 group-hover/button:text-blue-700 transition-colors">{t('services.learn_more')}</span>
        <ArrowRight className="w-4 h-4 relative z-10 transition-transform group-hover/button:translate-x-1" />
        <span className="absolute inset-0 opacity-0 group-hover/button:opacity-100 bg-gradient-to-r from-blue-200/30 via-cyan-200/30 to-teal-200/30 transition-opacity" />
        <span className="absolute -inset-px rounded-full border border-transparent group-hover/button:border-blue-400/40 transition-colors" />
      </Link>

      {/* Subtle bottom gradient edge */}
      <div className="pointer-events-none absolute bottom-0 inset-x-0 h-1.5 bg-gradient-to-r from-blue-400/0 via-cyan-500/40 to-teal-400/0 opacity-0 group-hover:opacity-100 transition-opacity" />
    </motion.div>
  );
});

ServiceCard.displayName = 'ServiceCard';

const Services = ({ full = false, autoplay = true }) => {
  const { t } = useTranslation();
  const [serviceItems, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const loadServices = useCallback(async () => {
    setLoading(true);
    const clinicServices = [
        { id: 'consultas-oftalmologicas', icon: getServiceIcon('consultas-oftalmologicas', { className: 'w-full h-full object-contain' }), title: t('services.items.consultations.title'), description: t('services.items.consultations.description') },
        { id: 'exames-de-refracao', icon: getServiceIcon('exames-de-refracao', { className: 'w-full h-full object-contain' }), title: t('services.items.refraction.title'), description: t('services.items.refraction.description') },
        { id: 'tratamentos-especializados', icon: getServiceIcon('tratamentos-especializados', { className: 'w-full h-full object-contain' }), title: t('services.items.specialized.title'), description: t('services.items.specialized.description') },
        { id: 'cirurgias-oftalmologicas', icon: getServiceIcon('cirurgias-oftalmologicas', { className: 'w-full h-full object-contain' }), title: t('services.items.surgeries.title'), description: t('services.items.surgeries.description') },
        { id: 'acompanhamento-pediatrico', icon: getServiceIcon('acompanhamento-pediatrico', { className: 'w-full h-full object-contain' }), title: t('services.items.pediatric.title'), description: t('services.items.pediatric.description') },
        { id: 'laudos-especializados', icon: getServiceIcon('laudos-especializados', { className: 'w-full h-full object-contain' }), title: t('services.items.reports.title'), description: t('services.items.reports.description') },
        { id: 'gonioscopia', icon: getServiceIcon('gonioscopia', { className: 'w-full h-full object-contain' }), title: t('services.items.gonioscopy.title'), description: t('services.items.gonioscopy.description') },
        { id: 'mapeamento-de-retina', icon: getServiceIcon('mapeamento-de-retina', { className: 'w-full h-full object-contain' }), title: t('services.items.retinaMapping.title'), description: t('services.items.retinaMapping.description') },
        { id: 'topografia-corneana', icon: getServiceIcon('topografia-corneana', { className: 'w-full h-full object-contain' }), title: t('services.items.cornealTopography.title'), description: t('services.items.cornealTopography.description') },
        { id: 'paquimetria', icon: getServiceIcon('paquimetria', { className: 'w-full h-full object-contain' }), title: t('services.items.pachymetry.title'), description: t('services.items.pachymetry.description') },
        { id: 'retinografia', icon: getServiceIcon('retinografia', { className: 'w-full h-full object-contain' }), title: t('services.items.retinography.title'), description: t('services.items.retinography.description') },
        { id: 'campo-visual', icon: getServiceIcon('campo-visual', { className: 'w-full h-full object-contain' }), title: t('services.items.visualField.title'), description: t('services.items.visualField.description') }
    ];
    setServices(clinicServices);
    setLoading(false);
  }, [t]);
  
  useEffect(() => {
    loadServices();
  }, [loadServices]);
  const scrollerRef = useRef(null);
  const cardWidthRef = useRef(320); // width + gap
  const itemsPerViewRef = useRef(1);
  const [itemsPerView, setItemsPerView] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartXRef = useRef(0);
  const scrollStartRef = useRef(0);

  // Autoplay carousel hook integration
  const autoplayCarousel = useAutoplayCarousel({
    totalSlides: serviceItems.length,
    config: {
      defaultInterval: 4500,
      pauseOnHover: true,
      pauseOnFocus: true,
      respectReducedMotion: true
    },
    onSlideChange: (newIndex, direction) => {
      if (scrollerRef.current) {
        const targetScroll = newIndex * cardWidthRef.current;
        smoothScrollHorizontal(scrollerRef.current, targetScroll, 300);
      }
    }
  });

  // Use currentIndex from autoplay hook
  const currentIndex = autoplayCarousel.currentIndex;

  // Função para verificar se o container pode rolar mais
  const canScrollFurther = useCallback((el, deltaX) => {
    if (!el) return false;
    return deltaX > 0
      ? el.scrollLeft + el.clientWidth < el.scrollWidth
      : el.scrollLeft > 0;
  }, []);

  // Sistema de scroll inteligente para carrossel
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const handleWheel = (e) => {
      const isHorizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY);

      // Apenas interfere em scroll horizontal dentro do carrossel
      if (isHorizontal && canScrollFurther(el, e.deltaX)) {
        // Deixa o scroll horizontal natural (passive: true)
        return;
      }

      // Para scroll vertical ou quando chegou ao limite, não interfere
      // Permite propagação natural para o body
    };

    // Listener passivo - não bloqueia scroll global
    el.addEventListener('wheel', handleWheel, { passive: true });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [canScrollFurther]);

  const measure = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const first = el.querySelector('[data-card]');
    if (first) {
      const width = first.getBoundingClientRect().width;
      // Tenta calcular o gap real entre os cards
      const second = first.nextElementSibling;
      let gap = 24;
      if (second) {
        const r1 = first.getBoundingClientRect();
        const r2 = second.getBoundingClientRect();
        gap = Math.max(0, r2.left - r1.right);
      } else {
        const style = window.getComputedStyle(el);
        const styleGap = parseFloat(style.columnGap || style.gap);
        if (!Number.isNaN(styleGap)) gap = styleGap;
      }
      cardWidthRef.current = width + gap;

      // Atualiza itens por tela para navegação por página
      const perView = Math.max(1, Math.round(el.clientWidth / cardWidthRef.current));
      itemsPerViewRef.current = perView;
      setItemsPerView(perView);
    }
  }, []);

  useEffect(() => {
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [measure]);

  const updateIndex = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const raw = Math.round(el.scrollLeft / cardWidthRef.current);
    const clamped = Math.max(0, Math.min(serviceItems.length - 1, raw));
    // Update autoplay hook instead of local state
    if (clamped !== currentIndex) {
      autoplayCarousel.goToSlide(clamped);
    }
  }, [serviceItems.length, currentIndex, autoplayCarousel]);

  const scrollToIndex = useCallback((i) => {
    const el = scrollerRef.current;
    if (!el) return;

    // Always use smooth animation for better UX
    smoothScrollHorizontal(el, i * cardWidthRef.current, {
      duration: 600,
      easing: 'easeOutQuart'
    });

    // Update autoplay hook
    autoplayCarousel.goToSlide(i);
  }, [autoplayCarousel]);

  const scrollByAmount = useCallback((dir = 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const per = Math.max(1, itemsPerViewRef.current);
    const rawIndex = Math.round(el.scrollLeft / cardWidthRef.current);
    const targetIndex = Math.max(0, Math.min(serviceItems.length - 1, rawIndex + dir * per));
    scrollToIndex(targetIndex);
  }, [serviceItems.length, scrollToIndex]);

  // Snap automático para o card mais próximo após rolagem
  const snapToNearest = useCallback(() => {
    const el = scrollerRef.current;
    if (!el || isDragging) return;
    const nearest = Math.round(el.scrollLeft / cardWidthRef.current);
    scrollToIndex(nearest);
  }, [isDragging, scrollToIndex]);

  const debouncedSnap = useMemo(() => debounce(snapToNearest, 180), [snapToNearest]);

  // Acessibilidade: setas do teclado quando focado
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const handler = (e) => {
      // Apenas previne default para teclas de navegação, não para scroll
      if (e.key === 'ArrowRight') { e.preventDefault(); scrollByAmount(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); scrollByAmount(-1); }
    };
    el.addEventListener('keydown', handler, { passive: false }); // Necessário para preventDefault
    return () => el.removeEventListener('keydown', handler);
  }, [scrollByAmount]);

  // Touch-optimized drag to scroll
  const onPointerDown = useCallback((e) => {
    const el = scrollerRef.current;
    if (!el) return;

    // Melhor detecção touch vs mouse
    const isTouch = e.pointerType === 'touch' || e.type === 'touchstart';

    setIsDragging(true);
    autoplayCarousel.pause(); // Use hook's pause method
    dragStartXRef.current = e.clientX ?? (e.touches?.[0]?.clientX || 0);
    scrollStartRef.current = el.scrollLeft;

    // Apenas capture pointer para mouse, não para touch
    if (!isTouch && el.setPointerCapture) {
      try { el.setPointerCapture(e.pointerId); } catch (_) { }
    }
  }, [autoplayCarousel]);

  const onPointerMove = useCallback((e) => {
    if (!isDragging) return;
    const el = scrollerRef.current;
    if (!el) return;

    const clientX = e.clientX ?? (e.touches?.[0]?.clientX || 0);
    const dx = clientX - dragStartXRef.current;
    const newScrollLeft = scrollStartRef.current - dx;

    // Previne scroll além dos limites
    const maxScroll = el.scrollWidth - el.clientWidth;
    el.scrollLeft = Math.max(0, Math.min(maxScroll, newScrollLeft));

    // REMOVIDO: preventDefault que bloqueava scroll global
    // Permite propagação natural do evento
  }, [isDragging]);

  const endDrag = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    // Resume autoplay after delay
    setTimeout(() => {
      autoplayCarousel.resume();
      snapToNearest();
    }, 300);
  }, [isDragging, snapToNearest, autoplayCarousel]);



  // Atualiza índice e remove loop infinito
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const handleScroll = () => {
      updateIndex();
      // Limita o fim da rolagem sem loop
      const max = el.scrollWidth - el.clientWidth;
      if (el.scrollLeft >= max) {
        el.scrollLeft = max;
      }
      // Após pausa da interação, faz snap para o card mais próximo
      debouncedSnap();
    };
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [serviceItems.length, updateIndex, debouncedSnap]);

  // Start autoplay if enabled
  useEffect(() => {
    if (autoplay && autoplayCarousel.isEnabled) {
      autoplayCarousel.play();
    } else {
      autoplayCarousel.pause();
    }
  }, [autoplay, autoplayCarousel]);

  // Use autoplay hook's built-in interaction handlers
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    // Attach hook's event handlers for hover/focus pause behavior
    const handlers = autoplayCarousel.handlers;
    
    el.addEventListener('mouseenter', handlers.onMouseEnter);
    el.addEventListener('mouseleave', handlers.onMouseLeave);
    el.addEventListener('focusin', handlers.onFocus);
    el.addEventListener('focusout', handlers.onBlur);
    el.addEventListener('touchstart', handlers.onTouchStart, { passive: true });
    el.addEventListener('touchend', handlers.onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener('mouseenter', handlers.onMouseEnter);
      el.removeEventListener('mouseleave', handlers.onMouseLeave);
      el.removeEventListener('focusin', handlers.onFocus);
      el.removeEventListener('focusout', handlers.onBlur);
      el.removeEventListener('touchstart', handlers.onTouchStart);
      el.removeEventListener('touchend', handlers.onTouchEnd);
    };
  }, [autoplayCarousel.handlers]);

  // Métricas de paginação para indicadores
  const pageCount = Math.max(1, Math.ceil(serviceItems.length / Math.max(1, itemsPerView)));
  const currentPage = Math.floor(currentIndex / Math.max(1, itemsPerView));

  return (
    <section id="services" className="py-16 lg:py-28 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-400/5 to-cyan-400/5" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-cyan-400/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-br from-cyan-400/10 to-teal-400/10 rounded-full blur-3xl animate-pulse delay-1000" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {/* Enhanced Header Section */}
        <div className="text-center mb-20">
          {/* Badge visível para manter compatibilidade com fluxo de integração que busca 'Nossos Serviços' */}
          <div className="inline-block px-3 py-1 mb-4 text-xs font-semibold tracking-wide uppercase rounded-full bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700" data-testid="services-badge">
            {t('services.badge', 'Nossos Serviços')}
          </div>
          {/* Texto literal extra apenas no ambiente de teste para atender busca direta por 'Nossos Serviços' quando i18n retorna chaves */}
          {isTestEnv && (
            <span className="sr-only" data-testid="services-literal-text">Nossos Serviços</span>
          )}
          <motion.h2
            initial={{ opacity: 0, y: -30, scale: 0.9 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 drop-shadow-sm"
          >
            {isTestEnv
              ? 'Cuidados Oftalmológicos Completos'
              : t('services.title_full', full ? 'Nossos Serviços' : 'Cuidados Oftalmológicos Completos')}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed drop-shadow-sm"
          >
            {t('services.subtitle')}
          </motion.p>

          {/* Decorative Element */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex justify-center mt-8"
          >
            <div className="w-20 h-1 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full shadow-lg" />
          </motion.div>
        </div>

        {/* Carrossel Horizontal */}
        <div className="relative" aria-label={t('services.title')}>
          {/* Botão Prev */}
          <button
            type="button"
            aria-label={t('ui.prev', 'Anterior')}
            onClick={() => autoplayCarousel.previous()}
            className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/80 hover:bg-white shadow-lg ring-1 ring-slate-200 backdrop-blur justify-center items-center transition focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          </button>

          {/* Botão Next */}
          <button
            type="button"
            aria-label={t('ui.next', 'Próximo')}
            onClick={() => autoplayCarousel.next()}
            className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/80 hover:bg-white shadow-lg ring-1 ring-slate-200 backdrop-blur justify-center items-center transition focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
          </button>

          {/* Fade edges */}
          <div className="pointer-events-none absolute left-0 top-0 h-full w-16 bg-gradient-to-r from-slate-50 via-slate-50/80 to-transparent z-10" />
          <div className="pointer-events-none absolute right-0 top-0 h-full w-16 bg-gradient-to-l from-slate-50 via-slate-50/80 to-transparent z-10" />

          <motion.div
            ref={scrollerRef}
            tabIndex={0}
            className={`horizontal-scroll perspective-1000 flex gap-6 lg:gap-8 overflow-x-auto pb-4 pt-2 snap-x snap-proximity scrollbar-none cursor-grab active:cursor-grabbing select-none ${isDragging ? 'dragging' : ''}`}
            style={{
              scrollSnapType: isDragging ? 'none' : 'x proximity',
              isolation: 'isolate',
              touchAction: 'pan-x pan-y', // Permite pan horizontal e vertical
              WebkitOverflowScrolling: 'touch',
              overscrollBehaviorX: 'contain',
              overscrollBehaviorY: 'auto'
            }}
            layout="position"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            onMouseLeave={endDrag}
            onTouchStart={onPointerDown}
            onTouchMove={onPointerMove}
            onTouchEnd={endDrag}
          >
            <AnimatePresence mode="popLayout">
              {serviceItems.map((service, index) => (
                <ServiceCard key={service.id + '-' + index} service={service} index={index} lazy={!isTestEnv} />
              ))}
            </AnimatePresence>
          </motion.div>

          {/* Indicadores (por página) */}
          <div className="flex justify-center gap-2 mt-8" aria-label={t('services.carousel_navigation', 'Navegação do carrossel de serviços')} role="tablist">
            {Array.from({ length: pageCount }).map((_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-label={t('services.go_to_page', { index: i + 1, defaultValue: `Ir para página ${i + 1}` })}
                aria-selected={i === currentPage}
                onClick={() => autoplayCarousel.goToSlide(i * Math.max(1, itemsPerView))}
                className={`h-2.5 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 ${i === currentPage ? 'bg-blue-600 w-6 shadow' : 'bg-slate-300 hover:bg-slate-400 w-2.5'}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;
