import React, { useState } from 'react';
import { InstagramFeedContainer } from './index';

/**
 * InstagramFeedDemo - Demonstration component showing usage of InstagramFeedContainer
 * This component shows different configuration options and layouts
 */
const InstagramFeedDemo = () => {
    const [config, setConfig] = useState({
        maxPosts: 4,
        showStats: true,
        layout: 'grid',
        theme: 'light',
        enableLazyLoading: true,
        enableAccessibility: true
    });

    const handleConfigChange = (key, value) => {
        setConfig(prev => ({ ...prev, [key]: value }));
    };

    const handlePostClick = (post) => {
        console.log('Post clicked:', post);
        // Custom post click handler - could open modal, navigate, etc.
    };

    const handleError = (error) => {
        console.error('Instagram feed error:', error);
    };

    const handleSuccess = (posts, metadata) => {
        console.log('Instagram feed loaded:', posts.length, 'posts', metadata);
    };

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Instagram Feed Demo
                </h1>
                <p className="text-gray-600">
                    Demonstration of the new Instagram embedded system components
                </p>
            </div>

            {/* Configuration Panel */}
            <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-lg font-semibold mb-4">Configuration</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Max Posts */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Max Posts
                        </label>
                        <select
                            value={config.maxPosts}
                            onChange={(e) => handleConfigChange('maxPosts', parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value={1}>1</option>
                            <option value={2}>2</option>
                            <option value={3}>3</option>
                            <option value={4}>4</option>
                            <option value={6}>6</option>
                            <option value={8}>8</option>
                        </select>
                    </div>

                    {/* Layout */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Layout
                        </label>
                        <select
                            value={config.layout}
                            onChange={(e) => handleConfigChange('layout', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="grid">Grid</option>
                            <option value="carousel">Carousel</option>
                        </select>
                    </div>

                    {/* Theme */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Theme
                        </label>
                        <select
                            value={config.theme}
                            onChange={(e) => handleConfigChange('theme', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="light">Light</option>
                            <option value="dark">Dark</option>
                            <option value="auto">Auto</option>
                        </select>
                    </div>

                    {/* Show Stats */}
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="showStats"
                            checked={config.showStats}
                            onChange={(e) => handleConfigChange('showStats', e.target.checked)}
                            className="h-4 w-4 text-cyan-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="showStats" className="ml-2 block text-sm text-gray-700">
                            Show Statistics
                        </label>
                    </div>

                    {/* Lazy Loading */}
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="lazyLoading"
                            checked={config.enableLazyLoading}
                            onChange={(e) => handleConfigChange('enableLazyLoading', e.target.checked)}
                            className="h-4 w-4 text-cyan-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="lazyLoading" className="ml-2 block text-sm text-gray-700">
                            Lazy Loading
                        </label>
                    </div>

                    {/* Accessibility */}
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="accessibility"
                            checked={config.enableAccessibility}
                            onChange={(e) => handleConfigChange('enableAccessibility', e.target.checked)}
                            className="h-4 w-4 text-cyan-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="accessibility" className="ml-2 block text-sm text-gray-700">
                            Accessibility Features
                        </label>
                    </div>
                </div>
            </div>

            {/* Instagram Feed */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <InstagramFeedContainer
                    maxPosts={config.maxPosts}
                    showStats={config.showStats}
                    layout={config.layout}
                    theme={config.theme}
                    enableLazyLoading={config.enableLazyLoading}
                    enableAccessibility={config.enableAccessibility}
                    onPostClick={handlePostClick}
                    onError={handleError}
                    onSuccess={handleSuccess}
                    className="w-full"
                />
            </div>

            {/* Usage Example */}
            <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-lg font-semibold mb-4">Usage Example</h2>
                <pre className="bg-gray-800 text-green-400 p-4 rounded-md overflow-x-auto text-sm">
                    {`import { InstagramFeedContainer } from './components/instagram';

function MyComponent() {
  return (
    <InstagramFeedContainer
      maxPosts={${config.maxPosts}}
      showStats={${config.showStats}}
      layout="${config.layout}"
      theme="${config.theme}"
      enableLazyLoading={${config.enableLazyLoading}}
      enableAccessibility={${config.enableAccessibility}}
      onPostClick={(post) => console.log('Clicked:', post)}
      onError={(error) => console.error('Error:', error)}
      onSuccess={(posts) => console.log('Loaded:', posts)}
    />
  );
}`}
                </pre>
            </div>

            {/* Features List */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold mb-4">Features</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <h3 className="font-medium text-gray-900 mb-2">Core Features</h3>
                        <ul className="space-y-1 text-sm text-gray-600">
                            <li>• Real-time Instagram post fetching</li>
                            <li>• Intelligent caching (5-minute TTL)</li>
                            <li>• Responsive grid and carousel layouts</li>
                            <li>• Image optimization and lazy loading</li>
                            <li>• Offline support with cached fallbacks</li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-medium text-gray-900 mb-2">Advanced Features</h3>
                        <ul className="space-y-1 text-sm text-gray-600">
                            <li>• Real-time statistics via WebSocket</li>
                            <li>• Engagement metrics with trends</li>
                            <li>• Full accessibility compliance (WCAG 2.1)</li>
                            <li>• Keyboard navigation support</li>
                            <li>• Screen reader compatibility</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InstagramFeedDemo;