import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Menu, X, MessageCircle, Globe, ChevronDown, Calendar, Headphones } from 'lucide-react';
import { clinicInfo } from '@/lib/clinicInfo';
import { Button } from '@/components/ui/button';
import Logo from '@/components/Logo';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useWhatsApp } from '@/hooks/useWhatsApp';
import { PERFORMANCE } from '@/lib/constants';

const Navbar = () => {
  const { t } = useTranslation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scheduleDropdownOpen, setScheduleDropdownOpen] = useState(false);
  const { generateWhatsAppUrl, openFloatingCTA } = useWhatsApp();
  const whatsappLink = generateWhatsAppUrl();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > PERFORMANCE.SCROLL_THRESHOLD);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = useMemo(() => [
    { name: t('navbar.home'), href: '/', internal: true, isRoute: true },
    { name: t('navbar.services'), href: '/servicos', internal: true, isRoute: true },
    { name: t('navbar.lenses'), href: '/lentes', internal: true, isRoute: true },
    { name: t('navbar.about'), href: '/sobre', internal: true, isRoute: true },
    { name: t('navbar.testimonials'), href: '/depoimentos', internal: true, isRoute: true },
    { name: t('navbar.contact'), href: '/contato', internal: true, isRoute: true },
    { name: 'Instagram', href: 'https://www.instagram.com/saraiva_vision/', internal: false },
  ], [t]);

  const handleNavClick = useCallback((e, link) => {
    setMobileMenuOpen(false);
    if (link.internal) {
      e.preventDefault();
      navigate(link.href);
    }
  }, [navigate]);

  const safeOpen = useCallback((url) => {
    // Validate URL before opening
    if (!url || url.trim() === '') {
      console.error('Invalid URL provided to safeOpen:', url);
      return;
    }

    try {
      // Ensure URL is properly formatted
      const validUrl = url.startsWith('http') ? url : `https://${url}`;
      const win = window.open(validUrl, '_blank', 'noopener,noreferrer');

      // Check if popup was blocked
      if (!win || win.closed || typeof win.closed === 'undefined') {
        // Fallback: redirect in same tab
        window.location.href = validUrl;
      }
    } catch (e) {
      console.error('Error opening URL:', url, e);
      // Final fallback: try direct navigation
      try {
        window.location.href = url.startsWith('http') ? url : `https://${url}`;
      } catch (fallbackError) {
        console.error('Fallback navigation also failed:', fallbackError);
      }
    }
  }, []);

  const handleAgendarOnlineClick = useCallback(() => {
    // Validate the scheduling URL exists
    if (!clinicInfo.onlineSchedulingUrl) {
      console.error('Online scheduling URL not configured');
      alert(t('navbar.scheduling_error', 'Serviço indisponível. Use WhatsApp ou ligue para (33) 99860-1427'));
      return;
    }

    safeOpen(clinicInfo.onlineSchedulingUrl);
  }, [safeOpen, t]);

  const handleAgendarWhatsappClick = useCallback(() => {
    safeOpen(whatsappLink);
  }, [whatsappLink, safeOpen]);

  const handleAgendarContatoClick = openFloatingCTA;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-header-gradient shadow-md py-2' : 'bg-transparent py-4'
        }`}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link to="/" aria-label={t('navbar.home_link_label', 'Ir para a página inicial')}><Logo /></Link>
          </motion.div>

          <nav className="hidden md:flex items-center space-x-1" aria-label={t('navbar.primary_navigation', 'Navegação principal')}>
            {navLinks.map((link, index) => (
              link.internal ? (
                <motion.a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link)}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="text-slate-800 hover:text-blue-700 font-medium transition-colors cursor-pointer px-4 py-2 rounded-lg hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                  tabIndex="0"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleNavClick(e, link);
                    }
                  }}
                >
                  {link.name}
                </motion.a>
              ) : (
                <motion.a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    const confirmed = window.confirm(
                      t('navbar.external_link_warning', `Você será redirecionado para ${link.name}. Continuar?`)
                    );
                    if (confirmed) {
                      safeOpen(link.href);
                    }
                  }}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="text-slate-800 hover:text-blue-700 font-medium transition-colors cursor-pointer px-4 py-2 rounded-lg hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                  tabIndex="0"
                  title={t('navbar.external_link_title', `Abre em nova aba: ${link.name}`)}
                >
                  {link.name}
                  <span className="ml-1 text-xs text-gray-500" aria-label="link externo">↗</span>
                </motion.a>
              )
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <LanguageSwitcher />

            {/* Podcast Icon - Link externo */}
            <a
              href="https://shorturl.at/X0S4m"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-slate-700 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
              aria-label={t('navbar.podcast', 'Podcast')}
            >
              <Headphones size={20} />
            </a>

            <div className="relative">
              <Button
                onClick={() => setScheduleDropdownOpen(!scheduleDropdownOpen)}
                className="flex items-center gap-2"
                onBlur={() => setTimeout(() => setScheduleDropdownOpen(false), 150)}
                aria-haspopup="menu"
                aria-expanded={scheduleDropdownOpen}
                aria-controls="navbar-schedule-menu"
              >
                <Calendar size={18} />
                <span>{t('navbar.schedule')}</span>
                <ChevronDown size={16} />
              </Button>
              {scheduleDropdownOpen && (
                <div id="navbar-schedule-menu" className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="p-2">
                    <button
                      onClick={handleAgendarOnlineClick}
                      className="w-full flex items-center gap-3 p-3 hover:bg-blue-50 rounded-lg transition-colors text-left focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-inset"
                      tabIndex="0"
                    >
                      <Globe size={20} className="text-blue-600" />
                      <div>
                        <div className="font-medium text-gray-900">{t('contact.online_scheduling_title')}</div>
                        <div className="text-xs text-gray-500">{t('contact.online_scheduling_desc')}</div>
                      </div>
                    </button>
                    <button
                      onClick={handleAgendarWhatsappClick}
                      className="w-full flex items-center gap-3 p-3 hover:bg-green-50 rounded-lg transition-colors text-left focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-inset"
                      tabIndex="0"
                    >
                      <MessageCircle size={20} className="text-green-600" />
                      <div>
                        <div className="font-medium text-gray-900">{t('navbar.whatsapp')}</div>
                        <div className="text-xs text-gray-500">{t('navbar.whatsapp_direct')}</div>
                      </div>
                    </button>
                    <button
                      onClick={handleAgendarContatoClick}
                      className="w-full flex items-center gap-3 p-3 hover:bg-purple-50 rounded-lg transition-colors text-left focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-inset"
                      tabIndex="0"
                    >
                      <Calendar size={20} className="text-purple-600" />
                      <div>
                        <div className="font-medium text-gray-900">{t('navbar.more_options')}</div>
                        <div className="text-xs text-gray-500">{t('navbar.more_options_desc')}</div>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="md:hidden flex items-center gap-2">
            <LanguageSwitcher />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? t('navbar.close_menu') : t('navbar.open_menu')}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="md:hidden bg-white/95 backdrop-blur-lg border-t"
          >
            <nav className="container mx-auto px-4 py-4 flex flex-col space-y-4" aria-label={t('navbar.mobile_navigation', 'Navegação móvel')}>
              {navLinks.map((link) => (
                link.internal ? (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link)}
                    className="text-slate-800 hover:text-blue-700 py-2 font-medium cursor-pointer text-lg"
                  >
                    {link.name}
                  </a>
                ) : (
                  <a
                    key={link.name}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-800 hover:text-blue-700 py-2 font-medium cursor-pointer text-lg"
                  >
                    {link.name}
                  </a>
                )
              ))}
              <div className="space-y-2 mt-4">
                <Button onClick={() => {
                  handleAgendarOnlineClick();
                  setMobileMenuOpen(false);
                }} className="flex items-center gap-2 w-full justify-center" size="lg">
                  <Globe size={18} />
                  <span>{t('contact.online_scheduling_title')}</span>
                </Button>
                <Button onClick={() => {
                  handleAgendarWhatsappClick();
                  setMobileMenuOpen(false);
                }} variant="outline" className="flex items-center gap-2 w-full justify-center">
                  <MessageCircle size={18} />
                  <span>{t('navbar.whatsapp')}</span>
                </Button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
