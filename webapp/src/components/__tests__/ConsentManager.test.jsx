import React from 'react';
import { describe, it, beforeEach, expect } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import ConsentManager from '@/components/ConsentManager';

const STORAGE_KEY = 'sv_consent_v1';

describe('ConsentManager (UI + storage + body lock)', () => {
  beforeEach(() => {
    localStorage.clear();
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
  });

  it('exibe banner quando não há consentimento salvo e bloqueia scroll do body', () => {
    render(<ConsentManager />);
    expect(screen.getByText('privacy.intro')).toBeInTheDocument();
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('abre modal ao personalizar e salva preferências', () => {
    render(<ConsentManager />);

    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[1]);

    expect(screen.getByText('privacy.manage_cookies')).toBeInTheDocument();

    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[1]);

    const saveBtn = screen.getAllByRole('button').pop();
    fireEvent.click(saveBtn);

    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    expect(saved).toBeTruthy();
    expect(saved).toHaveProperty('timestamp');
    expect(document.body.style.overflow).toBe('');
  });

  it('aceitar todos salva analytics/marketing como verdadeiros', () => {
    render(<ConsentManager />);
    const acceptAllBtn = screen.getAllByRole('button')[2];
    fireEvent.click(acceptAllBtn);

    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    expect(saved.analytics).toBe(true);
    expect(saved.marketing).toBe(true);
    expect(saved.functional).toBe(true);
  });

  it('evento "open-privacy-settings" abre o modal', () => {
    render(<ConsentManager />);
    act(() => {
      window.dispatchEvent(new Event('open-privacy-settings'));
    });
    expect(screen.getByText('privacy.manage_cookies')).toBeInTheDocument();
  });
});

