/**
 * Navigation Component - Jovem Profile
 * Young, tech-savvy, subscription model
 *
 * Design Characteristics:
 * - Gradient backgrounds
 * - Framer Motion animations
 * - Modern glassmorphism
 * - Bold typography
 * - Dark mode support
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from './ThemeProvider';

interface NavigationItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
  badge?: string;
  gradient?: string;
  children?: NavigationItem[];
}

const navigationItems: NavigationItem[] = [
  {
    label: 'Início',
    href: '/',
    icon: '⚡',
    gradient: 'from-purple-500 to-pink-500'
  },
  {
    label: 'Planos',
    href: '/planos',
    icon: '💎',
    badge: 'Popular',
    gradient: 'from-cyan-500 to-blue-500',
    children: [
      { label: 'Visão Premium', href: '/planos/premium', gradient: 'from-purple-500 to-pink-500' },
      { label: 'Visão Plus', href: '/planos/plus', gradient: 'from-cyan-500 to-blue-500' },
      { label: 'Visão Básico', href: '/planos/basico', gradient: 'from-green-500 to-emerald-500' },
      { label: 'Corporativo', href: '/planos/corporativo', gradient: 'from-orange-500 to-red-500' }
    ]
  },
  {
    label: 'Serviços',
    href: '/servicos',
    icon: '🔬',
    gradient: 'from-green-500 to-emerald-500',
    children: [
      { label: 'Consulta Express', href: '/servicos/express' },
      { label: 'Cirurgia Refrativa', href: '/servicos/refrativa' },
      { label: 'Lentes Premium', href: '/servicos/lentes' },
      { label: 'Exames Avançados', href: '/servicos/exames' }
    ]
  },
  {
    label: 'Tech',
    href: '/tecnologia',
    icon: '🚀',
    gradient: 'from-orange-500 to-red-500'
  },
  {
    label: 'Blog',
    href: '/blog',
    icon: '📱',
    badge: 'Novo'
  }
];

export const NavigationJovem: React.FC = () => {
  const pathname = usePathname();
  const { profile, isDarkMode } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  if (profile !== 'jovem') return null;

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname?.startsWith(href);
  };

  const menuVariants = {
    closed: {
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.3,
        ease: 'easeInOut'
      }
    },
    open: {
      opacity: 1,
      height: 'auto',
      transition: {
        duration: 0.3,
        ease: 'easeInOut'
      }
    }
  };

  const itemVariants = {
    closed: { opacity: 0, x: -20 },
    open: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.2
      }
    })
  };

  return (
    <motion.nav
      className={`navigation-jovem ${isDarkMode ? 'dark' : ''}`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      role="navigation"
      aria-label="Navegação principal"
    >
      <div className="nav-glass">
        <div className="nav-container">
          {/* Logo with Gradient */}
          <motion.div
            className="nav-logo"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link href="/" aria-label="Saraiva Vision - Página inicial">
              <div className="logo-gradient">
                <span className="logo-text">Saraiva</span>
                <span className="logo-accent">Vision</span>
              </div>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="nav-menu desktop-only" role="menubar">
            {navigationItems.map((item, index) => (
              <motion.div
                key={item.href}
                className="nav-item"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
                onHoverStart={() => item.children && setActiveDropdown(item.label)}
                onHoverEnd={() => item.children && setActiveDropdown(null)}
                role="none"
              >
                {item.children ? (
                  <>
                    <button
                      className={`nav-link ${isActive(item.href) ? 'active' : ''}`}
                      aria-expanded={activeDropdown === item.label}
                      aria-haspopup="true"
                      role="menuitem"
                    >
                      {item.icon && <span className="nav-icon">{item.icon}</span>}
                      <span className="nav-label">{item.label}</span>
                      {item.badge && (
                        <motion.span
                          className="nav-badge"
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ repeat: Infinity, duration: 2 }}
                        >
                          {item.badge}
                        </motion.span>
                      )}
                      <motion.span
                        className="dropdown-arrow"
                        animate={{ rotate: activeDropdown === item.label ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        ▼
                      </motion.span>
                    </button>

                    <AnimatePresence>
                      {activeDropdown === item.label && (
                        <motion.div
                          className="dropdown-menu"
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          role="menu"
                        >
                          {item.children.map((child, i) => (
                            <motion.div
                              key={child.href}
                              custom={i}
                              variants={itemVariants}
                              initial="closed"
                              animate="open"
                            >
                              <Link
                                href={child.href}
                                className={`dropdown-item ${child.gradient || ''} ${isActive(child.href) ? 'active' : ''}`}
                                role="menuitem"
                              >
                                {child.gradient && <div className={`gradient-bg bg-gradient-to-r ${child.gradient}`} />}
                                {child.label}
                              </Link>
                            </motion.div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                ) : (
                  <Link
                    href={item.href}
                    className={`nav-link ${isActive(item.href) ? 'active' : ''}`}
                    role="menuitem"
                  >
                    {item.icon && <span className="nav-icon">{item.icon}</span>}
                    <span className="nav-label">{item.label}</span>
                    {item.badge && (
                      <motion.span
                        className="nav-badge"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                      >
                        {item.badge}
                      </motion.span>
                    )}
                  </Link>
                )}
              </motion.div>
            ))}
          </div>

          {/* CTA Button with Gradient */}
          <motion.div
            className="nav-cta desktop-only"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link href="/assinar" className="btn-gradient">
              <span className="btn-shimmer" />
              <span className="btn-content">
                <span className="btn-icon">✨</span>
                Assinar Agora
              </span>
            </Link>
          </motion.div>

          {/* Mobile Menu Toggle */}
          <motion.button
            className="mobile-menu-toggle mobile-only"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            whileTap={{ scale: 0.9 }}
            aria-expanded={mobileMenuOpen}
            aria-label="Abrir menu de navegação"
            aria-controls="mobile-menu"
          >
            <motion.div
              className="hamburger"
              animate={mobileMenuOpen ? 'open' : 'closed'}
            >
              <motion.span
                variants={{
                  closed: { rotate: 0, y: 0 },
                  open: { rotate: 45, y: 8 }
                }}
              />
              <motion.span
                variants={{
                  closed: { opacity: 1 },
                  open: { opacity: 0 }
                }}
              />
              <motion.span
                variants={{
                  closed: { rotate: 0, y: 0 },
                  open: { rotate: -45, y: -8 }
                }}
              />
            </motion.div>
          </motion.button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            id="mobile-menu"
            className="mobile-menu mobile-only"
            variants={menuVariants}
            initial="closed"
            animate="open"
            exit="closed"
            role="menu"
          >
            <div className="mobile-menu-glass">
              {navigationItems.map((item, index) => (
                <motion.div
                  key={item.href}
                  custom={index}
                  variants={itemVariants}
                  initial="closed"
                  animate="open"
                  className="mobile-nav-item"
                >
                  {item.children ? (
                    <>
                      <button
                        className="mobile-nav-link"
                        onClick={() => setActiveDropdown(activeDropdown === item.label ? null : item.label)}
                        aria-expanded={activeDropdown === item.label}
                        role="menuitem"
                      >
                        {item.icon && <span className="nav-icon">{item.icon}</span>}
                        <span className="nav-label">{item.label}</span>
                        <motion.span
                          className="dropdown-arrow"
                          animate={{ rotate: activeDropdown === item.label ? 180 : 0 }}
                        >
                          ▼
                        </motion.span>
                      </button>

                      <AnimatePresence>
                        {activeDropdown === item.label && (
                          <motion.div
                            className="mobile-dropdown"
                            variants={menuVariants}
                            initial="closed"
                            animate="open"
                            exit="closed"
                          >
                            {item.children.map((child, i) => (
                              <motion.div
                                key={child.href}
                                custom={i}
                                variants={itemVariants}
                              >
                                <Link
                                  href={child.href}
                                  className={`mobile-dropdown-item ${isActive(child.href) ? 'active' : ''}`}
                                  onClick={() => setMobileMenuOpen(false)}
                                  role="menuitem"
                                >
                                  {child.label}
                                </Link>
                              </motion.div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  ) : (
                    <Link
                      href={item.href}
                      className={`mobile-nav-link ${isActive(item.href) ? 'active' : ''}`}
                      onClick={() => setMobileMenuOpen(false)}
                      role="menuitem"
                    >
                      {item.icon && <span className="nav-icon">{item.icon}</span>}
                      <span className="nav-label">{item.label}</span>
                      {item.badge && <span className="nav-badge">{item.badge}</span>}
                    </Link>
                  )}
                </motion.div>
              ))}

              <motion.div
                custom={navigationItems.length}
                variants={itemVariants}
                className="mobile-cta"
              >
                <Link
                  href="/assinar"
                  className="btn-gradient btn-block"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="btn-shimmer" />
                  <span className="btn-content">
                    <span className="btn-icon">✨</span>
                    Assinar Agora
                  </span>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .navigation-jovem {
          position: sticky;
          top: 0;
          z-index: 800;
          backdrop-filter: blur(20px);
        }

        .nav-glass {
          background: rgba(255, 255, 255, 0.7);
          border-bottom: 1px solid rgba(217, 70, 239, 0.2);
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.05);
        }

        .dark .nav-glass {
          background: rgba(24, 24, 27, 0.8);
          border-bottom: 1px solid rgba(217, 70, 239, 0.3);
        }

        .nav-container {
          max-width: 1440px;
          margin: 0 auto;
          padding: 1rem 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 2rem;
        }

        .logo-gradient {
          display: flex;
          gap: 0.5rem;
          font-family: var(--font-display);
          font-size: 1.5rem;
          font-weight: 700;
        }

        .logo-text {
          background: linear-gradient(135deg, #d946ef, #8b5cf6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .logo-accent {
          background: linear-gradient(135deg, #10b981, #3b82f6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .nav-menu {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex: 1;
        }

        .nav-item {
          position: relative;
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          color: var(--color-text-primary);
          font-family: var(--font-body);
          font-size: 0.9375rem;
          font-weight: 500;
          letter-spacing: -0.0125em;
          text-decoration: none;
          border-radius: 1rem;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          cursor: pointer;
          background: transparent;
          border: none;
          position: relative;
          overflow: hidden;
        }

        .nav-link::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(217, 70, 239, 0.1), rgba(139, 92, 246, 0.1));
          opacity: 0;
          transition: opacity 0.3s ease;
          border-radius: 1rem;
        }

        .nav-link:hover::before {
          opacity: 1;
        }

        .nav-link.active {
          color: #d946ef;
          font-weight: 600;
        }

        .nav-icon {
          font-size: 1.25rem;
        }

        .nav-badge {
          background: linear-gradient(135deg, #f43f5e, #fb7185);
          color: white;
          font-size: 0.6875rem;
          font-weight: 700;
          padding: 0.125rem 0.5rem;
          border-radius: 9999px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .dropdown-menu {
          position: absolute;
          top: calc(100% + 0.5rem);
          left: 50%;
          transform: translateX(-50%);
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(217, 70, 239, 0.2);
          border-radius: 1.5rem;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          min-width: 220px;
          padding: 0.75rem;
          overflow: hidden;
        }

        .dark .dropdown-menu {
          background: rgba(39, 39, 42, 0.95);
          border-color: rgba(217, 70, 239, 0.3);
        }

        .dropdown-item {
          display: block;
          padding: 0.875rem 1rem;
          color: var(--color-text-primary);
          text-decoration: none;
          border-radius: 1rem;
          transition: all 0.2s ease;
          font-size: 0.9375rem;
          position: relative;
          overflow: hidden;
        }

        .dropdown-item .gradient-bg {
          position: absolute;
          inset: 0;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .dropdown-item:hover .gradient-bg {
          opacity: 0.1;
        }

        .dropdown-item.active {
          color: #d946ef;
          font-weight: 600;
        }

        .btn-gradient {
          position: relative;
          display: inline-flex;
          align-items: center;
          padding: 0.875rem 1.75rem;
          background: linear-gradient(135deg, #d946ef, #8b5cf6, #3b82f6);
          background-size: 200% 200%;
          color: white;
          font-family: var(--font-body);
          font-size: 0.9375rem;
          font-weight: 600;
          text-decoration: none;
          border-radius: 1.5rem;
          border: none;
          cursor: pointer;
          overflow: hidden;
          box-shadow: 0 8px 24px rgba(217, 70, 239, 0.3);
          animation: gradient-x 3s ease infinite;
        }

        .btn-shimmer {
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          animation: shimmer 2s infinite;
        }

        .btn-content {
          position: relative;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .mobile-menu-toggle {
          display: none;
        }

        .hamburger {
          display: flex;
          flex-direction: column;
          gap: 5px;
          width: 24px;
        }

        .hamburger span {
          display: block;
          width: 24px;
          height: 2px;
          background: currentColor;
          border-radius: 2px;
        }

        @media (max-width: 1024px) {
          .desktop-only {
            display: none;
          }

          .mobile-only {
            display: block;
          }

          .mobile-menu-toggle {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 44px;
            height: 44px;
            background: transparent;
            border: none;
            cursor: pointer;
            color: var(--color-text-primary);
          }

          .mobile-menu {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(20px);
            border-top: 1px solid rgba(217, 70, 239, 0.2);
          }

          .dark .mobile-menu {
            background: rgba(24, 24, 27, 0.95);
          }

          .mobile-menu-glass {
            padding: 1.5rem;
            max-height: calc(100vh - 80px);
            overflow-y: auto;
          }

          .mobile-nav-item {
            margin-bottom: 0.5rem;
          }

          .mobile-nav-link {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 1rem 1.25rem;
            width: 100%;
            background: rgba(217, 70, 239, 0.05);
            border: none;
            border-radius: 1rem;
            color: var(--color-text-primary);
            text-decoration: none;
            font-size: 1rem;
            font-weight: 500;
            text-align: left;
            cursor: pointer;
          }

          .mobile-nav-link.active {
            background: linear-gradient(135deg, rgba(217, 70, 239, 0.15), rgba(139, 92, 246, 0.15));
            color: #d946ef;
            font-weight: 600;
          }

          .mobile-dropdown {
            padding-left: 2rem;
            margin-top: 0.5rem;
          }

          .mobile-dropdown-item {
            display: block;
            padding: 0.75rem 1rem;
            color: var(--color-text-secondary);
            text-decoration: none;
            border-radius: 0.75rem;
            font-size: 0.9375rem;
          }

          .mobile-dropdown-item.active {
            color: #d946ef;
            font-weight: 600;
          }

          .mobile-cta {
            margin-top: 1.5rem;
            padding-top: 1.5rem;
            border-top: 1px solid rgba(217, 70, 239, 0.2);
          }

          .btn-block {
            width: 100%;
            justify-content: center;
          }
        }

        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        @keyframes shimmer {
          0% { left: -100%; }
          100% { left: 100%; }
        }

        /* Reduced Motion Support */
        @media (prefers-reduced-motion: reduce) {
          * {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </motion.nav>
  );
};

export default NavigationJovem;
