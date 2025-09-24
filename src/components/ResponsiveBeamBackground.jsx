import React, { useEffect, useRef, useCallback, useMemo } from 'react';
import { useResponsiveDesign } from '../hooks/useResponsiveDesign';
import { usePerformanceMonitor } from '../hooks/usePerformanceMonitor';

/**
 * Responsive Beam Background Component
 * Adapts beam animations based on device type and orientation
 */
const ResponsiveBeamBackground = ({
    className = '',
    colors = ['#3B82F6', '#8B5CF6', '#06B6D4'],
    enableAnimation = true
}) => {
    const canvasRef = useRef(null);
    const animationRef = useRef(null);
    const particlesRef = useRef([]);
    const lastTimeRef = useRef(0);

    const {
        screenSize,
        deviceType,
        responsiveConfig,
        shouldEnableFeature,
        handleOrientationChange
    } = useResponsiveDesign();

    const { trackInteraction } = usePerformanceMonitor('ResponsiveBeamBackground');

    // Memoized beam configuration based on responsive settings
    const beamConfig = useMemo(() => {
        const config = responsiveConfig.beams || {};

        return {
            particleCount: config.particleCount || 20,
            intensity: config.intensity || 'medium',
            animationSpeed: config.animationSpeed || 1.0,
            enableAnimation: config.enableAnimation && enableAnimation && shouldEnableFeature('beams')
        };
    }, [responsiveConfig.beams, enableAnimation, shouldEnableFeature]);

    // Particle class for beam effects
    class BeamParticle {
        constructor(canvas, config) {
            this.canvas = canvas;
            this.config = config;
            this.reset();
        }

        reset() {
            const { width, height } = this.canvas;

            // Adjust spawn positions based on orientation
            if (screenSize.orientation === 'portrait') {
                this.x = Math.random() * width;
                this.y = -50;
                this.vx = (Math.random() - 0.5) * 2;
                this.vy = Math.random() * 2 + 1;
            } else {
                this.x = -50;
                this.y = Math.random() * height;
                this.vx = Math.random() * 2 + 1;
                this.vy = (Math.random() - 0.5) * 2;
            }

            this.size = Math.random() * 3 + 1;
            this.opacity = Math.random() * 0.5 + 0.2;
            this.color = colors[Math.floor(Math.random() * colors.length)];

            // Adjust properties based on device type
            if (deviceType === 'mobile') {
                this.size *= 0.7;
                this.opacity *= 0.6;
            } else if (deviceType === 'tablet') {
                this.size *= 0.85;
                this.opacity *= 0.8;
            }

            // Adjust for beam intensity
            const intensityMultiplier = {
                'subtle': 0.5,
                'medium': 0.8,
                'strong': 1.0
            }[this.config.intensity] || 0.8;

            this.opacity *= intensityMultiplier;
        }

        update(deltaTime) {
            if (!this.config.enableAnimation) return;

            const speedMultiplier = this.config.animationSpeed * (deltaTime / 16.67); // Normalize to 60fps

            this.x += this.vx * speedMultiplier;
            this.y += this.vy * speedMultiplier;

            // Fade out as particle moves
            this.opacity -= 0.002 * speedMultiplier;

            // Reset particle when it goes off screen or fades out
            const { width, height } = this.canvas;
            if (this.x > width + 50 || this.y > height + 50 || this.opacity <= 0) {
                this.reset();
            }
        }

        draw(ctx) {
            if (!this.config.enableAnimation || this.opacity <= 0) return;

            ctx.save();

            // Create gradient for beam effect
            const gradient = ctx.createRadialGradient(
                this.x, this.y, 0,
                this.x, this.y, this.size * 3
            );

            gradient.addColorStop(0, `${this.color}${Math.floor(this.opacity * 255).toString(16).padStart(2, '0')}`);
            gradient.addColorStop(0.5, `${this.color}${Math.floor(this.opacity * 0.5 * 255).toString(16).padStart(2, '0')}`);
            gradient.addColorStop(1, 'transparent');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
            ctx.fill();

            // Add core bright spot
            ctx.fillStyle = `${this.color}${Math.floor(this.opacity * 255).toString(16).padStart(2, '0')}`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        }
    }

    // Initialize particles
    const initializeParticles = useCallback(() => {
        if (!canvasRef.current || !beamConfig.enableAnimation) return;

        const canvas = canvasRef.current;
        particlesRef.current = [];

        for (let i = 0; i < beamConfig.particleCount; i++) {
            particlesRef.current.push(new BeamParticle(canvas, beamConfig));
        }
    }, [beamConfig]);

    // Animation loop
    const animate = useCallback((currentTime) => {
        if (!canvasRef.current || !beamConfig.enableAnimation) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const deltaTime = currentTime - lastTimeRef.current;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Update and draw particles
        particlesRef.current.forEach(particle => {
            particle.update(deltaTime);
            particle.draw(ctx);
        });

        lastTimeRef.current = currentTime;
        animationRef.current = requestAnimationFrame(animate);
    }, [beamConfig.enableAnimation]);

    // Resize canvas to match container
    const resizeCanvas = useCallback(() => {
        if (!canvasRef.current) return;

        const canvas = canvasRef.current;
        const container = canvas.parentElement;

        if (container) {
            const rect = container.getBoundingClientRect();
            const dpr = window.devicePixelRatio || 1;

            // Set actual size
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;

            // Scale back down using CSS
            canvas.style.width = `${rect.width}px`;
            canvas.style.height = `${rect.height}px`;

            // Scale context for high DPI displays
            const ctx = canvas.getContext('2d');
            ctx.scale(dpr, dpr);

            // Reinitialize particles with new dimensions
            initializeParticles();
        }
    }, [initializeParticles]);

    // Handle orientation change
    const handleOrientationChangeEvent = useCallback(() => {
        trackInteraction('orientation-change');

        // Delay to ensure dimensions are updated
        setTimeout(() => {
            resizeCanvas();
            handleOrientationChange();
        }, 100);
    }, [resizeCanvas, handleOrientationChange, trackInteraction]);

    // Setup canvas and start animation
    useEffect(() => {
        if (!canvasRef.current) return;

        resizeCanvas();

        if (beamConfig.enableAnimation) {
            animationRef.current = requestAnimationFrame(animate);
        }

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [resizeCanvas, animate, beamConfig.enableAnimation]);

    // Handle resize and orientation change events
    useEffect(() => {
        const handleResize = () => {
            resizeCanvas();
        };

        window.addEventListener('resize', handleResize);
        window.addEventListener('orientationchange', handleOrientationChangeEvent);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('orientationchange', handleOrientationChangeEvent);
        };
    }, [resizeCanvas, handleOrientationChangeEvent]);

    // Update particles when configuration changes
    useEffect(() => {
        initializeParticles();
    }, [initializeParticles, beamConfig]);

    // Don't render if animations are disabled
    if (!beamConfig.enableAnimation) {
        return null;
    }

    return (
        <canvas
            ref={canvasRef}
            className={`responsive-beam-background ${className}`}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 1,
                opacity: beamConfig.intensity === 'subtle' ? 0.3 :
                    beamConfig.intensity === 'medium' ? 0.6 : 1.0
            }}
            aria-hidden="true"
        />
    );
};

export default ResponsiveBeamBackground;