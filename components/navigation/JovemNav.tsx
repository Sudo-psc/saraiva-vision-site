/**
 * Navigation Component - Jovem Profile
 * Young, tech-savvy, subscription model
 *
 * Adapted from design system for Next.js implementation
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

interface NavigationItem {
  label: string;
  href: string;
  icon?: string;
  badge?: string;
  gradient?: string;
  children?: NavigationItem[];
}

const navigationItems: NavigationItem[] = [
  {
    label: 'Assinatura',
    href: '/jovem/assinatura',
    icon: '💎',
    badge: 'Popular',
    gradient: 'from-purple-500 to-pink-500'
  },
  {
    label: 'Tecnologia',
    href: '/jovem/tecnologia',
    icon: '🚀',
    gradient: 'from-cyan-500 to-blue-500',
    children: [
      { label: 'Cirurgia a Laser', href: '/jovem/tecnologia/laser' },
      { label: 'Lentes ICL', href: '/jovem/tecnologia/icl' },
      { label: 'Topografia de Córnea', href: '/jovem/tecnologia/topografia' },
      { label: 'Realidade Virtual', href: '/jovem/tecnologia/vr' }
    ]
  },
  {
    label: 'Lentes Premium',
    href: '/jovem/lentes',
    icon: '✨',
    gradient: 'from-green-500 to-emerald-500'
  },
  {
    label: 'Óculos Modernos',
    href: '/jovem/oculos',
    icon: '😎',
    gradient: 'from-orange-500 to-red-500'
  },
  {
    label: 'App',
    href: '/jovem/app',
    icon: '📱',
    badge: 'Novo'
  }
];

export const JovemNav: React.FC = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const isActive = (href: string) => {
    if (href === '/jovem') return pathname === '/jovem';
    return pathname?.startsWith(href);
  };

  const menuVariants = {
    closed: { opacity: 0, height: 0, transition: { duration: 0.3, ease: 'easeInOut' } },
    open: { opacity: 1, height: 'auto', transition: { duration: 0.3, ease: 'easeInOut' } }
  };

  const itemVariants = {
    closed: { opacity: 0, x: -20 },
    open: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.05, duration: 0.2 }
    })
  };

  return (
    <motion.nav
      className="navigation-jovem"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      role="navigation"
      aria-label="Navegação principal"
    >
      <div className="nav-glass">
        <div className="nav-container">
          {/* Logo with Gradient */}
          <motion.div className="nav-logo" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link href="/jovem" aria-label="Saraiva Vision - Página inicial">
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
                            <motion.div key={child.href} custom={i} variants={itemVariants} initial="closed" animate="open">
                              <Link
                                href={child.href}
                                className={`dropdown-item ${child.gradient || ''} ${isActive(child.href) ? 'active' : ''}`}
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
                  <Link href={item.href} className={`nav-link ${isActive(item.href) ? 'active' : ''}`} role="menuitem">
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
          <motion.div className="nav-cta desktop-only" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link href="/jovem/assinar" className="btn-gradient">
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
            <motion.div className="hamburger" animate={mobileMenuOpen ? 'open' : 'closed'}>
              <motion.span variants={{ closed: { rotate: 0, y: 0 }, open: { rotate: 45, y: 8 } }} />
              <motion.span variants={{ closed: { opacity: 1 }, open: { opacity: 0 } }} />
              <motion.span variants={{ closed: { rotate: 0, y: 0 }, open: { rotate: -45, y: -8 } }} />
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
                <motion.div key={item.href} custom={index} variants={itemVariants} initial="closed" animate="open" className="mobile-nav-item">
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
                        <motion.span className="dropdown-arrow" animate={{ rotate: activeDropdown === item.label ? 180 : 0 }}>
                          ▼
                        </motion.span>
                      </button>

                      <AnimatePresence>
                        {activeDropdown === item.label && (
                          <motion.div className="mobile-dropdown" variants={menuVariants} initial="closed" animate="open" exit="closed">
                            {item.children.map((child, i) => (
                              <motion.div key={child.href} custom={i} variants={itemVariants}>
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

              <motion.div custom={navigationItems.length} variants={itemVariants} className="mobile-cta">
                <Link href="/jovem/assinar" className="btn-gradient btn-block" onClick={() => setMobileMenuOpen(false)}>
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
    </motion.nav>
  );
};

export default JovemNav;
