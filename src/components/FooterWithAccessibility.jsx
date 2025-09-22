import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { MessageCircle, Bot } from 'lucide-react';
import Logo from '@/components/Logo';
import { clinicInfo } from '@/lib/clinicInfo';
import SocialIcons3D from '@/components/ui/SocialIcons3D';
import ScrollToTopEnhanced from '@/components/ui/ScrollToTopEnhanced';
import { useAccessibility } from '@/hooks/useAccessibility';
import { cn } from '@/lib/utils';

/**
 * Enhanced Footer component with 3D social icons and full accessibility support
 * Maintains all existing functionality while adding modern visual effects
 */
const FooterWithAccessibility = ({
    enableGlassEffects = true,
    enableAnimations = true,
    ...props
}) => {
    const { t } = useTranslation();

    const {
        isHighContrast,
        isKeyboardUser,
        announce,
        getAriaAttributes,
        getFocusStyles
    } = useAccessibility();

    // Memoize computed values
    const footerData = useMemo(() => ({
        phoneNumber: clinicInfo.phone.replace(/\D/g, ''),
        whatsappLink: `https://wa.me/${clinicInfo.phone.replace(/\D/g, '')}`,
        chatbotUrl: clinicInfo.chatbotUrl,
        amorSaudeLogo: "https://storage.googleapis.com/hostinger-horizons-assets-prod/979f9a5f-43ca-4577-b86e-f6adc587dcb8/66c6d707b457395f0aaf159d826531ef.png",
        currentYear: new Date().getFullYear()
    }), []);

    const navLinks = useMemo(() => [
        { name: t('navbar.home'), href: '/' },
        { name: t('navbar.services'), href: '/servicos' },
        { name: t('navbar.about'), href: '/sobre' },
        { name: t('navbar.testimonials'), href: '/depoimentos' },
        { name: t('navbar.contact'), href: '/contato' },
    ], [t]);

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

    // Enhanced social media data with accessibility information
    const socialsForLinks = useMemo(() => [
        {
            name: "Facebook",
            href: clinicInfo.facebook,
            image: "/icons_social/facebook_icon.png",
            color: "#1877F2",
            description: "Visit our Facebook page for updates and community discussions"
        },
        {
            name: "Instagram",
            href: clinicInfo.instagram,
            image: "/icons_social/instagram_icon.png",
            color: "#E4405F",
            description: "Follow us on Instagram for visual content and behind-the-scenes"
        },
        {
            name: "LinkedIn",
            href: clinicInfo.linkedin,
            image: "/icons_social/linkedln_icon.png",
            color: "#0A66C2",
            description: "Connect with us on LinkedIn for professional updates"
        },
        {
            name: "TikTok",
            href: "https://www.tiktok.com/@saraivavision",
            image: "/icons_social/tik_tok_icon.png",
            color: "#000000",
            description: "Watch our educational videos on TikTok"
        },
    ], []);

    // Handle social icon clicks with analytics
    const handleSocialIconClick = (socialName, href) => {
        announce(`Opening ${socialName} in new tab`);

        // Analytics tracking could be added here
        console.log(`Social icon clicked: ${socialName}`);

        window.open(href, '_blank', 'noopener,noreferrer');
    };

    // Handle scroll to top completion
    const handleScrollComplete = () => {
        announce('Reached top of page');
    };

    const FooterSection = ({ title, children, className, headingLevel = 3 }) => {
        const HeadingTag = `h${headingLevel}`;

        return (
            <div className={cn('space-y-3', className)}>
                <HeadingTag className="text-lg font-semibold mb-6 text-white">
                    {title}
                </HeadingTag>
                {children}
            </div>
        );
    };

    const ContactItem = ({ children, className }) => (
        <li className={cn('text-slate-400', className)}>{children}</li>
    );

    const ContactLink = ({ href, children, external = false, icon: Icon, className, ariaLabel }) => {
        const linkProps = {
            href,
            className: cn(
                'hover:text-white transition-colors flex items-center gap-2',
                getFocusStyles({ glassEffect: enableGlassEffects }).className,
                className
            ),
            'aria-label': ariaLabel,
            ...(external && {
                target: '_blank',
                rel: 'noopener noreferrer',
                'aria-describedby': 'external-link-description'
            })
        };

        return (
            <ContactItem>
                <a {...linkProps}>
                    {Icon && <Icon size={16} aria-hidden="true" />}
                    {children}
                </a>
            </ContactItem>
        );
    };

    return (
        <footer
            className={cn(
                'bg-slate-800 text-slate-300 pt-16 pb-8',
                isHighContrast && 'forced-colors:bg-Canvas forced-colors:text-CanvasText'
            )}
            {...getAriaAttributes('glass-container', {
                role: 'contentinfo',
                label: 'Site footer with contact information and navigation'
            })}
            {...props}
        >
            <div className="container mx-auto px-[7%]">
                {/* Hidden description for external links */}
                <div id="external-link-description" className="sr-only">
                    Opens in new tab
                </div>

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
                            aria-label={t('footer.partner_link_aria', 'Visit Amor e Saúde partner website (opens in new tab)')}
                            className={cn(
                                'inline-block',
                                getFocusStyles({ glassEffect: enableGlassEffects }).className
                            )}
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
                    <FooterSection title={t('footer.quick_links')} headingLevel={3}>
                        <nav aria-label="Footer navigation">
                            <ul className="space-y-3">
                                {navLinks.map(link => (
                                    <li key={link.href}>
                                        <Link
                                            to={link.href}
                                            className={cn(
                                                'hover:text-white transition-colors inline-block',
                                                getFocusStyles({ glassEffect: enableGlassEffects }).className
                                            )}
                                        >
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    </FooterSection>

                    {/* Services Section */}
                    <FooterSection title={t('footer.services')} headingLevel={3}>
                        <nav aria-label="Services navigation">
                            <ul className="space-y-3">
                                {Object.entries(serviceLinks).map(([key, serviceName]) => (
                                    <li key={key}>
                                        <Link
                                            to="/servicos"
                                            className={cn(
                                                'hover:text-white transition-colors inline-block',
                                                getFocusStyles({ glassEffect: enableGlassEffects }).className
                                            )}
                                        >
                                            {serviceName}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    </FooterSection>

                    {/* Contact Section */}
                    <FooterSection title={t('footer.contact')} headingLevel={3}>
                        <address className="not-italic">
                            <ul className="space-y-3">
                                <ContactItem>{t('footer.address_line1')}</ContactItem>
                                <ContactItem>{t('footer.address_line2')}</ContactItem>
                                <ContactLink
                                    href={`mailto:${clinicInfo.email}`}
                                    ariaLabel={`Send email to ${clinicInfo.email}`}
                                >
                                    {clinicInfo.email}
                                </ContactLink>
                                <ContactLink
                                    href={footerData.whatsappLink}
                                    external
                                    icon={MessageCircle}
                                    ariaLabel={`Contact us on WhatsApp at ${clinicInfo.phoneDisplay}`}
                                >
                                    {clinicInfo.phoneDisplay}
                                </ContactLink>
                                <ContactLink
                                    href={footerData.chatbotUrl}
                                    external
                                    icon={Bot}
                                    ariaLabel={`Open chatbot for instant support`}
                                >
                                    {t('contact.chatbot_title')}
                                </ContactLink>
                                <ContactItem>{t('footer.hours')}</ContactItem>
                            </ul>
                        </address>
                    </FooterSection>
                </div>

                {/* Footer Bottom Section */}
                <div className="border-t border-slate-700 pt-8">
                    <div className="flex flex-col lg:flex-row justify-between items-start gap-6 lg:gap-8">
                        {/* Legal Information */}
                        <div className="flex-1 space-y-2">
                            <p className="text-slate-400 text-xs leading-snug">
                                <span className="block font-medium text-slate-300">
                                    {clinicInfo.responsiblePhysician} • {clinicInfo.responsiblePhysicianCRM}
                                </span>
                                <span className="block">{clinicInfo.responsibleNurse}</span>
                                <span className="block">CNPJ: {clinicInfo.taxId}</span>
                                <span className="block">
                                    DPO: <a
                                        href={`mailto:${clinicInfo.dpoEmail}`}
                                        className={cn(
                                            'underline hover:text-white transition-colors',
                                            getFocusStyles({ glassEffect: enableGlassEffects }).className
                                        )}
                                        aria-label={`Contact Data Protection Officer at ${clinicInfo.dpoEmail}`}
                                    >
                                        {clinicInfo.dpoEmail}
                                    </a>
                                </span>
                                <span className="block space-x-3">
                                    <a
                                        href="/privacy"
                                        className={cn(
                                            'underline hover:text-white transition-colors',
                                            getFocusStyles({ glassEffect: enableGlassEffects }).className
                                        )}
                                    >
                                        {t('privacy.link_label')}
                                    </a>
                                    <button
                                        type="button"
                                        onClick={() => window.dispatchEvent(new Event('open-privacy-settings'))}
                                        className={cn(
                                            'underline hover:text-white transition-colors',
                                            getFocusStyles({ glassEffect: enableGlassEffects }).className
                                        )}
                                        aria-label="Open privacy settings to manage cookies"
                                    >
                                        {t('privacy.manage_cookies')}
                                    </button>
                                </span>
                                {/* reCAPTCHA disclosure */}
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
                            <p className="text-slate-400 text-xs mt-2">
                                {t('footer.copyright', { year: footerData.currentYear })}
                            </p>
                        </div>

                        {/* Social Links and Scroll to Top */}
                        <div className="flex flex-col items-center gap-4 lg:items-end">
                            <div className="flex items-center space-x-4">
                                {/* Enhanced 3D Social Icons */}
                                <SocialIcons3D
                                    socials={socialsForLinks}
                                    enableAnimations={enableAnimations}
                                    glassEffect={enableGlassEffects}
                                    onIconClick={handleSocialIconClick}
                                    className="social-icons-footer"
                                />

                                {/* Enhanced Scroll to Top Button */}
                                <ScrollToTopEnhanced
                                    glassEffect={enableGlassEffects}
                                    enableAnimations={enableAnimations}
                                    onScrollComplete={handleScrollComplete}
                                    className="scroll-to-top-footer"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Accessibility instructions for screen readers */}
            <div className="sr-only" id="footer-accessibility-instructions">
                Footer navigation: Use Tab to navigate through links and buttons.
                Social media icons support keyboard navigation with arrow keys.
                Press Enter or Space to activate links and buttons.
            </div>
        </footer>
    );
};

export default React.memo(FooterWithAccessibility);