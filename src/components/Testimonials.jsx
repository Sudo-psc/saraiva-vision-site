import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PERFORMANCE } from '@/lib/constants';
import { useGoogleReviews } from '@/hooks/useGoogleReviews';
import { CLINIC_PLACE_ID } from '@/lib/clinicInfo';

const Testimonials = ({ limit }) => {
  const { t } = useTranslation();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const testimonialsData = t('testimonials.reviews', { returnObjects: true }) || [];

  const {
    reviews: googleReviews,
    loading: reviewsLoading
  } = useGoogleReviews({
    placeId: CLINIC_PLACE_ID,
    limit: limit || 6,
    autoFetch: true,
    refreshInterval: PERFORMANCE.AUTO_SLIDE_INTERVAL * 20
  });

  const images = useMemo(() => [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'
  ], []);

  const fallbackTestimonials = useMemo(() =>
    Array.isArray(testimonialsData)
      ? testimonialsData.map((testimonial, index) => ({
          ...testimonial,
          image: images[index % images.length],
          rating: 5,
          role: t('testimonials.patient'),
          id: `local-${index}`
        }))
      : [],
    [testimonialsData, images, t]
  );

  const googleTestimonials = useMemo(() =>
    Array.isArray(googleReviews) && googleReviews.length > 0
      ? googleReviews.map((review, index) => ({
          id: review.id || `google-${index}`,
          name: review.reviewer?.displayName || t('testimonials.anonymous', 'Paciente Saraiva Vision'),
          content: review.comment || t('testimonials.defaultComment', 'Atendimento impecável e equipe atenciosa!'),
          rating: review.starRating || 5,
          image: review.reviewer?.profilePhotoUrl || images[index % images.length],
          role: t('testimonials.patient'),
        }))
      : [],
    [googleReviews, images, t]
  );

  const testimonials = useMemo(() => (
    googleTestimonials.length > 0 ? googleTestimonials : fallbackTestimonials
  ), [googleTestimonials, fallbackTestimonials]);

  useEffect(() => {
    setCurrentSlide(0);
  }, [testimonials.length]);

  // Auto-play functionality
  useEffect(() => {
    if (isAutoPlaying && testimonials.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % testimonials.length);
      }, PERFORMANCE.AUTO_SLIDE_INTERVAL);
      return () => clearInterval(interval);
    }
  }, [isAutoPlaying, testimonials.length]);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % testimonials.length);
    setIsAutoPlaying(false);
  }, [testimonials.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    setIsAutoPlaying(false);
  }, [testimonials.length]);

  const goToSlide = useCallback((index) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
  }, []);

  if (testimonials.length === 0) return null;

  // Mouse tilt effect for 3D cards
  const handleTilt = (e) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const midX = rect.width / 2;
    const midY = rect.height / 2;
    const rotateY = ((x - midX) / midX) * 6; // max 6deg
    const rotateX = -((y - midY) / midY) * 6;
    el.style.setProperty('--tiltX', rotateX.toFixed(2) + 'deg');
    el.style.setProperty('--tiltY', rotateY.toFixed(2) + 'deg');
    el.style.setProperty('--scale', '1.02');
  };

  const resetTilt = (e) => {
    const el = e.currentTarget;
    el.style.setProperty('--tiltX', '0deg');
    el.style.setProperty('--tiltY', '0deg');
    el.style.setProperty('--scale', '1');
  };

  return (
    <section id="testimonials" className="py-16 md:py-20 testimonials-3d-bg relative scroll-section-fix">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-br from-blue-400/6 to-cyan-400/6 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-gradient-to-br from-purple-400/6 to-pink-400/6 rounded-full blur-3xl animate-float-delayed" />
      </div>

      <div className="max-w-7xl mx-auto px-[7%] relative z-10 testimonials-container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-xs font-medium mb-4">
            <Star size={16} className="mr-2" />
            {t('testimonials.badge')}
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            {t('testimonials.title')}
          </h2>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto">
            {t('testimonials.subtitle')}
          </p>
        </motion.div>

        {/* Featured Testimonial (Carousel) */}
        <div className="max-w-4xl mx-auto mb-14 perspective-1000">
          <div
            className="relative bg-white/80 backdrop-blur-sm rounded-3xl testimonial-gradient-border testimonial-card-3d hover-sheen shadow-3d hover:shadow-3d-hover border-0 p-7 md:p-10 transform-gpu"
            onMouseMove={handleTilt}
            onMouseLeave={resetTilt}
          >
            <div className="absolute top-8 left-8 text-blue-300/60">
              <Quote size={48} />
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                {/* Rating */}
                <div className="flex justify-center gap-1 mb-6">
                  {[...Array(testimonials[currentSlide].rating)].map((_, i) => (
                    <Star key={i} className="h-6 w-6 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                {/* Testimonial Text */}
                <blockquote className="text-lg md:text-xl font-medium text-slate-800 mb-8 leading-relaxed italic">
                  "{testimonials[currentSlide].content}"
                </blockquote>

                {/* Author */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-200 ring-4 ring-blue-100">
                    <img
                      className="w-full h-full object-cover"
                      alt={`Foto de ${testimonials[currentSlide].name}`}
                      src={testimonials[currentSlide].image}
                      loading="lazy" decoding="async"
                    />
                  </div>
                  <div className="text-center sm:text-left">
                    <h4 className="text-base font-semibold text-gray-900">
                      {testimonials[currentSlide].name}
                    </h4>
                    <p className="text-gray-600">
                      {testimonials[currentSlide].role}
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            {testimonials.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={prevSlide}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white hover:bg-blue-700 shadow-md"
                  aria-label={t('testimonials.previous')}
                >
                  <ChevronLeft size={20} />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={nextSlide}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white hover:bg-blue-700 shadow-md"
                  aria-label={t('testimonials.next')}
                >
                  <ChevronRight size={20} />
                </Button>
              </>
            )}
          </div>

          {/* Dots Indicator */}
          {testimonials.length > 1 && (
            <div className="flex flex-col items-center gap-3 mt-6">
              <div className="flex justify-center gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentSlide
                      ? 'bg-blue-600 w-8'
                      : 'bg-slate-300 hover:bg-slate-400'
                      }`}
                    aria-label={`Ir para depoimento ${index + 1}`}
                  />
                ))}
              </div>
              <div className="text-xs font-medium text-slate-700" aria-live="polite">
                {currentSlide + 1} / {testimonials.length}
              </div>
            </div>
          )}
        </div>

        {/* All Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.slice(0, limit || testimonials.length).map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-slate-50 rounded-2xl p-5 shadow-soft-light hover:shadow-soft-medium border border-slate-200 testimonial-card-3d hover-sheen transition-all duration-500 ease-out group cursor-pointer transform-gpu"
              onClick={() => goToSlide(index)}
              onMouseMove={handleTilt}
              onMouseLeave={resetTilt}
            >
              {/* Rating */}
              <div className="flex items-center gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              {/* Testimonial Text */}
              <p className="text-[0.85rem] md:text-[0.95rem] text-slate-700 mb-5 italic group-hover:text-slate-900 transition-colors">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-200">
                  <img
                    className="w-full h-full object-cover"
                    alt={`Foto de ${testimonial.name}`}
                    src={testimonial.image}
                    loading="lazy" decoding="async"
                  />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-[0.85rem]">
                    {testimonial.name}
                  </h4>
                  <p className="text-xs text-gray-600">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}"
        </div>

        {limit && testimonials.length > limit && (
          <div className="mt-10 text-center">
            <a href="/sobre" className="text-blue-600 font-medium hover:underline inline-flex items-center gap-1">
              {t('testimonials.viewAll', 'Ver todos depoimentos')}
              <ChevronRight size={16} />
            </a>
          </div>
        )}

        {/* Trust Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-12"
        >
          <div className="inline-flex items-center gap-8 bg-white rounded-2xl p-6 shadow-soft-light border-2 border-slate-300">
            <div className="text-center">
              <div className="text-xl font-bold text-blue-600">4.9/5</div>
              <p className="text-sm text-slate-600">{t('testimonials.avgRating')}</p>
            </div>
            <div className="w-px h-12 bg-slate-200"></div>
            <div className="text-center">
              <div className="text-xl font-bold text-green-600">500+</div>
              <p className="text-sm text-slate-600">{t('testimonials.totalReviews')}</p>
            </div>
            <div className="w-px h-12 bg-slate-200"></div>
            <div className="text-center">
              <div className="text-xl font-bold text-purple-600">98%</div>
              <p className="text-sm text-slate-600">{t('testimonials.satisfaction')}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;
