'use client';

/**
 * Navbar Next.js - Versão corrigida para resolver React Error #306
 * Migrado de React Router para Next.js App Router
 * Saraiva Vision - Clínica Oftalmológica
 */

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Menu,
  X,
  MessageCircle,
  Globe,
  ChevronDown,
  Calendar,
  Headphones,
  ExternalLink
} from 'lucide-react';

// Tipos TypeScript para props
interface NavLink {
  name: string;
  href: string;
  internal: boolean;
  isRoute?: boolean;
}

interface NavbarProps {
  className?: string;
}

// Componente Logo inline para evitar import issues
const LogoComponent: React.FC<{ className?: string }> = ({ className = "" }) => {
  const logoUrl = "/img/logo-saraiva-vision.svg";

  return (
    <img
      src={logoUrl}
      alt="Saraiva Vision - Clínica Oftalmológica"
      className={`h-16 md:h-20 w-auto ${className}`}
      loading="eager"
      decoding="async"
    />
  );
};

// Button component inline para evitar dependency issues
const ButtonComponent: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  'aria-label'?: string;
  'aria-expanded'?: boolean;
  'aria-controls'?: string;
}> = ({
  children,
  onClick,
  className = "",
  variant = 'default',
  size = 'md',
  ...props
}) => {
  const baseClasses = "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500";

  const variantClasses = {
    default: "bg-cyan-600 text-white hover:bg-cyan-700",
    outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50",
    ghost: "text-gray-700 hover:bg-gray-100"
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
    icon: "p-2"
  };

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// Componente de bandeiras inline
const BrazilFlag: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 630" className={`w-5 h-4 ${className}`}>
    <rect width="900" height="630" fill="#009B3A"/>
    <path d="M450 63l315 252L450 567 135 315z" fill="#FFCC29"/>
    <circle cx="450" cy="315" r="110" fill="#002776"/>
  </svg>
);

const UsaFlag: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1235 650" className={`w-5 h-4 ${className}`}>
    <rect width="1235" height="650" fill="#FFF"/>
    <path d="M0 0h1235v50H0zM0 100h1235v50H0zM0 200h1235v50H0zM0 300h1235v50H0zM0 400h1235v50H0zM0 500h1235v50H0zM0 600h1235v50H0z" fill="#B22234"/>
    <path d="M0 0h494v350H0z" fill="#3C3B6E"/>
  </svg>
);

// Language Switcher inline
const LanguageSwitcherComponent: React.FC = () => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language || 'pt';

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => changeLanguage('pt')}
        className={`p-1 rounded ${currentLang === 'pt' ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
        aria-label="Português"
      >
        <BrazilFlag />
      </button>
      <button
        onClick={() => changeLanguage('en')}
        className={`p-1 rounded ${currentLang === 'en' ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
        aria-label="English"
      >
        <UsaFlag />
      </button>
    </div>
  );
};

// Componente principal do Navbar
const NavbarNextJS: React.FC<NavbarProps> = ({ className = "" }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();

  // Estados
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scheduleDropdownOpen, setScheduleDropdownOpen] = useState(false);

  // Refs
  const scheduleButtonRef = useRef<HTMLButtonElement>(null);

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Navigation links
  const navLinks: NavLink[] = useMemo(() => [
    { name: t('navbar.home', 'Início'), href: '/', internal: true, isRoute: true },
    { name: t('navbar.services', 'Serviços'), href: '/servicos', internal: true, isRoute: true },
    { name: t('navbar.lenses', 'Lentes'), href: '/lentes', internal: true, isRoute: true },
    { name: t('navbar.about', 'Sobre'), href: '/sobre', internal: true, isRoute: true },
    { name: t('navbar.blog', 'Blog'), href: '/blog', internal: true, isRoute: true },
    { name: t('navbar.faq', 'FAQ'), href: '/faq', internal: true, isRoute: true },
    { name: t('navbar.podcast', 'Podcast'), href: '/podcast', internal: true, isRoute: true },
  ], [t]);

  // Handlers
  const handleExternalLink = useCallback((url: string, name: string) => {
    const confirmed = window.confirm(
      t('navbar.external_link_warning', `Você será redirecionado para ${name}. Continuar?`)
    );
    if (confirmed) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }, [t]);

  const handleWhatsApp = useCallback(() => {
    const message = encodeURIComponent('Olá! Gostaria de agendar uma consulta na Saraiva Vision.');
    const whatsappUrl = `https://wa.me/5511999999999?text=${message}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-lg py-2'
          : 'bg-white/90 backdrop-blur-sm border-b border-gray-200 py-3'
      } ${className}`}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between w-full">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link href="/" aria-label="Ir para página inicial">
              <LogoComponent />
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1" aria-label="Navegação principal">
            {navLinks.map((link, index) => (
              <motion.div
                key={link.name}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                {link.internal ? (
                  <Link
                    href={link.href}
                    className={`text-gray-700 hover:text-cyan-700 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      pathname === link.href ? 'text-cyan-700 bg-blue-50' : ''
                    }`}
                  >
                    {link.name}
                  </Link>
                ) : (
                  <button
                    onClick={() => handleExternalLink(link.href, link.name)}
                    className="text-gray-700 hover:text-cyan-700 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-1"
                  >
                    {link.name}
                    <ExternalLink size={14} />
                  </button>
                )}
              </motion.div>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <LanguageSwitcherComponent />

            {/* Schedule Button */}
            <ButtonComponent
              onClick={handleWhatsApp}
              className="flex items-center gap-2"
              aria-label="Agendar consulta via WhatsApp"
            >
              <Calendar size={18} />
              <span>{t('navbar.schedule', 'Agendar')}</span>
            </ButtonComponent>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <LanguageSwitcherComponent />
            <ButtonComponent
              variant="outline"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </ButtonComponent>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="md:hidden bg-white/95 backdrop-blur-md border-t max-h-[calc(100vh-80px)] overflow-y-auto"
          >
            <nav id="mobile-navigation" className="container mx-auto px-4 py-4 space-y-2">
              {navLinks.map((link) => (
                <div key={link.name}>
                  {link.internal ? (
                    <Link
                      href={link.href}
                      className={`block text-gray-700 hover:text-cyan-700 py-3 font-medium text-lg border-b border-gray-100 ${
                        pathname === link.href ? 'text-cyan-700' : ''
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {link.name}
                    </Link>
                  ) : (
                    <button
                      onClick={() => {
                        handleExternalLink(link.href, link.name);
                        setMobileMenuOpen(false);
                      }}
                      className="block w-full text-left text-gray-700 hover:text-cyan-700 py-3 font-medium text-lg border-b border-gray-100"
                    >
                      {link.name}
                    </button>
                  )}
                </div>
              ))}

              {/* Mobile Actions */}
              <div className="pt-4 space-y-3">
                <ButtonComponent
                  onClick={() => {
                    handleWhatsApp();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full justify-center gap-2"
                >
                  <MessageCircle size={18} />
                  <span>{t('navbar.schedule', 'Agendar Consulta')}</span>
                </ButtonComponent>
              </div>

            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default NavbarNextJS;