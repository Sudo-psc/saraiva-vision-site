import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Menu, X, Calendar, Home, Stethoscope, Eye, FileText, Headphones, User, HelpCircle, Phone, FileCheck } from 'lucide-react';
import { Button } from '../components/ui/button.jsx';
import Logo from '../components/Logo.jsx';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock.js';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  // Prevent double-scroll: lock body when mobile menu is open
  useBodyScrollLock(mobileMenuOpen);

  // Handle home navigation: scroll to top if already on homepage, navigate otherwise
  const handleHomeClick = (e) => {
    if (location.pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/');
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = useMemo(() => [
    { name: t('navbar.home'), href: '/', internal: true, icon: Home },
    { name: t('navbar.services'), href: '/servicos', internal: true, icon: Stethoscope },
    { name: t('navbar.lenses'), href: '/lentes', internal: true, icon: Eye },
    { name: t('navbar.blog'), href: '/blog', internal: true, icon: FileText },
    { name: t('navbar.podcast'), href: '/podcast', internal: true, icon: Headphones },
    { name: t('navbar.about'), href: '/sobre', internal: true, icon: User },
    { name: t('navbar.plans'), href: '/planos', internal: true, icon: FileCheck },
    { name: t('navbar.faq'), href: '/faq', internal: true, icon: HelpCircle },
  ], [t]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 pointer-events-none ${isScrolled
        ? 'bg-white/95 backdrop-blur-sm shadow-md py-2'
        : 'bg-white/90 backdrop-blur border-b border-slate-200/60 md:bg-transparent md:border-0 py-3'
        }`}
    >
      <div className="container mx-auto px-4 md:px-6 no-scrollbar-x pointer-events-auto">
        <div className="flex flex-wrap items-center justify-between gap-3 md:gap-4 lg:gap-6 w-full">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="ml-[6%] flex-shrink-0"
          >
            <Link
              to="/"
              onClick={handleHomeClick}
              className="cursor-pointer hover:opacity-80 transition-opacity duration-200"
              aria-label={t('navbar.home_link_label')}
            >
              <Logo isWhite />
            </Link>
          </motion.div>

          {/* Desktop Navigation - Enhanced hover effects with cyan theme */}
          <nav
            className="hidden md:flex flex-1 items-center justify-center flex-wrap gap-1.5 lg:gap-2 xl:gap-3"
            aria-label={t('navbar.primary_navigation')}
          >
            {navLinks.map((link) => {
              const IconComponent = link.icon;
              const linkClasses = "group relative text-slate-700 hover:text-white font-semibold transition-all duration-300 ease-out px-3 py-1.5 lg:px-4 lg:py-2 rounded-xl flex items-center gap-2 text-[0.9rem] md:text-[0.95rem] lg:text-[1rem] xl:text-[1.05rem] hover:scale-[1.03] xl:hover:scale-105 active:scale-95 hover:shadow-lg active:shadow-sm bg-gradient-to-br from-slate-100 to-slate-200 hover:from-cyan-600 hover:to-cyan-700 border border-slate-300 hover:border-cyan-500";

              // Special handling for home button: scroll to top if already on homepage
              const isHomeLink = link.href === '/';

              return link.internal ? (
                <Link
                  key={link.name}
                  to={link.href}
                  onClick={isHomeLink ? handleHomeClick : undefined}
                  className={`${linkClasses} min-w-[7.5rem] justify-center lg:justify-start`}
                >
                  <IconComponent size={15} className="text-slate-600 group-hover:text-white transition-colors duration-300 md:w-4 md:h-4 lg:w-[17px] lg:h-[17px]" />
                  <span className="relative">
                    {link.name}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300"></span>
                  </span>
                </Link>
              ) : (
                <a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${linkClasses} min-w-[7.5rem] justify-center lg:justify-start`}
                >
                  <IconComponent size={15} className="text-slate-600 group-hover:text-white transition-colors duration-300 md:w-4 md:h-4 lg:w-[17px] lg:h-[17px]" />
                  <span className="relative">
                    {link.name}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300"></span>
                  </span>
                </a>
              );
            })}
          </nav>

          <div className="hidden md:flex items-center justify-end gap-2 lg:gap-3 xl:gap-4 mr-[6%] flex-shrink-0">
            <Button
              variant="outline"
              onClick={() => navigate('/contato')}
              className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-xl border-cyan-500 text-cyan-700 hover:text-white hover:bg-cyan-600 hover:border-cyan-600 transition-colors duration-300"
            >
              <Phone size={16} className="md:w-[18px] md:h-[18px]" />
              <span className="text-sm md:text-[0.95rem]">{t('navbar.contact')}</span>
            </Button>
            <Button
              onClick={() => navigate('/agendamento')}
              className="flex items-center gap-2 scale-[0.95] md:scale-100 lg:scale-105 origin-center bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 ease-out hover:scale-105 lg:hover:scale-110 active:scale-95 px-4 py-2 md:px-5 md:py-2.5 rounded-xl border-2 border-cyan-500 hover:border-cyan-400"
            >
              <Calendar size={16} className="animate-pulse md:w-[18px] md:h-[18px] lg:w-5 lg:h-5" />
              <span className="text-sm md:text-[0.95rem] lg:text-base">{t('navbar.schedule')}</span>
            </Button>
          </div>

          <div className="md:hidden flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="!h-12 !w-12 rounded-2xl border-blue-500 text-blue-700 bg-white shadow-3d hover:shadow-3d-hover"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? t('navbar.close_menu') : t('navbar.open_menu')}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-primary-navigation"
            >
              {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </Button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="md:hidden bg-white border-t shadow-lg pointer-events-auto"
        >
          <nav className="container mx-auto px-4 py-3 sm:py-4 flex flex-col space-y-2 sm:space-y-3">
            {navLinks.map((link, index) => {
              const IconComponent = link.icon;
              const isHomeLink = link.href === '/';

              return link.internal ? (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                >
                  <Link
                    to={link.href}
                    onClick={(e) => {
                      if (isHomeLink) {
                        handleHomeClick(e);
                      }
                      // Close menu after a small delay to ensure navigation is processed
                      setTimeout(() => setMobileMenuOpen(false), 50);
                    }}
                    className="text-slate-800 hover:text-cyan-600 hover:bg-cyan-50 active:bg-cyan-100 py-2.5 sm:py-3 px-3 rounded-lg font-medium text-base sm:text-lg flex items-center gap-3 transition-all duration-200"
                  >
                    <IconComponent size={18} className="text-slate-600 flex-shrink-0 sm:w-5 sm:h-5" />
                    <span className="flex-1">{link.name}</span>
                  </Link>
                </motion.div>
              ) : (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                >
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setTimeout(() => setMobileMenuOpen(false), 50)}
                    className="text-slate-800 hover:text-cyan-600 hover:bg-cyan-50 active:bg-cyan-100 py-2.5 sm:py-3 px-3 rounded-lg font-medium text-base sm:text-lg flex items-center gap-3 transition-all duration-200"
                  >
                    <IconComponent size={18} className="text-slate-600 flex-shrink-0 sm:w-5 sm:h-5" />
                    <span className="flex-1">{link.name}</span>
                  </a>
                </motion.div>
              );
            })}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: navLinks.length * 0.05, duration: 0.3 }}
              className="pt-2 sm:pt-3"
            >
              <Button
                onClick={() => {
                  navigate('/agendamento');
                  setTimeout(() => setMobileMenuOpen(false), 50);
                }}
                className="flex items-center gap-2 w-full justify-center py-3 sm:py-3.5 bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800"
              >
                <Calendar size={18} className="sm:w-5 sm:h-5" />
                <span className="text-base sm:text-lg">{t('navbar.schedule_consultation')}</span>
              </Button>
            </motion.div>
          </nav>
        </motion.div>
      )}


    </header>
  );
};

export default Navbar;
