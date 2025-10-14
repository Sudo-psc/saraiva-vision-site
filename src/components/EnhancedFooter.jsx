import React, { useMemo, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowUp } from 'lucide-react';
import Logo from './Logo';
import { clinicInfo, googleMapsProfileUrl } from '../lib/clinicInfo';
import { SocialLinks3D } from './ui/social-links-3d';
import { useGlassMorphism } from '../hooks/useGlassMorphism';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import { generateDarkGlassStyles, createGlassCustomProperties } from '../utils/glassMorphismUtils';
import { useFooterAccessibility } from '../hooks/useFooterAccessibility';
import { useLiquidClasses } from '../hooks/useLiquidTheme';
import { cn } from '../lib/utils';
import {
    animationVariants,
    getOptimizedVariant,
    getResponsiveTimings
} from '../utils/footerAnimationConfig';
import {
    useFooterTheme
} from '../utils/footerThemeManager';
import { useWorkingHoursStatus } from '../hooks/useWorkingHoursStatus';
import { getWeekdays } from '../lib/date';
import { WeekdaysList } from './footer/Weekdays';
import {
    initializeCompatibility,
    applyCompatibilityFixes,
    getCompatibilityConfig
} from '../utils/footerCompatibility';

/**
 * Enhanced Footer component with glass morphism effects and 3D social icons
 * Integrates all existing footer functionality with modern visual enhancements
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5
 */
