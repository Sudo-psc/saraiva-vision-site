import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Menu, X, Calendar, Home, Stethoscope, Eye, FileText, Headphones, User, HelpCircle, Phone, FileCheck, BookOpenCheck } from 'lucide-react';
import { Button } from '../components/ui/button.jsx';
import Logo from '../components/Logo.jsx';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock.js';
import { clinicInfo } from '../lib/clinicInfo.js';

/**
 * Enhanced Navbar Component - UX Optimized for Healthcare Platform
 *
 * Design Principles:
 * - Modern cyan palette (#06B6D4) for technology-forward brand identity
 * - Icons restored for better visual recognition and accessibility
 * - Clear active state indication for wayfinding
 * - Minimum 16px font size for accessibility (WCAG 2.1 AA)
 * - High contrast (slate-900) for readability
 * - Sticky header with shrink effect on scroll
 * - Mobile-first with glass morphism menu
 * - Improved button text layout with better spacing
 *
 * Color Philosophy:
 * Cyan was chosen to maintain the brand's technology-forward,
 * innovative positioning while still conveying medical professionalism.
 * The vibrant cyan (#06B6D4) balances modernity with trust.
 *
 * Icon Philosophy:
 * Icons provide visual anchors for navigation, helping users quickly
 * identify sections. Combined with text labels for clarity.
 */
