import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import PodcastPage from '../../pages/PodcastPage';

// Example mock to guard against heavy dependencies (if any imported indirectly)
vi.mock('../../components/GoogleMap', () => ({ default: () => <div /> }));

describe('PodcastPage (mobile-first + new episode)', () => {
  const renderComponent = () =>
    render(
      <HelmetProvider>
        <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <PodcastPage />
        </MemoryRouter>
      </HelmetProvider>
    );

  it('renders podcast title', () => {
    renderComponent();
    expect(screen.getAllByText('podcast.title').length).toBeGreaterThan(0);
  });

  it('uses compact vertical spacing and responsive grid', () => {
    const { container } = renderComponent();
    // Expect the hero section to have compact padding (py-10...)
    const section = Array.from(container.querySelectorAll('section')).find(s => s.className.includes('py-10'));
    expect(section).toBeTruthy();
    // Episodes grid is mobile-first
    const grid = container.querySelector('.grid.grid-cols-1');
    expect(grid).toBeTruthy();
  });

  it('includes Ceratocone episode in the list', () => {
    renderComponent();
    // Mocked i18n returns the key string
    expect(screen.getByText('podcast.episodes.ceratocone.title')).toBeInTheDocument();
  });
});
