/**
 * Navigation Component - Sênior Profile
 * Accessibility-first, WCAG AAA, high contrast
 *
 * Adapted from design system for Next.js implementation
 */

'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavigationItem {
  label: string;
  href: string;
  description?: string;
  children?: NavigationItem[];
}

const navigationItems: NavigationItem[] = [
  {
    label: 'Catarata',
    href: '/senior/catarata',
    description: 'Tratamento completo de catarata'
  },
  {
    label: 'Glaucoma',
    href: '/senior/glaucoma',
    description: 'Controle e tratamento do glaucoma',
    children: [
      { label: 'Diagnóstico Precoce', href: '/senior/glaucoma/diagnostico' },
      { label: 'Tratamento com Colírios', href: '/senior/glaucoma/tratamento' },
      { label: 'Cirurgia de Glaucoma', href: '/senior/glaucoma/cirurgia' },
      { label: 'Acompanhamento', href: '/senior/glaucoma/acompanhamento' }
    ]
  },
  {
    label: 'Cirurgias',
    href: '/senior/cirurgias',
    description: 'Procedimentos cirúrgicos'
  },
  {
    label: 'Acessibilidade',
    href: '/senior/acessibilidade',
    description: 'Recursos de acessibilidade'
  }
];

export const SeniorNav: React.FC = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [announcementText, setAnnouncementText] = useState('');
  const announcerRef = useRef<HTMLDivElement>(null);

  const isActive = (href: string) => {
    if (href === '/senior') return pathname === '/senior';
    return pathname?.startsWith(href);
  };

  const toggleDropdown = (label: string) => {
    const newState = activeDropdown === label ? null : label;
    setActiveDropdown(newState);
    announce(newState ? `Menu ${label} expandido` : `Menu ${label} recolhido`);
  };

  const announce = (message: string) => {
    setAnnouncementText(message);
    setTimeout(() => setAnnouncementText(''), 1000);
  };

  const handleMobileMenuToggle = () => {
    const newState = !mobileMenuOpen;
    setMobileMenuOpen(newState);
    announce(newState ? 'Menu aberto' : 'Menu fechado');
  };

  const handleKeyDown = (e: React.KeyboardEvent, item: NavigationItem) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (item.children) {
        toggleDropdown(item.label);
      }
    }
  };

  return (
    <>
      {/* Skip Navigation Link - WCAG 2.4.1 */}
      <a href="#main-content" className="skip-nav">
        Pular para o conteúdo principal
      </a>

      <nav className="navigation-senior" role="navigation" aria-label="Navegação principal do site">
        <div className="nav-container">
          {/* Logo with High Contrast */}
          <div className="nav-logo">
            <Link href="/senior" aria-label="Saraiva Vision - Voltar para página inicial">
              <div className="logo-text">
                <span className="logo-primary">Saraiva</span>
                <span className="logo-secondary">Vision</span>
              </div>
            </Link>
          </div>

          {/* Accessibility Tools */}
          <div className="nav-accessibility desktop-only">
            <button className="accessibility-btn" aria-label="Aumentar tamanho do texto" title="Aumentar texto">
              A+
            </button>
            <button className="accessibility-btn" aria-label="Diminuir tamanho do texto" title="Diminuir texto">
              A-
            </button>
            <button className="accessibility-btn" aria-label="Ativar alto contraste" title="Alto contraste">
              ◐
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="nav-menu desktop-only" role="menubar" aria-label="Menu de navegação">
            {navigationItems.map((item) => (
              <div key={item.href} className={`nav-item ${item.children ? 'has-dropdown' : ''}`} role="none">
                {item.children ? (
                  <>
                    <button
                      className={`nav-link ${isActive(item.href) ? 'active' : ''}`}
                      onClick={() => toggleDropdown(item.label)}
                      onKeyDown={(e) => handleKeyDown(e, item)}
                      aria-expanded={activeDropdown === item.label}
                      aria-haspopup="true"
                      aria-label={`${item.label}. ${item.description || ''}. Pressione Enter para expandir submenu`}
                      role="menuitem"
                    >
                      <span className="nav-label">{item.label}</span>
                      <span className="dropdown-indicator" aria-hidden="true">
                        {activeDropdown === item.label ? '▲' : '▼'}
                      </span>
                    </button>

                    {activeDropdown === item.label && (
                      <div className="dropdown-menu" role="menu" aria-label={`Submenu de ${item.label}`}>
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={`dropdown-item ${isActive(child.href) ? 'active' : ''}`}
                            role="menuitem"
                            aria-label={`${child.label}. ${child.description || ''}`}
                          >
                            <span className="dropdown-item-label">{child.label}</span>
                            {child.description && <span className="dropdown-item-desc">{child.description}</span>}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.href}
                    className={`nav-link ${isActive(item.href) ? 'active' : ''}`}
                    role="menuitem"
                    aria-label={`${item.label}. ${item.description || ''}`}
                    aria-current={isActive(item.href) ? 'page' : undefined}
                  >
                    <span className="nav-label">{item.label}</span>
                  </Link>
                )}
              </div>
            ))}
          </div>

          {/* Emergency Contact Button */}
          <div className="nav-cta desktop-only">
            <Link href="/senior/agendar" className="btn-emergency">
              <span className="btn-icon" aria-hidden="true">☎</span>
              <span className="btn-text">Agendar Consulta</span>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="mobile-menu-toggle mobile-only"
            onClick={handleMobileMenuToggle}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'Fechar menu de navegação' : 'Abrir menu de navegação'}
            aria-controls="mobile-menu"
          >
            <span className="menu-icon" aria-hidden="true">
              {mobileMenuOpen ? '✕ FECHAR' : '☰ MENU'}
            </span>
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div id="mobile-menu" className="mobile-menu mobile-only" role="menu" aria-label="Menu de navegação móvel">
            {navigationItems.map((item) => (
              <div key={item.href} className="mobile-nav-item">
                {item.children ? (
                  <>
                    <button
                      className="mobile-nav-link"
                      onClick={() => toggleDropdown(item.label)}
                      aria-expanded={activeDropdown === item.label}
                      aria-label={`${item.label}. ${item.description || ''}. Toque para expandir`}
                      role="menuitem"
                    >
                      <span className="mobile-nav-label">{item.label}</span>
                      <span className="mobile-dropdown-indicator" aria-hidden="true">
                        {activeDropdown === item.label ? '▲' : '▼'}
                      </span>
                    </button>

                    {activeDropdown === item.label && (
                      <div className="mobile-dropdown" role="menu" aria-label={`Submenu de ${item.label}`}>
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={`mobile-dropdown-item ${isActive(child.href) ? 'active' : ''}`}
                            onClick={() => {
                              setMobileMenuOpen(false);
                              announce('Menu fechado');
                            }}
                            role="menuitem"
                            aria-label={`${child.label}. ${child.description || ''}`}
                          >
                            <span className="mobile-dropdown-label">{child.label}</span>
                            {child.description && <span className="mobile-dropdown-desc">{child.description}</span>}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.href}
                    className={`mobile-nav-link ${isActive(item.href) ? 'active' : ''}`}
                    onClick={() => {
                      setMobileMenuOpen(false);
                      announce('Menu fechado');
                    }}
                    role="menuitem"
                    aria-label={`${item.label}. ${item.description || ''}`}
                    aria-current={isActive(item.href) ? 'page' : undefined}
                  >
                    <span className="mobile-nav-label">{item.label}</span>
                  </Link>
                )}
              </div>
            ))}

            {/* Mobile Emergency Contact */}
            <div className="mobile-cta">
              <Link
                href="/senior/agendar"
                className="btn-emergency btn-block"
                onClick={() => {
                  setMobileMenuOpen(false);
                  announce('Menu fechado');
                }}
              >
                <span className="btn-icon" aria-hidden="true">☎</span>
                <span className="btn-text">Agendar Consulta</span>
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Screen Reader Announcements */}
      <div ref={announcerRef} className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {announcementText}
      </div>
    </>
  );
};

export default SeniorNav;
