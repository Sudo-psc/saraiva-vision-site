import React from 'react';

/**
 * SkipLinks Component - WCAG 2.1 AA Compliance
 *
 * Provides keyboard navigation shortcuts for screen readers and keyboard users.
 * These links are visually hidden but become visible when focused (Tab key).
 *
 * WCAG Guidelines:
 * - 2.4.1 Bypass Blocks (Level A)
 * - 2.4.3 Focus Order (Level A)
 * - 2.1.1 Keyboard (Level A)
 *
 * @component
 * @example
 * <SkipLinks />
 */
const SkipLinks = () => {
  const skipLinkStyle = {
    position: 'absolute',
    left: '-10000px',
    top: 'auto',
    width: '1px',
    height: '1px',
    overflow: 'hidden',
    // When focused, bring into view
    '&:focus': {
      position: 'fixed',
      top: '10px',
      left: '10px',
      width: 'auto',
      height: 'auto',
      overflow: 'visible',
      zIndex: 999999
    }
  };

  const links = [
    {
      href: '#main-content',
      label: 'Pular para conteúdo principal',
      ariaLabel: 'Pressione Enter para pular para o conteúdo principal da página'
    },
    {
      href: '#navigation',
      label: 'Pular para navegação',
      ariaLabel: 'Pressione Enter para pular para o menu de navegação'
    },
    {
      href: '#footer',
      label: 'Pular para rodapé',
      ariaLabel: 'Pressione Enter para pular para o rodapé com informações de contato'
    }
  ];

  return (
    <div className="skip-links" role="navigation" aria-label="Links de atalho para navegação">
      {links.map((link, index) => (
        <a
          key={index}
          href={link.href}
          className="skip-link sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[999999] focus:bg-cyan-600 focus:text-white focus:px-6 focus:py-3 focus:rounded-lg focus:shadow-2xl focus:font-bold focus:text-lg focus:outline-none focus:ring-4 focus:ring-cyan-300 focus:ring-offset-2 focus:transform focus:scale-105 transition-all duration-200"
          aria-label={link.ariaLabel}
          tabIndex={0}
        >
          {link.label}
        </a>
      ))}

      {/* Additional styles for screen reader and focus behavior */}
      <style jsx>{`
        .skip-links {
          position: relative;
        }

        .skip-link {
          /* Visually hidden but accessible to screen readers */
          clip: rect(1px, 1px, 1px, 1px);
          clip-path: inset(50%);
          height: 1px;
          width: 1px;
          margin: -1px;
          overflow: hidden;
          padding: 0;
          position: absolute;
          white-space: nowrap;
        }

        .skip-link:focus {
          /* Make visible when focused */
          clip: auto;
          clip-path: none;
          height: auto;
          width: auto;
          margin: 0;
          overflow: visible;
          padding: 0.75rem 1.5rem;
          position: fixed;
          white-space: normal;
        }

        /* Smooth scroll behavior when using skip links */
        html {
          scroll-behavior: smooth;
        }

        /* Ensure target elements receive focus properly */
        #main-content:focus,
        #navigation:focus,
        #footer:focus {
          outline: 3px solid #0891b2; /* cyan-600 */
          outline-offset: 4px;
        }
      `}</style>
    </div>
  );
};

export default SkipLinks;
