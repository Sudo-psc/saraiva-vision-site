import React from 'react';
import InstagramResponsiveGrid from './InstagramResponsiveGrid';

/**
 * ResponsiveGridTest - Simple test component to verify responsive grid functionality
 */
const ResponsiveGridTest = () => {
    const mockPosts = [
        { id: '1', content: 'Post 1' },
        { id: '2', content: 'Post 2' },
        { id: '3', content: 'Post 3' },
        { id: '4', content: 'Post 4' }
    ];

    const handleLayoutChange = (layoutInfo) => {
        console.log('Layout changed:', layoutInfo);
    };

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Responsive Grid Test</h1>

            <div className="mb-8">
                <h2 className="text-lg font-semibold mb-2">Grid Layout (4 posts)</h2>
                <InstagramResponsiveGrid
                    maxPosts={4}
                    layout="grid"
                    enableTouchGestures={true}
                    onLayoutChange={handleLayoutChange}
                    className="border border-gray-300 rounded-lg p-4"
                >
                    {mockPosts.map((post) => (
                        <div
                            key={post.id}
                            className="bg-blue-100 border border-blue-300 rounded-lg p-4 h-32 flex items-center justify-center"
                        >
                            <span className="font-medium">{post.content}</span>
                        </div>
                    ))}
                </InstagramResponsiveGrid>
            </div>

            <div className="mb-8">
                <h2 className="text-lg font-semibold mb-2">Carousel Layout</h2>
                <InstagramResponsiveGrid
                    maxPosts={4}
                    layout="carousel"
                    enableTouchGestures={true}
                    className="border border-gray-300 rounded-lg p-4"
                >
                    {mockPosts.map((post) => (
                        <div
                            key={post.id}
                            className="bg-green-100 border border-green-300 rounded-lg p-4 h-32 flex items-center justify-center"
                        >
                            <span className="font-medium">{post.content}</span>
                        </div>
                    ))}
                </InstagramResponsiveGrid>
            </div>

            <div className="text-sm text-gray-600">
                <p>• Resize your browser window to see responsive behavior</p>
                <p>• On mobile: Single column layout</p>
                <p>• On tablet: Two column layout</p>
                <p>• On desktop: Four column layout</p>
                <p>• Touch gestures enabled for mobile devices</p>
            </div>
        </div>
    );
};

export default ResponsiveGridTest;