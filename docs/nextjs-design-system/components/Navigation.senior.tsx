/**
 * Navigation Component - Sênior Profile
 * Accessibility-first, WCAG AAA, high contrast
 *
 * Design Characteristics:
 * - WCAG AAA contrast ratios (7:1)
 * - Large touch targets (48x48px minimum)
 * - Clear focus indicators (3px)
 * - Atkinson Hyperlegible font
 * - No animations (reduced motion)
 * - High contrast borders
 * - Skip navigation links
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from './ThemeProvider';

interface NavigationItem {
  label: string;
  href: string;
  description?: string;
  children?: NavigationItem[];
}

const navigationItems: NavigationItem[] = [
  {
    label: 'Página Inicial',
    href: '/',
    description: 'Voltar para a página principal'
  },
  {
    label: 'Nossos Serviços',
    href: '/servicos',
    description: 'Conheça todos os nossos tratamentos',
    children: [
      { label: 'Consulta Oftalmológica Completa', href: '/servicos/consulta', description: 'Avaliação completa da visão' },
      { label: 'Cirurgia de Catarata', href: '/servicos/catarata', description: 'Tratamento para catarata' },
      { label: 'Tratamento de Glaucoma', href: '/servicos/glaucoma', description: 'Controle e tratamento do glaucoma' },
      { label: 'Tratamento de Retina', href: '/servicos/retina', description: 'Cuidados com a retina' },
      { label: 'Exames Oftalmológicos', href: '/servicos/exames', description: 'Diversos tipos de exames' }
    ]
  },
  {
    label: 'Especialidades Médicas',
    href: '/especialidades',
    description: 'Áreas de atuação da clínica',
    children: [
      { label: 'Oftalmologia Geral', href: '/especialidades/geral' },
      { label: 'Oftalmologia Pediátrica', href: '/especialidades/pediatria' },
      { label: 'Cirurgia Refrativa', href: '/especialidades/refrativa' },
      { label: 'Adaptação de Lentes', href: '/especialidades/lentes' }
    ]
  },
  {
    label: 'Sobre a Clínica',
    href: '/sobre',
    description: 'Conheça nossa história e equipe'
  },
  {
    label: 'Artigos e Notícias',
    href: '/blog',
    description: 'Informações sobre saúde ocular'
  },
  {
    label: 'Fale Conosco',
    href: '/contato',
    description: 'Entre em contato com a clínica'
  }
];

export const NavigationSenior: React.FC = () => {
  const pathname = usePathname();
  const { profile } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [announcementText, setAnnouncementText] = useState('');
  const announcerRef = useRef<HTMLDivElement>(null);

  if (profile !== 'senior') return null;

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname?.startsWith(href);
  };

  const toggleDropdown = (label: string) => {
    const newState = activeDropdown === label ? null : label;
    setActiveDropdown(newState);

    // Announce to screen readers
    if (newState) {
      announce(`Menu ${label} expandido`);
    } else {
      announce(`Menu ${label} recolhido`);
    }
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

  // Focus management for keyboard navigation
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

      <nav
        className="navigation-senior"
        role="navigation"
        aria-label="Navegação principal do site"
      >
        <div className="nav-container">
          {/* Logo with High Contrast */}
          <div className="nav-logo">
            <Link href="/" aria-label="Saraiva Vision - Voltar para página inicial">
              <div className="logo-text">
                <span className="logo-primary">Saraiva</span>
                <span className="logo-secondary">Vision</span>
              </div>
            </Link>
          </div>

          {/* Accessibility Tools */}
          <div className="nav-accessibility desktop-only">
            <button
              className="accessibility-btn"
              aria-label="Aumentar tamanho do texto"
              title="Aumentar texto"
            >
              A+
            </button>
            <button
              className="accessibility-btn"
              aria-label="Diminuir tamanho do texto"
              title="Diminuir texto"
            >
              A-
            </button>
            <button
              className="accessibility-btn"
              aria-label="Ativar alto contraste"
              title="Alto contraste"
            >
              ◐
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="nav-menu desktop-only" role="menubar" aria-label="Menu de navegação">
            {navigationItems.map((item) => (
              <div
                key={item.href}
                className={`nav-item ${item.children ? 'has-dropdown' : ''}`}
                role="none"
              >
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
                            {child.description && (
                              <span className="dropdown-item-desc">{child.description}</span>
                            )}
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
            <Link href="/agendar" className="btn-emergency">
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
          <div
            id="mobile-menu"
            className="mobile-menu mobile-only"
            role="menu"
            aria-label="Menu de navegação móvel"
          >
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
                            {child.description && (
                              <span className="mobile-dropdown-desc">{child.description}</span>
                            )}
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
                href="/agendar"
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
      <div
        ref={announcerRef}
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {announcementText}
      </div>

      <style jsx>{`
        /* Skip Navigation */
        .skip-nav {
          position: absolute;
          top: -100px;
          left: 0;
          background: #000000;
          color: #ffffff;
          padding: 1rem 1.5rem;
          font-size: 1.125rem;
          font-weight: 700;
          text-decoration: none;
          z-index: 9999;
          border: 3px solid #0066cc;
        }

        .skip-nav:focus {
          top: 0;
        }

        /* Main Navigation */
        .navigation-senior {
          background: #ffffff;
          border-bottom: 4px solid #000000;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
          position: sticky;
          top: 0;
          z-index: 800;
        }

        .nav-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 1.5rem 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 2rem;
        }

        /* Logo */
        .logo-text {
          display: flex;
          flex-direction: column;
          font-family: var(--font-heading);
          line-height: 1.2;
        }

        .logo-primary {
          font-size: 1.875rem;
          font-weight: 700;
          color: #000000;
        }

        .logo-secondary {
          font-size: 1.25rem;
          font-weight: 600;
          color: #0066cc;
        }

        /* Accessibility Tools */
        .nav-accessibility {
          display: flex;
          gap: 0.75rem;
        }

        .accessibility-btn {
          min-width: 48px;
          min-height: 48px;
          padding: 0.75rem;
          background: #f5f5f5;
          border: 2px solid #000000;
          border-radius: 0.25rem;
          color: #000000;
          font-size: 1.125rem;
          font-weight: 700;
          cursor: pointer;
          transition: background-color 0.1s, border-color 0.1s;
        }

        .accessibility-btn:hover {
          background: #e5e5e5;
          border-color: #0066cc;
        }

        .accessibility-btn:focus {
          outline: 3px solid #0066cc;
          outline-offset: 3px;
        }

        /* Navigation Menu */
        .nav-menu {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex: 1;
        }

        .nav-item {
          position: relative;
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          min-width: 48px;
          min-height: 48px;
          padding: 1rem 1.5rem;
          color: #000000;
          font-family: var(--font-body);
          font-size: 1.125rem;
          font-weight: 600;
          text-decoration: none;
          background: transparent;
          border: 2px solid transparent;
          border-radius: 0.25rem;
          cursor: pointer;
          transition: background-color 0.1s, border-color 0.1s;
        }

        .nav-link:hover {
          background: #f5f5f5;
          border-color: #000000;
        }

        .nav-link:focus {
          outline: 3px solid #0066cc;
          outline-offset: 3px;
          background: #f5f5f5;
        }

        .nav-link.active {
          background: #e5e5e5;
          border-color: #0066cc;
          color: #0066cc;
        }

        .dropdown-indicator {
          font-size: 1rem;
          margin-left: 0.25rem;
        }

        /* Dropdown Menu */
        .dropdown-menu {
          position: absolute;
          top: calc(100% + 0.5rem);
          left: 0;
          min-width: 320px;
          background: #ffffff;
          border: 3px solid #000000;
          border-radius: 0.25rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          padding: 0.75rem;
          z-index: 900;
        }

        .dropdown-item {
          display: block;
          padding: 1rem 1.25rem;
          color: #000000;
          text-decoration: none;
          border: 2px solid transparent;
          border-radius: 0.25rem;
          transition: background-color 0.1s, border-color 0.1s;
          margin-bottom: 0.5rem;
        }

        .dropdown-item:last-child {
          margin-bottom: 0;
        }

        .dropdown-item:hover {
          background: #f5f5f5;
          border-color: #000000;
        }

        .dropdown-item:focus {
          outline: 3px solid #0066cc;
          outline-offset: 3px;
          background: #f5f5f5;
        }

        .dropdown-item.active {
          background: #e5e5e5;
          border-color: #0066cc;
          color: #0066cc;
        }

        .dropdown-item-label {
          display: block;
          font-size: 1.125rem;
          font-weight: 600;
          margin-bottom: 0.25rem;
        }

        .dropdown-item-desc {
          display: block;
          font-size: 1rem;
          color: #262626;
        }

        /* CTA Button */
        .btn-emergency {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          min-width: 48px;
          min-height: 48px;
          padding: 1rem 1.75rem;
          background: #0066cc;
          color: #ffffff;
          font-family: var(--font-body);
          font-size: 1.125rem;
          font-weight: 700;
          text-decoration: none;
          border: 3px solid #000000;
          border-radius: 0.25rem;
          cursor: pointer;
          transition: background-color 0.1s;
        }

        .btn-emergency:hover {
          background: #0052a3;
        }

        .btn-emergency:focus {
          outline: 3px solid #0066cc;
          outline-offset: 3px;
        }

        .btn-icon {
          font-size: 1.5rem;
        }

        /* Mobile Menu Toggle */
        .mobile-menu-toggle {
          display: none;
        }

        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
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
            min-width: 120px;
            min-height: 48px;
            padding: 1rem 1.5rem;
            background: #000000;
            color: #ffffff;
            border: 3px solid #000000;
            border-radius: 0.25rem;
            font-size: 1.125rem;
            font-weight: 700;
            cursor: pointer;
          }

          .mobile-menu-toggle:focus {
            outline: 3px solid #0066cc;
            outline-offset: 3px;
          }

          .menu-icon {
            letter-spacing: 0.1em;
          }

          /* Mobile Menu */
          .mobile-menu {
            background: #ffffff;
            border-top: 3px solid #000000;
            padding: 1.5rem;
          }

          .mobile-nav-item {
            margin-bottom: 1rem;
            border-bottom: 2px solid #e5e5e5;
            padding-bottom: 1rem;
          }

          .mobile-nav-item:last-child {
            border-bottom: none;
            margin-bottom: 0;
          }

          .mobile-nav-link {
            display: flex;
            align-items: center;
            justify-content: space-between;
            min-width: 48px;
            min-height: 48px;
            padding: 1.25rem 1.5rem;
            width: 100%;
            background: #f5f5f5;
            border: 2px solid #000000;
            border-radius: 0.25rem;
            color: #000000;
            text-decoration: none;
            font-size: 1.25rem;
            font-weight: 600;
            text-align: left;
            cursor: pointer;
          }

          .mobile-nav-link.active {
            background: #e5e5e5;
            border-color: #0066cc;
            color: #0066cc;
          }

          .mobile-nav-link:focus {
            outline: 3px solid #0066cc;
            outline-offset: 3px;
          }

          .mobile-dropdown {
            margin-top: 1rem;
            padding-left: 1.5rem;
          }

          .mobile-dropdown-item {
            display: block;
            padding: 1rem 1.25rem;
            min-height: 48px;
            background: #ffffff;
            border: 2px solid #525252;
            border-radius: 0.25rem;
            color: #000000;
            text-decoration: none;
            margin-bottom: 0.75rem;
          }

          .mobile-dropdown-item:last-child {
            margin-bottom: 0;
          }

          .mobile-dropdown-item.active {
            background: #e5e5e5;
            border-color: #0066cc;
            color: #0066cc;
          }

          .mobile-dropdown-item:focus {
            outline: 3px solid #0066cc;
            outline-offset: 3px;
          }

          .mobile-dropdown-label {
            display: block;
            font-size: 1.125rem;
            font-weight: 600;
            margin-bottom: 0.25rem;
          }

          .mobile-dropdown-desc {
            display: block;
            font-size: 1rem;
            color: #262626;
          }

          .mobile-cta {
            margin-top: 1.5rem;
            padding-top: 1.5rem;
            border-top: 3px solid #000000;
          }

          .btn-block {
            width: 100%;
            justify-content: center;
          }
        }

        /* High Contrast Mode */
        .high-contrast .navigation-senior {
          background: #000000;
          border-bottom-color: #ffffff;
        }

        .high-contrast .nav-link,
        .high-contrast .dropdown-item,
        .high-contrast .mobile-nav-link {
          color: #ffffff;
        }

        .high-contrast .btn-emergency {
          background: #ffffff;
          color: #000000;
          border-color: #ffffff;
        }
      `}</style>
    </>
  );
};

export default NavigationSenior;
