import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n';
import GoogleReviewsWidget from '../GoogleReviewsWidget';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useGoogleReviews } from '@/hooks/useGoogleReviews';
import { fetchPlaceDetails } from '@/lib/fetchPlaceDetails';

// Mock a IntersectionObserver
beforeEach(() => {
    const mockIntersectionObserver = vi.fn();
    mockIntersectionObserver.mockReturnValue({
        observe: () => null,
        unobserve: () => null,
        disconnect: () => null
    });
    window.IntersectionObserver = mockIntersectionObserver;
});

// Mock the hooks used in the component
vi.mock('@/hooks/useGoogleReviews');
vi.mock('@/lib/fetchPlaceDetails');

const mockReviews = [
    {
        name: 'review-1',
        reviewer: { displayName: 'John Doe', profilePhotoUrl: '' },
        rating: 5,
        text: { text: 'Great service!' },
    },
    {
        name: 'review-2',
        authorAttribution: { displayName: 'Jane Smith', photoUri: '' },
        rating: 4,
        text: { text: 'Good experience.' },
    },
    { name: 'review-3', rating: 3 }, // Missing reviewer and text
    null, // Null review
];

describe('GoogleReviewsWidget', () => {
    it('should show loading state initially', () => {
        useGoogleReviews.mockReturnValue({
            reviews: [],
            stats: null,
            loading: true,
            error: null,
        });
        fetchPlaceDetails.mockResolvedValue({ reviews: [] });

        render(
            <I18nextProvider i18n={i18n}>
                <GoogleReviewsWidget />
            </I18nextProvider>
        );
        expect(screen.getByText('Carregando avaliações...')).toBeInTheDocument();
    });

    it('should render fallback reviews if API fails', async () => {
        useGoogleReviews.mockReturnValue({
            reviews: [],
            stats: null,
            loading: false,
            error: new Error('API Error'),
        });
        fetchPlaceDetails.mockRejectedValue(new Error('API Error'));

        render(
            <I18nextProvider i18n={i18n}>
                <GoogleReviewsWidget />
            </I18nextProvider>
        );

        await waitFor(() => {
            expect(screen.getAllByText('Elis R.').length).toBeGreaterThan(0);
            expect(screen.getAllByText('Lais S.').length).toBeGreaterThan(0);
        });
    });

    it('should render and normalize API reviews correctly', async () => {
        useGoogleReviews.mockReturnValue({
            reviews: mockReviews,
            stats: { overview: { averageRating: 4.5, totalReviews: 100 } },
            loading: false,
            error: null,
        });
        fetchPlaceDetails.mockResolvedValue({ reviews: mockReviews });

        render(
            <I18nextProvider i18n={i18n}>
                <GoogleReviewsWidget />
            </I18nextProvider>
        );

        await waitFor(() => {
            // Check for normalized names
            expect(screen.getAllByText('John Doe').length).toBeGreaterThan(0);
            expect(screen.getAllByText('Jane Smith').length).toBeGreaterThan(0);
            // Check for fallback name
            expect(screen.getAllByText('Anônimo').length).toBeGreaterThan(0);

            // Check for normalized texts
            expect(screen.getAllByText(/Great service!/).length).toBeGreaterThan(0);
            expect(screen.getAllByText(/Good experience./).length).toBeGreaterThan(0);
        });
    });
});
