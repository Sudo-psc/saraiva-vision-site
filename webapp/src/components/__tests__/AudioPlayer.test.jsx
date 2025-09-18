import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import { render as rtlRender } from '../../test/test-utils.jsx';

// Mocks for i18n and framer-motion to simplify rendering
import { mockUseTranslation, mockMotionComponents } from '../../test/test-utils.jsx';

vi.mock('react-i18next', () => ({
  useTranslation: mockUseTranslation
}));

vi.mock('framer-motion', () => mockMotionComponents);

import AudioPlayer from '../AudioPlayer.jsx';

describe('AudioPlayer (modal)', () => {
  beforeEach(() => {
    // Mock HTMLMediaElement methods to avoid jsdom errors
    Object.defineProperty(window.HTMLMediaElement.prototype, 'play', {
      configurable: true,
      value: vi.fn().mockResolvedValue()
    });
    Object.defineProperty(window.HTMLMediaElement.prototype, 'pause', {
      configurable: true,
      value: vi.fn()
    });
  });

  const episode = {
    id: 'test-ep',
    src: '/Podcasts/test.mp3',
    title: 'Teste',
    description: 'Descrição',
    cover: '/Podcasts/Covers/test.png',
    duration: '01:23',
    category: 'Teste'
  };

  it('renders modal without crashing and can close', () => {
    const onClose = vi.fn();
    rtlRender(
      <AudioPlayer episode={episode} mode="modal" onClose={onClose} />
    );

    // Close button exists and works
    const closeBtn = screen.getByLabelText('Fechar player');
    expect(closeBtn).toBeInTheDocument();
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalled();
  });

  it('toggles play/pause state via button', async () => {
    rtlRender(
      <AudioPlayer episode={episode} mode="modal" onClose={() => {}} />
    );

    // Initial state: should show "Reproduzir"
    const playBtn = screen.getByLabelText('Reproduzir');
    expect(playBtn).toBeInTheDocument();

    // Click to play
    fireEvent.click(playBtn);

    // After play resolves, label becomes "Pausar"
    const pauseBtn = await screen.findByLabelText('Pausar');
    expect(pauseBtn).toBeInTheDocument();

    // Click to pause
    fireEvent.click(pauseBtn);
    expect(await screen.findByLabelText('Reproduzir')).toBeInTheDocument();
  });
});