const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  // UX Enhancement: Prevent double-scroll by locking body when mobile menu is open
  useBodyScrollLock(mobileMenuOpen);

  // UX Enhancement: Handle home navigation with smooth scroll for better UX
  const handleHomeClick = (e) => {
    if (location.pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/');
    }
  };

  // UX Enhancement: Sticky navbar with shrink effect for better screen real estate
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Navigation structure with icons for better visual recognition
  const navLinks = useMemo(() => [
    { name: t('navbar.home'), href: '/', internal: true, icon: Home },
    { name: t('navbar.services'), href: '/servicos', internal: true, icon: Stethoscope },
    { name: t('navbar.lenses'), href: '/lentes', internal: true, icon: Eye },
    { name: t('navbar.lens_wiki'), href: '/lentes/wiki', internal: true, icon: BookOpenCheck },
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
          {/* Logo - Brand Identity */}
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

          {/* Desktop Navigation - With icons for visual recognition */}
          <nav
            className="hidden md:flex flex-1 items-center justify-center flex-wrap gap-1.5 lg:gap-2 xl:gap-3"
            aria-label={t('navbar.primary_navigation')}
          >
            {navLinks.map((link) => {
              const IconComponent = link.icon;
              // UX Enhancement: Active page indicator for wayfinding
              const isActive = location.pathname === link.href;
              const isHomeLink = link.href === '/';

              // UX Color Palette: Cyan for modern, technology-forward brand identity
              const linkClasses = `group relative font-semibold transition-all duration-300 ease-out px-3 py-1.5 lg:px-4 lg:py-2 rounded-xl text-base lg:text-[1.05rem] hover:scale-[1.03] xl:hover:scale-105 active:scale-95 hover:shadow-lg active:shadow-sm ${
                isActive
                  ? 'bg-gradient-to-br from-cyan-600 to-cyan-700 text-white border-2 border-cyan-500'
                  : 'text-slate-900 bg-gradient-to-br from-slate-100 to-slate-200 hover:from-cyan-600 hover:to-cyan-700 hover:text-white border border-slate-300 hover:border-cyan-500'
              }`;

              return link.internal ? (
                <Link
                  key={link.name}
                  to={link.href}
                  onClick={isHomeLink ? handleHomeClick : undefined}
                  className={`${linkClasses} min-w-[7.5rem] flex items-center justify-center gap-2`}
                >
                  <IconComponent
                    size={16}
                    className={`flex-shrink-0 transition-colors duration-300 ${
                      isActive ? 'text-white' : 'text-slate-600 group-hover:text-white'
                    }`}
                  />
                  <span className="relative">
                    {link.name}
                    {/* UX Enhancement: Animated underline on hover for feedback */}
                    {!isActive && (
                      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300"></span>
                    )}
                  </span>
                </Link>
              ) : (
                <a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${linkClasses} min-w-[7.5rem] flex items-center justify-center gap-2`}
                >
                  <IconComponent
                    size={16}
                    className={`flex-shrink-0 transition-colors duration-300 ${
                      isActive ? 'text-white' : 'text-slate-600 group-hover:text-white'
                    }`}
                  />
                  <span className="relative">
                    {link.name}
                    {!isActive && (
                      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300"></span>
                    )}
                  </span>
                </a>
              );
            })}
          </nav>

          {/* CTAs - Improved layout with better text spacing */}
          <div className="hidden md:flex items-center justify-end gap-2 lg:gap-3 xl:gap-4 mr-[6%] flex-shrink-0">
            {/* Secondary CTA - WhatsApp Contact */}
            <a
              href={clinicInfo.whatsapp24h}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:flex items-center gap-2.5 px-5 py-2.5 rounded-xl border-2 border-cyan-500 text-cyan-700 hover:text-white hover:bg-cyan-600 hover:border-cyan-600 transition-colors duration-300 text-base font-semibold bg-white hover:shadow-lg"
              aria-label={t('navbar.contact')}
            >
              <Phone size={18} className="flex-shrink-0" />
              <span className="whitespace-nowrap">{t('navbar.contact')}</span>
            </a>

            {/* Primary CTA - Prominent scheduling button with improved layout */}
            <Button
              onClick={() => navigate('/agendamento')}
              className="flex items-center gap-2.5 scale-[0.95] md:scale-100 lg:scale-105 origin-center bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300 ease-out hover:scale-105 lg:hover:scale-110 active:scale-95 px-5 py-2.5 md:px-6 md:py-3 rounded-xl border-2 border-cyan-500 hover:border-cyan-400 text-base lg:text-lg"
            >
              <Calendar size={20} className="animate-pulse flex-shrink-0" />
              <span className="whitespace-nowrap">{t('navbar.schedule')}</span>
            </Button>
          </div>

          {/* Mobile Menu Toggle - Cyan theme */}
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

      {/* Mobile Menu - Full-height with glass morphism */}
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
              const isActive = location.pathname === link.href;
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
                      setTimeout(() => setMobileMenuOpen(false), 50);
                    }}
                    className={`py-3 sm:py-3.5 px-4 rounded-lg font-medium text-base sm:text-lg flex items-center gap-3 transition-all duration-200 ${
                      isActive
                        ? 'text-white bg-cyan-600 font-semibold'
                        : 'text-slate-900 hover:text-cyan-600 hover:bg-cyan-50 active:bg-cyan-100'
                    }`}
                  >
                    <IconComponent size={20} className="flex-shrink-0" />
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
                    className="text-slate-900 hover:text-cyan-600 hover:bg-cyan-50 active:bg-cyan-100 py-3 sm:py-3.5 px-4 rounded-lg font-medium text-base sm:text-lg flex items-center gap-3 transition-all duration-200"
                  >
                    <IconComponent size={20} className="flex-shrink-0" />
                    <span className="flex-1">{link.name}</span>
                  </a>
                </motion.div>
              );
            })}

            {/* Mobile CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: navLinks.length * 0.05, duration: 0.3 }}
              className="pt-2 sm:pt-3 flex flex-col gap-2"
            >
              {/* WhatsApp Contact Button */}
              <a
                href={clinicInfo.whatsapp24h}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setTimeout(() => setMobileMenuOpen(false), 50)}
                className="flex items-center justify-center gap-3 w-full py-3.5 sm:py-4 border-2 border-cyan-600 text-cyan-700 font-bold rounded-lg hover:bg-cyan-50 transition-colors duration-200 text-base sm:text-lg"
              >
                <Phone size={22} />
                <span>{t('navbar.contact')}</span>
              </a>

              {/* Schedule Button */}
              <Button
                onClick={() => {
                  navigate('/agendamento');
                  setTimeout(() => setMobileMenuOpen(false), 50);
                }}
                className="flex items-center justify-center gap-3 w-full py-3.5 sm:py-4 bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 text-base sm:text-lg font-bold"
              >
                <Calendar size={22} />
                <span>{t('navbar.schedule_consultation')}</span>
              </Button>
            </motion.div>
          </nav>
        </motion.div>
      )}

    </header>
  );
};

export default Navbar;
