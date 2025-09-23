/**
 * Review Data Validator
 * Validates and sanitizes review data from Google Business API
 */

/**
 * Validate review object structure
 * @param {Object} review - Review object to validate
 */
export const validateReview = (review) => {
    const errors = [];
    const warnings = [];

    if (!review) {
        errors.push('Review object is null or undefined');
        return { isValid: false, errors, warnings };
    }

    // Required fields validation
    if (!review.id && !review.reviewId) {
        errors.push('Review must have an id or reviewId');
    }

    if (!review.starRating || review.starRating < 1 || review.starRating > 5) {
        errors.push('Review must have a valid star rating (1-5)');
    }

    if (!review.createTime) {
        warnings.push('Review missing creation time');
    }

    // Reviewer validation
    if (!review.reviewer) {
        warnings.push('Review missing reviewer information');
    } else {
        if (!review.reviewer.displayName && !review.reviewer.isAnonymous) {
            warnings.push('Review has no display name and is not marked as anonymous');
        }
    }

    // Comment validation
    if (!review.comment || review.comment.trim().length === 0) {
        warnings.push('Review has no comment text');
    } else if (review.comment.length > 5000) {
        warnings.push('Review comment is unusually long (>5000 characters)');
    }

    // Date validation
    if (review.createTime) {
        try {
            const createDate = new Date(review.createTime);
            if (isNaN(createDate.getTime())) {
                errors.push('Invalid createTime format');
            } else if (createDate > new Date()) {
                warnings.push('Review creation date is in the future');
            }
        } catch (error) {
            errors.push('Error parsing createTime');
        }
    }

    if (review.updateTime) {
        try {
            const updateDate = new Date(review.updateTime);
            if (isNaN(updateDate.getTime())) {
                errors.push('Invalid updateTime format');
            }
        } catch (error) {
            errors.push('Error parsing updateTime');
        }
    }

    return {
        isValid: errors.length === 0,
        errors,
        warnings
    };
};

/**
 * Sanitize review data for safe display
 * @param {Object} review - Review object to sanitize
 */
export const sanitizeReview = (review) => {
    if (!review) return null;

    const sanitized = {
        id: sanitizeString(review.id),
        reviewId: sanitizeString(review.reviewId),
        starRating: Math.max(1, Math.min(5, parseInt(review.starRating) || 1)),
        comment: sanitizeComment(review.comment),
        createTime: sanitizeDate(review.createTime),
        updateTime: sanitizeDate(review.updateTime),
        reviewer: {
            displayName: sanitizeDisplayName(review.reviewer?.displayName),
            profilePhotoUrl: sanitizeUrl(review.reviewer?.profilePhotoUrl),
            isAnonymous: Boolean(review.reviewer?.isAnonymous)
        },
        reviewReply: review.reviewReply ? {
            comment: sanitizeComment(review.reviewReply.comment),
            updateTime: sanitizeDate(review.reviewReply.updateTime)
        } : null,
        // Metadata
        isRecent: Boolean(review.isRecent),
        hasResponse: Boolean(review.hasResponse),
        wordCount: Math.max(0, parseInt(review.wordCount) || 0)
    };

    return sanitized;
};

/**
 * Sanitize string input
 * @param {string} str - String to sanitize
 */
const sanitizeString = (str) => {
    if (!str || typeof str !== 'string') return null;
    return str.trim().substring(0, 1000); // Limit length
};

/**
 * Sanitize comment text
 * @param {string} comment - Comment to sanitize
 */
const sanitizeComment = (comment) => {
    if (!comment || typeof comment !== 'string') return '';

    // Remove potentially harmful content
    let sanitized = comment
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .replace(/javascript:/gi, '') // Remove javascript: URLs
        .replace(/on\w+\s*=/gi, '') // Remove event handlers
        .trim();

    // Limit length
    if (sanitized.length > 5000) {
        sanitized = sanitized.substring(0, 4997) + '...';
    }

    return sanitized;
};

/**
 * Sanitize display name
 * @param {string} displayName - Display name to sanitize
 */
const sanitizeDisplayName = (displayName) => {
    if (!displayName || typeof displayName !== 'string') return 'Anonymous';

    let sanitized = displayName
        .replace(/[<>]/g, '') // Remove angle brackets
        .trim();

    // Limit length
    if (sanitized.length > 100) {
        sanitized = sanitized.substring(0, 97) + '...';
    }

    return sanitized || 'Anonymous';
};

/**
 * Sanitize URL
 * @param {string} url - URL to sanitize
 */
const sanitizeUrl = (url) => {
    if (!url || typeof url !== 'string') return null;

    try {
        const urlObj = new URL(url);

        // Only allow https URLs
        if (urlObj.protocol !== 'https:') {
            return null;
        }

        // Only allow Google domains for profile photos
        const allowedDomains = [
            'lh3.googleusercontent.com',
            'lh4.googleusercontent.com',
            'lh5.googleusercontent.com',
            'lh6.googleusercontent.com'
        ];

        if (!allowedDomains.includes(urlObj.hostname)) {
            return null;
        }

        return urlObj.toString();
    } catch (error) {
        return null;
    }
};

