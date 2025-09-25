/**
 * Blog Premium Showcase
 * Demonstração completa do design premium com efeitos 3D e vidro líquido
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Eye,
    Sparkles,
    Palette,
    Monitor,
    Smartphone,
    Tablet,
    ToggleLeft,
    ToggleRight,
    Star,
    Heart,
    Zap
} from 'lucide-react';
import BlogPostPresbiopiaPremium from './BlogPostPresbiopiaPremium';
import BlogListPremium from './BlogListPremium';
import '../../styles/premiumLiquidGlass.css';

const BlogPremiumShowcase = () => {
    const [currentView, setCurrentView] = useState('post'); // 'post' ou 'list'
    const [showFeatures, setShowFeatures] = useState(true);

    const features = [
        {
            icon: <Sparkles className="w-8 h-8" />,
            title: "Efeitos de Vidro Líquido",
            description: "Backdrop blur avançado com transparências e gradientes suaves",
            gradient: "from-blue-500 to-purple-600"
        },
        {
            icon: <Zap className="w-8 h-8" />,
            title: "Animações 3D",
            description: "Hover effects, transformações e transições cinematográficas",
            gradient: "from-purple-500 to-pink-600"
        },
        {
            icon: <Palette className="w-8 h-8" />,
            title: "Paleta Premium",
            description: "Cores modernas e aconchegantes com gradientes harmoniosos",
            gradient: "from-green-500 to-teal-600"
        },
        {
            icon: <Heart className="w-8 h-8" />,
            title: "UX Aconchegante",
            description: "Design que transmite confiança e profissionalismo médico",
            gradient: "from-red-500 to-pink-600"
        },
        {
            icon: <Monitor className="w-8 h-8" />,
            title: "Responsivo Premium",
            description: "Adaptação perfeita para desktop, tablet e mobile",
            gradient: "from-yellow-500 to-orange-600"
        },
        {
            icon: <Star className="w-8 h-8" />,
            title: "Margens Otimizadas",
            description: "Espaçamento premium com containers responsivos inteligentes",
            gradient: "from-indigo-500 to-blue-600"
        }
    ];

    const deviceSizes = [
        { name: 'Desktop', icon: <Monitor className="w-5 h-5" />, width: '100%' },
        { name: 'Tablet', icon: <Tablet className="w-5 h-5" />, width: '768px' },
        { name: 'Mobile', icon: <Smartphone className="w-5 h-5" />, width: '375px' }
    ];

    const [selectedDevice, setSelectedDevice] = useState('Desktop');

    return (
        <div className="min-h-screen" style={{ background: 'var(--premium-bg-main)' }}>
            {/* Header de Controles */}
            <div className="premium-container py-8">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="premium-glass-card mb-8"
                >
                    <div className="premium-card-content">
                        <div className="flex flex-wrap items-center justify-between gap-6">
                            {/* Título */}
                            <div className="flex items-center gap-4">
                                <div
                                    className="w-12 h-12 rounded-full flex items-center justify-center text-white"
                                    style={{ background: 'var(--premium-primary)' }}
                                >
                                    <Eye className="w-6 h-6" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold" style={{ color: 'var(--premium-text-primary)' }}>
                                        Blog Premium Showcase
                                    </h1>
                                    <p style={{ color: 'var(--premium-text-secondary)' }}>
                                        Design de vidro líquido com efeitos 3D
                                    </p>
                                </div>
                            </div>

                            {/* Controles de Visualização */}
                            <div className="flex items-center gap-4">
                                {/* Toggle de Features */}
                                <button
                                    onClick={() => setShowFeatures(!showFeatures)}
                                    className="premium-badge premium-hover-lift"
                                >
                                    {showFeatures ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                                    Features
                                </button>

                                {/* Seletor de Visualização */}
                                <div className="flex bg-white/10 rounded-full p-1">
                                    <button
                                        onClick={() => setCurrentView('post')}
                                        className={`px-4 py-2 rounded-full transition-all ${currentView === 'post'
                                                ? 'bg-white text-blue-600 shadow-lg'
                                                : 'text-white hover:bg-white/10'
                                            }`}
                                    >
                                        Post
                                    </button>
                                    <button
                                        onClick={() => setCurrentView('list')}
                                        className={`px-4 py-2 rounded-full transition-all ${currentView === 'list'
                                                ? 'bg-white text-blue-600 shadow-lg'
                                                : 'text-white hover:bg-white/10'
                                            }`}
                                    >
                                        Lista
                                    </button>
                                </div>

                                {/* Seletor de Dispositivo */}
                                <div className="flex gap-2">
                                    {deviceSizes.map((device) => (
                                        <button
                                            key={device.name}
                                            onClick={() => setSelectedDevice(device.name)}
                                            className={`premium-badge ${selectedDevice === device.name
                                                    ? 'bg-white/20 border-white/40'
                                                    : ''
                                                }`}
                                        >
                                            {device.icon}
                                            {device.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Features Premium */}
                {showFeatures && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-8"
                    >
                        <div className="premium-glass-card">
                            <div className="premium-card-content">
                                <h2 className="text-2xl font-bold mb-8 text-center" style={{ color: 'var(--premium-text-primary)' }}>
                                    ✨ Recursos Premium Implementados
                                </h2>

                                <div className="premium-grid premium-grid-3">
                                    {features.map((feature, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.1 * index }}
                                            className="premium-glass-card premium-hover-lift"
                                        >
                                            <div className="premium-card-content text-center">
                                                <div
                                                    className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center text-white bg-gradient-to-r ${feature.gradient}`}
                                                >
                                                    {feature.icon}
                                                </div>
                                                <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--premium-text-primary)' }}>
                                                    {feature.title}
                                                </h3>
                                                <p className="text-sm" style={{ color: 'var(--premium-text-secondary)' }}>
                                                    {feature.description}
                                                </p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Viewport Responsivo */}
            <div className="premium-container pb-8">
                <div className="premium-glass-card">
                    <div className="premium-card-content p-4">
                        <div className="text-center mb-4">
                            <div className="premium-badge">
                                {deviceSizes.find(d => d.name === selectedDevice)?.icon}
                                Visualização: {selectedDevice}
                            </div>
                        </div>

                        <div
                            className="mx-auto transition-all duration-500 overflow-hidden rounded-2xl"
                            style={{
                                maxWidth: deviceSizes.find(d => d.name === selectedDevice)?.width,
                                boxShadow: 'var(--premium-shadow-xl)'
                            }}
                        >
                            {/* Conteúdo do Blog */}
                            <motion.div
                                key={currentView}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                {currentView === 'post' ? (
                                    <BlogPostPresbiopiaPremium />
                                ) : (
                                    <BlogListPremium />
                                )}
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Informações Técnicas */}
            <div className="premium-container pb-16">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="premium-glass-card"
                >
                    <div className="premium-card-content">
                        <h2 className="text-2xl font-bold mb-8 text-center" style={{ color: 'var(--premium-text-primary)' }}>
                            🎨 Especificações Técnicas do Design
                        </h2>

                        <div className="premium-grid premium-grid-2">
                            <div>
                                <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--premium-text-primary)' }}>
                                    Efeitos Visuais
                                </h3>
                                <ul className="space-y-2 text-sm" style={{ color: 'var(--premium-text-secondary)' }}>
                                    <li>✅ Backdrop blur com 25px de desfoque</li>
                                    <li>✅ Transparências rgba com múltiplas camadas</li>
                                    <li>✅ Gradientes CSS personalizados</li>
                                    <li>✅ Sombras multicamadas com inset</li>
                                    <li>✅ Animações cubic-bezier suaves</li>
                                    <li>✅ Hover effects com transform 3D</li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--premium-text-primary)' }}>
                                    Responsividade
                                </h3>
                                <ul className="space-y-2 text-sm" style={{ color: 'var(--premium-text-secondary)' }}>
                                    <li>✅ Container máximo: 1400px</li>
                                    <li>✅ Margens laterais: 2rem (desktop)</li>
                                    <li>✅ Margens laterais: 1.5rem (tablet)</li>
                                    <li>✅ Margens laterais: 1rem (mobile)</li>
                                    <li>✅ Grid responsivo inteligente</li>
                                    <li>✅ Tipografia fluida com clamp()</li>
                                </ul>
                            </div>
                        </div>

                        <div className="mt-8 p-6 rounded-2xl" style={{ background: 'var(--premium-glass)' }}>
                            <h4 className="text-lg font-bold mb-4" style={{ color: 'var(--premium-text-primary)' }}>
                                🎯 Paleta de Cores Premium
                            </h4>
                            <div className="flex flex-wrap gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full" style={{ background: 'var(--premium-primary)' }}></div>
                                    <span className="text-sm">Primary Gradient</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full" style={{ background: 'var(--premium-secondary)' }}></div>
                                    <span className="text-sm">Secondary Gradient</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full" style={{ background: 'var(--premium-accent)' }}></div>
                                    <span className="text-sm">Accent Gradient</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full" style={{ background: 'var(--premium-warm)' }}></div>
                                    <span className="text-sm">Warm Gradient</span>
                                </div>
                            </div>
                        </div>
                    </div>
            </div>
        </div>
        </div >
    );
};

export default BlogPremiumShowcase;