import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Menu, X, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Logo from '@/components/Logo';
import LanguageSwitcher from '@/components/LanguageSwitcher';

const Navbar = () => {
  const { t } = useTranslation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const whatsappNumber = "5533998601427";
  const whatsappLink = `https://wa.me/${whatsappNumber}`;
  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: t('navbar.home'), href: '#home', internal: true },
    { name: t('navbar.services'), href: '#services', internal: true },
    { name: t('navbar.about'), href: '#about', internal: true },
    { name: t('navbar.testimonials'), href: '#testimonials', internal: true },
    { name: t('navbar.contact'), href: '#contact', internal: true },
    { name: t('navbar.blog'), href: 'https://blog.saraivavision.com.br', internal: false },
  ];

  const handleNavClick = (e, link) => {
    setMobileMenuOpen(false);
    if (link.internal) {
      e.preventDefault();
      if (isHomePage) {
        const element = document.querySelector(link.href);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        navigate('/' + link.href);
      }
    }
  };

  const handleAgendarClick = () => {
    window.open(whatsappLink, '_blank', 'noopener,noreferrer');
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-header-gradient shadow-md py-2' : 'bg-transparent py-4'
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
            <Button onClick={handleAgendarClick} className="flex items-center gap-2">
              <MessageCircle size={18} />
              <span>{t('navbar.schedule')}</span>
            </Button>
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
              <Button onClick={() => {
                handleAgendarClick();
                setMobileMenuOpen(false);
              }} className="flex items-center gap-2 w-full justify-center mt-4" size="lg">
                <MessageCircle size={18} />
                <span>{t('navbar.schedule_consultation')}</span>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;