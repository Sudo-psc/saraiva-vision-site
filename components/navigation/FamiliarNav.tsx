/**
 * Navigation Component - Familiar Profile
 * Family-focused, trust, prevention
 *
 * Adapted from design system for Next.js implementation
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavigationItem {
  label: string;
  href: string;
  icon?: string;
  badge?: string;
  children?: NavigationItem[];
}

const navigationItems: NavigationItem[] = [
  {
    label: 'Prevenção',
    href: '/familiar/prevencao',
    icon: '🛡️'
  },
  {
    label: 'Exames',
    href: '/familiar/exames',
    icon: '🔬',
    children: [
      { label: 'Mapeamento de Retina', href: '/familiar/exames/retina' },
      { label: 'Tonometria (Glaucoma)', href: '/familiar/exames/glaucoma' },
      { label: 'Refração Visual', href: '/familiar/exames/refracao' },
      { label: 'Teste de Visão Infantil', href: '/familiar/exames/infantil' }
    ]
  },
  {
    label: 'Planos Familiares',
    href: '/familiar/planos',
    icon: '👨‍👩‍👧‍👦',
    badge: 'Popular'
  },
  {
    label: 'Dúvidas Frequentes',
    href: '/familiar/duvidas',
    icon: '❓'
  }
];

export const FamiliarNav: React.FC = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const isActive = (href: string) => {
    if (href === '/familiar') return pathname === '/familiar';
    return pathname?.startsWith(href);
  };

  const toggleDropdown = (label: string) => {
    setActiveDropdown(activeDropdown === label ? null : label);
  };

  return (
    <nav className="navigation-familiar" role="navigation" aria-label="Navegação principal">
      <div className="nav-container">
        {/* Logo */}
        <div className="nav-logo">
          <Link href="/familiar" aria-label="Saraiva Vision - Página inicial">
            <img src="/logo-saraiva-vision.svg" alt="Saraiva Vision" width={180} height={48} />
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
                <Link href={item.href} className="nav-link" role="menuitem">
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
          <Link href="/familiar/agendar" className="btn-primary">
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
        <div id="mobile-menu" className="mobile-menu mobile-only" role="menu">
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
              href="/familiar/agendar"
              className="btn-primary btn-block"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="btn-icon" aria-hidden="true">📅</span>
              Agendar Consulta
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default FamiliarNav;
