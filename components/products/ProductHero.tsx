'use client';

/**
 * ProductHero Component
 * Hero section for product pages with Next.js Image optimization
 *
 * Features:
 * - Responsive design (mobile-first)
 * - Framer Motion animations
 * - Next.js Image optimization
 * - Accessible (WCAG AA)
 * - Trust indicators
 * - Dual CTAs (primary + secondary)
 */

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Eye, Sparkles, Shield, Award, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductHeroProps } from '@/types/products';

export const ProductHero: React.FC<ProductHeroProps> = ({
  title,
  subtitle,
  badge,
  image,
  ctaPrimary,
  ctaSecondary,
  trustBadges = [],
  className = ''
}) => {
  return (
    <section className={`relative bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/30 py-12 md:py-20 overflow-hidden ${className}`}>
      {/* 3D Background Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/60 via-cyan-50/40 to-teal-50/20" aria-hidden="true"></div>
      <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-gradient-radial from-blue-100/30 via-transparent to-transparent rounded-full blur-3xl" aria-hidden="true"></div>
      <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-radial from-indigo-100/20 via-transparent to-transparent rounded-full blur-3xl" aria-hidden="true"></div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          {badge && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6"
            >
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              <span>{badge}</span>
            </motion.div>
          )}

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-4 md:mb-6 leading-tight"
          >
            {title}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-slate-600 mb-8 md:mb-10 leading-relaxed"
          >
            {subtitle}
          </motion.p>

          {/* Hero Image */}
          {image && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mb-8 md:mb-10 flex justify-center relative"
            >
              <div className="relative group max-w-2xl w-full">
                {/* Background gradient */}
                <div
                  className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-cyan-400/20 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-300"
                  aria-hidden="true"
                ></div>

                {/* Image container */}
                <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-4 md:p-6 border border-slate-200/80 shadow-2xl">
                  <div className="relative w-full aspect-video rounded-2xl overflow-hidden">
                    <Image
                      src={image}
                      alt={title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 800px"
                      className="object-cover"
                      priority
                    />
                  </div>

                  {/* Floating decorative elements */}
                  <div className="absolute -top-4 -right-4 md:-top-6 md:-right-6 w-10 h-10 md:w-12 md:h-12 bg-blue-500/20 rounded-full flex items-center justify-center animate-float" aria-hidden="true">
                    <Eye className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
                  </div>
                  <div className="absolute -bottom-4 -left-4 md:-bottom-6 md:-left-6 w-8 h-8 md:w-10 md:h-10 bg-cyan-500/20 rounded-full flex items-center justify-center animate-float-delayed" aria-hidden="true">
                    <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-cyan-600" />
                  </div>
                </div>

                {/* Trust indicators below image */}
                {trustBadges.length > 0 && (
                  <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 flex flex-wrap items-center justify-center gap-2 bg-white/90 backdrop-blur-sm px-3 py-2 md:px-4 rounded-full border border-gray-200 shadow-lg">
                    {trustBadges.slice(0, 3).map((badge, index) => {
                      const Icon = badge.icon;
                      return (
                        <React.Fragment key={badge.key}>
                          {index > 0 && <div className="w-1 h-1 bg-gray-300 rounded-full" aria-hidden="true"></div>}
                          <div className="flex items-center gap-1 text-xs md:text-sm text-gray-600">
                            <Icon className="w-3 h-3 md:w-4 md:h-4 text-blue-600" aria-hidden="true" />
                            <span className="font-medium hidden sm:inline">{badge.value}</span>
                          </div>
                        </React.Fragment>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-10 md:mb-12"
          >
            {ctaPrimary && (
              <Button
                size="lg"
                variant="medical"
                className="w-full sm:w-auto gap-2"
                onClick={ctaPrimary.onClick}
                asChild={!!ctaPrimary.href}
              >
                {ctaPrimary.href ? (
                  <a href={ctaPrimary.href}>
                    <Eye className="h-5 w-5" aria-hidden="true" />
                    {ctaPrimary.text}
                  </a>
                ) : (
                  <>
                    <Eye className="h-5 w-5" aria-hidden="true" />
                    {ctaPrimary.text}
                  </>
                )}
              </Button>
            )}

            {ctaSecondary && (
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto gap-2"
                onClick={ctaSecondary.onClick}
                asChild={!!ctaSecondary.href}
              >
                {ctaSecondary.href ? (
                  <a href={ctaSecondary.href} target="_blank" rel="noopener noreferrer">
                    {ctaSecondary.text}
                  </a>
                ) : (
                  <>{ctaSecondary.text}</>
                )}
              </Button>
            )}
          </motion.div>

          {/* Trust Badges Grid */}
          {trustBadges.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6"
            >
              {trustBadges.map((badge) => {
                const Icon = badge.icon;
                return (
                  <div
                    key={badge.key}
                    className="text-center p-3 md:p-4 bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
                  >
                    <Icon
                      className="h-6 w-6 md:h-8 md:w-8 text-blue-600 mx-auto mb-2 md:mb-3"
                      aria-hidden="true"
                    />
                    <p className="text-xs md:text-sm font-semibold text-slate-900">
                      {badge.value}
                    </p>
                    {badge.description && (
                      <p className="text-xs text-slate-600 mt-1 hidden md:block">
                        {badge.description}
                      </p>
                    )}
                  </div>
                );
              })}
            </motion.div>
          )}
        </div>
      </div>

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 4s ease-in-out infinite 1s;
        }
      `}</style>
    </section>
  );
};

export default ProductHero;
