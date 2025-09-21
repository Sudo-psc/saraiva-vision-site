import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Menu,
  X,
  Calendar,
  Headphones,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Logo from '@/components/Logo';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { safeOpenUrl } from '@/utils/safeNavigation';

interface NavLink {
  name: string;
  href: string;
  internal: boolean;
  isRoute?: boolean;
}

const Navbar: React.FC = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scheduleDropdownOpen, setScheduleDropdownOpen] = useState(false);
  const scheduleButtonRef = useRef<HTMLButtonElement>(null);

  // Prevent double-scroll: lock body when mobile menu is open
  useBodyScrollLock(mobileMenuOpen);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50); // SCROLL_THRESHOLD
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks: NavLink[] = useMemo(() => [
    { name: t('navbar.home', 'Home'), href: '/', internal: true, isRoute: true },
    { name: t('navbar.services', 'Serviços'), href: '/servicos', internal: true, isRoute: true },
    { name: t('navbar.lenses', 'Lentes'), href: '/lentes', internal: true, isRoute: true },
    { name: t('navbar.about', 'Sobre'), href: '/sobre', internal: true, isRoute: true },
    { name: t('navbar.testimonials', 'Depoimentos'), href: '/depoimentos', internal: true, isRoute: true },
    { name: t('navbar.blog', 'Blog'), href: '/blog', internal: true, isRoute: true },
    { name: t('navbar.faq', 'FAQ'), href: '/faq', internal: true, isRoute: true },
    { name: t('navbar.contact', 'Contato'), href: '/contato', internal: true, isRoute: true },
    { name: 'Instagram', href: 'https://www.instagram.com/saraiva_vision/', internal: false },
  ], [t]);

  const handleNavClick = useCallback((e: React.MouseEvent, link: NavLink) => {
    setMobileMenuOpen(false);
    if (link.internal && link.isRoute) {
      e.preventDefault();
      router.push(link.href);
    } else if (!link.internal) {
      e.preventDefault();
      const confirmed = window.confirm(
        t('navbar.external_link_warning', `Você será redirecionado para ${link.name}. Continuar?`)
      );
      if (confirmed) {
        safeOpenUrl(link.href);
      }
    }
  }, [router, t]);

  const handleScheduleClick = useCallback(() => {
    // Placeholder for schedule functionality
    // You can implement a modal or redirect to booking page
    console.log('Schedule clicked');
  }, []);

  const isActiveLink = (href: string): boolean => {
    return pathname === href;
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-md py-2'
          : 'bg-white/90 backdrop-blur border-b border-slate-200/60 md:bg-transparent md:border-0 py-3'
      }`}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between w-full">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link href="/" aria-label={t('navbar.home_link_label', 'Ir para a página inicial')}>
              <Logo />
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <nav
            className="hidden md:flex items-center space-x-1"
            aria-label={t('navbar.primary_navigation', 'Navegação principal')}
          >
            {navLinks.map((link, index) => (
              <motion.div
                key={link.name}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                {link.internal && link.isRoute ? (
                  <Link
                    href={link.href}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      isActiveLink(link.href)
                        ? 'text-blue-700 bg-blue-50'
                        : 'text-slate-800 hover:text-blue-700 hover:bg-slate-100'
                    }`}
                  >
                    {link.name}
                  </Link>
                ) : (
                  <button
                    onClick={(e) => handleNavClick(e, link)}
                    className="text-slate-800 hover:text-blue-700 font-medium transition-colors cursor-pointer px-4 py-2 rounded-lg hover:bg-slate-100 flex items-center"
                    title={t('navbar.external_link_title', `Abre em nova aba: ${link.name}`)}
                  >
                    {link.name}
                    <span className="ml-1 text-xs text-gray-500" aria-label="link externo">↗</span>
                  </button>
                )}
              </motion.div>
            ))}
          </nav>

          {/* Desktop Right Section */}
          <div className="hidden md:flex items-center gap-4">
            <LanguageSwitcher />

            {/* Podcast Icon */}
            <Link
              href="/podcast"
              className="p-2 text-slate-700 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
              aria-label={t('navbar.podcast', 'Podcast')}
            >
              <Headphones size={20} />
            </Link>

            {/* Schedule Button */}
            <Button
              ref={scheduleButtonRef}
              onClick={handleScheduleClick}
              className="flex items-center gap-2"
            >
              <Calendar size={18} />
              <span>{t('navbar.schedule', 'Agendar')}</span>
            </Button>

            {/* Admin Link (conditional) */}
            {/* Add authentication check here */}
            <Link
              href="/admin"
              className="p-2 text-slate-700 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
              aria-label="Admin"
            >
              <User size={20} />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <LanguageSwitcher />
            <Button
              variant="outline"
              size="icon"
              className="!h-12 !w-12 rounded-2xl border-blue-500 text-blue-700 bg-white shadow-lg hover:shadow-xl"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? t('navbar.close_menu', 'Fechar menu') : t('navbar.open_menu', 'Abrir menu')}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </Button>
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
            className="md:hidden bg-white/95 backdrop-blur-lg border-t max-h-[calc(100dvh-80px)] overflow-y-auto"
          >
            <nav className="container mx-auto px-4 py-4 flex flex-col space-y-4">
              {navLinks.map((link) => (
                <div key={link.name}>
                  {link.internal && link.isRoute ? (
                    <Link
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`block py-2 font-medium text-lg ${
                        isActiveLink(link.href) ? 'text-blue-700' : 'text-slate-800 hover:text-blue-700'
                      }`}
                    >
                      {link.name}
                    </Link>
                  ) : (
                    <button
                      onClick={(e) => handleNavClick(e, link)}
                      className="block text-left w-full text-slate-800 hover:text-blue-700 py-2 font-medium text-lg"
                    >
                      {link.name}
                    </button>
                  )}
                </div>
              ))}

              {/* Mobile Schedule Button */}
              <div className="pt-4 border-t">
                <Button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleScheduleClick();
                  }}
                  className="flex items-center gap-2 w-full justify-center"
                  size="lg"
                >
                  <Calendar size={18} />
                  <span>{t('navbar.schedule', 'Agendar Consulta')}</span>
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