const EnhancedFooter = ({
    className = '',
    glassOpacity = null,
    glassBlur = null,
    enableAnimations = true,
    useGlassEffect = false,
    ...props
}) => {
    const { t } = useTranslation();
    const {
        capabilities,
        glassIntensity,
        shouldEnableGlass,
        getGlassStyles
    } = useGlassMorphism();

    const [footerRef, isFooterVisible] = useIntersectionObserver({
        threshold: 0.1,
        rootMargin: '100px'
    });

    const [isAnimationEnabled, setIsAnimationEnabled] = useState(false);

    // Use accessibility hook
    const {
        getFooterAriaProps,
        getGlassLayerAriaProps,
        shouldReduceMotion,
        shouldDisableGlass,
        announcementText,
        announce
    } = useFooterAccessibility();

    // Scroll to top functionality (preserved from original Footer)
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    // Memoize computed values (preserved from original Footer)
    const footerData = useMemo(() => ({
        phoneNumber: clinicInfo.phone.replace(/\D/g, ''),
        whatsappLink: "https://wa.me/message/2QFZJG3EDJZVF1", // Updated WhatsApp scheduling link
        chatbotUrl: clinicInfo.chatbotUrl,
        amorSaudeLogo: "/img/amorsaude_logo.png",
        currentYear: 2025
    }), []);

    // Navigation links (preserved from original Footer)
    const navLinks = useMemo(() => [
        { name: t('navbar.home'), href: '/' },
        { name: t('navbar.services'), href: '/servicos' },
        { name: t('navbar.lenses'), href: '/lentes' },
        { name: t('navbar.blog'), href: '/blog' },
        { name: t('navbar.podcast'), href: '/podcast' },
        { name: t('navbar.about'), href: '/sobre' },
        { name: t('navbar.plans'), href: '/planos' },
    ], [t]);

    // Service links (preserved from original Footer)
    const serviceLinks = useMemo(() =>
        t('footer.service_links', { returnObjects: true }) || {
            "consultations": "Consultations",
            "refraction": "Refraction",
            "treatments": "Treatments",
            "surgeries": "Surgeries",
            "pediatric": "Pediatric",
            "reports": "Reports"
        }
        , [t]);

    // Enhanced social media data for 3D icons
    const socialsForLinks = useMemo(() => [
        {
            name: "Facebook",
            href: clinicInfo.facebook,
            image: "/icons_social/facebook_icon.png",
            color: "#1877F2"
        },
        {
            name: "Instagram",
            href: clinicInfo.instagram,
            image: "/icons_social/instagram_icon.png",
            color: "#E4405F"
        },
        {
            name: "LinkedIn",
            href: clinicInfo.linkedin,
            image: "/icons_social/linkedin_icon.png",
            color: "#0A66C2"
        },
        {
            name: "X",
            href: clinicInfo.x || "https://x.com/philipe_saraiva",
            image: "/icons_social/x2 Background Removed.png",
            color: "#000000"
        },
        {
            name: "TikTok",
            href: "https://www.tiktok.com/@saraivavision",
            image: "/icons_social/tik_tok_icon.png",
            color: "#000000"
        },
        {
            name: "Spotify",
            href: clinicInfo.spotify,
            image: "/icons_social/spotify_icon.png",
            color: "#1DB954"
        },
        {
            name: "WhatsApp",
            href: "https://wa.me/message/2QFZJG3EDJZVF1",
            image: "/icons_social/whatsapp_icon.png",
            color: "#25D366"
        },
        {
            name: "Google Reviews",
            href: "https://search.google.com/local/writereview?placeid=ChIJVUKww7WRugARF7u2lAe7BeE",
            image: "/icons_social/IA.png",
            color: "#4285F4"
        },
    ], []);

    // Helper components (preserved from original Footer)
    const FooterSection = ({ title, children, className }) => (
        <div className={cn('space-y-3', className)}>
            <h3 className="text-lg font-semibold mb-6 text-white">{title}</h3>
            {children}
        </div>
    );

    const ContactItem = ({ children, className }) => (
        <li className={cn('text-slate-400', className)}>{children}</li>
    );

    // Working hours status
    const { status, nextOpening, closesAt } = useWorkingHoursStatus();
    const isOpen = status === 'open';

    // Enhanced working hours display with status indicator
    const WorkingHoursDisplay = () => {
        return (
            <ContactItem>
                <div className="flex items-center gap-2">
                    {/* Status indicator */}
                    <div
                        className={cn(
                            'w-3 h-3 rounded-full animate-pulse',
                            isOpen ? 'bg-green-500' : 'bg-red-500'
                        )}
                        aria-label={isOpen ? 'Clínica aberta' : 'Clínica fechada'}
                    />
                    <div>
                        <div className="flex items-center gap-2 text-sm">
                            <span className={cn(
                                'font-medium',
                                isOpen ? 'text-green-400' : 'text-red-400'
                            )}>
                                {isOpen ? 'Aberto agora' : 'Fechado'}
                            </span>
                            {!isOpen && nextOpening && (
                                <span className="text-xs text-slate-500">
                                    ({nextOpening})
                                </span>
                            )}
                            {isOpen && closesAt && (
                                <span className="text-xs text-slate-500">
                                    (Fecha às {closesAt})
                                </span>
                            )}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                            <WeekdaysList />
                        </div>
                    </div>
                </div>
            </ContactItem>
        );
    };

    const ContactLink = ({ href, children, external = false, icon: Icon, className }) => {
        const linkProps = {
            href,
            className: cn('hover:text-white transition-colors flex items-center gap-2', className),
            ...(external && { target: '_blank', rel: 'noopener noreferrer' })
        };

        return (
            <ContactItem>
                <a {...linkProps}>
                    {Icon && <Icon size={16} />}
                    {children}
                </a>
            </ContactItem>
        );
    };

    // Initialize compatibility fixes on mount
    useEffect(() => {
        initializeCompatibility();
    }, []);

    // Apply compatibility fixes to footer element
    useEffect(() => {
        if (footerRef.current) {
            applyCompatibilityFixes(footerRef.current);
        }
    }, [footerRef]);

    // Enable animations only when footer is visible and animations are allowed
    useEffect(() => {
        if (isFooterVisible && enableAnimations && !capabilities.reducedMotion && !shouldReduceMotion) {
            setIsAnimationEnabled(true);
        } else {
            setIsAnimationEnabled(false);
        }
    }, [isFooterVisible, enableAnimations, capabilities.reducedMotion, shouldReduceMotion]);

    // Announce footer visibility changes for screen readers
    useEffect(() => {
        if (isFooterVisible) {
            announce('Footer with enhanced visual effects is now visible');
        }
    }, [isFooterVisible, announce]);

    // Generate glass morphism styles based on current settings
    const enableGlass = useMemo(
        () => useGlassEffect && shouldEnableGlass() && !shouldDisableGlass,
        [useGlassEffect, shouldEnableGlass, shouldDisableGlass]
    );

    const glassStyles = useMemo(() => {
        if (!enableGlass) {
            return {
                background: 'rgba(30, 41, 59, 0.95)',
                backdropFilter: 'none',
                WebkitBackdropFilter: 'none'
            };
        }

        return generateDarkGlassStyles({
            intensity: glassIntensity,
            opacity: glassOpacity,
            blur: glassBlur
        });
    }, [enableGlass, glassIntensity, glassOpacity, glassBlur]);
    // Generate CSS classes for glass morphism
    const glassClasses = useMemo(() => {
        const baseClasses = ['footer-glass-morphism'];

        if (enableGlass) {
            baseClasses.push(`footer-glass-${glassIntensity}`);
        }

        return baseClasses.join(' ');
    }, [enableGlass, glassIntensity]);

    // Get compatibility configuration
    const compatibilityConfig = useMemo(() => getCompatibilityConfig(), []);

    // Use theme manager for dynamic theming with null safety
    const footerThemeResult = useFooterTheme({
        glassOpacity,
        glassBlur,
        enableAnimations: enableAnimations && !shouldReduceMotion
    });

    // Extract with fallback for safety
    const themeProperties = footerThemeResult?.cssCustomProperties || {};

    // CSS custom properties for dynamic theming
    const customProperties = useMemo(() => {
        const baseProperties = createGlassCustomProperties(glassIntensity);

        // Merge theme properties
        const mergedProperties = {
            ...baseProperties,
            ...themeProperties
        };

        // Override with custom values if provided
        if (glassOpacity !== null) {
            mergedProperties['--glass-opacity'] = glassOpacity.toString();
            mergedProperties['--footer-glass-opacity'] = glassOpacity.toString();
        }
        if (glassBlur !== null) {
            mergedProperties['--glass-blur'] = `${glassBlur}px`;
            mergedProperties['--footer-glass-blur'] = `${glassBlur}px`;
        }

        // Apply compatibility-based adjustments
        if (!compatibilityConfig.shouldUseGlass || !enableGlass) {
            mergedProperties['--footer-glass-opacity'] = '0';
            mergedProperties['--footer-glass-blur'] = '0px';
        }

        if (!compatibilityConfig.shouldUse3D) {
            mergedProperties['--footer-social-rotate-x'] = '0deg';
            mergedProperties['--footer-social-rotate-y'] = '0deg';
            mergedProperties['--footer-social-translate-z'] = '0px';
        }

        return mergedProperties;
    }, [enableGlass, glassIntensity, glassOpacity, glassBlur, themeProperties, compatibilityConfig]);

    // Get responsive timings based on screen size
    const responsiveTimings = useMemo(() => {
        if (typeof window !== 'undefined') {
            const width = window.innerWidth;
            if (width < 768) return getResponsiveTimings('mobile');
            if (width < 1024) return getResponsiveTimings('tablet');
            return getResponsiveTimings('desktop');
        }
        return getResponsiveTimings('desktop');
    }, []);

    // Optimized animation variants with performance considerations
    const containerVariants = useMemo(() =>
        getOptimizedVariant(animationVariants.footerContainer, capabilities, shouldReduceMotion),
        [capabilities, shouldReduceMotion]
    );

    const glassLayerVariants = useMemo(() =>
        getOptimizedVariant(animationVariants.glassLayer, capabilities, shouldReduceMotion),
        [capabilities, shouldReduceMotion]
    );

    // Liquid Glass classes for footer
    const footerClasses = useLiquidClasses('enhanced-footer relative', {
        variant: 'secondary',
        responsive: true
    });

    return (
        <motion.div
            ref={footerRef}
            className={cn(footerClasses, 'footer-liquid', className)}
            variants={isAnimationEnabled && !shouldReduceMotion ? containerVariants : undefined}
            initial={isAnimationEnabled && !shouldReduceMotion ? 'hidden' : false}
            animate={isAnimationEnabled && !shouldReduceMotion && isFooterVisible ? 'visible' : 'hidden'}
            style={customProperties}
            {...getFooterAriaProps()}
            {...props}
        >
            {/* Glass Morphism Background Layer */}
            <motion.div
                className={cn(
                    'enhanced-footer-glass-layer absolute inset-0 z-0',
                    enableGlass ? glassClasses : 'bg-slate-800/95'
                )}
                style={enableGlass ? glassStyles : undefined}
                variants={isAnimationEnabled && !shouldReduceMotion ? glassLayerVariants : undefined}
                initial={isAnimationEnabled && !shouldReduceMotion ? 'hidden' : false}
                animate={isAnimationEnabled && !shouldReduceMotion && isFooterVisible ? 'visible' : 'hidden'}
                {...getGlassLayerAriaProps()}
            />

            {/* Gradient Overlay for Enhanced Depth */}
            <div
                className="absolute inset-0 z-0 bg-gradient-to-t from-slate-900/20 via-transparent to-transparent"
                {...getGlassLayerAriaProps()}
            />

            {/* Enhanced Footer Content with all original functionality preserved */}
            <div className="relative z-10 bg-slate-800 text-slate-300 pt-16 pb-8">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
                        {/* Logo and Partner Section */}
                        <div>
                            <Logo isWhite />
                            <p className="mt-4 mb-6 text-slate-400">
                                {t('footer.slogan')}
                            </p>
                            <p className="text-slate-400 mb-2 text-sm">{t('footer.partner_of')}</p>
                            <a
                                href="https://www.amorsaude.com.br/clinica/caratinga-mg/"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={t('footer.partner_link_aria', 'Abrir site do parceiro Amor e Saúde (nova aba)')}
                                className="inline-block"
                            >
                                <img
                                    src={footerData.amorSaudeLogo}
                                    alt={t('footer.amor_saude_alt')}
                                    className="h-16 w-auto mb-6 hover:opacity-80 transition-opacity"
                                    width="160"
                                    height="64"
                                    sizes="(min-width: 768px) 160px, 128px"
                                    loading="lazy"
                                    decoding="async"
                                />
                            </a>
                        </div>

                        {/* Quick Links Section */}
                        <FooterSection title={t('footer.quick_links')}>
                            <ul className="space-y-3">
                                {navLinks.map(link => (
                                    <li key={link.href}>
                                        <Link to={link.href} className="hover:text-white transition-colors inline-block">
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </FooterSection>

                        {/* Services Section */}
                        <FooterSection title={t('footer.services')}>
                            <ul className="space-y-3">
                                {Object.entries(serviceLinks).map(([key, serviceName]) => (
                                    <li key={key}>
                                        <Link to="/servicos" className="hover:text-white transition-colors inline-block">
                                            {serviceName}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </FooterSection>

                        {/* Contact Section */}
                        <FooterSection title={t('footer.contact')}>
                            <ul className="space-y-3">
                                <ContactItem>
                                    <div className="font-semibold text-white mb-1">
                                        {clinicInfo.name}
                                    </div>
                                </ContactItem>
                                <ContactItem>
                                    <a
                                        href={googleMapsProfileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="hover:text-white transition-colors inline-flex items-start gap-2 group"
                                        aria-label={`Endereço da ${clinicInfo.name}: ${clinicInfo.streetAddress}, ${clinicInfo.neighborhood}, ${clinicInfo.city}-${clinicInfo.state}. Abrir no Google Maps (nova aba)`}
                                    >
                                        <img
                                            src="/icons_social/Pin_icon_menino.png"
                                            alt="Localização"
                                            className="w-11 h-11 object-contain group-hover:scale-200 transition-transform duration-300 ease-in-out flex-shrink-0"
                                            loading="lazy"
                                            decoding="async"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.nextSibling.style.display = 'inline-block';
                                            }}
                                        />
                                        <span
                                            className="text-primary-400 group-hover:scale-110 transition-transform"
                                            aria-hidden="true"
                                            style={{ display: 'none' }}
                                        >
                                            📍
                                        </span>
                                        <span className="flex-1">
                                            {clinicInfo.streetAddress}, {clinicInfo.neighborhood}
                                            <br />
                                            {clinicInfo.city}-{clinicInfo.state}, CEP {clinicInfo.postalCode}
                                        </span>
                                    </a>
                                </ContactItem>
                                <ContactLink href={`mailto:${clinicInfo.email}`}>
                                    {clinicInfo.email}
                                </ContactLink>
                                <ContactItem>
                                    <a
                                        href={footerData.whatsappLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="hover:text-white hover:scale-110 transition-all duration-300 flex items-center gap-2 transform"
                                    >
                                        <img
                                            src="/icons_social/whatsapp_icon.png"
                                            alt="WhatsApp"
                                            className="w-8 h-8 object-contain"
                                            loading="lazy"
                                            decoding="async"
                                        />
                                        {clinicInfo.phoneDisplay}
                                    </a>
                                </ContactItem>
                                <ContactItem>
                                    <a
                                        href="https://wa.me/message/2QFZJG3EDJZVF1"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="hover:text-white hover:scale-110 transition-all duration-300 flex items-center gap-2 transform text-green-400"
                                    >
                                        <img
                                            src="/icons_social/whatsapp_icon.png"
                                            alt="WhatsApp Auto Atendimento"
                                            className="w-6 h-6 object-contain"
                                            loading="lazy"
                                            decoding="async"
                                        />
                                        Auto Atendimento
                                    </a>
                                </ContactItem>
                                <ContactItem>
                                    <a
                                        href="https://wa.me/message/2QFZJG3EDJZVF1"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="hover:text-white hover:scale-110 transition-all duration-300 flex items-center gap-2 transform text-red-400"
                                    >
                                        <img
                                            src="/icons_social/whatsapp_icon.png"
                                            alt="WhatsApp Urgência"
                                            className="w-6 h-6 object-contain"
                                            loading="lazy"
                                            decoding="async"
                                        />
                                        Urgência - Enfermeira Ana (COREN-MG 834184)
                                    </a>
                                </ContactItem>
                                <ContactItem>
                                    <a
                                        href={footerData.chatbotUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="hover:text-white hover:scale-110 transition-all duration-300 flex items-center gap-2 transform"
                                    >
                                        <img
                                            src="/icons_social/IA.png"
                                            alt="IA Chatbot"
                                            className="w-8 h-8 object-contain"
                                            loading="lazy"
                                            decoding="async"
                                        />
                                        {t('contact.chatbot_title')}
                                    </a>
                                </ContactItem>
                                <WorkingHoursDisplay />
                            </ul>
                        </FooterSection>
                    </div>

                    {/* Bottom Section with Enhanced Social Icons */}
                    <div className="border-t border-slate-700 pt-8">
                        <div className="flex flex-col lg:flex-row justify-between items-start gap-6 lg:gap-8">
                            <div className="flex-1 space-y-2">
                                <p className="text-slate-400 text-xs leading-snug">
                                    <span className="block font-medium text-slate-300">{clinicInfo.responsiblePhysician} • {clinicInfo.responsiblePhysicianCRM} • {clinicInfo.responsiblePhysicianTitle}</span>
                                    <span className="block">{clinicInfo.responsibleNurse} • {clinicInfo.responsibleNurseTitle}</span>
                                    <span className="block">CNPJ: {clinicInfo.taxId}</span>
                                    <span className="block">DPO: <a href={`mailto:${clinicInfo.dpoEmail}`} className="underline hover:text-white transition-colors">{clinicInfo.dpoEmail}</a></span>
                                    <span className="block space-x-3">
                                        <a href="/privacy" className="underline hover:text-white transition-colors">{t('privacy.link_label')}</a>
                                        <button
                                            type="button"
                                            onClick={() => window.dispatchEvent(new Event('open-cookie-modal'))}
                                            className="underline hover:text-white transition-colors"
                                        >
                                            {t('privacy.manage_cookies')}
                                        </button>
                                    </span>
                                    {/* reCAPTCHA disclosure (required if badge is hidden) */}
                                    <span
                                        className="block mt-2"
                                        dangerouslySetInnerHTML={{
                                            __html: t(
                                                'recaptcha.disclosure_html',
                                                'Este site é protegido pelo reCAPTCHA e se aplicam a <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" class="underline">Política de Privacidade</a> e os <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" class="underline">Termos de Serviço</a> do Google.'
                                            )
                                        }}
                                    />
                                </p>
                                <p className="text-slate-500 text-xs">{t('privacy.disclaimer')}</p>
                                <p className="text-slate-500 text-xs">{t('cfm.disclaimer')}</p>
                                <p className="text-slate-400 text-xs mt-2">{t('footer.copyright', { year: footerData.currentYear })}</p>
                            </div>

                            <div className="flex flex-col items-center gap-4 lg:items-end">
                                {/* Enhanced 3D Social Links */}
                                <div className="flex items-center space-x-4">
                                    <SocialLinks3D
                                        socials={socialsForLinks}
                                        spacing="normal"
                                        enableGlassContainer={!shouldDisableGlass}
                                        className="transform-gpu"
                                    />

                                    {/* Enhanced Scroll to Top Button with Glass Effect */}
                                    <motion.button
                                        onClick={scrollToTop}
                                        className={cn(
                                            "p-2.5 rounded-full text-white transition-all",
                                            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800",
                                            // Glass morphism styling for scroll button
                                            !shouldDisableGlass ? [
                                                "bg-gradient-to-br from-white/10 via-white/5 to-transparent",
                                                "backdrop-blur-md border border-white/20",
                                                "hover:bg-gradient-to-br hover:from-cyan-500/20 hover:via-blue-500/10 hover:to-transparent",
                                                "hover:border-blue-400/30 hover:shadow-[0_8px_32px_rgba(59,130,246,0.15)]"
                                            ] : [
                                                "bg-slate-700 hover:bg-cyan-600"
                                            ]
                                        )}
                                        variants={!shouldReduceMotion ? animationVariants.scrollButton : undefined}
                                        initial="default"
                                        whileHover="hover"
                                        whileTap="tap"
                                        aria-label={t('footer.back_to_top')}
                                        title={t('footer.back_to_top')}
                                    >
                                        <ArrowUp size={18} />
                                    </motion.button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Screen reader announcements */}
            {announcementText && (
                <div
                    className="sr-only"
                    aria-live="polite"
                    aria-atomic="true"
                >
                    {announcementText}
                </div>
            )}

            {/* Hidden description for screen readers */}
            <div id="footer-description" className="sr-only">
                Enhanced footer with modern glass morphism effects and 3D interactive social media icons. All functionality remains accessible via keyboard navigation.
            </div>


        </motion.div>
    );
};

export default React.memo(EnhancedFooter);
