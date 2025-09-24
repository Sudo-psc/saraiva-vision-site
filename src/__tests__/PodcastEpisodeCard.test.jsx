/**
 * Podcast Episode Card Component Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PodcastEpisodeCard from '../components/PodcastEpisodeCard';

// Mock Lucide React icons
vi.mock('lucide-react', () => ({
    Play: () => <div data-testid="play-icon">Play</div>,
    Clock: () => <div data-testid="clock-icon">Clock</div>,
    Calendar: () => <div data-testid="calendar-icon">Calendar</div>,
    ExternalLink: () => <div data-testid="external-link-icon">ExternalLink</div>,
    Volume2: () => <div data-testid="volume-icon">Volume2</div>
}));

describe('PodcastEpisodeCard', () => {
    const mockEpisode = {
        id: '1',
        spotifyId: 'abc123',
        title: 'Test Episode',
        description: 'This is a test episode description that is long enough to test the truncation functionality.',
        formattedDuration: '30:45',
        publishedAt: '2024-01-01T10:00:00.000Z',
        spotifyUrl: 'https://open.spotify.com/episode/abc123',
        embedUrl: 'https://open.spotify.com/embed/episode/abc123',
        imageUrl: 'https://example.com/image.jpg'
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render episode information correctly', () => {
        render(<PodcastEpisodeCard episode={mockEpisode} />);

        expect(screen.getByText('Test Episode')).toBeInTheDocument();
        expect(screen.getByText(/This is a test episode description/)).toBeInTheDocument();
        expect(screen.getByText('30:45')).toBeInTheDocument();
        expect(screen.getByText('1 de janeiro de 2024')).toBeInTheDocument();
    });

    it('should render episode image when provided', () => {
        render(<PodcastEpisodeCard episode={mockEpisode} />);

        const image = screen.getByAltText('Test Episode');
        expect(image).toBeInTheDocument();
        expect(image).toHaveAttribute('src', 'https://example.com/image.jpg');
    });

    it('should render fallback icon when no image provided', () => {
        const episodeWithoutImage = { ...mockEpisode, imageUrl: null };
        render(<PodcastEpisodeCard episode={episodeWithoutImage} />);

        expect(screen.getByTestId('volume-icon')).toBeInTheDocument();
    });

    it('should show play button overlay when player is enabled', () => {
        render(<PodcastEpisodeCard episode={mockEpisode} showPlayer={true} />);

        const playButton = screen.getByLabelText('Reproduzir Test Episode');
        expect(playButton).toBeInTheDocument();
        expect(screen.getByTestId('play-icon')).toBeInTheDocument();
    });

    it('should hide play button when player is disabled', () => {
        render(<PodcastEpisodeCard episode={mockEpisode} showPlayer={false} />);

        expect(screen.queryByLabelText('Reproduzir Test Episode')).not.toBeInTheDocument();
    });

    it('should load Spotify player when play button is clicked', async () => {
        render(<PodcastEpisodeCard episode={mockEpisode} showPlayer={true} />);

        const playButton = screen.getByLabelText('Reproduzir Test Episode');
        fireEvent.click(playButton);

        await waitFor(() => {
            const iframe = screen.getByTitle('Player do Spotify - Test Episode');
            expect(iframe).toBeInTheDocument();
            expect(iframe).toHaveAttribute('src', mockEpisode.embedUrl);
        });

        // Play button should be hidden after loading player
        expect(screen.queryByLabelText('Reproduzir Test Episode')).not.toBeInTheDocument();
    });

    it('should call onPlay callback when play button is clicked', () => {
        const onPlayMock = vi.fn();
        render(<PodcastEpisodeCard episode={mockEpisode} showPlayer={true} onPlay={onPlayMock} />);

        const playButton = screen.getByLabelText('Reproduzir Test Episode');
        fireEvent.click(playButton);

        expect(onPlayMock).toHaveBeenCalledWith(mockEpisode);
    });

    it('should open Spotify URL when external link is clicked', () => {
        const windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => { });

        render(<PodcastEpisodeCard episode={mockEpisode} />);

        const externalLinkButton = screen.getByLabelText('Abrir no Spotify');
        fireEvent.click(externalLinkButton);

        expect(windowOpenSpy).toHaveBeenCalledWith(
            mockEpisode.spotifyUrl,
            '_blank',
            'noopener,noreferrer'
        );

        windowOpenSpy.mockRestore();
    });

    it('should truncate long descriptions', () => {
        render(<PodcastEpisodeCard episode={mockEpisode} />);

        // Should show truncated description initially
        expect(screen.getByText(/This is a test episode description that is long enough to test the truncation functionality\.\.\./)).toBeInTheDocument();

        // Should show "Ver mais" button
        expect(screen.getByText('Ver mais')).toBeInTheDocument();
    });

    it('should expand and collapse description', () => {
        render(<PodcastEpisodeCard episode={mockEpisode} />);

        const verMaisButton = screen.getByText('Ver mais');
        fireEvent.click(verMaisButton);

        // Should show full description
        expect(screen.getByText('This is a test episode description that is long enough to test the truncation functionality.')).toBeInTheDocument();

        // Button should change to "Ver menos"
        expect(screen.getByText('Ver menos')).toBeInTheDocument();

        // Click "Ver menos"
        const verMenosButton = screen.getByText('Ver menos');
        fireEvent.click(verMenosButton);

        // Should show truncated description again
        expect(screen.getByText(/This is a test episode description that is long enough to test the truncation functionality\.\.\./)).toBeInTheDocument();
        expect(screen.getByText('Ver mais')).toBeInTheDocument();
    });

    it('should render in compact mode', () => {
        render(<PodcastEpisodeCard episode={mockEpisode} compact={true} />);

        // In compact mode, description should be shorter and no expand/collapse
        expect(screen.queryByText('Ver mais')).not.toBeInTheDocument();

        // Should still show basic episode info
        expect(screen.getByText('Test Episode')).toBeInTheDocument();
        expect(screen.getByText('30:45')).toBeInTheDocument();
    });

    it('should handle missing episode data gracefully', () => {
        const incompleteEpisode = {
            id: '1',
            title: 'Test Episode'
            // Missing other fields
        };

        render(<PodcastEpisodeCard episode={incompleteEpisode} />);

        expect(screen.getByText('Test Episode')).toBeInTheDocument();
        // Should not crash when optional fields are missing
    });

    it('should return null when no episode provided', () => {
        const { container } = render(<PodcastEpisodeCard episode={null} />);
        expect(container.firstChild).toBeNull();
    });

    it('should format dates correctly', () => {
        const episodeWithDate = {
            ...mockEpisode,
            publishedAt: '2024-12-25T15:30:00.000Z'
        };

        render(<PodcastEpisodeCard episode={episodeWithDate} />);

        expect(screen.getByText('25 de dezembro de 2024')).toBeInTheDocument();
    });

    it('should handle invalid dates gracefully', () => {
        const episodeWithInvalidDate = {
            ...mockEpisode,
            publishedAt: 'invalid-date'
        };

        render(<PodcastEpisodeCard episode={episodeWithInvalidDate} />);

        // Should not crash and not show date
        expect(screen.queryByTestId('calendar-icon')).not.toBeInTheDocument();
    });

    it('should not show external link when no Spotify URL', () => {
        const episodeWithoutUrl = { ...mockEpisode, spotifyUrl: null };
        render(<PodcastEpisodeCard episode={episodeWithoutUrl} />);

        expect(screen.queryByLabelText('Abrir no Spotify')).not.toBeInTheDocument();
    });

    it('should apply correct CSS classes for compact mode', () => {
        const { container } = render(<PodcastEpisodeCard episode={mockEpisode} compact={true} />);

        // Should have compact padding
        const card = container.querySelector('.p-4');
        expect(card).toBeInTheDocument();
    });

    it('should apply correct CSS classes for normal mode', () => {
        const { container } = render(<PodcastEpisodeCard episode={mockEpisode} compact={false} />);

        // Should have normal padding
        const card = container.querySelector('.p-6');
        expect(card).toBeInTheDocument();
    });
});