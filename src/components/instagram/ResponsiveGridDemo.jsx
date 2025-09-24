import React from 'react';
import InstagramResponsiveGrid from './InstagramResponsiveGrid';
import InstagramPost from './InstagramPost';

/**
 * ResponsiveGridDemo - Demo component to showcase responsive grid functionality
 */
const ResponsiveGridDemo = () => {
    // Mock Instagram posts data
    const mockPosts = [
        {
            id: '1',
            caption: 'Beautiful sunset at the beach! 🌅 #sunset #beach #photography',
            media_type: 'IMAGE',
            media_url: '/img/hero.webp',
            permalink: 'https://instagram.com/p/demo1',
            timestamp: new Date().toISOString(),
            username: 'saraivavision',
            stats: {
                likes: 245,
                comments: 12,
                engagement_rate: 4.2
            }
        },
        {
            id: '2',
            caption: 'Amazing eye surgery results! Our patient is thriving 👁️✨ #eyecare #surgery #vision',
            media_type: 'IMAGE',
            media_url: '/img/drphilipe_perfil.webp',
            permalink: 'https://instagram.com/p/demo2',
            timestamp: new Date(Date.now() - 86400000).toISOString(),
            username: 'saraivavision',
            stats: {
                likes: 189,
                comments: 8,
                engagement_rate: 3.8
            }
        },
        {
            id: '3',
            caption: 'Educational video about eye health 📚 Learn more about protecting your vision!',
            media_type: 'VIDEO',
            media_url: '/img/catartat.webp',
            thumbnail_url: '/img/catartat.webp',
            permalink: 'https://instagram.com/p/demo3',
            timestamp: new Date(Date.now() - 172800000).toISOString(),
            username: 'saraivavision',
            stats: {
                likes: 312,
                comments: 24,
                engagement_rate: 5.1
            }
        },
        {
            id: '4',
            caption: 'State-of-the-art equipment for the best patient care 🏥 #technology #healthcare',
            media_type: 'CAROUSEL_ALBUM',
            media_url: '/img/clinic_facade.webp',
            permalink: 'https://instagram.com/p/demo4',
            timestamp: new Date(Date.now() - 259200000).toISOString(),
            username: 'saraivavision',
            stats: {
                likes: 156,
                comments: 6,
                engagement_rate: 3.2
            }
        }
    ];

    const handleLayoutChange = (layoutInfo) => {
        console.log('Layout changed:', layoutInfo);
    };

    const handleSwipe = (swipeInfo) => {
        console.log('Swipe detected:', swipeInfo);
    };

    const handlePostClick = (post) => {
        console.log('Post clicked:', post.id);
        // In a real app, this would open the Instagram post
        alert(`Opening Instagram post: ${post.caption.substring(0, 50)}...`);
    };

    return (
        <div className="responsive-grid-demo p-8 max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-4">Instagram Responsive Grid Demo</h1>
                <p className="text-gray-600 mb-6">
                    This demo showcases the responsive grid layout with touch gestures,
                    performance optimizations, and accessibility features.
                </p>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <h3 className="font-semibold text-blue-800 mb-2">Features Demonstrated:</h3>
                    <ul className="text-blue-700 text-sm space-y-1">
                        <li>• Responsive CSS Grid layout that adapts to screen size</li>
                        <li>• Touch gesture support for mobile devices</li>
                        <li>• Optimized image loading with WebP/AVIF support</li>
                        <li>• Skeleton loading states</li>
                        <li>• Accessibility compliance (ARIA attributes, keyboard navigation)</li>
                        <li>• Performance monitoring and optimization</li>
                    </ul>
                </div>
            </div>

            <div className="space-y-8">
                {/* Grid Layout Demo */}
                <section>
                    <h2 className="text-2xl font-semibold mb-4">Grid Layout (Default)</h2>
                    <InstagramResponsiveGrid
                        maxPosts={4}
                        layout="grid"
                        enableTouchGestures={true}
                        onLayoutChange={handleLayoutChange}
                        className="border border-gray-200 rounded-lg p-4"
                    >
                        {mockPosts.map((post) => (
                            <InstagramPost
                                key={post.id}
                                post={post}
                                onClick={handlePostClick}
                                enableLazyLoading={true}
                                enableAccessibility={true}
                                className="h-full"
                            />
                        ))}
                    </InstagramResponsiveGrid>
                </section>

                {/* Carousel Layout Demo */}
                <section>
                    <h2 className="text-2xl font-semibold mb-4">Carousel Layout</h2>
                    <InstagramResponsiveGrid
                        maxPosts={4}
                        layout="carousel"
                        enableTouchGestures={true}
                        onLayoutChange={handleLayoutChange}
                        className="border border-gray-200 rounded-lg p-4"
                    >
                        {mockPosts.map((post) => (
                            <InstagramPost
                                key={post.id}
                                post={post}
                                onClick={handlePostClick}
                                enableLazyLoading={true}
                                enableAccessibility={true}
                                className="h-full"
                            />
                        ))}
                    </InstagramResponsiveGrid>
                </section>

                {/* Different Post Counts */}
                <section>
                    <h2 className="text-2xl font-semibold mb-4">Different Post Counts</h2>

                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-medium mb-2">2 Posts</h3>
                            <InstagramResponsiveGrid
                                maxPosts={2}
                                layout="grid"
                                className="border border-gray-200 rounded-lg p-4"
                            >
                                {mockPosts.slice(0, 2).map((post) => (
                                    <InstagramPost
                                        key={post.id}
                                        post={post}
                                        onClick={handlePostClick}
                                        enableLazyLoading={true}
                                        enableAccessibility={true}
                                        className="h-full"
                                    />
                                ))}
                            </InstagramResponsiveGrid>
                        </div>

                        <div>
                            <h3 className="text-lg font-medium mb-2">3 Posts</h3>
                            <InstagramResponsiveGrid
                                maxPosts={3}
                                layout="grid"
                                className="border border-gray-200 rounded-lg p-4"
                            >
                                {mockPosts.slice(0, 3).map((post) => (
                                    <InstagramPost
                                        key={post.id}
                                        post={post}
                                        onClick={handlePostClick}
                                        enableLazyLoading={true}
                                        enableAccessibility={true}
                                        className="h-full"
                                    />
                                ))}
                            </InstagramResponsiveGrid>
                        </div>
                    </div>
                </section>

                {/* Instructions */}
                <section className="bg-gray-50 rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4">Try These Features:</h2>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                            <h4 className="font-medium mb-2">Desktop:</h4>
                            <ul className="space-y-1 text-gray-600">
                                <li>• Resize your browser window to see responsive behavior</li>
                                <li>• Hover over posts to see interaction effects</li>
                                <li>• Use Tab key to navigate through posts</li>
                                <li>• Click posts to see interaction handling</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-medium mb-2">Mobile:</h4>
                            <ul className="space-y-1 text-gray-600">
                                <li>• Swipe left/right on carousel layout</li>
                                <li>• Tap posts to interact</li>
                                <li>• Notice optimized touch targets</li>
                                <li>• Observe lazy loading as you scroll</li>
                            </ul>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default ResponsiveGridDemo;