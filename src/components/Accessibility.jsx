import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Type, Eye, EyeOff, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

const Accessibility = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [fontSize, setFontSize] = useState('normal');
  const [contrast, setContrast] = useState('normal');
  const [readingMode, setReadingMode] = useState(false);

  useEffect(() => {
    // Aplicar configurações de acessibilidade
    const root = document.documentElement;
    
    switch (fontSize) {
      case 'large':
        root.style.fontSize = '18px';
        break;
      case 'extra-large':
        root.style.fontSize = '20px';
        break;
      default:
        root.style.fontSize = '16px';
    }

    switch (contrast) {
      case 'high':
        root.classList.add('high-contrast');
        break;
      case 'dark':
        root.classList.add('dark-mode');
        break;
      default:
        root.classList.remove('high-contrast', 'dark-mode');
    }

    if (readingMode) {
      root.classList.add('reading-mode');
    } else {
      root.classList.remove('reading-mode');
    }
  }, [fontSize, contrast, readingMode]);

  const announceChange = (message) => {
    // Criar anúncio para leitores de tela
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    document.body.appendChild(announcement);
    setTimeout(() => document.body.removeChild(announcement), 1000);
  };

  const handleFontSizeChange = (size) => {
    setFontSize(size);
    announceChange(t(`accessibility.fontSize.${size}`));
  };

  const handleContrastChange = (contrastMode) => {
    setContrast(contrastMode);
    announceChange(t(`accessibility.contrast.${contrastMode}`));
  };

  const toggleReadingMode = () => {
    setReadingMode(!readingMode);
    announceChange(readingMode ? t('accessibility.readingMode.off') : t('accessibility.readingMode.on'));
  };

  return (
    <>
      {/* Botão de Acessibilidade Flutuante */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed bottom-6 left-6 z-50"
      >
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg"
          aria-label={t('accessibility.toggle')}
          aria-expanded={isOpen}
        >
          <Settings size={24} className="text-white" />
        </Button>
      </motion.div>

      {/* Painel de Acessibilidade */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: -300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-24 left-6 z-50 bg-white rounded-xl shadow-2xl border p-6 w-80"
            role="dialog"
            aria-labelledby="accessibility-title"
          >
            <h3 id="accessibility-title" className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Settings size={20} />
              {t('accessibility.title')}
            </h3>

            {/* Tamanho da Fonte */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                <Type size={16} className="inline mr-2" />
                {t('accessibility.fontSize.label')}
              </label>
              <div className="flex gap-2">
                {['normal', 'large', 'extra-large'].map((size) => (
                  <Button
                    key={size}
                    variant={fontSize === size ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleFontSizeChange(size)}
                  >
                    {t(`accessibility.fontSize.${size}`)}
                  </Button>
                ))}
              </div>
            </div>

            {/* Contraste */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                <Eye size={16} className="inline mr-2" />
                {t('accessibility.contrast.label')}
              </label>
              <div className="flex gap-2">
                {['normal', 'high', 'dark'].map((contrastMode) => (
                  <Button
                    key={contrastMode}
                    variant={contrast === contrastMode ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleContrastChange(contrastMode)}
                  >
                    {t(`accessibility.contrast.${contrastMode}`)}
                  </Button>
                ))}
              </div>
            </div>

            {/* Modo de Leitura */}
            <div className="mb-4">
              <Button
                variant={readingMode ? 'default' : 'outline'}
                onClick={toggleReadingMode}
                className="w-full flex items-center justify-center gap-2"
              >
                {readingMode ? <EyeOff size={16} /> : <Eye size={16} />}
                {readingMode ? t('accessibility.readingMode.off') : t('accessibility.readingMode.on')}
              </Button>
            </div>

            {/* Botão para Fechar */}
            <Button
              variant="ghost"
              onClick={() => setIsOpen(false)}
              className="w-full"
            >
              {t('accessibility.close')}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Estilos de Acessibilidade */}
      <style jsx global>{`
        .high-contrast {
          filter: contrast(150%) brightness(110%);
        }
        
        .dark-mode {
          filter: invert(1) hue-rotate(180deg);
        }
        
        .reading-mode {
          background: #f8f9fa !important;
        }
        
        .reading-mode * {
          color: #2d3748 !important;
          background: transparent !important;
        }
        
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }
        
        /* Melhor foco para teclado */
        *:focus {
          outline: 2px solid #3b82f6 !important;
          outline-offset: 2px !important;
        }
        
        /* Animações reduzidas para usuários que preferem */
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </>
  );
};

export default Accessibility;
