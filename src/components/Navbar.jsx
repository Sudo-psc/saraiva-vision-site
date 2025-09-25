import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, X, Calendar, ExternalLink } from 'lucide-react';
import { Button } from '../components/ui/button.jsx';
import Logo from '../components/Logo.jsx';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock.js';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    { name: 'Home', href: '/', internal: true },
    { name: 'Serviços', href: '/servicos', internal: true },
    { name: 'Lentes', href: '/lentes', internal: true },
    { name: 'Blog', href: '/blog', internal: true },
    { name: 'Podcast', href: '/podcast', internal: true },
    { name: 'Sobre', href: '/sobre', internal: true },
    { name: 'Depoimentos', href: '/depoimentos', internal: true },
    { name: 'FAQ', href: '/faq', internal: true },
    { name: 'Contato', href: '/contato', internal: true },
    { name: 'Instagram', href: 'https://www.instagram.com/saraiva_vision/', internal: false },
  ], []);


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
          >
            <Link to="/" aria-label="Ir para a página inicial"><Logo /></Link>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1" aria-label="Navegação principal">
            {navLinks.map((link) => (
              link.internal ? (
                <Link
                  key={link.name}
                  to={link.href}
                  className="text-slate-800 hover:text-blue-700 font-medium transition-colors px-4 py-2 rounded-lg hover:bg-slate-100 flex items-center gap-1"
                  onClick={() => console.log(`🔗 Link clicado: ${link.name} -> ${link.href}`)}
                >
                  {link.name}
                </Link>
              ) : (
                <a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-800 hover:text-blue-700 font-medium transition-colors px-4 py-2 rounded-lg hover:bg-slate-100 flex items-center gap-1"
                  onClick={() => console.log(`🔗 Link clicado: ${link.name} -> ${link.href}`)}
                >
                  {link.name}
                  <ExternalLink size={14} className="text-slate-500" />
                </a>
              )
            ))}
          </nav>

           <div className="hidden md:flex items-center gap-4">
             <Link
               to="/contato"
               className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
               onClick={() => console.log(`🔗 Botão Agendar clicado -> /contato`)}
             >
               <Calendar size={18} />
               <span>Agendar</span>
             </Link>
           </div>

          <div className="md:hidden flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="!h-12 !w-12 rounded-2xl border-blue-500 text-blue-700 bg-white shadow-3d hover:shadow-3d-hover"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Fechar menu" : "Abrir menu"}
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
            {navLinks.map((link) => (
              link.internal ? (
                <Link
                  key={link.name}
                  to={link.href}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    console.log(`🔗 Link mobile clicado: ${link.name} -> ${link.href}`);
                  }}
                  className="text-slate-800 hover:text-blue-700 py-2 font-medium text-lg flex items-center gap-2"
                >
                  {link.name}
                </Link>
              ) : (
                <a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    console.log(`🔗 Link mobile clicado: ${link.name} -> ${link.href}`);
                  }}
                  className="text-slate-800 hover:text-blue-700 py-2 font-medium text-lg flex items-center gap-2"
                >
                  {link.name}
                  <ExternalLink size={16} className="text-slate-500" />
                </a>
              )
            ))}
            <div className="pt-4">
              <Link
                to="/contato"
                onClick={() => {
                  setMobileMenuOpen(false);
                  console.log(`🔗 Botão Agendar mobile clicado -> /contato`);
                }}
                className="inline-flex items-center gap-2 w-full justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Calendar size={18} />
                <span>Agendar Consulta</span>
              </Link>
            </div>
          </nav>
        </div>
      )}


    </header>
  );
};

export default Navbar;