/**
 * Sanitize date string
 * @param {string} dateStr - Date string to sanitize
 */
const sanitizeDate = (dateStr) => {
    if (!dateStr) return null;

    try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) {
            return null;
        }

        // Return ISO string for consistency
        return date.toISOString();
    } catch (error) {
        return null;
    }
};

/**
 * Validate array of reviews
 * @param {Array} reviews - Array of reviews to validate
 */
export const validateReviews = (reviews) => {
    if (!Array.isArray(reviews)) {
        return {
            isValid: false,
            errors: ['Reviews must be an array'],
            warnings: [],
            validReviews: [],
            invalidReviews: []
        };
    }

    const validReviews = [];
    const invalidReviews = [];
    const allErrors = [];
    const allWarnings = [];

    reviews.forEach((review, index) => {
        const validation = validateReview(review);

        if (validation.isValid) {
            validReviews.push(sanitizeReview(review));
        } else {
            invalidReviews.push({
                index,
                review,
                errors: validation.errors
            });
        }

        // Collect all errors and warnings
        validation.errors.forEach(error => {
            allErrors.push(`Review ${index}: ${error}`);
        });

        validation.warnings.forEach(warning => {
            allWarnings.push(`Review ${index}: ${warning}`);
        });
    });

    return {
        isValid: invalidReviews.length === 0,
        errors: allErrors,
        warnings: allWarnings,
        validReviews,
        invalidReviews,
        totalReviews: reviews.length,
        validCount: validReviews.length,
        invalidCount: invalidReviews.length
    };
};

/**
 * Filter out potentially spam or fake reviews
 * @param {Array} reviews - Array of reviews to filter
 */
export const filterSpamReviews = (reviews) => {
    if (!Array.isArray(reviews)) return [];

    return reviews.filter(review => {
        // Skip reviews with suspicious patterns
        if (review.comment) {
            const comment = review.comment.toLowerCase();

            // Check for spam keywords
            const spamKeywords = [
                'click here',
                'visit our website',
                'buy now',
                'discount code',
                'promo code',
                'http://',
                'https://',
                'www.',
                '.com',
                '.net',
                '.org'
            ];

            const hasSpamKeywords = spamKeywords.some(keyword =>
                comment.includes(keyword)
            );

            if (hasSpamKeywords) {
                return false;
            }

            // Check for excessive repetition
            const words = comment.split(' ');
            const uniqueWords = new Set(words);
            const repetitionRatio = uniqueWords.size / words.length;

            if (words.length > 10 && repetitionRatio < 0.3) {
                return false; // Too much repetition
            }

            // Check for excessive capitalization
            const capitalRatio = (comment.match(/[A-Z]/g) || []).length / comment.length;
            if (capitalRatio > 0.5 && comment.length > 20) {
                return false; // Too much capitalization
            }
        }

        // Check for suspicious reviewer patterns
        if (review.reviewer && !review.reviewer.isAnonymous) {
            const displayName = review.reviewer.displayName || '';

            // Check for generic names
            const genericNames = [
                'user',
                'customer',
                'client',
                'buyer',
                'person',
                'someone'
            ];

            if (genericNames.some(name =>
                displayName.toLowerCase().includes(name)
            )) {
                return false;
            }
        }

        return true;
    });
};

/**
 * Sort reviews by various criteria
 * @param {Array} reviews - Array of reviews to sort
 * @param {string} sortBy - Sort criteria
 */
export const sortReviews = (reviews, sortBy = 'newest') => {
    if (!Array.isArray(reviews)) return [];

    const sortedReviews = [...reviews];

    switch (sortBy) {
        case 'newest':
            return sortedReviews.sort((a, b) =>
                new Date(b.createTime || 0) - new Date(a.createTime || 0)
            );

        case 'oldest':
            return sortedReviews.sort((a, b) =>
                new Date(a.createTime || 0) - new Date(b.createTime || 0)
            );

        case 'highest':
            return sortedReviews.sort((a, b) =>
                (b.starRating || 0) - (a.starRating || 0)
            );

        case 'lowest':
            return sortedReviews.sort((a, b) =>
                (a.starRating || 0) - (b.starRating || 0)
            );

        case 'longest':
            return sortedReviews.sort((a, b) =>
                (b.wordCount || 0) - (a.wordCount || 0)
            );

        case 'shortest':
            return sortedReviews.sort((a, b) =>
                (a.wordCount || 0) - (b.wordCount || 0)
            );

        default:
            return sortedReviews;
    }
};

export default {
    validateReview,
    sanitizeReview,
    validateReviews,
    filterSpamReviews,
    sortReviews
};