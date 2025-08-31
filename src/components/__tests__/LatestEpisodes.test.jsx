import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LatestEpisodes from '../../components/LatestEpisodes';

describe('LatestEpisodes (mobile-first + design)', () => {
  const renderComponent = () =>
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <LatestEpisodes />
      </MemoryRouter>
    );

  it('renders the podcast header text', () => {
    renderComponent();
    // With mocked i18n, this resolves to the key
    expect(screen.getByText('podcast.title')).toBeInTheDocument();
  });

  it('uses a horizontal scrollable carousel on mobile', () => {
    const { container } = renderComponent();
    const scroll = container.querySelector('[data-testid="podcast-scroll"]');
    expect(scroll).toBeTruthy();
    expect(scroll?.className).toContain('overflow-x-auto');
    expect(scroll?.className).toContain('snap-x');
  });

  it('applies glassmorphism and 3D card styles to episode cards', () => {
    const { container } = renderComponent();
    const card3d = container.querySelector('.card-3d');
    expect(card3d).toBeTruthy();
    // Ensure glass variant applied
    const glass = container.querySelector('.glass-blue');
    expect(glass).toBeTruthy();
  });

  it('links to the full podcast page', () => {
    renderComponent();
    const link = screen.getAllByRole('link').find(a => a.getAttribute('href') === '/podcast');
    expect(link).toBeTruthy();
  });
});
