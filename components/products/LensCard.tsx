'use client';

/**
 * LensCard Component
 * Individual contact lens product display card
 *
 * Features:
 * - Three variants: compact, standard, detailed
 * - Product information display
 * - Optional pricing
 * - Interactive hover effects
 * - Accessible (WCAG AA)
 * - Mobile-responsive
 */

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Check, Shield, Eye, Droplets, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LensCardProps } from '@/types/products';
import Badge from '@/components/ui/Badge';

export const LensCard: React.FC<LensCardProps> = ({
  product,
  variant = 'standard',
  showPrice = false,
  showCTA = true,
  onSelect,
  className = ''
}) => {
  const handleSelect = () => {
    if (onSelect) {
      onSelect(product);
    }
  };

  // Variant-specific classes
  const variantClasses = {
    compact: 'p-4',
    standard: 'p-6',
    detailed: 'p-6 md:p-8'
  };

  // Render compact variant
  if (variant === 'compact') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        whileHover={{ y: -4, transition: { duration: 0.2 } }}
        className={`bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-slate-100 ${variantClasses.compact} ${className}`}
      >
        <div className="flex items-start gap-4">
          {/* Image */}
          <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-slate-50">
            <Image
              src={product.images.thumbnail || product.images.main}
              alt={`${product.name} - ${product.brand}`}
              fill
              sizes="64px"
              className="object-cover"
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-900 truncate mb-1">
              {product.name}
            </h3>
            <p className="text-sm text-slate-600 mb-2">{product.brand}</p>

            {/* Key feature */}
            <div className="flex items-center gap-1 text-xs text-blue-600">
              <Droplets className="w-3 h-3" aria-hidden="true" />
              <span>{product.waterContent}% hidratação</span>
            </div>
          </div>

          {/* CTA */}
          {showCTA && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleSelect}
              aria-label={`Saiba mais sobre ${product.name}`}
            >
              <Info className="w-4 h-4" />
            </Button>
          )}
        </div>
      </motion.div>
    );
  }

  // Render standard variant
  if (variant === 'standard') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        whileHover={{ y: -6, transition: { duration: 0.2 } }}
        className={`bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-100 overflow-hidden ${className}`}
      >
        {/* Image */}
        <div className="relative h-48 overflow-hidden bg-gradient-to-br from-blue-50 to-cyan-50">
          <Image
            src={product.images.main}
            alt={`${product.name} - ${product.brand}`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 hover:scale-110"
          />

          {/* Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm text-slate-800">
              {product.brand}
            </Badge>
            {product.uvProtection && (
              <Badge variant="secondary" className="bg-blue-600 text-white">
                <Shield className="w-3 h-3 mr-1" aria-hidden="true" />
                UV Protection
              </Badge>
            )}
          </div>

          {!product.available && (
            <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center">
              <span className="text-white font-semibold">Indisponível</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className={variantClasses.standard}>
          <h3 className="text-xl font-bold text-slate-900 mb-2">
            {product.name}
          </h3>
          <p className="text-slate-600 text-sm mb-4 line-clamp-2">
            {product.description}
          </p>

          {/* Key specs */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <Droplets className="w-4 h-4 text-blue-600" aria-hidden="true" />
              <span className="text-slate-700">{product.waterContent}% água</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Eye className="w-4 h-4 text-cyan-600" aria-hidden="true" />
              <span className="text-slate-700">Dk/t {product.oxygenPermeability}</span>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-2 mb-4">
            {product.features.slice(0, 3).map((feature, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" aria-hidden="true" />
                <span className="text-sm text-slate-700">{feature}</span>
              </div>
            ))}
          </div>

          {/* Price */}
          {showPrice && product.price && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-slate-600">A partir de</p>
              <p className="text-2xl font-bold text-blue-600">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: product.price.currency
                }).format(product.price.value)}
              </p>
              <p className="text-xs text-slate-500">{product.price.unit}</p>
            </div>
          )}

          {/* CTA */}
          {showCTA && (
            <Button
              variant="medical"
              className="w-full"
              onClick={handleSelect}
              disabled={!product.available}
            >
              {product.available ? 'Saiba Mais' : 'Indisponível'}
            </Button>
          )}

          {product.prescriptionRequired && (
            <p className="text-xs text-slate-500 text-center mt-3">
              * Requer receita médica
            </p>
          )}
        </div>
      </motion.div>
    );
  }

  // Render detailed variant
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden ${className}`}
    >
      <div className="md:flex">
        {/* Image Section */}
        <div className="md:w-2/5 relative h-64 md:h-auto bg-gradient-to-br from-blue-50 to-cyan-50">
          <Image
            src={product.images.main}
            alt={`${product.name} - ${product.brand}`}
            fill
            sizes="(max-width: 768px) 100vw, 40vw"
            className="object-cover"
          />

          {/* Floating badges */}
          <div className="absolute top-4 left-4 right-4 flex flex-wrap gap-2">
            <Badge className="bg-white/90 backdrop-blur-sm text-slate-800">
              {product.brand}
            </Badge>
            <Badge className="bg-blue-600 text-white">
              {product.type === 'daily' ? 'Diária' : product.type === 'monthly' ? 'Mensal' : 'Quinzenal'}
            </Badge>
            {product.uvProtection && (
              <Badge className="bg-green-600 text-white">
                <Shield className="w-3 h-3 mr-1" aria-hidden="true" />
                UV
              </Badge>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className={`md:w-3/5 ${variantClasses.detailed}`}>
          <div className="mb-4">
            <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
              {product.name}
            </h3>
            <p className="text-slate-600 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Specifications Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-slate-50 rounded-xl">
            <div>
              <p className="text-xs text-slate-500 mb-1">Hidratação</p>
              <p className="font-semibold text-slate-900">{product.waterContent}%</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Oxigenação</p>
              <p className="font-semibold text-slate-900">Dk/t {product.oxygenPermeability}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Material</p>
              <p className="font-semibold text-slate-900 capitalize">
                {product.material.replace('-', ' ')}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Troca</p>
              <p className="font-semibold text-slate-900 capitalize">
                {product.replacementSchedule === 'daily' ? 'Diária' :
                 product.replacementSchedule === 'monthly' ? 'Mensal' : 'Quinzenal'}
              </p>
            </div>
          </div>

          {/* Features */}
          <div className="mb-6">
            <h4 className="font-semibold text-slate-900 mb-3">Características:</h4>
            <div className="space-y-2">
              {product.features.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" aria-hidden="true" />
                  <span className="text-sm text-slate-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Benefits */}
          {product.benefits && product.benefits.length > 0 && (
            <div className="mb-6">
              <h4 className="font-semibold text-slate-900 mb-3">Benefícios:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {product.benefits.map((benefit, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm text-blue-600">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" aria-hidden="true"></div>
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ideal For */}
          {product.idealFor && product.idealFor.length > 0 && (
            <div className="mb-6 p-4 bg-blue-50 rounded-xl">
              <h4 className="font-semibold text-slate-900 mb-2">Ideal para:</h4>
              <p className="text-sm text-slate-700">
                {product.idealFor.join(' • ')}
              </p>
            </div>
          )}

          {/* Price */}
          {showPrice && product.price && (
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl text-white">
              <p className="text-sm opacity-90 mb-1">A partir de</p>
              <p className="text-3xl font-bold">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: product.price.currency
                }).format(product.price.value)}
              </p>
              <p className="text-sm opacity-75">{product.price.unit}</p>
            </div>
          )}

          {/* CTA */}
          {showCTA && (
            <div className="space-y-3">
              <Button
                variant="medical"
                size="lg"
                className="w-full"
                onClick={handleSelect}
                disabled={!product.available}
              >
                {product.available ? 'Agendar Adaptação' : 'Produto Indisponível'}
              </Button>

              {product.prescriptionRequired && (
                <p className="text-xs text-slate-500 text-center">
                  * Requer receita médica e adaptação profissional
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default LensCard;
