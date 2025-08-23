import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Menu, X, MessageCircle, Globe, ChevronDown, Calendar } from 'lucide-react';
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
  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > PERFORMANCE.SCROLL_THRESHOLD);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = useMemo(() => [
    { name: t('navbar.home'), href: '#home', internal: true },
    { name: t('navbar.services'), href: '#services', internal: true },
    { name: t('navbar.lenses'), href: '/lentes', internal: true, isRoute: true },
    { name: t('navbar.about'), href: '#about', internal: true },
    { name: t('navbar.testimonials'), href: '#testimonials', internal: true },
    { name: t('navbar.contact'), href: '#contact', internal: true },
    { name: 'Instagram', href: 'https://www.instagram.com/saraiva_vision/', internal: false },
  ], [t]);

  const handleNavClick = useCallback((e, link) => {
    setMobileMenuOpen(false);
    if (link.internal) {
      e.preventDefault();
      if (link.isRoute) {
        navigate(link.href);
      } else if (isHomePage) {
        const element = document.querySelector(link.href);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        navigate('/' + link.href);
      }
    }
  }, [isHomePage, navigate]);

  const handleAgendarOnlineClick = useCallback(() => {
    window.open(clinicInfo.onlineSchedulingUrl, '_blank', 'noopener,noreferrer');
  }, []);

  const handleAgendarWhatsappClick = useCallback(() => {
    window.open(whatsappLink, '_blank', 'noopener,noreferrer');
  }, [whatsappLink]);

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
            <Link to="/"><Logo /></Link>
          </motion.div>

          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link, index) => (
              link.internal ? (
                <motion.a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link)}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="text-slate-700 hover:text-blue-600 font-medium transition-colors cursor-pointer px-4 py-2 rounded-lg hover:bg-slate-100"
                >
                  {link.name}
                </motion.a>
              ) : (
                <motion.a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="text-slate-700 hover:text-blue-600 font-medium transition-colors cursor-pointer px-4 py-2 rounded-lg hover:bg-slate-100"
                >
                  {link.name}
                </motion.a>
              )
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <LanguageSwitcher />
            <div className="relative">
              <Button
                onClick={() => setScheduleDropdownOpen(!scheduleDropdownOpen)}
                className="flex items-center gap-2"
                onBlur={() => setTimeout(() => setScheduleDropdownOpen(false), 150)}
              >
                <Calendar size={18} />
                <span>{t('navbar.schedule')}</span>
                <ChevronDown size={16} />
              </Button>
              {scheduleDropdownOpen && (
                <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="p-2">
                    <button
                      onClick={handleAgendarOnlineClick}
                      className="w-full flex items-center gap-3 p-3 hover:bg-blue-50 rounded-lg transition-colors text-left"
                    >
                      <Globe size={20} className="text-blue-600" />
                      <div>
                        <div className="font-medium text-gray-900">{t('contact.online_scheduling_title')}</div>
                        <div className="text-xs text-gray-500">{t('contact.online_scheduling_desc')}</div>
                      </div>
                    </button>
                    <button
                      onClick={handleAgendarWhatsappClick}
                      className="w-full flex items-center gap-3 p-3 hover:bg-green-50 rounded-lg transition-colors text-left"
                    >
                      <MessageCircle size={20} className="text-green-600" />
                      <div>
                        <div className="font-medium text-gray-900">WhatsApp</div>
                        <div className="text-xs text-gray-500">Conversa direta com a equipe</div>
                      </div>
                    </button>
                    <button
                      onClick={handleAgendarContatoClick}
                      className="w-full flex items-center gap-3 p-3 hover:bg-purple-50 rounded-lg transition-colors text-left"
                    >
                      <Calendar size={20} className="text-purple-600" />
                      <div>
                        <div className="font-medium text-gray-900">Mais Opções</div>
                        <div className="text-xs text-gray-500">Telefone, e-mail e outras formas</div>
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
            <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
              {navLinks.map((link) => (
                link.internal ? (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link)}
                    className="text-gray-700 hover:text-blue-600 py-2 font-medium cursor-pointer text-lg"
                  >
                    {link.name}
                  </a>
                ) : (
                  <a
                    key={link.name}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-700 hover:text-blue-600 py-2 font-medium cursor-pointer text-lg"
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
                  <span>WhatsApp</span>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;