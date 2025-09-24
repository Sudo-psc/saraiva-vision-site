import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import GoogleBusinessService from '../googleBusinessService.js';
import { validateReviews, filterSpamReviews, sortReviews } from '../../utils/reviewDataValidator.js';

describe('Google Business Reviews - Integration Tests', () => {
    let service;
    const mockLocationId = 'accounts/123456789/locations/987654321';

    const mockReviewsData = [
        {
            name: 'accounts/123/locations/456/reviews/review1',
            reviewId: 'review1',
            reviewer: {
                displayName: 'John Doe',
                profilePhotoUrl: 'https://lh3.googleusercontent.com/photo1.jpg',
                isAnonymous: false
            },
            starRating: 'FIVE',
            comment: 'Excellent service and great food! Highly recommend this place.',
            createTime: '2024-01-15T10:30:00Z',
            updateTime: '2024-01-15T10:30:00Z',
            reviewReply: {
                comment: 'Thank you for your wonderful feedback!',
                updateTime: '2024-01-16T09:00:00Z'
            }
        },
        {
            name: 'accounts/123/locations/456/reviews/review2',
            reviewId: 'review2',
            reviewer: {
                displayName: 'Jane Smith',
                profilePhotoUrl: 'https://lh3.googleusercontent.com/photo2.jpg',
                isAnonymous: false
            },
            starRating: 'FOUR',
            comment: 'Good experience overall, friendly staff.',
            createTime: '2024-01-10T14:20:00Z',
            updateTime: '2024-01-10T14:20:00Z'
        },
        {
            name: 'accounts/123/locations/456/reviews/review3',
            reviewId: 'review3',
            reviewer: {
                displayName: 'Anonymous User',
                isAnonymous: true
            },
            starRating: 'TWO',
            comment: 'Poor service, long wait times.',
            createTime: '2024-01-05T16:45:00Z',
            updateTime: '2024-01-05T16:45:00Z'
        },
        {
            name: 'accounts/123/locations/456/reviews/review4',
            reviewId: 'review4',
            reviewer: {
                displayName: 'Spam User',
                isAnonymous: false
            },
            starRating: 'FIVE',
            comment: 'Click here to visit our website www.spam.com for discount codes!',
            createTime: '2024-01-01T12:00:00Z',
            updateTime: '2024-01-01T12:00:00Z'
        }
    ];

    it('should complete full review processing workflow', async () => {
        // Mock API response
        vi.spyOn(service, 'fetchReviews').mockResolvedValue({
            success: true,
            reviews: mockReviewsData,
            nextPageToken: null,
            totalSize: 4,
            averageRating: 4.0,
            fetchedAt: new Date().toISOString()
        });

        // Step 1: Fetch reviews with advanced options
        const fetchResult = await service.fetchAllReviews(mockLocationId, {
            maxReviews: 10,
            minRating: 1,
            sortBy: 'newest',
            keywords: null,
            excludeAnonymous: false,
            onProgress: (progress) => {
                expect(progress.totalFetched).toBeGreaterThan(0);
            }
        });

        expect(fetchResult.success).toBe(true);
        expect(fetchResult.reviews).toHaveLength(4);

        // Step 2: Validate review data
        const validationResult = validateReviews(fetchResult.reviews);
        expect(validationResult.isValid).toBe(true);
        expect(validationResult.validCount).toBe(4);

        // Step 3: Filter out spam reviews
        const cleanReviews = filterSpamReviews(validationResult.validReviews);
        expect(cleanReviews).toHaveLength(3); // Should remove spam review

        // Step 4: Apply business filters
        const filteredReviews = service.filterReviews(cleanReviews, {
            minRating: 3,
            excludeAnonymous: true
        });
        expect(filteredReviews).toHaveLength(2); // Should remove low rating and anonymous

        // Step 5: Sort reviews
        const sortedReviews = sortReviews(filteredReviews, 'newest');
        expect(sortedReviews[0].createTime).toBe('2024-01-15T10:30:00Z');

        // Step 6: Calculate final statistics
        const stats = service.calculateReviewStats(sortedReviews);
        expect(stats.averageRating).toBe(4.5); // (5+4)/2
        expect(stats.totalReviews).toBe(2);
        expect(stats.responseRate).toBe(50); // 1 out of 2 has reply
    });

    it('should handle batch processing workflow', async () => {
        // Mock multiple batch responses
        const batch1 = mockReviewsData.slice(0, 2);
        const batch2 = mockReviewsData.slice(2, 4);

        vi.spyOn(service, 'fetchReviews')
            .mockResolvedValueOnce({
                success: true,
                reviews: batch1,
                nextPageToken: 'token-2'
            })
            .mockResolvedValueOnce({
                success: true,
                reviews: batch2,
                nextPageToken: null
            });

        const batchCallbacks = [];
        const errorCallbacks = [];

        const result = await service.fetchReviewsBatch(mockLocationId, {
            batchSize: 2,
            maxBatches: 2,
            delayBetweenBatches: 100,
            filters: { minRating: 1 },
            onBatchComplete: (batch, results) => {
                batchCallbacks.push(batch);
            },
            onError: (error, results) => {
                errorCallbacks.push(error);
            }
        });

        expect(result.success).toBe(true);
        expect(result.results.batches).toHaveLength(2);
        expect(result.results.totalReviews).toBe(4);
        expect(batchCallbacks).toHaveLength(2);
        expect(errorCallbacks).toHaveLength(0);

        // Verify batch processing details
        expect(result.summary.totalBatches).toBe(2);
        expect(result.summary.errorCount).toBe(0);
        expect(result.summary.averageProcessingTime).toBeGreaterThan(0);
    });

    it('should handle sentiment analysis workflow', async () => {
        vi.spyOn(service, 'fetchReviews').mockResolvedValue({
            success: true,
            reviews: mockReviewsData,
            nextPageToken: null
        });

        const fetchResult = await service.fetchAllReviews(mockLocationId);

        // Analyze sentiment for each review
        const reviewsWithSentiment = fetchResult.reviews.map(review => ({
            ...review,
            sentiment: service.analyzeSentiment(review)
        }));

        // Filter by positive sentiment
        const positiveReviews = service.filterReviews(reviewsWithSentiment, {
            sentiment: 'positive'
        });

        expect(positiveReviews.length).toBeGreaterThan(0);

        // Verify sentiment analysis results
        const excellentReview = reviewsWithSentiment.find(r =>
            r.comment.includes('Excellent service')
        );
        expect(service.analyzeSentiment(excellentReview)).toBe('positive');

        const poorReview = reviewsWithSentiment.find(r =>
            r.comment.includes('Poor service')
        );
        expect(service.analyzeSentiment(poorReview)).toBe('negative');
    });

    it('should handle error recovery in workflow', async () => {
        // Mock partial failure scenario
        vi.spyOn(service, 'fetchReviews')
            .mockResolvedValueOnce({
                success: true,
                reviews: mockReviewsData.slice(0, 2),
                nextPageToken: 'token-2'
            })
            .mockRejectedValueOnce(new Error('Network timeout'));

        const result = await service.fetchAllReviews(mockLocationId, {
            maxReviews: 10
        });

        // Should return partial results
        expect(result.success).toBe(false);
        expect(result.error).toBe('Network timeout');
        expect(result.reviews).toHaveLength(2); // Partial data
        expect(result.totalFetched).toBe(2);

        // Validate partial data is still usable
        const validationResult = validateReviews(result.reviews);
        expect(validationResult.isValid).toBe(true);
        expect(validationResult.validCount).toBe(2);
    });

    it('should handle complex filtering scenarios', async () => {
        vi.spyOn(service, 'fetchReviews').mockResolvedValue({
            success: true,
            reviews: mockReviewsData,
            nextPageToken: null
        });

        const fetchResult = await service.fetchAllReviews(mockLocationId, {
            dateRange: {
                start: new Date('2024-01-01'),
                end: new Date('2024-01-31')
            },
            keywords: ['service', 'food'],
            minRating: 3,
            excludeAnonymous: true
        });

        expect(fetchResult.success).toBe(true);
        expect(fetchResult.metadata.appliedFilters).toEqual({
            minRating: 3,
            dateRange: {
                start: new Date('2024-01-01'),
                end: new Date('2024-01-31')
            },
            keywords: ['service', 'food'],
            excludeAnonymous: true
        });

        // Verify filters were applied correctly
        fetchResult.reviews.forEach(review => {
            expect(review.starRating).toBeGreaterThanOrEqual(3);
            expect(review.reviewer.isAnonymous).toBe(false);

            const hasKeyword = ['service', 'food'].some(keyword =>
                review.comment.toLowerCase().includes(keyword)
            );
            expect(hasKeyword).toBe(true);
        });
    });

    it('should provide comprehensive review statistics', async () => {
        vi.spyOn(service, 'fetchReviews').mockResolvedValue({
            success: true,
            reviews: mockReviewsData,
            nextPageToken: null,
            totalSize: 4,
            averageRating: 4.0
        });

        const fetchResult = await service.fetchAllReviews(mockLocationId);
        const stats = service.calculateReviewStats(fetchResult.reviews);

        // Verify comprehensive statistics
        expect(stats).toHaveProperty('averageRating');
        expect(stats).toHaveProperty('totalReviews');
        expect(stats).toHaveProperty('ratingDistribution');
        expect(stats).toHaveProperty('recentReviews');
        expect(stats).toHaveProperty('responseRate');

        expect(stats.ratingDistribution).toEqual({
            1: 0, 2: 1, 3: 0, 4: 1, 5: 2
        });

        expect(stats.responseRate).toBe(25); // 1 out of 4 has reply
        expect(stats.averageRating).toBe(4); // (5+4+2+5)/4 = 4
    });
});

