import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, X, Home, Stethoscope, Eye, FileText, Headphones, User, HelpCircle, FileCheck, BookOpenCheck, Droplets, Star, Zap } from 'lucide-react';
import { Button } from '../components/ui/button.jsx';
import Logo from '../components/Logo.jsx';
import ClinicClosedNotice from './ClinicClosedNotice.jsx';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock.js';
import { isSchedulingEnabled } from '../lib/clinicStatus.js';

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
    { name: t('navbar.dry_eye'), href: '/olho-seco', internal: true, icon: Droplets },
    { name: t('navbar.irpl'), href: '/luz-pulsada-irpl', internal: true, icon: Zap },
    { name: t('navbar.lenses'), href: '/lentes', internal: true, icon: Eye },
    { name: t('navbar.lens_wiki'), href: '/lentes/wiki', internal: true, icon: BookOpenCheck },
    { name: t('navbar.blog'), href: '/blog', internal: true, icon: FileText },
    { name: t('navbar.podcast'), href: '/podcast', internal: true, icon: Headphones },
    { name: t('navbar.reviews'), href: '/avaliacoes', internal: true, icon: Star },
    { name: t('navbar.about'), href: '/sobre', internal: true, icon: User },
    { name: t('navbar.plans'), href: '/planos', internal: true, icon: FileCheck },
    { name: t('navbar.faq'), href: '/faq', internal: true, icon: HelpCircle },
  ], [t]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 pointer-events-none ${isScrolled
        ? 'bg-white/95 backdrop-blur-sm shadow-md py-1 lg:py-2'
        : 'bg-white/90 backdrop-blur border-b border-slate-200/60 lg:bg-transparent lg:border-0 py-2 lg:py-3'
        }`}
    >
      <div className="container mx-auto px-3 lg:px-4 xl:px-6 pointer-events-auto overflow-x-hidden">
        <div className="flex items-center justify-between gap-2 lg:gap-3 xl:gap-4 w-full">
          {/* Logo - Brand Identity */}
          <div className="flex-shrink-0">
            <Link
              to="/"
              onClick={handleHomeClick}
              className="cursor-pointer hover:opacity-80 transition-opacity duration-200"
              aria-label={t('navbar.home_link_label')}
            >
              <Logo isWhite />
            </Link>
          </div>

          {/* Desktop Navigation - Text-only for space efficiency (icons only in CTAs per design guidelines) */}
          <nav
            className="hidden lg:flex flex-1 items-center justify-center flex-wrap gap-1 xl:gap-1.5 2xl:gap-2"
            aria-label={t('navbar.primary_navigation')}
          >
            {navLinks.map((link) => {
              const isActive = location.pathname === link.href;
              const isHomeLink = link.href === '/';

              const linkClasses = `group relative font-semibold transition-all duration-200 ease-out px-2 py-1 xl:px-3 xl:py-1.5 2xl:px-3.5 2xl:py-2 rounded-lg text-xs xl:text-sm 2xl:text-base whitespace-nowrap hover:scale-[1.03] active:scale-95 ${
                isActive
                  ? 'bg-gradient-to-br from-cyan-600 to-cyan-700 text-white border border-cyan-500'
                  : 'text-slate-800 hover:bg-cyan-600 hover:text-white border border-transparent hover:border-cyan-500'
              }`;

              return link.internal ? (
                <Link
                  key={link.name}
                  to={link.href}
                  onClick={isHomeLink ? handleHomeClick : undefined}
                  className={linkClasses}
                >
                  <span className="relative">
                    {link.name}
                    {!isActive && (
                      <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300"></span>
                    )}
                  </span>
                </Link>
              ) : (
                <a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClasses}
                >
                  <span className="relative">
                    {link.name}
                    {!isActive && (
                      <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300"></span>
                    )}
                  </span>
                </a>
              );
            })}
          </nav>

          <div className="hidden lg:flex items-center justify-end gap-2 xl:gap-3 flex-shrink-0">
            {isSchedulingEnabled() ? (
              <Button
                onClick={() => navigate('/agendamento')}
                className="flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 text-white font-bold shadow-md hover:shadow-lg transition-all duration-200 ease-out hover:scale-105 active:scale-95 px-3 py-2 xl:px-4 xl:py-2.5 2xl:px-5 2xl:py-3 rounded-lg border-2 border-cyan-500 hover:border-cyan-400 text-sm xl:text-base"
              >
                <span className="whitespace-nowrap">{t('navbar.schedule')}</span>
              </Button>
            ) : (
              <ClinicClosedNotice variant="compact" showAuthorLink={false} />
            )}
          </div>

          {/* Mobile/Tablet Menu Toggle */}
          <div className="lg:hidden flex items-center gap-2">
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

      {/* Mobile/Tablet Menu */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden bg-white border-t shadow-lg pointer-events-auto"
        >
          <nav className="container mx-auto px-4 py-3 sm:py-4 flex flex-col space-y-2 sm:space-y-3">
            {navLinks.map((link, index) => {
              const IconComponent = link.icon;
              const isActive = location.pathname === link.href;
              const isHomeLink = link.href === '/';

              return link.internal ? (
                <div key={link.name}>
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
                </div>
              ) : (
                <div key={link.name}>
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
                </div>
              );
            })}

            <div className="pt-2 sm:pt-3 flex flex-col gap-2">
              {isSchedulingEnabled() ? (
                <Button
                  onClick={() => {
                    navigate('/agendamento');
                    setTimeout(() => setMobileMenuOpen(false), 50);
                  }}
                  className="flex items-center justify-center gap-3 w-full py-3.5 sm:py-4 bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 text-base sm:text-lg font-bold"
                >
                  <span>{t('navbar.schedule_consultation')}</span>
                </Button>
              ) : (
                <ClinicClosedNotice variant="inline" />
              )}
            </div>
          </nav>
        </div>
      )}

    </header>
  );
};

export default Navbar;
