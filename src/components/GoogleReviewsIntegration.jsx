/**
 * Google Reviews Integration Component
 * Ready-to-use component for displaying Google Business reviews on homepage
 * Uses the new GoogleReviewsWidget with improved reliability
 */

import React from 'react';
import GoogleReviewsWidget from './GoogleReviewsWidget';

const GoogleReviewsIntegration = ({
    maxReviews = 3,
    showViewAllButton = true,
    className = ''
}) => {

    return (
        <GoogleReviewsWidget
            maxReviews={maxReviews}
            showViewAllButton={showViewAllButton}
            className={className}
        />
    );
};

export default GoogleReviewsIntegration;