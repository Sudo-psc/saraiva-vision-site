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
    // Updated to match new featured episode title
    expect(screen.getByText('Podcast em Destaque')).toBeInTheDocument();
  });

  it('displays a single featured episode instead of carousel', () => {
    const { container } = renderComponent();
    // Should no longer have the scroll carousel
    const scroll = container.querySelector('[data-testid="podcast-scroll"]');
    expect(scroll).toBeFalsy();

    // Should have a single featured episode section
    const featuredSection = container.querySelector('.max-w-4xl');
    expect(featuredSection).toBeTruthy();
  });

  it('applies glassmorphism and 3D card styles to the featured episode', () => {
    const { container } = renderComponent();
    const card3d = container.querySelector('.card-3d');
    expect(card3d).toBeTruthy();
    // Ensure glass variant applied
    const glass = container.querySelector('.glass-blue');
    expect(glass).toBeTruthy();
  });

  it('does not include Spotify embed on homepage', () => {
    const { container } = renderComponent();
    const spotifyEmbed = container.querySelector('iframe[src*="spotify.com/embed"]');
    expect(spotifyEmbed).toBeFalsy();
  });

  it('links to the full podcast page', () => {
    renderComponent();
    const link = screen.getAllByRole('link').find(a => a.getAttribute('href') === '/podcast');
    expect(link).toBeTruthy();
  });
});
