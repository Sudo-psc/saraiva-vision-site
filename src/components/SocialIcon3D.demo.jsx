import React, { useState } from 'react';
import SocialIcon3D from './SocialIcon3D';
import SocialLinks3D from './ui/social-links-3d';

/**
 * Demo component to showcase the 3D Social Icons functionality
 * 
 * This demonstrates all the features implemented in task 2:
 * - 3D transform capabilities with perspective
 * - Hover state management with smooth transitions
 * - Glass bubble effect with liquid morphing animations
 * - Depth shadow system with multiple layered shadows
 */

const SocialIcon3DDemo = () => {
    const [hoveredIcon, setHoveredIcon] = useState(null);

    const mockSocials = [
        {
            name: 'Facebook',
            href: 'https://facebook.com/saraivavision',
            image: '/icons_social/facebook_icon.png',
            color: '#1877f2'
        },
        {
            name: 'Instagram',
            href: 'https://instagram.com/saraivavision',
            image: '/icons_social/instagram_icon.png',
            color: '#E4405F'
        },
        {
            name: 'LinkedIn',
            href: 'https://linkedin.com/company/saraivavision',
            image: '/icons_social/linkedln_icon.png',
            color: '#0077B5'
        },
        {
            name: 'TikTok',
            href: 'https://tiktok.com/@saraivavision',
            image: '/icons_social/tik_tok_icon.png',
            color: '#000000'
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold text-white mb-8 text-center">
                    3D Social Icons Demo
                </h1>

                <div className="space-y-12">
                    {/* Individual Icons Demo */}
                    <section className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                        <h2 className="text-2xl font-semibold text-white mb-6">Individual 3D Icons</h2>
                        <div className="flex justify-center gap-8">
                            {mockSocials.map((social, index) => (
                                <SocialIcon3D
                                    key={social.name}
                                    social={social}
                                    index={index}
                                    isHovered={hoveredIcon === social.name}
                                    onHover={setHoveredIcon}
                                />
                            ))}
                        </div>
                        <p className="text-slate-400 text-sm mt-4 text-center">
                            Hover over the icons to see 3D transforms, glass bubbles, and depth shadows
                        </p>
                    </section>

                    {/* Enhanced Container Demo */}
                    <section className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                        <h2 className="text-2xl font-semibold text-white mb-6">Enhanced Container with Glass Morphism</h2>
                        <div className="flex justify-center">
                            <SocialLinks3D
                                socials={mockSocials}
                                spacing="normal"
                                enableGlassContainer={true}
                            />
                        </div>
                        <p className="text-slate-400 text-sm mt-4 text-center">
                            Container with coordinated hover states and glass morphism background
                        </p>
                    </section>

                    {/* Different Spacing Options */}
                    <section className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                        <h2 className="text-2xl font-semibold text-white mb-6">Spacing Variations</h2>
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg text-white mb-3">Compact Spacing</h3>
                                <div className="flex justify-center">
                                    <SocialLinks3D
                                        socials={mockSocials}
                                        spacing="compact"
                                        enableGlassContainer={true}
                                    />
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg text-white mb-3">Wide Spacing</h3>
                                <div className="flex justify-center">
                                    <SocialLinks3D
                                        socials={mockSocials}
                                        spacing="wide"
                                        enableGlassContainer={true}
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Features List */}
                    <section className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                        <h2 className="text-2xl font-semibold text-white mb-6">Implemented Features</h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-lg font-medium text-white mb-3">3D Transform System</h3>
                                <ul className="text-slate-300 space-y-2 text-sm">
                                    <li>• Perspective-based 3D transforms</li>
                                    <li>• Dynamic rotation based on mouse position</li>
                                    <li>• Smooth spring animations</li>
                                    <li>• GPU-accelerated rendering</li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="text-lg font-medium text-white mb-3">Glass Morphism Effects</h3>
                                <ul className="text-slate-300 space-y-2 text-sm">
                                    <li>• Backdrop blur with transparency</li>
                                    <li>• Liquid bubble animations</li>
                                    <li>• Multiple layered glass effects</li>
                                    <li>• Gradient overlays</li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="text-lg font-medium text-white mb-3">Hover State Management</h3>
                                <ul className="text-slate-300 space-y-2 text-sm">
                                    <li>• Coordinated hover states</li>
                                    <li>• Smooth transitions between states</li>
                                    <li>• Mouse position tracking</li>
                                    <li>• Click animations</li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="text-lg font-medium text-white mb-3">Depth Shadow System</h3>
                                <ul className="text-slate-300 space-y-2 text-sm">
                                    <li>• Multiple layered shadows</li>
                                    <li>• Realistic 3D depth perception</li>
                                    <li>• Dynamic shadow intensity</li>
                                    <li>• Performance optimized</li>
                                </ul>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default SocialIcon3DDemo;