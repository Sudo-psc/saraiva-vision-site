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

  const linkClasses =
    'sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[999999] focus:px-5 focus:py-3 focus:rounded-lg focus:bg-cyan-700 focus:text-white focus:shadow-2xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-cyan-700 focus:scale-105 transition-all duration-200';

  return (
    <nav className="relative" aria-label="Links de atalho para navegação">
      {links.map((link, index) => (
        <a
          key={index}
          href={link.href}
          className={linkClasses}
          aria-label={link.ariaLabel}
          tabIndex={0}
        >
          {link.label}
        </a>
      ))}
    </nav>
  );
};

export default SkipLinks;
