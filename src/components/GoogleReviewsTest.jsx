/**
 * Google Reviews Test Component
 * Test component to verify the Google Places API integration
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/Badge.jsx';
import { useGoogleReviews } from '@/hooks/useGoogleReviews';
import { Star, RefreshCw, AlertCircle, CheckCircle, MapPin } from 'lucide-react';

const GoogleReviewsTest = ({ placeId = process.env.VITE_GOOGLE_PLACE_ID }) => {
    const {
        reviews,
        stats,
        loading,
        error,
        refresh,
        config
    } = useGoogleReviews({
        placeId,
        limit: 5,
        autoFetch: true
    });

    const renderStars = (rating) => {
        return (
            <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`w-4 h-4 ${star <= rating
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300'
                            }`}
                    />
                ))}
            </div>
        );
    };

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-blue-600" />
                            Google Places API Test
                        </span>
                        <Button
                            onClick={refresh}
                            size="sm"
                            variant="outline"
                            disabled={loading}
                        >
                            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {/* Status Indicators */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="flex items-center gap-2">
                            {loading ? (
                                <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />
                            ) : error ? (
                                <AlertCircle className="w-5 h-5 text-red-500" />
                            ) : (
                                <CheckCircle className="w-5 h-5 text-green-500" />
                            )}
                            <span className="text-sm font-medium">
                                Status: {loading ? 'Loading...' : error ? 'Error' : 'Connected'}
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">Reviews:</span>
                            <Badge variant="secondary">{reviews.length}</Badge>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">API:</span>
                            <Badge variant="outline" className="text-xs">
                                Google Places
                            </Badge>
                        </div>
                    </div>

                    {/* Error Display */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                            <div className="flex items-center gap-2 mb-2">
                                <AlertCircle className="w-5 h-5 text-red-600" />
                                <h3 className="font-medium text-red-800">API Error</h3>
                            </div>
                            <p className="text-red-700 text-sm">{error.message}</p>
                            <div className="mt-3 text-red-600 text-xs">
                                <p><strong>Possible causes:</strong></p>
                                <ul className="list-disc list-inside mt-1 space-y-1">
                                    <li>Google Places API key not configured or invalid</li>
                                    <li>Place ID not found or invalid</li>
                                    <li>API quota exceeded</li>
                                    <li>Network connectivity issues</li>
                                </ul>
                            </div>
                        </div>
                    )}

                    {/* Success Display */}
                    {!error && !loading && reviews.length > 0 && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                            <div className="flex items-center gap-2 mb-2">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                                <h3 className="font-medium text-green-800">API Connected Successfully!</h3>
                            </div>
                            <p className="text-green-700 text-sm">
                                Successfully fetched {reviews.length} reviews from Google Places API.
                            </p>
                        </div>
                    )}

                    {/* Statistics Display */}
                    {stats && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                            <h3 className="font-medium text-blue-800 mb-3">Place Statistics</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-600">
                                        {stats.overview?.averageRating || 'N/A'}
                                    </div>
                                    <div className="text-sm text-blue-600">Avg Rating</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-600">
                                        {stats.overview?.totalReviews || 'N/A'}
                                    </div>
                                    <div className="text-sm text-blue-600">Total Reviews</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-600">
                                        {stats.overview?.recentReviews || 'N/A'}
                                    </div>
                                    <div className="text-sm text-blue-600">Recent (30d)</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-600">
                                        {stats.sentiment?.positivePercentage || 'N/A'}%
                                    </div>
                                    <div className="text-sm text-blue-600">Positive</div>
                                </div>
                            </div>

                            {stats.place && (
                                <div className="mt-4 pt-4 border-t border-blue-200">
                                    <h4 className="font-medium text-blue-800 mb-2">Place Information</h4>
                                    <p className="text-blue-700 text-sm"><strong>Name:</strong> {stats.place.name}</p>
                                    {stats.place.address && (
                                        <p className="text-blue-700 text-sm"><strong>Address:</strong> {stats.place.address}</p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Reviews Display */}
                    <div className="space-y-4">
                        <h3 className="font-medium text-gray-800">Recent Reviews</h3>

                        {loading && (
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="animate-pulse">
                                        <div className="flex items-start gap-4 p-4 border rounded-lg">
                                            <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                                            <div className="flex-1 space-y-2">
                                                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                                <div className="h-3 bg-gray-200 rounded w-full"></div>
                                                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {!loading && reviews.length === 0 && !error && (
                            <div className="text-center py-8 text-gray-500">
                                <p>No reviews available</p>
                                <p className="text-sm mt-1">This place may not have any reviews yet</p>
                            </div>
                        )}

                        {!loading && reviews.length > 0 && (
                            <div className="space-y-4">
                                {reviews.map((review, index) => (
                                    <div key={review.id || index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                                {review.reviewer?.profilePhotoUrl ? (
                                                    <img
                                                        src={review.reviewer.profilePhotoUrl}
                                                        alt={review.reviewer.displayName}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <span className="text-gray-500 text-sm">
                                                        {(review.reviewer?.displayName || 'A')[0]}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div>
                                                        <h4 className="font-medium text-gray-900">
                                                            {review.reviewer?.displayName || 'Anonymous'}
                                                        </h4>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            {renderStars(review.starRating || 5)}
                                                            <Badge variant="secondary" className="text-xs">
                                                                {review.starRating || 5}/5
                                                            </Badge>
                                                        </div>
                                                    </div>

                                                    <div className="text-sm text-gray-500">
                                                        {review.relativeTimeDescription ||
                                                            (review.createTime ? new Date(review.createTime).toLocaleDateString() : 'Recent')}
                                                    </div>
                                                </div>

                                                <p className="text-gray-700 text-sm leading-relaxed">
                                                    {review.comment || 'No comment provided'}
                                                </p>

                                                {review.wordCount > 0 && (
                                                    <div className="mt-2 text-xs text-gray-500">
                                                        {review.wordCount} words • {review.language || 'pt-BR'}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Configuration Info */}
                    <div className="mt-6 pt-6 border-t">
                        <h3 className="font-medium text-gray-800 mb-3">Configuration</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="font-medium">Place ID:</span>
                                <p className="text-gray-600 break-all">{config.placeId || 'Not configured'}</p>
                            </div>
                            <div>
                                <span className="font-medium">API Key:</span>
                                <p className="text-gray-600">
                                    {process.env.VITE_GOOGLE_PLACES_API_KEY ?
                                        `${process.env.VITE_GOOGLE_PLACES_API_KEY.substring(0, 10)}...` :
                                        'Not configured'
                                    }
                                </p>
                            </div>
                            <div>
                                <span className="font-medium">Limit:</span>
                                <p className="text-gray-600">{config.limit} reviews (max 5 from Places API)</p>
                            </div>
                            <div>
                                <span className="font-medium">Language:</span>
                                <p className="text-gray-600">pt-BR</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Setup Instructions */}
            <Card>
                <CardHeader>
                    <CardTitle>API Setup Status</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4 text-sm">
                        <div className="flex items-center gap-2">
                            {process.env.VITE_GOOGLE_PLACES_API_KEY ? (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                                <AlertCircle className="w-4 h-4 text-red-500" />
                            )}
                            <span className="font-medium">Google Places API Key:</span>
                            <span className={process.env.VITE_GOOGLE_PLACES_API_KEY ? 'text-green-600' : 'text-red-600'}>
                                {process.env.VITE_GOOGLE_PLACES_API_KEY ? 'Configured' : 'Missing'}
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            {process.env.VITE_GOOGLE_PLACE_ID ? (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                                <AlertCircle className="w-4 h-4 text-red-500" />
                            )}
                            <span className="font-medium">Google Place ID:</span>
                            <span className={process.env.VITE_GOOGLE_PLACE_ID ? 'text-green-600' : 'text-red-600'}>
                                {process.env.VITE_GOOGLE_PLACE_ID ? 'Configured' : 'Missing'}
                            </span>
                        </div>

                        {(!process.env.VITE_GOOGLE_PLACES_API_KEY || !process.env.VITE_GOOGLE_PLACE_ID) && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                                <h4 className="font-medium text-yellow-800 mb-2">Setup Required</h4>
                                <p className="text-yellow-700 text-sm mb-2">
                                    Your environment variables are already configured in .env:
                                </p>
                                <div className="bg-yellow-100 rounded p-2 font-mono text-xs">
                                    VITE_GOOGLE_PLACES_API_KEY={process.env.VITE_GOOGLE_PLACES_API_KEY || 'your_api_key'}<br />
                                    VITE_GOOGLE_PLACE_ID={process.env.VITE_GOOGLE_PLACE_ID || 'your_place_id'}
                                </div>
                                <p className="text-yellow-700 text-sm mt-2">
                                    The API should work automatically with your existing Google Places API key.
                                </p>
                            </div>
                        )}

                        {process.env.VITE_GOOGLE_PLACES_API_KEY && process.env.VITE_GOOGLE_PLACE_ID && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                                <h4 className="font-medium text-green-800 mb-2">✅ Ready to Use!</h4>
                                <p className="text-green-700 text-sm">
                                    Your Google Places API is properly configured. The reviews should load automatically.
                                    You can now use the GoogleReviewsIntegration component in your application.
                                </p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default GoogleReviewsTest;