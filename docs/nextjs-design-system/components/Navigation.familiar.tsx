/**
 * Navigation Component - Familiar Profile
 * Family-focused, trust, prevention
 *
 * Design Characteristics:
 * - Warm, approachable colors
 * - Clear hierarchy
 * - Large touch targets
 * - Family-friendly icons
 * - Trustworthy typography
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from './ThemeProvider';

interface NavigationItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
  badge?: string;
  children?: NavigationItem[];
}

const navigationItems: NavigationItem[] = [
  {
    label: 'Home',
    href: '/',
    icon: '🏠'
  },
  {
    label: 'Serviços',
    href: '/servicos',
    icon: '👁️',
    children: [
      { label: 'Consulta Completa', href: '/servicos/consulta' },
      { label: 'Cirurgia de Catarata', href: '/servicos/catarata' },
      { label: 'Tratamento de Glaucoma', href: '/servicos/glaucoma' },
      { label: 'Saúde da Retina', href: '/servicos/retina' },
      { label: 'Exames', href: '/servicos/exames' }
    ]
  },
  {
    label: 'Especialidades',
    href: '/especialidades',
    icon: '🔬',
    children: [
      { label: 'Oftalmologia Geral', href: '/especialidades/geral' },
      { label: 'Pediatria Oftalmológica', href: '/especialidades/pediatria' },
      { label: 'Cirurgia Refrativa', href: '/especialidades/refrativa' },
      { label: 'Lentes de Contato', href: '/especialidades/lentes' }
    ]
  },
  {
    label: 'Sobre Nós',
    href: '/sobre',
    icon: '👨‍⚕️'
  },
  {
    label: 'Blog',
    href: '/blog',
    icon: '📖',
    badge: 'Novo'
  },
  {
    label: 'Contato',
    href: '/contato',
    icon: '📞'
  }
];

export const NavigationFamiliar: React.FC = () => {
  const pathname = usePathname();
  const { profile } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  if (profile !== 'familiar') return null;

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname?.startsWith(href);
  };

  const toggleDropdown = (label: string) => {
    setActiveDropdown(activeDropdown === label ? null : label);
  };

  return (
    <nav
      className="navigation-familiar"
      role="navigation"
      aria-label="Navegação principal"
    >
      <div className="nav-container">
        {/* Logo */}
        <div className="nav-logo">
          <Link href="/" aria-label="Saraiva Vision - Página inicial">
            <img
              src="/logo-saraiva-vision.svg"
              alt="Saraiva Vision"
              width={180}
              height={48}
            />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="nav-menu desktop-only" role="menubar">
          {navigationItems.map((item) => (
            <div
              key={item.href}
              className={`nav-item ${item.children ? 'has-dropdown' : ''} ${isActive(item.href) ? 'active' : ''}`}
              role="none"
            >
              {item.children ? (
                <>
                  <button
                    className="nav-link dropdown-trigger"
                    onClick={() => toggleDropdown(item.label)}
                    aria-expanded={activeDropdown === item.label}
                    aria-haspopup="true"
                    role="menuitem"
                  >
                    {item.icon && <span className="nav-icon" aria-hidden="true">{item.icon}</span>}
                    <span className="nav-label">{item.label}</span>
                    <span className="dropdown-arrow" aria-hidden="true">▼</span>
                  </button>

                  {activeDropdown === item.label && (
                    <div className="dropdown-menu" role="menu">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={`dropdown-item ${isActive(child.href) ? 'active' : ''}`}
                          role="menuitem"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  href={item.href}
                  className="nav-link"
                  role="menuitem"
                >
                  {item.icon && <span className="nav-icon" aria-hidden="true">{item.icon}</span>}
                  <span className="nav-label">{item.label}</span>
                  {item.badge && (
                    <span className="nav-badge" aria-label={`${item.badge} conteúdo`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              )}
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <div className="nav-cta desktop-only">
          <Link href="/agendar" className="btn-primary">
            <span className="btn-icon" aria-hidden="true">📅</span>
            Agendar Consulta
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="mobile-menu-toggle mobile-only"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-expanded={mobileMenuOpen}
          aria-label="Abrir menu de navegação"
          aria-controls="mobile-menu"
        >
          <span className="hamburger-icon" aria-hidden="true">
            {mobileMenuOpen ? '✕' : '☰'}
          </span>
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div
          id="mobile-menu"
          className="mobile-menu mobile-only"
          role="menu"
        >
          {navigationItems.map((item) => (
            <div key={item.href} className="mobile-nav-item">
              {item.children ? (
                <>
                  <button
                    className="mobile-nav-link"
                    onClick={() => toggleDropdown(item.label)}
                    aria-expanded={activeDropdown === item.label}
                    role="menuitem"
                  >
                    {item.icon && <span className="nav-icon" aria-hidden="true">{item.icon}</span>}
                    <span className="nav-label">{item.label}</span>
                    <span className="dropdown-arrow" aria-hidden="true">
                      {activeDropdown === item.label ? '▲' : '▼'}
                    </span>
                  </button>

                  {activeDropdown === item.label && (
                    <div className="mobile-dropdown">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={`mobile-dropdown-item ${isActive(child.href) ? 'active' : ''}`}
                          onClick={() => setMobileMenuOpen(false)}
                          role="menuitem"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  href={item.href}
                  className={`mobile-nav-link ${isActive(item.href) ? 'active' : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                  role="menuitem"
                >
                  {item.icon && <span className="nav-icon" aria-hidden="true">{item.icon}</span>}
                  <span className="nav-label">{item.label}</span>
                  {item.badge && (
                    <span className="nav-badge" aria-label={`${item.badge} conteúdo`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              )}
            </div>
          ))}

          {/* Mobile CTA */}
          <div className="mobile-cta">
            <Link
              href="/agendar"
              className="btn-primary btn-block"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="btn-icon" aria-hidden="true">📅</span>
              Agendar Consulta
            </Link>
          </div>
        </div>
      )}

      <style jsx>{`
        .navigation-familiar {
          background: linear-gradient(to bottom, #ffffff, #f8fafc);
          border-bottom: 2px solid var(--color-primary);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          position: sticky;
          top: 0;
          z-index: 800;
        }

        .nav-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 1rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 2rem;
        }

        .nav-logo img {
          height: 48px;
          width: auto;
        }

        .nav-menu {
          display: flex;
          align-items: center;
          gap: 1.5rem;
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
          font-size: 1rem;
          font-weight: 500;
          text-decoration: none;
          border-radius: 0.5rem;
          transition: all 0.3s ease;
          cursor: pointer;
          background: transparent;
          border: none;
          min-height: 44px;
        }

        .nav-link:hover {
          background-color: rgba(14, 165, 233, 0.1);
          color: var(--color-primary);
        }

        .nav-link:focus-visible {
          outline: 2px solid var(--color-focus);
          outline-offset: 2px;
        }

        .nav-item.active .nav-link {
          color: var(--color-primary);
          font-weight: 600;
        }

        .nav-icon {
          font-size: 1.25rem;
        }

        .nav-badge {
          background-color: var(--color-accent);
          color: white;
          font-size: 0.75rem;
          font-weight: 600;
          padding: 0.125rem 0.5rem;
          border-radius: 9999px;
        }

        .dropdown-arrow {
          font-size: 0.75rem;
          margin-left: 0.25rem;
          transition: transform 0.3s ease;
        }

        .dropdown-trigger[aria-expanded="true"] .dropdown-arrow {
          transform: rotate(180deg);
        }

        .dropdown-menu {
          position: absolute;
          top: 100%;
          left: 0;
          margin-top: 0.5rem;
          background: white;
          border: 1px solid var(--color-border);
          border-radius: 0.75rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          min-width: 200px;
          padding: 0.5rem;
          animation: fadeIn 0.2s ease;
        }

        .dropdown-item {
          display: block;
          padding: 0.75rem 1rem;
          color: var(--color-text-primary);
          text-decoration: none;
          border-radius: 0.5rem;
          transition: all 0.2s ease;
          font-size: 0.9375rem;
        }

        .dropdown-item:hover {
          background-color: var(--color-foreground);
          color: var(--color-primary);
        }

        .dropdown-item.active {
          background-color: rgba(14, 165, 233, 0.1);
          color: var(--color-primary);
          font-weight: 600;
        }

        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
          color: white;
          font-family: var(--font-body);
          font-size: 1rem;
          font-weight: 600;
          text-decoration: none;
          border-radius: 0.75rem;
          box-shadow: 0 4px 8px rgba(14, 165, 233, 0.3);
          transition: all 0.3s ease;
          border: none;
          cursor: pointer;
          min-height: 44px;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(14, 165, 233, 0.4);
        }

        .btn-primary:focus-visible {
          outline: 2px solid white;
          outline-offset: 2px;
        }

        .mobile-menu-toggle {
          display: none;
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
            font-size: 1.5rem;
            color: var(--color-text-primary);
          }

          .mobile-menu {
            background: white;
            border-top: 1px solid var(--color-border);
            padding: 1rem;
            animation: slideDown 0.3s ease;
          }

          .mobile-nav-item {
            border-bottom: 1px solid var(--color-border);
          }

          .mobile-nav-item:last-child {
            border-bottom: none;
          }

          .mobile-nav-link {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 1rem;
            width: 100%;
            color: var(--color-text-primary);
            text-decoration: none;
            background: transparent;
            border: none;
            font-size: 1rem;
            font-weight: 500;
            text-align: left;
            cursor: pointer;
            min-height: 48px;
          }

          .mobile-nav-link.active {
            color: var(--color-primary);
            font-weight: 600;
          }

          .mobile-dropdown {
            padding-left: 2rem;
            animation: slideDown 0.2s ease;
          }

          .mobile-dropdown-item {
            display: block;
            padding: 0.75rem 1rem;
            color: var(--color-text-secondary);
            text-decoration: none;
            font-size: 0.9375rem;
          }

          .mobile-dropdown-item.active {
            color: var(--color-primary);
            font-weight: 600;
          }

          .mobile-cta {
            margin-top: 1rem;
            padding-top: 1rem;
            border-top: 1px solid var(--color-border);
          }

          .btn-block {
            width: 100%;
            justify-content: center;
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            max-height: 0;
          }
          to {
            opacity: 1;
            max-height: 1000px;
          }
        }

        /* Reduced Motion Support */
        @media (prefers-reduced-motion: reduce) {
          .nav-link,
          .dropdown-item,
          .btn-primary {
            transition: none;
          }

          .dropdown-menu,
          .mobile-menu,
          .mobile-dropdown {
            animation: none;
          }
        }
      `}</style>
    </nav>
  );
};

export default NavigationFamiliar;
