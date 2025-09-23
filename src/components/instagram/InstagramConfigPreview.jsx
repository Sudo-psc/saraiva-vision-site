import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Monitor,
    Smartphone,
    Tablet,
    RefreshCw,
    Eye,
    Settings
} from 'lucide-react';
import InstagramFeedContainer from './InstagramFeedContainer';
import useAccessibilityPreferences from '../../hooks/useAccessibilityPreferences';

/**
 * InstagramConfigPreview - Live preview of configuration changes
 * Shows how the Instagram feed will look with current settings
 */
const InstagramConfigPreview = ({
    config,
    previewMode = 'desktop', // 'desktop', 'tablet', 'mobile'
    showControls = true,
    onPreviewModeChange = null,
    className = ''
}) => {
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [mockPosts, setMockPosts] = useState([]);

    // Accessibility
    const {
        shouldReduceMotion,
        getAnimationConfig,
        getAccessibilityClasses,
        getAccessibilityStyles
    } = useAccessibilityPreferences();

    // Generate mock posts based on configuration
    useEffect(() => {
        const generateMockPosts = () => {
            const posts = [
                {
                    id: '1',
                    caption: 'Beautiful sunset at the beach 🌅 Perfect end to a perfect day! The colors in the sky were absolutely breathtaking and I had to capture this moment. #sunset #beach #nature #photography #beautiful #peaceful #golden #hour #ocean #waves',
                    media_url: '/img/hero.webp',
                    permalink: 'https://instagram.com/p/preview1',
                    timestamp: new Date().toISOString(),
                    media_type: 'IMAGE',
                    stats: { likes: 245, comments: 18, engagement_rate: 12.5 },
                    hashtags: ['sunset', 'beach', 'nature', 'photography']
                },
                {
                    id: '2',
                    caption: 'Coffee and code ☕️ Starting the day right with some fresh coffee and exciting new projects. There\'s nothing quite like that first sip of coffee in the morning! #developer #coffee #coding #morning #productivity #work #tech #programming',
                    media_url: '/img/drphilipe_perfil.webp',
                    permalink: 'https://instagram.com/p/preview2',
                    timestamp: new Date(Date.now() - 3600000).toISOString(),
                    media_type: 'IMAGE',
                    stats: { likes: 156, comments: 12, engagement_rate: 8.9 },
                    hashtags: ['developer', 'coffee', 'coding', 'morning']
                },
                {
                    id: '3',
                    caption: 'Weekend vibes 🎉 Spending quality time with friends and family. These are the moments that matter most in life! #weekend #fun #friends #family #happiness #memories #good #times #celebration',
                    media_url: '/img/clinic_facade.webp',
                    permalink: 'https://instagram.com/p/preview3',
                    timestamp: new Date(Date.now() - 7200000).toISOString(),
                    media_type: 'IMAGE',
                    stats: { likes: 89, comments: 7, engagement_rate: 6.2 },
                    hashtags: ['weekend', 'fun', 'friends', 'family']
                },
                {
                    id: '4',
                    caption: 'New project launch! 🚀 Excited to share what we\'ve been working on. This has been months in the making and we can\'t wait for everyone to see it! #project #launch #excited #team #work #innovation #technology #startup',
                    media_url: '/img/placeholder.svg',
                    permalink: 'https://instagram.com/p/preview4',
                    timestamp: new Date(Date.now() - 10800000).toISOString(),
                    media_type: 'IMAGE',
                    stats: { likes: 312, comments: 25, engagement_rate: 15.8 },
                    hashtags: ['project', 'launch', 'excited', 'team']
                },
                {
                    id: '5',
                    caption: 'Healthy lifestyle 🥗 Trying to eat better and take care of my body. Small changes can make a big difference over time! #healthy #lifestyle #nutrition #wellness #fitness #food #salad #vegetables',
                    media_url: '/img/hero.webp',
                    permalink: 'https://instagram.com/p/preview5',
                    timestamp: new Date(Date.now() - 14400000).toISOString(),
                    media_type: 'IMAGE',
                    stats: { likes: 78, comments: 5, engagement_rate: 4.1 },
                    hashtags: ['healthy', 'lifestyle', 'nutrition', 'wellness']
                },
                {
                    id: '6',
                    caption: 'Learning never stops 📚 Always trying to improve and learn new skills. Education is a lifelong journey! #learning #education #books #knowledge #growth #development #skills #improvement',
                    media_url: '/img/drphilipe_perfil.webp',
                    permalink: 'https://instagram.com/p/preview6',
                    timestamp: new Date(Date.now() - 18000000).toISOString(),
                    media_type: 'IMAGE',
                    stats: { likes: 134, comments: 9, engagement_rate: 7.3 },
                    hashtags: ['learning', 'education', 'books', 'knowledge']
                }
            ];

            // Filter posts based on configuration
            let filteredPosts = posts;

            // Filter by hashtags (include)
            if (config.hashtags && config.hashtags.length > 0) {
                filteredPosts = filteredPosts.filter(post =>
                    post.hashtags.some(hashtag =>
                        config.hashtags.includes(hashtag.toLowerCase())
                    )
                );
            }

            // Filter by hashtags (exclude)
            if (config.excludeHashtags && config.excludeHashtags.length > 0) {
                filteredPosts = filteredPosts.filter(post =>
                    !post.hashtags.some(hashtag =>
                        config.excludeHashtags.includes(hashtag.toLowerCase())
                    )
                );
            }

            // Filter by content types
            if (config.contentTypes && config.contentTypes.length > 0) {
                filteredPosts = filteredPosts.filter(post =>
                    config.contentTypes.includes(post.media_type)
                );
            }

            // Filter by minimum likes
            if (config.minLikes > 0) {
                filteredPosts = filteredPosts.filter(post =>
                    post.stats.likes >= config.minLikes
                );
            }

            // Limit to maxPosts
            filteredPosts = filteredPosts.slice(0, config.maxPosts || 4);

            return filteredPosts;
        };

        setMockPosts(generateMockPosts());
    }, [config]);

    // Handle refresh
    const handleRefresh = async () => {
        setIsRefreshing(true);

        // Simulate refresh delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Regenerate posts (could add some randomization here)
        setMockPosts(prev => [...prev].sort(() => Math.random() - 0.5));

        setIsRefreshing(false);
    };

    // Get preview dimensions based on mode
    const getPreviewDimensions = () => {
        switch (previewMode) {
            case 'mobile':
                return { width: '375px', height: '600px' };
            case 'tablet':
                return { width: '768px', height: '600px' };
            case 'desktop':
            default:
                return { width: '100%', height: '600px' };
        }
    };

    // Get preview classes based on mode
    const getPreviewClasses = () => {
        const base = 'border border-gray-300 rounded-lg overflow-hidden bg-white';

        switch (previewMode) {
            case 'mobile':
                return `${base} mx-auto shadow-lg`;
            case 'tablet':
                return `${base} mx-auto shadow-lg`;
            case 'desktop':
            default:
                return `${base} shadow-sm`;
        }
    };

    // Apply configuration styles
    const getConfigStyles = () => {
        const styles = {};

        // Apply theme
        if (config.theme === 'dark') {
            styles.backgroundColor = '#1F2937';
            styles.color = '#F9FAFB';
        }

        // Apply custom colors
        if (config.colorScheme === 'custom' && config.customColors) {
            styles.backgroundColor = config.customColors.background;
            styles.color = config.customColors.text;
        }

        return styles;
    };

    const dimensions = getPreviewDimensions();
    const animationConfig = getAnimationConfig();

    return (
        <div className={`instagram-config-preview ${getAccessibilityClasses()} ${className}`} style={getAccessibilityStyles()}>
            {/* Preview controls */}
            {showControls && (
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">Preview:</span>

                        {/* Device mode buttons */}
                        <div className="flex items-center bg-gray-100 rounded-lg p-1">
                            {[
                                { mode: 'desktop', icon: Monitor, label: 'Desktop' },
                                { mode: 'tablet', icon: Tablet, label: 'Tablet' },
                                { mode: 'mobile', icon: Smartphone, label: 'Mobile' }
                            ].map(({ mode, icon: Icon, label }) => (
                                <button
                                    key={mode}
                                    onClick={() => {
                                        if (onPreviewModeChange) {
                                            onPreviewModeChange(mode);
                                        }
                                    }}
                                    className={`
                                        flex items-center gap-1 px-3 py-1 rounded-md text-sm transition-colors
                                        ${previewMode === mode
                                            ? 'bg-white text-gray-900 shadow-sm'
                                            : 'text-gray-600 hover:text-gray-900'
                                        }
                                    `}
                                    title={label}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span className="hidden sm:inline">{label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Refresh button */}
                    <button
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50 transition-colors"
                        title="Refresh preview"
                    >
                        <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>
            )}

            {/* Preview container */}
            <div className="relative">
                <motion.div
                    className={getPreviewClasses()}
                    style={{
                        width: dimensions.width,
                        height: dimensions.height,
                        ...getConfigStyles()
                    }}
                    layout={!shouldReduceMotion()}
                    transition={shouldReduceMotion() ? {} : {
                        duration: animationConfig.duration,
                        ease: animationConfig.ease
                    }}
                >
                    {/* Preview header */}
                    <div className="p-4 border-b border-gray-200 bg-gray-50">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Settings className="w-4 h-4 text-gray-600" />
                                <span className="text-sm font-medium text-gray-900">
                                    Preview Mode: {previewMode.charAt(0).toUpperCase() + previewMode.slice(1)}
                                </span>
                            </div>

                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                <span>{mockPosts.length} posts</span>
                                <span>•</span>
                                <span>{config.layout} layout</span>
                            </div>
                        </div>
                    </div>

                    {/* Instagram feed preview */}
                    <div className="p-4 overflow-y-auto" style={{ height: 'calc(100% - 73px)' }}>
                        {mockPosts.length > 0 ? (
                            <InstagramFeedContainer
                                posts={mockPosts}
                                config={config}
                                isPreview={true}
                                className="h-full"
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-gray-500">
                                <Eye className="w-12 h-12 mb-4 opacity-50" />
                                <p className="text-lg font-medium mb-2">No posts to display</p>
                                <p className="text-sm text-center max-w-sm">
                                    Your current filters don't match any posts.
                                    Try adjusting your content filtering settings.
                                </p>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Loading overlay */}
                {isRefreshing && (
                    <motion.div
                        className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div className="flex items-center gap-3 text-gray-600">
                            <RefreshCw className="w-5 h-5 animate-spin" />
                            <span className="text-sm font-medium">Refreshing preview...</span>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Preview info */}
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex items-start gap-2">
                    <Eye className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-800">
                        <p className="font-medium mb-1">Live Preview</p>
                        <p>
                            This preview shows how your Instagram feed will appear with the current settings.
                            Changes are applied in real-time. The actual feed will use live data from Instagram.
                        </p>
                    </div>
                </div>
            </div>

            {/* Configuration summary */}
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="bg-gray-50 p-3 rounded-md">
                    <div className="font-medium text-gray-900">Posts</div>
                    <div className="text-gray-600">{config.maxPosts} max</div>
                </div>

                <div className="bg-gray-50 p-3 rounded-md">
                    <div className="font-medium text-gray-900">Layout</div>
                    <div className="text-gray-600 capitalize">{config.layout}</div>
                </div>

                <div className="bg-gray-50 p-3 rounded-md">
                    <div className="font-medium text-gray-900">Theme</div>
                    <div className="text-gray-600 capitalize">{config.theme}</div>
                </div>

                <div className="bg-gray-50 p-3 rounded-md">
                    <div className="font-medium text-gray-900">Filters</div>
                    <div className="text-gray-600">
                        {config.hashtags?.length || 0} include, {config.excludeHashtags?.length || 0} exclude
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InstagramConfigPreview;