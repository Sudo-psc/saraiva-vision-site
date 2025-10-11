"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface FooterBeamBackgroundProps {
    className?: string;
    children?: React.ReactNode;
    intensity?: "subtle" | "medium" | "strong";
    colorScheme?: "blue" | "purple" | "brand";
}

interface FooterBeam {
    x: number;
    y: number;
    width: number;
    length: number;
    angle: number;
    speed: number;
    opacity: number;
    hue: number;
    pulse: number;
    pulseSpeed: number;
}

// Device capability detection hook
const useDeviceCapabilities = () => {
    const [capabilities, setCapabilities] = useState({
        performanceLevel: 'high' as 'low' | 'medium' | 'high',
        supportsBackdropFilter: false,
        prefersReducedMotion: false,
    });

    useEffect(() => {
        // Check for backdrop-filter support
        const supportsBackdropFilter = CSS.supports('backdrop-filter', 'blur(1px)');

        // Check for reduced motion preference
        const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches || false;

        // Simple performance detection based on device memory and hardware concurrency
        const deviceMemory = (navigator as any).deviceMemory || 4;
        const hardwareConcurrency = navigator.hardwareConcurrency || 4;

        let performanceLevel: 'low' | 'medium' | 'high' = 'high';
        if (deviceMemory < 4 || hardwareConcurrency < 4) {
            performanceLevel = 'low';
        } else if (deviceMemory < 8 || hardwareConcurrency < 8) {
            performanceLevel = 'medium';
        }

        setCapabilities({
            performanceLevel,
            supportsBackdropFilter,
            prefersReducedMotion,
        });
    }, []);

    return capabilities;
};

// Brand color schemes
const colorSchemes = {
    brand: {
        primary: 234, // Blue hue for #0ea5e9
        secondary: 210, // Slightly different blue
        accent: 200, // Lighter blue
    },
    blue: {
        primary: 220,
        secondary: 240,
        accent: 200,
    },
    purple: {
        primary: 280,
        secondary: 260,
        accent: 300,
    },
};

function createFooterBeam(width: number, height: number, colorScheme: keyof typeof colorSchemes): FooterBeam {
    const colors = colorSchemes[colorScheme];
    const angle = -25 + Math.random() * 15; // Slightly different angle for footer

    return {
        x: Math.random() * width * 1.2 - width * 0.1,
        y: Math.random() * height * 1.2 - height * 0.1,
        width: 20 + Math.random() * 40, // Smaller beams for footer
        length: height * 1.5, // Shorter length for footer context
        angle: angle,
        speed: 0.3 + Math.random() * 0.6, // Slower speed for footer
        opacity: 0.08 + Math.random() * 0.12, // Lower opacity for footer
        hue: colors.primary + Math.random() * 40 - 20, // Vary around brand colors
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.015 + Math.random() * 0.02, // Slower pulse for footer
    };
}

