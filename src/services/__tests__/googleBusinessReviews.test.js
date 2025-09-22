import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import GoogleBusinessService from '../googleBusinessService.js';

// Mock fetch globally
global.fetch = vi.fn();

describe('GoogleBusinessService - Review Functionality', () => {
    let service;
    const mockLocationId = 'accounts/123456789/locations/987654321';

    beforeEach(() => {
        service = new GoogleBusinessService();
        service.apiKey = 'test-api-key';
        service.accessToken = 'test-access-token';
        vi.clearAllMocks();
        fetch.mockClear();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('fetchReviews', () => {
        const mockReviewsResponse = {
            reviews: [
                {
                    name: 'accounts/123/locations/456/reviews/review1',
                    reviewId: 'review1',
                    reviewer: {
                        displayName: 'John Doe',
                        profilePhotoUrl: 'https://lh3.googleusercontent.com/photo.jpg',
                        isAnonymous: false
                    },
                    starRating: 'FIVE',
                    comment: 'Great service!',
                    createTime: '2024-01-15T10:30:00Z',
                    updateTime: '2024-01-15T10:30:00Z',
                    reviewReply: {
                        comment: 'Thank you!',
                        updateTime: '2024-01-16T09:00:00Z'
                    }
                }
            ],
            nextPageToken: 'next-token-123',
            totalSize: 25,
            averageRating: 4.5
        };

        it('should fetch reviews successfully', async () => {
            const mockResponse = {
                ok: true,
                status: 200,
                json: vi.fn().mockResolvedValue(mockReviewsResponse),
                headers: new Map()
            };

            fetch.mockResolvedValue(mockResponse);
            vi.spyOn(service, 'makeRequest').mockResolvedValue({
                ok: true,
                status: 200,
                data: mockReviewsResponse
            });

            const result = await service.fetchReviews(mockLocationId);

            expect(result.success).toBe(true);
            expect(result.reviews).toHaveLength(1);
            expect(result.reviews[0].reviewId).toBe('review1');
            expect(result.nextPageToken).toBe('next-token-123');
            expect(result.totalSize).toBe(25);
            expect(result.averageRating).toBe(4.5);
            expect(result.fetchedAt).toBeDefined();
        });

        it('should handle pagination options', async () => {
            vi.spyOn(service, 'makeRequest').mockResolvedValue({
                ok: true,
                status: 200,
                data: mockReviewsResponse
            });

            const options = {
                pageSize: 10,
                pageToken: 'token-123',
                orderBy: 'starRating desc',
                filter: 'starRating >= 4'
            };

            await service.fetchReviews(mockLocationId, options);

            expect(service.makeRequest).toHaveBeenCalledWith(
                expect.stringContaining('pageSize=10'),
                'GET'
            );
            expect(service.makeRequest).toHaveBeenCalledWith(
                expect.stringContaining('pageToken=token-123'),
                'GET'
            );
            expect(service.makeRequest).toHaveBeenCalledWith(
                expect.stringContaining('orderBy=starRating'),
                'GET'
            );
        });

        it('should throw error for missing location ID', async () => {
            await expect(service.fetchReviews()).rejects.toThrow('Location ID is required');
        });

        it('should throw error for invalid location ID format', async () => {
            await expect(service.fetchReviews('invalid-id')).rejects.toThrow('Invalid location ID format');
        });

        it('should handle API errors gracefully', async () => {
            vi.spyOn(service, 'makeRequest').mockRejectedValue(new Error('API Error'));

            const result = await service.fetchReviews(mockLocationId);

            expect(result.success).toBe(false);
            expect(result.error).toBe('API Error');
            expect(result.reviews).toEqual([]);
        });

        it('should handle empty reviews response', async () => {
            vi.spyOn(service, 'makeRequest').mockResolvedValue({
                ok: true,
                status: 200,
                data: { reviews: [] }
            });

            const result = await service.fetchReviews(mockLocationId);

            expect(result.success).toBe(true);
            expect(result.reviews).toEqual([]);
            expect(result.totalSize).toBe(0);
        });
    });

    describe('fetchBusinessInfo', () => {
        const mockBusinessInfo = {
            name: 'accounts/123/locations/456',
            displayName: 'Test Business',
            websiteUri: 'https://testbusiness.com',
            phoneNumbers: {
                primaryPhone: '+1234567890'
            },
            categories: {
                primaryCategory: {
                    displayName: 'Restaurant'
                }
            }
        };

        it('should fetch business info successfully', async () => {
            vi.spyOn(service, 'makeRequest').mockResolvedValue({
                ok: true,
                status: 200,
                data: mockBusinessInfo
            });

            const result = await service.fetchBusinessInfo(mockLocationId);

            expect(result.success).toBe(true);
            expect(result.businessInfo).toEqual(mockBusinessInfo);
            expect(result.fetchedAt).toBeDefined();
        });

        it('should throw error for missing location ID', async () => {
            await expect(service.fetchBusinessInfo()).rejects.toThrow('Location ID is required');
        });

        it('should handle API errors', async () => {
            vi.spyOn(service, 'makeRequest').mockRejectedValue(new Error('Business info error'));

            const result = await service.fetchBusinessInfo(mockLocationId);

            expect(result.success).toBe(false);
            expect(result.error).toBe('Business info error');
            expect(result.businessInfo).toBeNull();
        });
    });

    describe('getReviewStats', () => {
        const mockReviews = [
            { starRating: 'FIVE', createTime: '2024-01-15T10:30:00Z', reviewReply: { comment: 'Thanks!' } },
            { starRating: 'FOUR', createTime: '2024-01-10T10:30:00Z' },
            { starRating: 'FIVE', createTime: '2024-01-05T10:30:00Z', reviewReply: { comment: 'Appreciate it!' } },
            { starRating: 'THREE', createTime: '2023-12-20T10:30:00Z' }
        ];

        it('should calculate review statistics', async () => {
            vi.spyOn(service, 'fetchReviews').mockResolvedValue({
                success: true,
                reviews: mockReviews,
                totalSize: 4,
                averageRating: 4.25
            });

            const result = await service.getReviewStats(mockLocationId);

            expect(result.success).toBe(true);
            expect(result.stats.totalReviews).toBe(4);
            expect(result.stats.averageRating).toBe(4.25);
            expect(result.stats.ratingDistribution).toEqual({
                1: 0, 2: 0, 3: 1, 4: 1, 5: 2
            });
            expect(result.stats.responseRate).toBe(50); // 2 out of 4 have replies
        });

        it('should handle empty reviews for stats', async () => {
            vi.spyOn(service, 'fetchReviews').mockResolvedValue({
                success: true,
                reviews: [],
                totalSize: 0,
                averageRating: 0
            });

            const result = await service.getReviewStats(mockLocationId);

            expect(result.success).toBe(true);
            expect(result.stats.totalReviews).toBe(0);
            expect(result.stats.averageRating).toBe(0);
            expect(result.stats.ratingDistribution).toEqual({
                1: 0, 2: 0, 3: 0, 4: 0, 5: 0
            });
        });

        it('should handle fetch reviews error', async () => {
            vi.spyOn(service, 'fetchReviews').mockResolvedValue({
                success: false,
                error: 'Failed to fetch reviews'
            });

            const result = await service.getReviewStats(mockLocationId);

            expect(result.success).toBe(false);
            expect(result.error).toBe('Failed to fetch reviews');
            expect(result.stats).toBeNull();
        });
    });

    describe('parseStarRating', () => {
        it('should parse star rating enums correctly', () => {
            expect(service.parseStarRating('ONE')).toBe(1);
            expect(service.parseStarRating('TWO')).toBe(2);
            expect(service.parseStarRating('THREE')).toBe(3);
            expect(service.parseStarRating('FOUR')).toBe(4);
            expect(service.parseStarRating('FIVE')).toBe(5);
        });

        it('should return 0 for invalid ratings', () => {
            expect(service.parseStarRating('INVALID')).toBe(0);
            expect(service.parseStarRating(null)).toBe(0);
            expect(service.parseStarRating(undefined)).toBe(0);
        });
    });

    describe('parseReviewData', () => {
        const mockRawReview = {
            name: 'accounts/123/locations/456/reviews/review1',
            reviewId: 'review1',
            reviewer: {
                displayName: 'John Doe',
                profilePhotoUrl: 'https://lh3.googleusercontent.com/photo.jpg',
                isAnonymous: false
            },
            starRating: 'FIVE',
            comment: 'Great service and friendly staff!',
            createTime: '2024-01-15T10:30:00Z',
            updateTime: '2024-01-15T10:30:00Z',
            reviewReply: {
                comment: 'Thank you for your feedback!',
                updateTime: '2024-01-16T09:00:00Z'
            }
        };

        it('should parse review data correctly', () => {
            const parsed = service.parseReviewData(mockRawReview);

            expect(parsed.id).toBe('accounts/123/locations/456/reviews/review1');
            expect(parsed.reviewId).toBe('review1');
            expect(parsed.starRating).toBe(5);
            expect(parsed.comment).toBe('Great service and friendly staff!');
            expect(parsed.reviewer.displayName).toBe('John Doe');
            expect(parsed.reviewer.isAnonymous).toBe(false);
            expect(parsed.reviewReply.comment).toBe('Thank you for your feedback!');
            expect(parsed.hasResponse).toBe(true);
            expect(parsed.wordCount).toBe(5);
        });

        it('should handle anonymous reviewers', () => {
            const anonymousReview = {
                ...mockRawReview,
                reviewer: {
                    isAnonymous: true
                }
            };

            const parsed = service.parseReviewData(anonymousReview);

            expect(parsed.reviewer.displayName).toBe('Anonymous');
            expect(parsed.reviewer.isAnonymous).toBe(true);
        });

        it('should handle reviews without replies', () => {
            const noReplyReview = {
                ...mockRawReview,
                reviewReply: null
            };

            const parsed = service.parseReviewData(noReplyReview);

            expect(parsed.reviewReply).toBeNull();
            expect(parsed.hasResponse).toBe(false);
        });

        it('should return null for invalid review data', () => {
            expect(service.parseReviewData(null)).toBeNull();
            expect(service.parseReviewData(undefined)).toBeNull();
        });

        it('should handle parsing errors gracefully', () => {
            const invalidReview = {
                createTime: 'invalid-date'
            };

            const parsed = service.parseReviewData(invalidReview);
            expect(parsed).not.toBeNull();
            expect(parsed.isRecent).toBe(false);
        });
    });

    describe('isRecentReview', () => {
        it('should identify recent reviews correctly', () => {
            const recentDate = new Date();
            recentDate.setDate(recentDate.getDate() - 15); // 15 days ago

            const oldDate = new Date();
            oldDate.setDate(oldDate.getDate() - 45); // 45 days ago

            expect(service.isRecentReview(recentDate.toISOString())).toBe(true);
            expect(service.isRecentReview(oldDate.toISOString())).toBe(false);
        });

        it('should handle invalid dates', () => {
            expect(service.isRecentReview('invalid-date')).toBe(false);
            expect(service.isRecentReview(null)).toBe(false);
            expect(service.isRecentReview(undefined)).toBe(false);
        });
    });

    describe('fetchAllReviews', () => {
        it('should fetch all reviews with pagination', async () => {
            const firstPageResponse = {
                success: true,
                reviews: [
                    { starRating: 'FIVE', comment: 'Great!' },
                    { starRating: 'FOUR', comment: 'Good!' }
                ],
                nextPageToken: 'token-2'
            };

            const secondPageResponse = {
                success: true,
                reviews: [
                    { starRating: 'FIVE', comment: 'Excellent!' }
                ],
                nextPageToken: null
            };

            vi.spyOn(service, 'fetchReviews')
                .mockResolvedValueOnce(firstPageResponse)
                .mockResolvedValueOnce(secondPageResponse);

            vi.spyOn(service, 'parseReviewData')
                .mockImplementation(review => ({
                    ...review,
                    starRating: service.parseStarRating(review.starRating),
                    wordCount: review.comment.split(' ').length
                }));

            const result = await service.fetchAllReviews(mockLocationId, { maxReviews: 10 });

            expect(result.success).toBe(true);
            expect(result.reviews).toHaveLength(3);
            expect(result.totalFetched).toBe(3);
            expect(result.hasMore).toBe(false);
        });

        it('should respect maxReviews limit', async () => {
            const mockResponse = {
                success: true,
                reviews: Array(10).fill().map((_, i) => ({
                    starRating: 'FIVE',
                    comment: `Review ${i}`
                })),
                nextPageToken: 'has-more'
            };

            vi.spyOn(service, 'fetchReviews').mockResolvedValue(mockResponse);
            vi.spyOn(service, 'parseReviewData').mockImplementation(review => review);

            const result = await service.fetchAllReviews(mockLocationId, { maxReviews: 5 });

            expect(result.reviews).toHaveLength(5);
        });

        it('should filter by minimum rating', async () => {
            const mockResponse = {
                success: true,
                reviews: [
                    { starRating: 'FIVE', comment: 'Great!' },
                    { starRating: 'TWO', comment: 'Poor!' },
                    { starRating: 'FOUR', comment: 'Good!' }
                ],
                nextPageToken: null
            };

            vi.spyOn(service, 'fetchReviews').mockResolvedValue(mockResponse);
            vi.spyOn(service, 'parseReviewData').mockImplementation(review => ({
                ...review,
                starRating: service.parseStarRating(review.starRating)
            }));

            const result = await service.fetchAllReviews(mockLocationId, { minRating: 4 });

            expect(result.reviews).toHaveLength(2); // Only 4 and 5 star reviews
            expect(result.reviews.every(r => r.starRating >= 4)).toBe(true);
        });

        it('should filter by date range', async () => {
            const mockResponse = {
                success: true,
                reviews: [
                    { starRating: 'FIVE', comment: 'Great!', createTime: '2024-01-15T10:30:00Z' },
                    { starRating: 'FOUR', comment: 'Good!', createTime: '2023-12-01T10:30:00Z' },
                    { starRating: 'FIVE', comment: 'Excellent!', createTime: '2024-01-20T10:30:00Z' }
                ],
                nextPageToken: null
            };

            vi.spyOn(service, 'fetchReviews').mockResolvedValue(mockResponse);
            vi.spyOn(service, 'parseReviewData').mockImplementation(review => ({
                ...review,
                starRating: service.parseStarRating(review.starRating),
                createTime: review.createTime
            }));

            const dateRange = {
                start: new Date('2024-01-01'),
                end: new Date('2024-01-31')
            };

            const result = await service.fetchAllReviews(mockLocationId, { dateRange });

            expect(result.reviews).toHaveLength(2); // Only reviews from January 2024
            expect(result.metadata.appliedFilters.dateRange).toEqual(dateRange);
        });

        it('should filter by keywords', async () => {
            const mockResponse = {
                success: true,
                reviews: [
                    { starRating: 'FIVE', comment: 'Great food and service!' },
                    { starRating: 'FOUR', comment: 'Nice atmosphere' },
                    { starRating: 'FIVE', comment: 'Excellent food quality' }
                ],
                nextPageToken: null
            };

            vi.spyOn(service, 'fetchReviews').mockResolvedValue(mockResponse);
            vi.spyOn(service, 'parseReviewData').mockImplementation(review => ({
                ...review,
                starRating: service.parseStarRating(review.starRating),
                comment: review.comment
            }));

            const result = await service.fetchAllReviews(mockLocationId, {
                keywords: ['food']
            });

            expect(result.reviews).toHaveLength(2); // Only reviews mentioning 'food'
            expect(result.reviews.every(r => r.comment.toLowerCase().includes('food'))).toBe(true);
        });

        it('should call progress callback', async () => {
            const mockResponse = {
                success: true,
                reviews: [{ starRating: 'FIVE', comment: 'Great!' }],
                nextPageToken: null
            };

            vi.spyOn(service, 'fetchReviews').mockResolvedValue(mockResponse);
            vi.spyOn(service, 'parseReviewData').mockImplementation(review => review);

            const progressCallback = vi.fn();

            await service.fetchAllReviews(mockLocationId, {
                onProgress: progressCallback
            });

            expect(progressCallback).toHaveBeenCalledWith({
                totalFetched: 1,
                totalProcessed: 1,
                hasMore: false,
                currentBatch: 1
            });
        });

        it('should handle fetch errors and return partial results', async () => {
            const firstPageResponse = {
                success: true,
                reviews: [{ starRating: 'FIVE', comment: 'Great!' }],
                nextPageToken: 'token-2'
            };

            vi.spyOn(service, 'fetchReviews')
                .mockResolvedValueOnce(firstPageResponse)
                .mockRejectedValueOnce(new Error('Network error'));

            vi.spyOn(service, 'parseReviewData').mockImplementation(review => review);

            const result = await service.fetchAllReviews(mockLocationId);

            expect(result.success).toBe(false);
            expect(result.error).toBe('Network error');
            expect(result.reviews).toHaveLength(1); // Partial results
        });
    });

    describe('filterReviews', () => {
        const mockReviews = [
            {
                starRating: 5,
                hasResponse: true,
                isRecent: true,
                wordCount: 20,
                comment: 'Great service with excellent food',
                reviewer: { isAnonymous: false }
            },
            {
                starRating: 3,
                hasResponse: false,
                isRecent: false,
                wordCount: 5,
                comment: 'Average experience',
                reviewer: { isAnonymous: true }
            },
            {
                starRating: 4,
                hasResponse: true,
                isRecent: true,
                wordCount: 15,
                comment: 'Good food and service',
                reviewer: { isAnonymous: false }
            }
        ];

        it('should filter by rating range', () => {
            const filtered = service.filterReviews(mockReviews, {
                minRating: 4,
                maxRating: 5
            });

            expect(filtered).toHaveLength(2);
            expect(filtered.every(r => r.starRating >= 4 && r.starRating <= 5)).toBe(true);
        });

        it('should filter by response status', () => {
            const withResponses = service.filterReviews(mockReviews, { hasResponse: true });
            const withoutResponses = service.filterReviews(mockReviews, { hasResponse: false });

            expect(withResponses).toHaveLength(2);
            expect(withoutResponses).toHaveLength(1);
        });

        it('should filter by recent status', () => {
            const recentReviews = service.filterReviews(mockReviews, { isRecent: true });
            const oldReviews = service.filterReviews(mockReviews, { isRecent: false });

            expect(recentReviews).toHaveLength(2);
            expect(oldReviews).toHaveLength(1);
        });

        it('should filter by word count', () => {
            const longReviews = service.filterReviews(mockReviews, { minWordCount: 10 });

            expect(longReviews).toHaveLength(2);
            expect(longReviews.every(r => r.wordCount >= 10)).toBe(true);
        });

        it('should filter by keywords', () => {
            const foodReviews = service.filterReviews(mockReviews, {
                keywords: ['food', 'service']
            });

            expect(foodReviews).toHaveLength(2);
        });

        it('should exclude anonymous reviews', () => {
            const namedReviews = service.filterReviews(mockReviews, {
                excludeAnonymous: true
            });

            expect(namedReviews).toHaveLength(2);
            expect(namedReviews.every(r => !r.reviewer.isAnonymous)).toBe(true);
        });

        it('should handle empty reviews array', () => {
            const filtered = service.filterReviews([], { minRating: 4 });
            expect(filtered).toEqual([]);
        });

        it('should handle null reviews array', () => {
            const filtered = service.filterReviews(null, { minRating: 4 });
            expect(filtered).toEqual([]);
        });

        it('should filter by date range', () => {
            const reviewsWithDates = [
                {
                    starRating: 5,
                    createTime: '2024-01-15T10:30:00Z',
                    reviewer: { isAnonymous: false }
                },
                {
                    starRating: 4,
                    createTime: '2023-12-01T10:30:00Z',
                    reviewer: { isAnonymous: false }
                },
                {
                    starRating: 5,
                    createTime: '2024-01-20T10:30:00Z',
                    reviewer: { isAnonymous: false }
                }
            ];

            const dateRange = {
                start: new Date('2024-01-01'),
                end: new Date('2024-01-31')
            };

            const filtered = service.filterReviews(reviewsWithDates, { dateRange });

            expect(filtered).toHaveLength(2);
            expect(filtered.every(r => {
                const reviewDate = new Date(r.createTime);
                return reviewDate >= dateRange.start && reviewDate <= dateRange.end;
            })).toBe(true);
        });

        it('should filter by sentiment', () => {
            const reviewsWithSentiment = [
                {
                    starRating: 5,
                    comment: 'Great service and excellent food!',
                    reviewer: { isAnonymous: false }
                },
                {
                    starRating: 1,
                    comment: 'Terrible experience, awful service',
                    reviewer: { isAnonymous: false }
                },
                {
                    starRating: 3,
                    comment: 'It was okay',
                    reviewer: { isAnonymous: false }
                }
            ];

            vi.spyOn(service, 'analyzeSentiment')
                .mockReturnValueOnce('positive')
                .mockReturnValueOnce('negative')
                .mockReturnValueOnce('neutral');

            const positiveFiltered = service.filterReviews(reviewsWithSentiment, { sentiment: 'positive' });
            const negativeFiltered = service.filterReviews(reviewsWithSentiment, { sentiment: 'negative' });

            expect(positiveFiltered).toHaveLength(1);
            expect(negativeFiltered).toHaveLength(1);
        });

        it('should apply multiple filters', () => {
            const filtered = service.filterReviews(mockReviews, {
                minRating: 4,
                hasResponse: true,
                isRecent: true,
                excludeAnonymous: true
            });

            expect(filtered).toHaveLength(2);
            expect(filtered.every(r =>
                r.starRating >= 4 &&
                r.hasResponse &&
                r.isRecent &&
                !r.reviewer.isAnonymous
            )).toBe(true);
        });
    });

    describe('calculateReviewStats', () => {
        // Create dates that are definitely within the last 30 days
        const now = new Date();
        const recent1 = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000); // 5 days ago
        const recent2 = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000); // 10 days ago
        const recent3 = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000); // 15 days ago
        const old1 = new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000); // 45 days ago
        const old2 = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000); // 60 days ago

        const mockReviews = [
            { starRating: 'FIVE', createTime: recent1.toISOString(), reviewReply: { comment: 'Thanks!' } },
            { starRating: 'FOUR', createTime: recent2.toISOString() },
            { starRating: 'FIVE', createTime: recent3.toISOString(), reviewReply: { comment: 'Great!' } },
            { starRating: 'THREE', createTime: old1.toISOString() },
            { starRating: 'TWO', createTime: old2.toISOString() }
        ];

        it('should calculate statistics correctly', () => {
            const stats = service.calculateReviewStats(mockReviews);

            expect(stats.averageRating).toBe(3.8); // (5+4+5+3+2)/5 = 3.8
            expect(stats.totalReviews).toBe(5);
            expect(stats.ratingDistribution).toEqual({
                1: 0, 2: 1, 3: 1, 4: 1, 5: 2
            });
            expect(stats.responseRate).toBe(40); // 2 out of 5 have replies
            expect(stats.recentReviews).toBe(3); // Reviews within last 30 days
        });

        it('should handle empty reviews array', () => {
            const stats = service.calculateReviewStats([]);

            expect(stats.averageRating).toBe(0);
            expect(stats.totalReviews).toBe(0);
            expect(stats.ratingDistribution).toEqual({
                1: 0, 2: 0, 3: 0, 4: 0, 5: 0
            });
            expect(stats.responseRate).toBe(0);
            expect(stats.recentReviews).toBe(0);
        });

        it('should handle null reviews', () => {
            const stats = service.calculateReviewStats(null);

            expect(stats.averageRating).toBe(0);
            expect(stats.totalReviews).toBe(0);
        });
    });

    describe('analyzeSentiment', () => {
        it('should identify positive sentiment', () => {
            const positiveReview = {
                comment: 'Great service and excellent food!',
                starRating: 5
            };

            const sentiment = service.analyzeSentiment(positiveReview);
            expect(sentiment).toBe('positive');
        });

        it('should identify negative sentiment', () => {
            const negativeReview = {
                comment: 'Terrible experience, awful service and bad food',
                starRating: 1
            };

            const sentiment = service.analyzeSentiment(negativeReview);
            expect(sentiment).toBe('negative');
        });

        it('should identify neutral sentiment', () => {
            const neutralReview = {
                comment: 'It was okay, nothing special',
                starRating: 3
            };

            const sentiment = service.analyzeSentiment(neutralReview);
            expect(sentiment).toBe('neutral');
        });

        it('should handle reviews without comments', () => {
            const reviewWithoutComment = {
                starRating: 4
            };

            const sentiment = service.analyzeSentiment(reviewWithoutComment);
            expect(sentiment).toBe('neutral');
        });

        it('should factor in star rating', () => {
            const highRatingReview = {
                comment: 'okay',
                starRating: 5
            };

            const lowRatingReview = {
                comment: 'okay',
                starRating: 1
            };

            expect(service.analyzeSentiment(highRatingReview)).toBe('positive');
            expect(service.analyzeSentiment(lowRatingReview)).toBe('negative');
        });
    });

    describe('fetchReviewsBatch', () => {
        it('should process reviews in batches', async () => {
            const mockResponse = {
                success: true,
                reviews: [
                    { starRating: 'FIVE', comment: 'Great!' },
                    { starRating: 'FOUR', comment: 'Good!' }
                ],
                nextPageToken: 'token-2'
            };

            vi.spyOn(service, 'fetchReviews').mockResolvedValue(mockResponse);
            vi.spyOn(service, 'parseReviewData').mockImplementation(review => ({
                ...review,
                starRating: service.parseStarRating(review.starRating)
            }));
            vi.spyOn(service, 'filterReviews').mockImplementation(reviews => reviews);

            const result = await service.fetchReviewsBatch(mockLocationId, {
                batchSize: 2,
                maxBatches: 1
            });

            expect(result.success).toBe(true);
            expect(result.results.batches).toHaveLength(1);
            expect(result.results.totalReviews).toBe(2);
            expect(result.summary.totalBatches).toBe(1);
        });

        it('should call batch complete callback', async () => {
            const mockResponse = {
                success: true,
                reviews: [{ starRating: 'FIVE', comment: 'Great!' }],
                nextPageToken: null
            };

            vi.spyOn(service, 'fetchReviews').mockResolvedValue(mockResponse);
            vi.spyOn(service, 'parseReviewData').mockImplementation(review => review);
            vi.spyOn(service, 'filterReviews').mockImplementation(reviews => reviews);

            const batchCallback = vi.fn();

            await service.fetchReviewsBatch(mockLocationId, {
                onBatchComplete: batchCallback
            });

            expect(batchCallback).toHaveBeenCalledWith(
                expect.objectContaining({
                    batchNumber: 1,
                    reviews: expect.any(Array),
                    rawCount: 1,
                    filteredCount: 1
                }),
                expect.any(Object)
            );
        });

        it('should handle batch errors gracefully', async () => {
            vi.spyOn(service, 'fetchReviews')
                .mockResolvedValueOnce({
                    success: true,
                    reviews: [{ starRating: 'FIVE', comment: 'Great!' }],
                    nextPageToken: 'token-2'
                })
                .mockRejectedValueOnce(new Error('Network error'));

            vi.spyOn(service, 'parseReviewData').mockImplementation(review => review);
            vi.spyOn(service, 'filterReviews').mockImplementation(reviews => reviews);

            const errorCallback = vi.fn();

            const result = await service.fetchReviewsBatch(mockLocationId, {
                maxBatches: 2,
                onError: errorCallback
            });

            expect(result.success).toBe(false);
            expect(result.results.errors).toHaveLength(1);
            expect(errorCallback).toHaveBeenCalledWith(
                expect.objectContaining({
                    batchNumber: 2,
                    error: 'Network error'
                }),
                expect.any(Object)
            );
        });

        it('should respect delay between batches', async () => {
            const mockResponse = {
                success: true,
                reviews: [{ starRating: 'FIVE', comment: 'Great!' }],
                nextPageToken: 'token-2'
            };

            vi.spyOn(service, 'fetchReviews').mockResolvedValue(mockResponse);
            vi.spyOn(service, 'parseReviewData').mockImplementation(review => review);
            vi.spyOn(service, 'filterReviews').mockImplementation(reviews => reviews);
            vi.spyOn(service, 'sleep').mockResolvedValue();

            await service.fetchReviewsBatch(mockLocationId, {
                maxBatches: 2,
                delayBetweenBatches: 500
            });

            expect(service.sleep).toHaveBeenCalledWith(500);
        });

        it('should stop on authentication errors', async () => {
            vi.spyOn(service, 'fetchReviews')
                .mockResolvedValueOnce({
                    success: true,
                    reviews: [{ starRating: 'FIVE', comment: 'Great!' }],
                    nextPageToken: 'token-2'
                })
                .mockRejectedValueOnce(new Error('Authentication failed'));

            vi.spyOn(service, 'parseReviewData').mockImplementation(review => review);
            vi.spyOn(service, 'filterReviews').mockImplementation(reviews => reviews);

            const result = await service.fetchReviewsBatch(mockLocationId, {
                maxBatches: 3
            });

            expect(result.success).toBe(false);
            expect(result.results.batches).toHaveLength(1); // Only first batch succeeded
            expect(result.results.errors).toHaveLength(1);
        });
    });
});