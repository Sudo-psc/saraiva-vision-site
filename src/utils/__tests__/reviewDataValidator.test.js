import { describe, it, expect } from 'vitest';
import {
    validateReview,
    sanitizeReview,
    validateReviews,
    filterSpamReviews,
    sortReviews
} from '../reviewDataValidator.js';

describe('Review Data Validator', () => {
    const validReview = {
        id: 'review-123',
        reviewId: 'review-123',
        starRating: 5,
        comment: 'Great service and friendly staff!',
        createTime: '2024-01-15T10:30:00Z',
        updateTime: '2024-01-15T10:30:00Z',
        reviewer: {
            displayName: 'John Doe',
            profilePhotoUrl: 'https://lh3.googleusercontent.com/photo.jpg',
            isAnonymous: false
        },
        reviewReply: {
            comment: 'Thank you for your feedback!',
            updateTime: '2024-01-16T09:00:00Z'
        },
        isRecent: true,
        hasResponse: true,
        wordCount: 5
    };

    describe('validateReview', () => {
        it('should validate a correct review', () => {
            const result = validateReview(validReview);

            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should return error for null review', () => {
            const result = validateReview(null);

            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Review object is null or undefined');
        });

        it('should return error for missing ID', () => {
            const invalidReview = { ...validReview };
            delete invalidReview.id;
            delete invalidReview.reviewId;

            const result = validateReview(invalidReview);

            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Review must have an id or reviewId');
        });

        it('should return error for invalid star rating', () => {
            const invalidReview = { ...validReview, starRating: 0 };

            const result = validateReview(invalidReview);

            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Review must have a valid star rating (1-5)');
        });

        it('should return warning for missing creation time', () => {
            const reviewWithoutTime = { ...validReview };
            delete reviewWithoutTime.createTime;

            const result = validateReview(reviewWithoutTime);

            expect(result.isValid).toBe(true);
            expect(result.warnings).toContain('Review missing creation time');
        });

        it('should return warning for missing reviewer', () => {
            const reviewWithoutReviewer = { ...validReview };
            delete reviewWithoutReviewer.reviewer;

            const result = validateReview(reviewWithoutReviewer);

            expect(result.isValid).toBe(true);
            expect(result.warnings).toContain('Review missing reviewer information');
        });

        it('should return warning for empty comment', () => {
            const reviewWithoutComment = { ...validReview, comment: '' };

            const result = validateReview(reviewWithoutComment);

            expect(result.isValid).toBe(true);
            expect(result.warnings).toContain('Review has no comment text');
        });

        it('should return warning for very long comment', () => {
            const longComment = 'a'.repeat(5001);
            const reviewWithLongComment = { ...validReview, comment: longComment };

            const result = validateReview(reviewWithLongComment);

            expect(result.isValid).toBe(true);
            expect(result.warnings).toContain('Review comment is unusually long (>5000 characters)');
        });

        it('should return error for invalid date format', () => {
            const reviewWithInvalidDate = { ...validReview, createTime: 'invalid-date' };

            const result = validateReview(reviewWithInvalidDate);

            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Invalid createTime format');
        });

        it('should return warning for future date', () => {
            const futureDate = new Date();
            futureDate.setFullYear(futureDate.getFullYear() + 1);
            const reviewWithFutureDate = { ...validReview, createTime: futureDate.toISOString() };

            const result = validateReview(reviewWithFutureDate);

            expect(result.isValid).toBe(true);
            expect(result.warnings).toContain('Review creation date is in the future');
        });
    });

    describe('sanitizeReview', () => {
        it('should sanitize a valid review', () => {
            const sanitized = sanitizeReview(validReview);

            expect(sanitized.id).toBe('review-123');
            expect(sanitized.starRating).toBe(5);
            expect(sanitized.comment).toBe('Great service and friendly staff!');
            expect(sanitized.reviewer.displayName).toBe('John Doe');
            expect(sanitized.reviewer.isAnonymous).toBe(false);
        });

        it('should return null for null input', () => {
            const sanitized = sanitizeReview(null);
            expect(sanitized).toBeNull();
        });

        it('should sanitize HTML from comments', () => {
            const reviewWithHTML = {
                ...validReview,
                comment: 'Great <script>alert("xss")</script> service!'
            };

            const sanitized = sanitizeReview(reviewWithHTML);

            expect(sanitized.comment).toBe('Great  service!');
            expect(sanitized.comment).not.toContain('<script>');
        });

        it('should limit comment length', () => {
            const longComment = 'a'.repeat(5001);
            const reviewWithLongComment = { ...validReview, comment: longComment };

            const sanitized = sanitizeReview(reviewWithLongComment);

            expect(sanitized.comment.length).toBeLessThanOrEqual(5000);
            expect(sanitized.comment.endsWith('...')).toBe(true);
        });

        it('should sanitize display name', () => {
            const reviewWithBadName = {
                ...validReview,
                reviewer: {
                    displayName: '<script>alert("xss")</script>John Doe',
                    isAnonymous: false
                }
            };

            const sanitized = sanitizeReview(reviewWithBadName);

            expect(sanitized.reviewer.displayName).toBe('scriptalert("xss")/scriptJohn Doe');
        });

        it('should handle missing display name', () => {
            const reviewWithoutName = {
                ...validReview,
                reviewer: { isAnonymous: false }
            };

            const sanitized = sanitizeReview(reviewWithoutName);

            expect(sanitized.reviewer.displayName).toBe('Anonymous');
        });

        it('should sanitize profile photo URLs', () => {
            const reviewWithBadURL = {
                ...validReview,
                reviewer: {
                    ...validReview.reviewer,
                    profilePhotoUrl: 'http://malicious-site.com/photo.jpg'
                }
            };

            const sanitized = sanitizeReview(reviewWithBadURL);

            expect(sanitized.reviewer.profilePhotoUrl).toBeNull();
        });

        it('should allow valid Google photo URLs', () => {
            const reviewWithGoogleURL = {
                ...validReview,
                reviewer: {
                    ...validReview.reviewer,
                    profilePhotoUrl: 'https://lh3.googleusercontent.com/photo.jpg'
                }
            };

            const sanitized = sanitizeReview(reviewWithGoogleURL);

            expect(sanitized.reviewer.profilePhotoUrl).toBe('https://lh3.googleusercontent.com/photo.jpg');
        });

        it('should clamp star rating to valid range', () => {
            const reviewWithInvalidRating = { ...validReview, starRating: 10 };

            const sanitized = sanitizeReview(reviewWithInvalidRating);

            expect(sanitized.starRating).toBe(5);
        });

        it('should handle invalid dates', () => {
            const reviewWithInvalidDate = { ...validReview, createTime: 'invalid-date' };

            const sanitized = sanitizeReview(reviewWithInvalidDate);

            expect(sanitized.createTime).toBeNull();
        });
    });

    describe('validateReviews', () => {
        const validReviews = [validReview, { ...validReview, id: 'review-456' }];

        it('should validate array of valid reviews', () => {
            const result = validateReviews(validReviews);

            expect(result.isValid).toBe(true);
            expect(result.validReviews).toHaveLength(2);
            expect(result.invalidReviews).toHaveLength(0);
            expect(result.totalReviews).toBe(2);
            expect(result.validCount).toBe(2);
            expect(result.invalidCount).toBe(0);
        });

        it('should handle invalid reviews in array', () => {
            const mixedReviews = [
                validReview,
                { starRating: 0 }, // Invalid
                { ...validReview, id: 'review-789' }
            ];

            const result = validateReviews(mixedReviews);

            expect(result.isValid).toBe(false);
            expect(result.validReviews).toHaveLength(2);
            expect(result.invalidReviews).toHaveLength(1);
            expect(result.errors).toContain('Review 1: Review must have an id or reviewId');
        });

        it('should return error for non-array input', () => {
            const result = validateReviews('not-an-array');

            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Reviews must be an array');
        });

        it('should handle empty array', () => {
            const result = validateReviews([]);

            expect(result.isValid).toBe(true);
            expect(result.validReviews).toHaveLength(0);
            expect(result.totalReviews).toBe(0);
        });
    });

    describe('filterSpamReviews', () => {
        const legitimateReviews = [
            {
                comment: 'Great service and friendly staff!',
                reviewer: { displayName: 'John Smith', isAnonymous: false }
            },
            {
                comment: 'Excellent food quality and atmosphere.',
                reviewer: { displayName: 'Mary Johnson', isAnonymous: false }
            }
        ];

        const spamReviews = [
            {
                comment: 'Click here to visit our website www.spam.com for discount codes!',
                reviewer: { displayName: 'Spammer', isAnonymous: false }
            },
            {
                comment: 'AMAZING AMAZING AMAZING BEST BEST BEST!!!',
                reviewer: { displayName: 'Fake User', isAnonymous: false }
            },
            {
                comment: 'good good good good good good good good good good',
                reviewer: { displayName: 'Generic User', isAnonymous: false }
            }
        ];

        it('should filter out spam reviews with URLs', () => {
            const allReviews = [...legitimateReviews, spamReviews[0]];
            const filtered = filterSpamReviews(allReviews);

            expect(filtered).toHaveLength(2);
            expect(filtered.every(r => !r.comment.includes('www.'))).toBe(true);
        });

        it('should filter out reviews with excessive capitalization', () => {
            const allReviews = [...legitimateReviews, spamReviews[1]];
            const filtered = filterSpamReviews(allReviews);

            expect(filtered).toHaveLength(2);
        });

        it('should filter out reviews with excessive repetition', () => {
            const allReviews = [...legitimateReviews, spamReviews[2]];
            const filtered = filterSpamReviews(allReviews);

            expect(filtered).toHaveLength(2);
        });

        it('should filter out reviews with generic usernames', () => {
            const reviewWithGenericName = {
                comment: 'Good service',
                reviewer: { displayName: 'Generic Customer', isAnonymous: false }
            };

            const allReviews = [...legitimateReviews, reviewWithGenericName];
            const filtered = filterSpamReviews(allReviews);

            expect(filtered).toHaveLength(2);
        });

        it('should handle empty array', () => {
            const filtered = filterSpamReviews([]);
            expect(filtered).toEqual([]);
        });

        it('should handle non-array input', () => {
            const filtered = filterSpamReviews(null);
            expect(filtered).toEqual([]);
        });

        it('should preserve legitimate reviews', () => {
            const filtered = filterSpamReviews(legitimateReviews);
            expect(filtered).toHaveLength(2);
            expect(filtered).toEqual(legitimateReviews);
        });
    });

    describe('sortReviews', () => {
        const unsortedReviews = [
            {
                createTime: '2024-01-10T10:30:00Z',
                starRating: 3,
                wordCount: 10
            },
            {
                createTime: '2024-01-15T10:30:00Z',
                starRating: 5,
                wordCount: 5
            },
            {
                createTime: '2024-01-05T10:30:00Z',
                starRating: 4,
                wordCount: 20
            }
        ];

        it('should sort by newest first', () => {
            const sorted = sortReviews(unsortedReviews, 'newest');

            expect(sorted[0].createTime).toBe('2024-01-15T10:30:00Z');
            expect(sorted[1].createTime).toBe('2024-01-10T10:30:00Z');
            expect(sorted[2].createTime).toBe('2024-01-05T10:30:00Z');
        });

        it('should sort by oldest first', () => {
            const sorted = sortReviews(unsortedReviews, 'oldest');

            expect(sorted[0].createTime).toBe('2024-01-05T10:30:00Z');
            expect(sorted[1].createTime).toBe('2024-01-10T10:30:00Z');
            expect(sorted[2].createTime).toBe('2024-01-15T10:30:00Z');
        });

        it('should sort by highest rating first', () => {
            const sorted = sortReviews(unsortedReviews, 'highest');

            expect(sorted[0].starRating).toBe(5);
            expect(sorted[1].starRating).toBe(4);
            expect(sorted[2].starRating).toBe(3);
        });

        it('should sort by lowest rating first', () => {
            const sorted = sortReviews(unsortedReviews, 'lowest');

            expect(sorted[0].starRating).toBe(3);
            expect(sorted[1].starRating).toBe(4);
            expect(sorted[2].starRating).toBe(5);
        });

        it('should sort by longest reviews first', () => {
            const sorted = sortReviews(unsortedReviews, 'longest');

            expect(sorted[0].wordCount).toBe(20);
            expect(sorted[1].wordCount).toBe(10);
            expect(sorted[2].wordCount).toBe(5);
        });

        it('should sort by shortest reviews first', () => {
            const sorted = sortReviews(unsortedReviews, 'shortest');

            expect(sorted[0].wordCount).toBe(5);
            expect(sorted[1].wordCount).toBe(10);
            expect(sorted[2].wordCount).toBe(20);
        });

        it('should return original array for unknown sort type', () => {
            const sorted = sortReviews(unsortedReviews, 'unknown');

            expect(sorted).toEqual(unsortedReviews);
        });

        it('should handle empty array', () => {
            const sorted = sortReviews([], 'newest');
            expect(sorted).toEqual([]);
        });

        it('should handle non-array input', () => {
            const sorted = sortReviews(null, 'newest');
            expect(sorted).toEqual([]);
        });

        it('should not mutate original array', () => {
            const original = [...unsortedReviews];
            const sorted = sortReviews(unsortedReviews, 'newest');

            expect(unsortedReviews).toEqual(original);
            expect(sorted).not.toBe(unsortedReviews);
        });
    });
});