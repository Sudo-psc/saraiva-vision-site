import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Type, Contrast, Volume2, X, Settings, Check } from 'lucide-react';
import { Button } from '../ui/button';

/**
 * AccessibilityControls - Comprehensive accessibility toolbar
 * Features: Font size, High contrast, Text-to-speech
 */
const AccessibilityControls = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [fontSize, setFontSize] = useState('normal');
  const [contrast, setContrast] = useState('normal');
  const [isReading, setIsReading] = useState(false);

  // Font size options
  const fontSizes = {
    small: { label: 'Pequeno', class: 'accessibility-font-small' },
    normal: { label: 'Normal', class: 'accessibility-font-normal' },
    large: { label: 'Grande', class: 'accessibility-font-large' },
    xlarge: { label: 'Muito Grande', class: 'accessibility-font-xlarge' }
  };

  // Contrast modes
  const contrastModes = {
    normal: { label: 'Normal', class: '' },
    high: { label: 'Alto Contraste', class: 'accessibility-high-contrast' }
  };

  // Apply font size to article content
  useEffect(() => {
    const article = document.querySelector('article');
    if (article) {
      Object.values(fontSizes).forEach(size => {
        article.classList.remove(size.class);
      });
      article.classList.add(fontSizes[fontSize].class);
    }
  }, [fontSize]);

  // Apply contrast mode to body
  useEffect(() => {
    const body = document.body;
    Object.values(contrastModes).forEach(mode => {
      if (mode.class) body.classList.remove(mode.class);
    });
    if (contrastModes[contrast].class) {
      body.classList.add(contrastModes[contrast].class);
    }
  }, [contrast]);

  // Text-to-speech functionality
  const toggleReading = () => {
    if (isReading) {
      window.speechSynthesis.cancel();
      setIsReading(false);
    } else {
      const article = document.querySelector('article .prose');
      if (article) {
        const text = article.innerText;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'pt-BR';
        utterance.rate = 0.9;
        utterance.onend = () => setIsReading(false);
        utterance.onerror = () => setIsReading(false);
        window.speechSynthesis.speak(utterance);
        setIsReading(true);
      }
    }
  };

  const resetSettings = () => {
    setFontSize('normal');
    setContrast('normal');
    if (isReading) {
      window.speechSynthesis.cancel();
      setIsReading(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3, delay: 0.5 }}
        className={`fixed bottom-6 right-6 z-40 ${className}`}
      >
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 rounded-full bg-cyan-600 hover:bg-cyan-700 shadow-2xl"
          aria-label={isOpen ? 'Fechar acessibilidade' : 'Abrir acessibilidade'}
        >
          {isOpen ? <X className="w-6 h-6" /> : <Settings className="w-6 h-6" />}
        </Button>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30"
            />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-24 right-6 w-80 bg-white rounded-2xl shadow-2xl z-40"
            >
              <div className="bg-gradient-to-r from-cyan-600 to-indigo-600 p-4 text-white">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Acessibilidade
                </h3>
              </div>
              <div className="p-4 space-y-6">
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold mb-3">
                    <Type className="w-4 h-4 text-cyan-600" />
                    Tamanho da Fonte
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(fontSizes).map(([key, { label }]) => (
                      <button
                        key={key}
                        onClick={() => setFontSize(key)}
                        className={`px-3 py-2 rounded-lg text-sm transition-all ${
                          fontSize === key ? 'bg-cyan-600 text-white' : 'bg-gray-100'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold mb-3">
                    <Contrast className="w-4 h-4 text-cyan-600" />
                    Contraste
                  </label>
                  <div className="space-y-2">
                    {Object.entries(contrastModes).map(([key, { label }]) => (
                      <button
                        key={key}
                        onClick={() => setContrast(key)}
                        className={`w-full px-3 py-2 rounded-lg text-sm ${
                          contrast === key ? 'bg-cyan-600 text-white' : 'bg-gray-100'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <button
                    onClick={toggleReading}
                    className={`w-full px-4 py-3 rounded-lg flex items-center justify-center gap-2 ${
                      isReading ? 'bg-red-500' : 'bg-green-500'
                    } text-white`}
                  >
                    <Volume2 className="w-5 h-5" />
                    {isReading ? 'Parar' : 'Ouvir Artigo'}
                  </button>
                </div>
              </div>
              <div className="p-4 bg-gray-50">
                <button onClick={resetSettings} className="w-full px-4 py-2 bg-gray-200 rounded-lg">
                  Restaurar
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default AccessibilityControls;
