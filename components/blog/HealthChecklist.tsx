'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Printer, RotateCcw, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { HealthChecklistProps, ChecklistProgress } from '@/types/blog-content';

/**
 * HealthChecklist - Interactive health checklist with progress tracking
 *
 * Features:
 * - Checkable items with visual feedback
 * - Progress tracking with percentage
 * - localStorage persistence (LGPD compliant)
 * - Print functionality for patient records
 * - Accessibility: WCAG AAA compliant
 * - Smooth animations with Framer Motion
 *
 * @example
 * ```tsx
 * <HealthChecklist
 *   title="Checklist de Saúde Ocular"
 *   checklistId="eye-health-checklist"
 *   items={[
 *     "Faça exames regulares",
 *     "Use óculos de sol",
 *     "Mantenha distância da tela"
 *   ]}
 *   showProgress={true}
 *   allowPrint={true}
 * />
 * ```
 */
const HealthChecklist: React.FC<HealthChecklistProps> = ({
  items = [],
  title = 'Checklist de Saúde',
  className = '',
  checklistId = 'default-checklist',
  showProgress = true,
  allowPrint = true,
  onProgressChange,
}) => {
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});
  const [isLoaded, setIsLoaded] = useState(false);

  // Normalize items to string array
  const itemTexts = items.map((item) => (typeof item === 'string' ? item : item.text));

  // Load saved progress from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(`saraiva_checklist_progress_${checklistId}`);
        if (saved) {
          const progress: ChecklistProgress = JSON.parse(saved);
          setCheckedItems(progress.checkedItems);
        }
      } catch (error) {
        console.error('Failed to load checklist progress:', error);
      }
      setIsLoaded(true);
    }
  }, [checklistId]);

  // Calculate progress
  const progress = itemTexts.length > 0 ? Math.round((Object.values(checkedItems).filter(Boolean).length / itemTexts.length) * 100) : 0;

  // Save progress to localStorage
  const saveProgress = (newCheckedItems: Record<number, boolean>) => {
    if (typeof window !== 'undefined') {
      try {
        const progressData: ChecklistProgress = {
          checklistId,
          checkedItems: newCheckedItems,
          progress,
          lastUpdated: new Date().toISOString(),
        };
        localStorage.setItem(`saraiva_checklist_progress_${checklistId}`, JSON.stringify(progressData));

        // Trigger callback if provided
        if (onProgressChange) {
          onProgressChange(progress);
        }
      } catch (error) {
        console.error('Failed to save checklist progress:', error);
      }
    }
  };

  const handleCheck = (index: number) => {
    const newCheckedItems = {
      ...checkedItems,
      [index]: !checkedItems[index],
    };
    setCheckedItems(newCheckedItems);
    saveProgress(newCheckedItems);
  };

  const handleReset = () => {
    setCheckedItems({});
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(`saraiva_checklist_progress_${checklistId}`);
      } catch (error) {
        console.error('Failed to clear checklist progress:', error);
      }
    }
    if (onProgressChange) {
      onProgressChange(0);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const checkedCount = Object.values(checkedItems).filter(Boolean).length;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title} - Saraiva Vision</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 40px;
              line-height: 1.6;
            }
            h1 {
              color: #1e40af;
              margin-bottom: 10px;
            }
            .subtitle {
              color: #6b7280;
              margin-bottom: 30px;
            }
            .checklist {
              list-style: none;
              padding: 0;
            }
            .checklist li {
              padding: 12px;
              margin-bottom: 8px;
              border: 1px solid #e5e7eb;
              border-radius: 8px;
              display: flex;
              align-items: center;
              gap: 12px;
            }
            .checked {
              background-color: #f0fdf4;
              border-color: #86efac;
            }
            .checkbox {
              width: 20px;
              height: 20px;
              border: 2px solid #9ca3af;
              border-radius: 4px;
              display: inline-block;
            }
            .checkbox.checked {
              background-color: #22c55e;
              border-color: #22c55e;
              position: relative;
            }
            .checkbox.checked::after {
              content: '✓';
              color: white;
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              font-weight: bold;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 2px solid #e5e7eb;
              color: #6b7280;
              font-size: 14px;
            }
            .progress {
              margin-top: 30px;
              padding: 15px;
              background-color: #eff6ff;
              border-radius: 8px;
              font-weight: bold;
              color: #1e40af;
            }
            @media print {
              body {
                padding: 20px;
              }
            }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          <p class="subtitle">Clínica Oftalmológica Saraiva Vision</p>

          <div class="progress">
            Progresso: ${checkedCount} de ${itemTexts.length} itens concluídos (${progress}%)
          </div>

          <ul class="checklist">
            ${itemTexts
              .map(
                (item, idx) => `
              <li class="${checkedItems[idx] ? 'checked' : ''}">
                <span class="checkbox ${checkedItems[idx] ? 'checked' : ''}"></span>
                <span>${item}</span>
              </li>
            `
              )
              .join('')}
          </ul>

          <div class="footer">
            <p><strong>Data:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
            <p><strong>Saraiva Vision</strong> - Clínica Oftalmológica</p>
            <p>Este documento é apenas um guia educativo. Consulte sempre um oftalmologista.</p>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.print();
  };

  if (!itemTexts || itemTexts.length === 0) {
    return null;
  }

  if (!isLoaded) return null; // Wait for client-side hydration

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={`my-8 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 md:p-8 shadow-lg border-2 border-green-100 ${className}`}
      role="region"
      aria-label={title}
      data-testid="health-checklist"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-full p-3 shadow-md">
            <CheckCircle2 className="w-6 h-6 text-white" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            {showProgress && (
              <p className="text-sm text-gray-600">
                {Object.values(checkedItems).filter(Boolean).length} de {itemTexts.length} concluídos
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {allowPrint && (
            <Button
              onClick={handlePrint}
              variant="outline"
              size="sm"
              className="hidden sm:flex"
              aria-label="Imprimir checklist"
            >
              <Printer className="w-4 h-4 mr-1" />
              Imprimir
            </Button>
          )}
          <Button onClick={handleReset} variant="ghost" size="sm" aria-label="Resetar checklist">
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      {showProgress && (
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              Progresso
            </span>
            <span className="font-semibold">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
            <motion.div
              className="bg-gradient-to-r from-green-600 to-emerald-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      )}

      {/* Checklist Items */}
      <ul className="space-y-3" role="list">
        {itemTexts.map((item, index) => {
          const isChecked = checkedItems[index] || false;

          return (
            <motion.li
              key={index}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="flex items-start gap-3"
            >
              <button
                onClick={() => handleCheck(index)}
                className={`flex-shrink-0 mt-1 w-6 h-6 rounded-md border-2 transition-all focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                  isChecked ? 'bg-green-600 border-green-600' : 'border-gray-300 hover:border-green-400'
                }`}
                role="checkbox"
                aria-checked={isChecked}
                aria-labelledby={`checklist-item-${index}`}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleCheck(index);
                  }
                }}
              >
                {isChecked ? <CheckCircle2 className="w-full h-full text-white" aria-hidden="true" /> : <Circle className="w-full h-full text-transparent" aria-hidden="true" />}
              </button>
              <label
                id={`checklist-item-${index}`}
                htmlFor={`health-item-${index}`}
                className={`flex-1 cursor-pointer transition-all ${isChecked ? 'text-gray-600 line-through' : 'text-gray-900'}`}
              >
                {item}
              </label>
            </motion.li>
          );
        })}
      </ul>

      {/* CFM Disclaimer */}
      <div className="mt-6 pt-6 border-t border-green-200">
        <p className="text-xs text-gray-600 text-center">
          ⚕️ Este checklist é apenas um guia educativo. Não substitui orientação médica profissional. Consulte sempre um oftalmologista.
        </p>
      </div>

      {/* LGPD Notice */}
      <div className="mt-4 p-3 bg-white rounded-lg border border-gray-200 text-xs text-gray-600">
        <p>🔒 Seu progresso é salvo apenas no seu navegador local (LGPD compliant). Nenhum dado é enviado para servidores externos.</p>
      </div>

      {/* Completion Message */}
      {progress === 100 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-6 p-4 bg-green-600 text-white rounded-xl text-center font-semibold shadow-lg"
        >
          🎉 Parabéns! Você completou todos os itens!
        </motion.div>
      )}
    </motion.div>
  );
};

export default HealthChecklist;
