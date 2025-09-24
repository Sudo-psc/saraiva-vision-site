import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BrazilFlag from '@/components/icons/BrazilFlag';
import UsaFlag from '@/components/icons/UsaFlag';

const LanguageSwitcher = ({ compact = false, className = '' }) => {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const currentLanguage = i18n.language || 'pt';

  const languages = [
    {
      code: 'pt',
      name: 'Português',
      nativeName: 'Português',
      flag: <BrazilFlag className="w-4 h-4" />
    },
    {
      code: 'en',
      name: 'English',
      nativeName: 'English',
      flag: <UsaFlag className="w-4 h-4" />
    }
  ];

  const currentLang = languages.find(lang => lang.code === currentLanguage) || languages[0];

  const handleLanguageChange = (langCode) => {
    i18n.changeLanguage(langCode);
    localStorage.setItem('language', langCode);
    setIsOpen(false);
    
    // Announce language change to screen readers
    const langName = languages.find(lang => lang.code === langCode)?.name;
    if (langName) {
      setTimeout(() => {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = `Idioma alterado para ${langName}`;
        document.body.appendChild(announcement);
        setTimeout(() => document.body.removeChild(announcement), 1000);
      }, 100);
    }
  };

  if (compact) {
    return (
      <div className={`relative ${className}`}>
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 p-2 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label={t('nav.language')}
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          {currentLang.flag}
          <ChevronDown className="w-3 h-3" />
        </motion.button>
        
        <AnimatePresence>
          {isOpen && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setIsOpen(false)}
                aria-hidden="true"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -5 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full right-0 mt-1 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50 min-w-[120px]"
                role="menu"
                aria-orientation="vertical"
              >
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-sm transition-colors ${
                      currentLanguage === lang.code
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                    role="menuitem"
                    aria-current={currentLanguage === lang.code ? 'true' : 'false'}
                  >
                    {lang.flag}
                    <span>{lang.nativeName}</span>
                    {currentLanguage === lang.code && (
                      <span className="ml-auto text-blue-600">✓</span>
                    )}
                  </button>
                ))}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <motion.div
      className={`relative ${className}`}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="outline"
        className="flex items-center gap-2"
        aria-label={t('nav.language')}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        id="language-switcher"
      >
        <Globe className="w-4 h-4" />
        {currentLang.flag}
        <span className="text-sm font-medium">{currentLang.nativeName}</span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </Button>
      
      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)}
              aria-hidden="true"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -5 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50 min-w-[180px]"
              role="menu"
              aria-labelledby="language-switcher"
              aria-orientation="vertical"
            >
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                    currentLanguage === lang.code
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                  role="menuitem"
                  aria-current={currentLanguage === lang.code ? 'true' : 'false'}
                >
                  {lang.flag}
                  <span className="font-medium">{lang.nativeName}</span>
                  {currentLanguage === lang.code && (
                    <span className="ml-auto text-blue-600 font-semibold">✓</span>
                  )}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default LanguageSwitcher;