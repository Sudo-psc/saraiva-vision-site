'use client';

/**
 * LensComparison Component
 * Interactive comparison table for contact lens products
 *
 * Features:
 * - Responsive table design
 * - Mobile-friendly cards on small screens
 * - Product selection capability
 * - Accessible (WCAG AA)
 * - Visual indicators for better/worse values
 * - Sticky header on scroll
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Shield, Droplets, Eye, ChevronDown, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LensComparisonProps, LensComparison } from '@/types/products';
import Badge from '@/components/ui/Badge';

export const LensComparisonTable: React.FC<LensComparisonProps> = ({
  products,
  maxProducts = 3,
  enableSelection = false,
  onCompare,
  className = ''
}) => {
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const displayProducts = products.slice(0, maxProducts);

  const handleToggleSelection = (productId: string) => {
    if (!enableSelection) return;

    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleCompare = () => {
    if (onCompare) {
      const selected = products.filter(p => selectedProducts.includes(p.productId));
      onCompare(selected);
    }
  };

  const toggleRow = (row: string) => {
    setExpandedRow(expandedRow === row ? null : row);
  };

  // Helper to determine if value is better (higher is better for water content and oxygen)
  const isBetterValue = (value: number, allValues: number[], higherIsBetter: boolean = true) => {
    const max = Math.max(...allValues);
    const min = Math.min(...allValues);
    return higherIsBetter ? value === max : value === min;
  };

  // Mobile Card View
  const MobileComparisonCard: React.FC<{ product: LensComparison }> = ({ product }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-md border border-slate-200 p-5 mb-4"
    >
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-bold text-lg text-slate-900">{product.name}</h3>
            <p className="text-sm text-slate-600">{product.brand}</p>
          </div>
          {enableSelection && (
            <Button
              size="sm"
              variant={selectedProducts.includes(product.productId) ? 'default' : 'outline'}
              onClick={() => handleToggleSelection(product.productId)}
              aria-label={`${selectedProducts.includes(product.productId) ? 'Desselecionar' : 'Selecionar'} ${product.name}`}
            >
              {selectedProducts.includes(product.productId) ? (
                <Check className="w-4 h-4" />
              ) : (
                <span className="text-xs">Selecionar</span>
              )}
            </Button>
          )}
        </div>

        <Badge variant="secondary" className="text-xs">
          {product.type === 'daily' ? 'Diária' : product.type === 'monthly' ? 'Mensal' : 'Quinzenal'}
        </Badge>
      </div>

      {/* Specifications */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between py-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Droplets className="w-4 h-4 text-blue-600" aria-hidden="true" />
            <span className="text-sm text-slate-600">Hidratação</span>
          </div>
          <span className="font-semibold text-slate-900">{product.waterContent}%</span>
        </div>

        <div className="flex items-center justify-between py-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-cyan-600" aria-hidden="true" />
            <span className="text-sm text-slate-600">Oxigenação</span>
          </div>
          <span className="font-semibold text-slate-900">Dk/t {product.oxygenPermeability}</span>
        </div>

        <div className="flex items-center justify-between py-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-green-600" aria-hidden="true" />
            <span className="text-sm text-slate-600">Proteção UV</span>
          </div>
          {product.uvProtection ? (
            <Check className="w-5 h-5 text-green-600" aria-label="Sim" />
          ) : (
            <X className="w-5 h-5 text-slate-400" aria-label="Não" />
          )}
        </div>

        <div className="flex items-center justify-between py-2">
          <span className="text-sm text-slate-600">Troca</span>
          <span className="font-semibold text-slate-900 capitalize">
            {product.replacementSchedule === 'daily' ? 'Diária' :
             product.replacementSchedule === 'monthly' ? 'Mensal' : 'Quinzenal'}
          </span>
        </div>
      </div>

      {/* Features */}
      <div>
        <button
          onClick={() => toggleRow(product.productId)}
          className="flex items-center justify-between w-full text-sm font-semibold text-slate-900 mb-2"
          aria-expanded={expandedRow === product.productId}
        >
          <span>Características</span>
          <ChevronDown
            className={`w-4 h-4 transition-transform ${expandedRow === product.productId ? 'rotate-180' : ''}`}
            aria-hidden="true"
          />
        </button>

        {expandedRow === product.productId && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-1"
          >
            {product.features.map((feature, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                <div className="w-1 h-1 bg-blue-600 rounded-full mt-1.5 flex-shrink-0" aria-hidden="true"></div>
                <span>{feature}</span>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );

  // Desktop Table View
  const DesktopComparisonTable = () => {
    const waterContents = displayProducts.map(p => p.waterContent);
    const oxygenValues = displayProducts.map(p => p.oxygenPermeability);

    return (
      <div className="overflow-x-auto rounded-2xl border border-slate-200">
        <table className="w-full bg-white">
          <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
            <tr>
              <th className="py-4 px-6 text-left text-sm font-semibold text-slate-700">
                Característica
              </th>
              {displayProducts.map(product => (
                <th key={product.productId} className="py-4 px-6 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="text-sm font-bold text-slate-900">{product.name}</div>
                    <Badge variant="secondary" className="text-xs">
                      {product.brand}
                    </Badge>
                    {enableSelection && (
                      <Button
                        size="sm"
                        variant={selectedProducts.includes(product.productId) ? 'default' : 'outline'}
                        onClick={() => handleToggleSelection(product.productId)}
                        className="mt-2"
                        aria-label={`${selectedProducts.includes(product.productId) ? 'Desselecionar' : 'Selecionar'} ${product.name}`}
                      >
                        {selectedProducts.includes(product.productId) ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <span className="text-xs">Selecionar</span>
                        )}
                      </Button>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {/* Type Row */}
            <tr className="hover:bg-slate-50 transition-colors">
              <td className="py-4 px-6 text-sm font-medium text-slate-700">Tipo</td>
              {displayProducts.map(product => (
                <td key={product.productId} className="py-4 px-6 text-center">
                  <Badge variant="outline" className="capitalize">
                    {product.type === 'daily' ? 'Diária' : product.type === 'monthly' ? 'Mensal' : 'Quinzenal'}
                  </Badge>
                </td>
              ))}
            </tr>

            {/* Water Content Row */}
            <tr className="hover:bg-slate-50 transition-colors">
              <td className="py-4 px-6 text-sm font-medium text-slate-700">
                <div className="flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-blue-600" aria-hidden="true" />
                  <span>Hidratação</span>
                </div>
              </td>
              {displayProducts.map(product => {
                const isBest = isBetterValue(product.waterContent, waterContents);
                return (
                  <td key={product.productId} className="py-4 px-6 text-center">
                    <span className={`font-semibold ${isBest ? 'text-green-600' : 'text-slate-900'}`}>
                      {product.waterContent}%
                    </span>
                    {isBest && (
                      <Badge variant="default" className="ml-2 text-xs bg-green-600">
                        Melhor
                      </Badge>
                    )}
                  </td>
                );
              })}
            </tr>

            {/* Oxygen Permeability Row */}
            <tr className="hover:bg-slate-50 transition-colors">
              <td className="py-4 px-6 text-sm font-medium text-slate-700">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-cyan-600" aria-hidden="true" />
                  <span>Oxigenação (Dk/t)</span>
                </div>
              </td>
              {displayProducts.map(product => {
                const isBest = isBetterValue(product.oxygenPermeability, oxygenValues);
                return (
                  <td key={product.productId} className="py-4 px-6 text-center">
                    <span className={`font-semibold ${isBest ? 'text-green-600' : 'text-slate-900'}`}>
                      {product.oxygenPermeability}
                    </span>
                    {isBest && (
                      <Badge variant="default" className="ml-2 text-xs bg-green-600">
                        Melhor
                      </Badge>
                    )}
                  </td>
                );
              })}
            </tr>

            {/* UV Protection Row */}
            <tr className="hover:bg-slate-50 transition-colors">
              <td className="py-4 px-6 text-sm font-medium text-slate-700">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-600" aria-hidden="true" />
                  <span>Proteção UV</span>
                </div>
              </td>
              {displayProducts.map(product => (
                <td key={product.productId} className="py-4 px-6 text-center">
                  {product.uvProtection ? (
                    <Check className="w-6 h-6 text-green-600 mx-auto" aria-label="Sim" />
                  ) : (
                    <X className="w-6 h-6 text-slate-400 mx-auto" aria-label="Não" />
                  )}
                </td>
              ))}
            </tr>

            {/* Replacement Schedule Row */}
            <tr className="hover:bg-slate-50 transition-colors">
              <td className="py-4 px-6 text-sm font-medium text-slate-700">Troca</td>
              {displayProducts.map(product => (
                <td key={product.productId} className="py-4 px-6 text-center">
                  <span className="text-sm text-slate-900 capitalize">
                    {product.replacementSchedule === 'daily' ? 'Diária' :
                     product.replacementSchedule === 'monthly' ? 'Mensal' : 'Quinzenal'}
                  </span>
                </td>
              ))}
            </tr>

            {/* Best For Row */}
            <tr className="hover:bg-slate-50 transition-colors">
              <td className="py-4 px-6 text-sm font-medium text-slate-700">Ideal para</td>
              {displayProducts.map(product => (
                <td key={product.productId} className="py-4 px-6">
                  <ul className="text-xs text-slate-600 space-y-1">
                    {product.bestFor.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-1">
                        <div className="w-1 h-1 bg-blue-600 rounded-full mt-1.5 flex-shrink-0" aria-hidden="true"></div>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Mobile View */}
      <div className="md:hidden">
        {displayProducts.map(product => (
          <MobileComparisonCard key={product.productId} product={product} />
        ))}
      </div>

      {/* Desktop View */}
      <div className="hidden md:block">
        <DesktopComparisonTable />
      </div>

      {/* Compare Button */}
      {enableSelection && selectedProducts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center"
        >
          <Button
            size="lg"
            variant="medical"
            onClick={handleCompare}
            className="gap-2"
          >
            <Info className="w-5 h-5" aria-hidden="true" />
            Comparar Selecionados ({selectedProducts.length})
          </Button>
        </motion.div>
      )}

      {/* Legend */}
      <div className="text-center text-xs text-slate-500 mt-4">
        <p>* Valores destacados em verde indicam melhor desempenho naquela categoria</p>
        <p className="mt-1">** Todas as lentes requerem receita médica e adaptação profissional</p>
      </div>
    </div>
  );
};

export default LensComparisonTable;
