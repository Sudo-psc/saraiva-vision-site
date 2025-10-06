import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Menu, X, Calendar, Home, Stethoscope, Eye, FileText, Headphones, User, Star, HelpCircle, Phone } from 'lucide-react';
import { Button } from '../components/ui/button.jsx';
import Logo from '../components/Logo.jsx';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock.js';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Prevent double-scroll: lock body when mobile menu is open
  useBodyScrollLock(mobileMenuOpen);

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
    { name: t('navbar.faq'), href: '/faq', internal: true, icon: HelpCircle },
  ], [t]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
        ? 'bg-white/95 backdrop-blur-sm shadow-md py-2'
        : 'bg-white/90 backdrop-blur border-b border-slate-200/60 md:bg-transparent md:border-0 py-3'
        }`}
    >
      <div className="container mx-auto px-4 md:px-6 no-scrollbar-x">
        <div className="flex items-center justify-between w-full">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="ml-[6%]"
          >
            <Link to="/" aria-label={t('navbar.home_link_label')}><Logo isWhite /></Link>
          </motion.div>

          {/* Desktop Navigation - 20% larger text */}
          <nav className="hidden md:flex items-center space-x-1" aria-label={t('navbar.primary_navigation')}>
            {navLinks.map((link) => {
              const IconComponent = link.icon;
              return link.internal ? (
                <Link
                  key={link.name}
                  to={link.href}
                  className="text-slate-800 hover:text-blue-700 font-medium transition-colors px-4 py-2 rounded-lg hover:bg-slate-100 flex items-center gap-2 text-[1.2rem]"
                >
                  <IconComponent size={19} className="text-slate-600" />
                  {link.name}
                </Link>
              ) : (
                <a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-800 hover:text-blue-700 font-medium transition-colors px-4 py-2 rounded-lg hover:bg-slate-100 flex items-center gap-2 text-[1.2rem]"
                >
                  <IconComponent size={19} className="text-slate-600" />
                  {link.name}
                </a>
              );
            })}
          </nav>

           <div className="hidden md:flex items-center gap-4 mr-[6%]">
             <Button
               onClick={() => navigate('/agendamento')}
               className="flex items-center gap-2 scale-[1.2] origin-center"
             >
               <Calendar size={20} />
               <span>{t('navbar.schedule')}</span>
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
        <div className="md:hidden bg-white border-t">
          <nav className="container mx-auto px-4 py-4 flex flex-col space-y-4">
            {navLinks.map((link) => {
              const IconComponent = link.icon;
              return link.internal ? (
                <Link
                  key={link.name}
                  to={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-slate-800 hover:text-blue-700 py-2 font-medium text-lg flex items-center gap-3"
                >
                  <IconComponent size={18} className="text-slate-600" />
                  {link.name}
                </Link>
              ) : (
                <a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-slate-800 hover:text-blue-700 py-2 font-medium text-lg flex items-center gap-3"
                >
                  <IconComponent size={18} className="text-slate-600" />
                  {link.name}
                </a>
              );
            })}
            <div className="pt-4">
              <Button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/agendamento');
                }}
                className="flex items-center gap-2 w-full justify-center"
              >
                <Calendar size={18} />
                <span>{t('navbar.schedule_consultation')}</span>
              </Button>
            </div>
          </nav>
        </div>
      )}


    </header>
  );
};

export default Navbar;
