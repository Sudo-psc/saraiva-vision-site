import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { InstagramPost, InstagramStats } from '../index';

// Mock framer-motion
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }) => <div {...props}>{children}</div>,
        article: ({ children, ...props }) => <article {...props}>{children}</article>,
        img: ({ children, ...props }) => <img {...props}>{children}</img>
    },
    AnimatePresence: ({ children }) => children
}));

// Mock date-fns
vi.mock('date-fns', () => ({
    format: vi.fn(() => '01/01/2024'),
    formatDistanceToNow: vi.fn(() => 'há 2 horas')
}));

vi.mock('date-fns/locale', () => ({
    ptBR: {}
}));

describe('Instagram Components', () => {
    const mockPost = {
        id: 'test-post-1',
        caption: 'Test Instagram post caption',
        media_type: 'IMAGE',
        media_url: 'https://example.com/image.jpg',
        permalink: 'https://instagram.com/p/test',
        timestamp: '2024-01-01T12:00:00Z',
        username: 'testuser',
        stats: {
            likes: 150,
            comments: 25,
            engagement_rate: 5.2
        }
    };

    beforeEach(() => {
        // Reset all mocks
        vi.clearAllMocks();

        // Mock IntersectionObserver
        global.IntersectionObserver = vi.fn().mockImplementation((callback) => ({
            observe: vi.fn(),
            disconnect: vi.fn(),
            unobserve: vi.fn(),
        }));

        // Mock WebSocket
        global.WebSocket = vi.fn().mockImplementation(() => ({
            readyState: 1, // OPEN
            send: vi.fn(),
            close: vi.fn(),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
        }));
    });

    describe('InstagramPost', () => {
        it('renders post with basic information', () => {
            render(<InstagramPost post={mockPost} enableLazyLoading={false} />);

            expect(screen.getByText('@testuser')).toBeInTheDocument();
            expect(screen.getByText(/Test Instagram post caption/)).toBeInTheDocument();
            expect(screen.getByRole('button')).toBeInTheDocument();
        });

        it('shows video indicator for video posts', () => {
            const videoPost = {
                ...mockPost,
                media_type: 'VIDEO',
                thumbnail_url: 'https://example.com/thumbnail.jpg'
            };

            render(<InstagramPost post={videoPost} enableLazyLoading={false} />);
            expect(screen.getByText('VIDEO')).toBeInTheDocument();
        });

        it('handles missing post gracefully', () => {
            const { container } = render(<InstagramPost post={null} />);
            expect(container.firstChild).toBeNull();
        });

        it('renders image with correct attributes', () => {
            render(<InstagramPost post={mockPost} enableLazyLoading={false} />);

            const image = screen.getByRole('img');
            expect(image).toHaveAttribute('src', mockPost.media_url);
        });
    });

    describe('InstagramStats', () => {
        it('renders statistics correctly', () => {
            render(<InstagramStats postId="test-post-1" initialStats={mockPost.stats} />);

            expect(screen.getByText('150')).toBeInTheDocument(); // likes
            expect(screen.getByText('25')).toBeInTheDocument(); // comments
            expect(screen.getByText('5.2%')).toBeInTheDocument(); // engagement rate
        });

        it('formats large numbers correctly', () => {
            const largeStats = {
                likes: 1500,
                comments: 250,
                engagement_rate: 8.5
            };

            render(<InstagramStats postId="test-post-1" initialStats={largeStats} />);

            expect(screen.getByText('1.5K')).toBeInTheDocument();
            expect(screen.getByText('250')).toBeInTheDocument();
        });

        it('handles missing postId gracefully', () => {
            const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });
            const { container } = render(<InstagramStats />);

            expect(container.firstChild).toBeNull();
            expect(consoleSpy).toHaveBeenCalledWith('InstagramStats: postId is required');

            consoleSpy.mockRestore();
        });

        it('shows loading state when no initial stats', () => {
            render(<InstagramStats postId="test-post-1" realtime={false} />);
            expect(screen.getByText('Loading stats...')).toBeInTheDocument();
        });
    });
});