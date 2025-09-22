// Demo component showcasing WordPress GraphQL integration
import React, { useState } from 'react';
import {
    WordPressPost,
    WordPressPage,
    RecentPostsPreview,
    PopularServicesPreview
} from '../WordPressContent.jsx';
import { checkWordPressHealth } from '../../lib/wordpress.js';
import { invalidateCache, getCacheStats } from '../../lib/wordpress-api.js';

export const WordPressIntegrationDemo = () => {
    const [activeTab, setActiveTab] = useState('posts');
    const [healthStatus, setHealthStatus] = useState(null);
    const [cacheStats, setCacheStats] = useState(null);
    const [testSlug, setTestSlug] = useState('');

    const handleHealthCheck = async () => {
        try {
            const result = await checkWordPressHealth();
            setHealthStatus(result);
        } catch (error) {
            setHealthStatus({
                isHealthy: false,
                error: { message: error.message },
            });
        }
    };

    const handleClearCache = () => {
        invalidateCache();
        setCacheStats(getCacheStats());
    };

    const handleGetCacheStats = () => {
        setCacheStats(getCacheStats());
    };

    const tabs = [
        { id: 'posts', label: 'Recent Posts', component: RecentPostsPreview },
        { id: 'services', label: 'Popular Services', component: PopularServicesPreview },
        { id: 'single-post', label: 'Single Post', component: WordPressPost },
        { id: 'single-page', label: 'Single Page', component: WordPressPage },
    ];

    return (
        <div className="max-w-6xl mx-auto p-6 bg-white">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    WordPress GraphQL Integration Demo
                </h1>
                <p className="text-gray-600 mb-6">
                    This demo showcases the WordPress headless CMS integration with GraphQL,
                    ISR (Incremental Static Regeneration), and real-time content updates.
                </p>

                {/* Control Panel */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <h2 className="text-lg font-semibold mb-4">Control Panel</h2>

                    <div className="flex flex-wrap gap-4 mb-4">
                        <button
                            onClick={handleHealthCheck}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        >
                            Check WordPress Health
                        </button>

                        <button
                            onClick={handleGetCacheStats}
                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                        >
                            Get Cache Stats
                        </button>

                        <button
                            onClick={handleClearCache}
                            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                        >
                            Clear Cache
                        </button>
                    </div>

                    {/* Health Status */}
                    {healthStatus && (
                        <div className={`p-3 rounded mb-4 ${healthStatus.isHealthy
                                ? 'bg-green-100 border border-green-200'
                                : 'bg-red-100 border border-red-200'
                            }`}>
                            <h3 className={`font-semibold ${healthStatus.isHealthy ? 'text-green-800' : 'text-red-800'
                                }`}>
                                WordPress Status: {healthStatus.isHealthy ? 'Healthy' : 'Unhealthy'}
                            </h3>
                            {healthStatus.data && (
                                <p className="text-sm text-gray-600 mt-1">
                                    Site: {healthStatus.data.title} ({healthStatus.data.url})
                                </p>
                            )}
                            {healthStatus.error && (
                                <p className="text-sm text-red-600 mt-1">
                                    Error: {healthStatus.error.message}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Cache Stats */}
                    {cacheStats && (
                        <div className="bg-blue-100 border border-blue-200 p-3 rounded">
                            <h3 className="font-semibold text-blue-800">Cache Statistics</h3>
                            <p className="text-sm text-blue-600 mt-1">
                                Cached items: {cacheStats.size}
                            </p>
                            {cacheStats.keys.length > 0 && (
                                <details className="mt-2">
                                    <summary className="text-sm text-blue-600 cursor-pointer">
                                        View cache keys ({cacheStats.keys.length})
                                    </summary>
                                    <ul className="text-xs text-blue-500 mt-1 ml-4">
                                        {cacheStats.keys.map((key, index) => (
                                            <li key={index}>{key}</li>
                                        ))}
                                    </ul>
                                </details>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Content Area */}
            <div className="min-h-96">
                {activeTab === 'posts' && (
                    <div>
                        <h2 className="text-2xl font-bold mb-4">Recent Posts from WordPress</h2>
                        <RecentPostsPreview count={3} />
                    </div>
                )}

                {activeTab === 'services' && (
                    <div>
                        <h2 className="text-2xl font-bold mb-4">Popular Services from WordPress</h2>
                        <PopularServicesPreview count={6} />
                    </div>
                )}

                {activeTab === 'single-post' && (
                    <div>
                        <h2 className="text-2xl font-bold mb-4">Single Post Demo</h2>
                        <div className="mb-4">
                            <label htmlFor="post-slug" className="block text-sm font-medium text-gray-700 mb-2">
                                Enter Post Slug:
                            </label>
                            <div className="flex gap-2">
                                <input
                                    id="post-slug"
                                    type="text"
                                    value={testSlug}
                                    onChange={(e) => setTestSlug(e.target.value)}
                                    placeholder="e.g., catarata-sintomas-tratamento"
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                Try slugs like: 'catarata-sintomas-tratamento', 'glaucoma-prevencao', etc.
                            </p>
                        </div>
                        {testSlug ? (
                            <WordPressPost slug={testSlug} />
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                Enter a post slug above to load content
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'single-page' && (
                    <div>
                        <h2 className="text-2xl font-bold mb-4">Single Page Demo</h2>
                        <div className="mb-4">
                            <label htmlFor="page-slug" className="block text-sm font-medium text-gray-700 mb-2">
                                Enter Page Slug:
                            </label>
                            <div className="flex gap-2">
                                <input
                                    id="page-slug"
                                    type="text"
                                    value={testSlug}
                                    onChange={(e) => setTestSlug(e.target.value)}
                                    placeholder="e.g., sobre, contato, equipe"
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                Try slugs like: 'sobre', 'contato', 'equipe', etc.
                            </p>
                        </div>
                        {testSlug ? (
                            <WordPressPage slug={testSlug} />
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                Enter a page slug above to load content
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Integration Info */}
            <div className="mt-12 bg-gray-50 rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4">Integration Features</h2>
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-2">✅ Implemented Features</h3>
                        <ul className="text-sm text-gray-600 space-y-1">
                            <li>• GraphQL client configuration</li>
                            <li>• Content fetching utilities (posts, pages, services)</li>
                            <li>• ISR (Incremental Static Regeneration) support</li>
                            <li>• Webhook endpoints for revalidation</li>
                            <li>• React hooks for content consumption</li>
                            <li>• Error handling and fallbacks</li>
                            <li>• In-memory caching system</li>
                            <li>• Health check functionality</li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-2">🔧 Configuration Required</h3>
                        <ul className="text-sm text-gray-600 space-y-1">
                            <li>• Set WORDPRESS_GRAPHQL_ENDPOINT in .env</li>
                            <li>• Configure WP_REVALIDATE_SECRET</li>
                            <li>• Set up WordPress webhooks</li>
                            <li>• Install WPGraphQL plugin on WordPress</li>
                            <li>• Configure custom post types (services, team, testimonials)</li>
                            <li>• Set up WordPress custom fields (ACF)</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};