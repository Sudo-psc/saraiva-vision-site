import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// Override i18n mock to capture changeLanguage calls specifically for this component
const changeLanguage = vi.fn();
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k, d) => d || k,
    i18n: { language: 'pt', changeLanguage }
  })
}));

// Button is mocked globally in setup to a plain button
import LanguageSwitcher from '@/components/LanguageSwitcher';

describe('LanguageSwitcher', () => {
  it('renderiza dois botões com rótulos de acessibilidade', () => {
    render(<LanguageSwitcher />);
    expect(screen.getByLabelText('Mudar para Português')).toBeInTheDocument();
    expect(screen.getByLabelText('Switch to English')).toBeInTheDocument();
  });

  it('chama i18n.changeLanguage ao clicar em EN e PT', () => {
    render(<LanguageSwitcher />);

    fireEvent.click(screen.getByLabelText('Switch to English'));
    expect(changeLanguage).toHaveBeenCalledWith('en');

    fireEvent.click(screen.getByLabelText('Mudar para Português'));
    expect(changeLanguage).toHaveBeenCalledWith('pt');
  });
});

