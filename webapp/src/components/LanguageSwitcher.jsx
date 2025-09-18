import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import BrazilFlag from '@/components/icons/BrazilFlag';
import UsaFlag from '@/components/icons/UsaFlag';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => changeLanguage('pt')}
        className={`rounded-full p-0 w-8 h-8 ${i18n.language === 'pt' ? 'ring-2 ring-primary ring-offset-2' : ''}`}
        aria-label="Mudar para Português"
      >
        <BrazilFlag className="w-6 h-6 rounded-full" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => changeLanguage('en')}
        className={`rounded-full p-0 w-8 h-8 ${i18n.language === 'en' ? 'ring-2 ring-primary ring-offset-2' : ''}`}
        aria-label="Switch to English"
      >
        <UsaFlag className="w-6 h-6 rounded-full" />
      </Button>
    </div>
  );
};

export default LanguageSwitcher;