export function FooterBeamBackground({
    className,
    children,
    intensity = "medium",
    colorScheme = "brand",
}: FooterBeamBackgroundProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const beamsRef = useRef<FooterBeam[]>([]);
    const animationFrameRef = useRef<number>(0);
    const capabilities = useDeviceCapabilities();

    // Adjust beam count based on device capabilities and intensity
    const getBeamCount = () => {
        const baseCount = {
            subtle: 8,
            medium: 12,
            strong: 16,
        }[intensity];

        const performanceMultiplier = {
            low: 0.5,
            medium: 0.75,
            high: 1,
        }[capabilities.performanceLevel];

        return Math.floor(baseCount * performanceMultiplier);
    };

    // Opacity mapping based on intensity and device capabilities
    const getOpacityMultiplier = () => {
        const intensityMap = {
            subtle: 0.6,
            medium: 0.8,
            strong: 1,
        };

        const performanceMap = {
            low: 0.7,
            medium: 0.85,
            high: 1,
        };

        return intensityMap[intensity] * performanceMap[capabilities.performanceLevel];
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || capabilities.prefersReducedMotion) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const updateCanvasSize = () => {
            const container = canvas.parentElement;
            if (!container) return;

            const dpr = window.devicePixelRatio || 1;
            const rect = container.getBoundingClientRect();

            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            canvas.style.width = `${rect.width}px`;
            canvas.style.height = `${rect.height}px`;
            ctx.scale(dpr, dpr);

            const beamCount = getBeamCount();
            beamsRef.current = Array.from({ length: beamCount }, () =>
                createFooterBeam(rect.width, rect.height, colorScheme)
            );
        };

        updateCanvasSize();
        window.addEventListener("resize", updateCanvasSize);

        function resetBeam(beam: FooterBeam, index: number, totalBeams: number) {
            if (!canvas) return beam;

            const rect = canvas.getBoundingClientRect();
            const column = index % 3;
            const spacing = rect.width / 3;

            beam.y = rect.height + 50; // Start just below footer
            beam.x = column * spacing + spacing / 2 + (Math.random() - 0.5) * spacing * 0.3;
            beam.width = 20 + Math.random() * 30;
            beam.speed = 0.2 + Math.random() * 0.3;

            const colors = colorSchemes[colorScheme];
            beam.hue = colors.primary + (index * 30) / totalBeams + Math.random() * 20 - 10;
            beam.opacity = 0.06 + Math.random() * 0.08;

            return beam;
        }

        function drawBeam(ctx: CanvasRenderingContext2D, beam: FooterBeam) {
            ctx.save();
            ctx.translate(beam.x, beam.y);
            ctx.rotate((beam.angle * Math.PI) / 180);

            // Calculate pulsing opacity with performance consideration
            const opacityMultiplier = getOpacityMultiplier();
            const pulsingOpacity = beam.opacity *
                (0.7 + Math.sin(beam.pulse) * 0.3) *
                opacityMultiplier;

            const gradient = ctx.createLinearGradient(0, 0, 0, beam.length);

            // Brand-optimized gradient with footer-specific colors
            gradient.addColorStop(0, `hsla(${beam.hue}, 70%, 60%, 0)`);
            gradient.addColorStop(0.2, `hsla(${beam.hue}, 70%, 60%, ${pulsingOpacity * 0.3})`);
            gradient.addColorStop(0.5, `hsla(${beam.hue}, 70%, 60%, ${pulsingOpacity})`);
            gradient.addColorStop(0.8, `hsla(${beam.hue}, 70%, 60%, ${pulsingOpacity * 0.3})`);
            gradient.addColorStop(1, `hsla(${beam.hue}, 70%, 60%, 0)`);

            ctx.fillStyle = gradient;
            ctx.fillRect(-beam.width / 2, 0, beam.width, beam.length);
            ctx.restore();
        }

        function animate() {
            if (!canvas || !ctx) return;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Reduced blur for footer context
            ctx.filter = capabilities.performanceLevel === 'low' ? "blur(15px)" : "blur(25px)";

            const totalBeams = beamsRef.current.length;
            beamsRef.current.forEach((beam, index) => {
                beam.y -= beam.speed;
                beam.pulse += beam.pulseSpeed;

                // Reset beam when it goes off screen
                if (beam.y + beam.length < -50) {
                    resetBeam(beam, index, totalBeams);
                }

                drawBeam(ctx, beam);
            });

            animationFrameRef.current = requestAnimationFrame(animate);
        }

        // Start animation with a slight delay for footer context
        const timeoutId = setTimeout(() => {
            animate();
        }, 100);

        return () => {
            window.removeEventListener("resize", updateCanvasSize);
            clearTimeout(timeoutId);
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [intensity, colorScheme, capabilities, getBeamCount, getOpacityMultiplier]);

    // Don't render beams if reduced motion is preferred
    if (capabilities.prefersReducedMotion) {
        return (
            <div className={cn("relative w-full", className)}>
                {children}
            </div>
        );
    }

    return (
        <div className={cn("relative w-full overflow-hidden", className)}>
            <canvas
                ref={canvasRef}
                className="absolute inset-0 pointer-events-none"
                style={{
                    filter: capabilities.performanceLevel === 'low' ? "blur(8px)" : "blur(12px)",
                    opacity: capabilities.performanceLevel === 'low' ? 0.7 : 1,
                }}
            />

            {/* Subtle overlay for footer context */}
            <motion.div
                className="absolute inset-0 pointer-events-none"
                animate={{
                    opacity: [0.02, 0.08, 0.02],
                }}
                transition={{
                    duration: 8,
                    ease: "easeInOut",
                    repeat: Number.POSITIVE_INFINITY,
                }}
                style={{
                    background: `linear-gradient(135deg, 
                        hsla(${colorSchemes[colorScheme].primary}, 50%, 50%, 0.02), 
                        hsla(${colorSchemes[colorScheme].secondary}, 50%, 50%, 0.01))`,
                    backdropFilter: capabilities.supportsBackdropFilter ? "blur(20px)" : "none",
                }}
            />

            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
}