describe('Performance and Reliability', () => {
    it('should handle large datasets efficiently', async () => {
        // Generate large dataset
        const largeDataset = Array(100).fill().map((_, i) => ({
            name: `accounts/123/locations/456/reviews/review${i}`,
            reviewId: `review${i}`,
            reviewer: {
                displayName: `User ${i}`,
                isAnonymous: false
            },
            starRating: ['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE'][i % 5],
            comment: `Review comment ${i}`,
            createTime: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString()
        }));

        vi.spyOn(service, 'fetchReviews').mockResolvedValue({
            success: true,
            reviews: largeDataset,
            nextPageToken: null
        });

        const startTime = Date.now();
        const result = await service.fetchAllReviews(mockLocationId, {
            maxReviews: 100
        });
        const processingTime = Date.now() - startTime;

        expect(result.success).toBe(true);
        expect(result.reviews).toHaveLength(100);
        expect(processingTime).toBeLessThan(5000); // Should process within 5 seconds

        // Verify data integrity
        const validationResult = validateReviews(result.reviews);
        expect(validationResult.isValid).toBe(true);
        expect(validationResult.validCount).toBe(100);
    });

    it('should handle rate limiting gracefully', async () => {
        // Mock rate limit scenario
        vi.spyOn(service, 'fetchReviews')
            .mockRejectedValueOnce(new Error('Rate limit exceeded'))
            .mockResolvedValueOnce({
                success: true,
                reviews: mockReviewsData.slice(0, 2),
                nextPageToken: null
            });

        vi.spyOn(service, 'sleep').mockResolvedValue();

        const result = await service.fetchReviewsBatch(mockLocationId, {
            batchSize: 2,
            maxBatches: 2,
            delayBetweenBatches: 1000
        });

        expect(result.success).toBe(false);
        expect(result.results.errors).toHaveLength(1);
        expect(result.results.errors[0].error).toBe('Rate limit exceeded');
    });
});
});