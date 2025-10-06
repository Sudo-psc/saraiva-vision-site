import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Zap,
    Image as ImageIcon,
    Clock,
    Gauge,
    CheckCircle,
    AlertCircle,
    Loader2,
    Eye,
    Wifi
} from 'lucide-react';
import OptimizedImage from './OptimizedImage';
import { InstagramFeedSkeleton, InstagramPostSkeleton, ShimmerSkeleton } from './InstagramSkeleton';
import useInstagramPerformance from '../../hooks/useInstagramPerformance';

/**
 * PerformanceOptimizationDemo - Demonstrates all performance optimization features
 * Shows lazy loading, image optimization, skeleton loading, and performance metrics
 */
const PerformanceOptimizationDemo = () => {
    const [activeDemo, setActiveDemo] = useState('lazy-loading');
    const [demoImages, setDemoImages] = useState([]);
    const [showMetrics, setShowMetrics] = useState(false);

    // Performance hook for monitoring
    const {
        loadingImages,
        loadedImages,
        performanceMetrics,
        preloadImages,
        getLoadingProgress,
        getPerformanceReport
    } = useInstagramPerformance({
        enableLazyLoading: true,
        enableImageOptimization: true,
        enablePerformanceMonitoring: true
    });

    // Demo image URLs
    const sampleImages = [
        '/img/hero.webp',
        '/img/drphilipe_perfil.webp',
        '/img/catartat.webp',
        '/img/retina.webp',
        '/images/hero-640w.webp',
        '/images/drphilipe_perfil-640w.webp'
    ];

    useEffect(() => {
        setDemoImages(sampleImages);
    }, []);

    const loadingProgress = getLoadingProgress();
    const performanceReport = getPerformanceReport();

    const demos = {
        'lazy-loading': {
            title: 'Lazy Loading',
            description: 'Images load only when they become visible in the viewport',
            icon: Eye,
            component: LazyLoadingDemo
        },
        'image-optimization': {
            title: 'Image Format Optimization',
            description: 'Automatic WebP/AVIF format detection and fallback',
            icon: ImageIcon,
            component: ImageOptimizationDemo
        },
        'skeleton-loading': {
            title: 'Skeleton Loading States',
            description: 'Smooth loading animations while content loads',
            icon: Loader2,
            component: SkeletonLoadingDemo
        },
        'performance-metrics': {
            title: 'Performance Monitoring',
            description: 'Real-time performance tracking and optimization',
            icon: Gauge,
            component: PerformanceMetricsDemo
        }
    };

    return (
        <div className="performance-demo max-w-6xl mx-auto p-6 space-y-8">
            {/* Header */}
            <div className="text-center">
                <div className="flex items-center justify-center gap-3 mb-4">
                    <div className="p-3 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-xl">
                        <Zap className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        Performance Optimization Demo
                    </h1>
                </div>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    Explore the advanced performance optimizations implemented in the Instagram feed system,
                    including lazy loading, image optimization, and real-time performance monitoring.
                </p>
            </div>

            {/* Performance Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-5 h-5 text-blue-500" />
                        <span className="font-medium text-gray-700">Load Time</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                        {performanceMetrics.averageLoadTime > 0
                            ? `${Math.round(performanceMetrics.averageLoadTime)}ms`
                            : '0ms'
                        }
                    </div>
                </div>

                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                        <ImageIcon className="w-5 h-5 text-green-500" />
                        <span className="font-medium text-gray-700">Images Loaded</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                        {loadedImages.size}/{performanceMetrics.totalImages}
                    </div>
                </div>

                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                        <Gauge className="w-5 h-5 text-purple-500" />
                        <span className="font-medium text-gray-700">Progress</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                        {loadingProgress.percentage}%
                    </div>
                </div>

                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                        <span className="font-medium text-gray-700">Status</span>
                    </div>
                    <div className="text-sm font-medium">
                        {loadingProgress.isComplete ? (
                            <span className="text-emerald-600">Complete</span>
                        ) : loadingImages.size > 0 ? (
                            <span className="text-cyan-600">Loading...</span>
                        ) : (
                            <span className="text-gray-500">Ready</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Demo Navigation */}
            <div className="flex flex-wrap gap-2 justify-center">
                {Object.entries(demos).map(([key, demo]) => {
                    const Icon = demo.icon;
                    return (
                        <button
                            key={key}
                            onClick={() => setActiveDemo(key)}
                            className={`
                                flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
                                ${activeDemo === key
                                    ? 'bg-cyan-600 text-white shadow-lg'
                                    : 'bg-white text-gray-700 border border-gray-200 hover:border-cyan-300 hover:text-cyan-600'
                                }
                            `}
                        >
                            <Icon className="w-4 h-4" />
                            {demo.title}
                        </button>
                    );
                })}
            </div>

            {/* Active Demo */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3 mb-2">
                        {React.createElement(demos[activeDemo].icon, {
                            className: "w-6 h-6 text-cyan-600"
                        })}
                        <h2 className="text-xl font-semibold text-gray-900">
                            {demos[activeDemo].title}
                        </h2>
                    </div>
                    <p className="text-gray-600">
                        {demos[activeDemo].description}
                    </p>
                </div>

                <div className="p-6">
                    {React.createElement(demos[activeDemo].component, {
                        images: demoImages,
                        performanceMetrics,
                        loadingProgress
                    })}
                </div>
            </div>

            {/* Performance Report */}
            {showMetrics && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-50 rounded-xl p-6 border border-gray-200"
                >
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Performance Report
                    </h3>
                    <pre className="text-sm text-gray-700 bg-white p-4 rounded-lg overflow-auto">
                        {JSON.stringify(performanceReport, null, 2)}
                    </pre>
                </motion.div>
            )}

            {/* Controls */}
            <div className="flex justify-center gap-4">
                <button
                    onClick={() => preloadImages(demoImages)}
                    className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
                >
                    Preload All Images
                </button>
                <button
                    onClick={() => setShowMetrics(!showMetrics)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                    {showMetrics ? 'Hide' : 'Show'} Performance Report
                </button>
            </div>
        </div>
    );
};

// Demo Components
const LazyLoadingDemo = ({ images }) => (
    <div className="space-y-6">
        <div className="text-sm text-gray-600 bg-blue-50 p-4 rounded-lg">
            <strong>How it works:</strong> Scroll down to see images load only when they become visible.
            This reduces initial page load time and saves bandwidth.
        </div>

        <div className="space-y-8">
            {images.map((src, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">
                        Image {index + 1} - Lazy Loading {index > 2 ? 'Enabled' : 'Disabled'}
                    </h4>
                    <div className="w-full h-64">
                        <OptimizedImage
                            src={src}
                            alt={`Demo image ${index + 1}`}
                            enableLazyLoading={index > 2}
                            enableFormatOptimization={true}
                            className="w-full h-full"
                        />
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const ImageOptimizationDemo = ({ images }) => (
    <div className="space-y-6">
        <div className="text-sm text-gray-600 bg-green-50 p-4 rounded-lg">
            <strong>How it works:</strong> Images are automatically served in the most efficient format
            (WebP/AVIF) with fallbacks to ensure compatibility across all browsers.
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {images.slice(0, 4).map((src, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">
                        Optimized Image {index + 1}
                    </h4>
                    <div className="w-full h-48">
                        <OptimizedImage
                            src={src}
                            alt={`Optimized demo image ${index + 1}`}
                            enableFormatOptimization={true}
                            enableLazyLoading={false}
                            className="w-full h-full"
                        />
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const SkeletonLoadingDemo = () => (
    <div className="space-y-6">
        <div className="text-sm text-gray-600 bg-purple-50 p-4 rounded-lg">
            <strong>How it works:</strong> Skeleton screens provide visual feedback during loading,
            improving perceived performance and user experience.
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <h4 className="font-medium text-gray-900 mb-3">Instagram Post Skeleton</h4>
                <InstagramPostSkeleton />
            </div>

            <div>
                <h4 className="font-medium text-gray-900 mb-3">Shimmer Skeleton</h4>
                <div className="space-y-3">
                    <ShimmerSkeleton width="100%" height="20px" />
                    <ShimmerSkeleton width="80%" height="20px" />
                    <ShimmerSkeleton width="60%" height="20px" />
                </div>
            </div>
        </div>

        <div>
            <h4 className="font-medium text-gray-900 mb-3">Instagram Feed Skeleton</h4>
            <InstagramFeedSkeleton postCount={4} layout="grid" showHeader={false} />
        </div>
    </div>
);

const PerformanceMetricsDemo = ({ performanceMetrics, loadingProgress }) => (
    <div className="space-y-6">
        <div className="text-sm text-gray-600 bg-orange-50 p-4 rounded-lg">
            <strong>How it works:</strong> Real-time performance monitoring tracks loading times,
            success rates, and provides optimization recommendations.
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Loading Metrics</h4>
                <div className="space-y-2">
                    <div className="flex justify-between">
                        <span className="text-gray-600">Total Images:</span>
                        <span className="font-medium">{performanceMetrics.totalImages}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Loaded:</span>
                        <span className="font-medium text-green-600">{performanceMetrics.loadedImages}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Failed:</span>
                        <span className="font-medium text-red-600">{performanceMetrics.failedImages}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Average Load Time:</span>
                        <span className="font-medium">{Math.round(performanceMetrics.averageLoadTime)}ms</span>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Progress</h4>
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span>Loading Progress</span>
                        <span>{loadingProgress.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-cyan-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${loadingProgress.percentage}%` }}
                        />
                    </div>
                    <div className="text-xs text-gray-500">
                        {loadingProgress.loaded} of {loadingProgress.total} images loaded
                    </div>
                </div>
            </div>
        </div>
    </div>
);

export default PerformanceOptimizationDemo;