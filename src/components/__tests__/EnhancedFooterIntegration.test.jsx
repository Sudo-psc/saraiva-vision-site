import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { BrowserRouter } from '@/utils/router';
import { vi } from 'vitest';
import EnhancedFooter from '../EnhancedFooter';
import Footer from '../Footer';

// Mock dependencies for both components
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key, options) => {
            const translations = {
                'footer.slogan': 'Your vision, our commitment',
                'footer.partner_of': 'Partner of',
                'footer.amor_saude_alt': 'Amor e Saúde Logo',
                'footer.partner_link_aria': 'Open Amor e Saúde partner site (new tab)',
                'footer.quick_links': 'Quick Links',
                'footer.services': 'Services',
                'footer.contact': 'Contact',
                'footer.address_line1': 'Address Line 1',
                'footer.address_line2': 'Address Line 2',
                'footer.hours': 'Business Hours',
                'footer.back_to_top': 'Back to top',
                'footer.copyright': `© ${options?.year || 2024} All rights reserved`,
                'navbar.home': 'Home',
                'navbar.services': 'Services',
                'navbar.about': 'About',
                'navbar.testimonials': 'Testimonials',
                'navbar.contact': 'Contact',
                'contact.chatbot_title': 'Chatbot',
                'privacy.link_label': 'Privacy Policy',
                'privacy.manage_cookies': 'Manage Cookies',
                'privacy.disclaimer': 'Privacy disclaimer',
                'cfm.disclaimer': 'CFM disclaimer',
                'recaptcha.disclosure_html': 'reCAPTCHA disclosure'
            };

            if (key === 'footer.service_links') {
                return {
                    consultations: 'Consultations',
                    refraction: 'Refraction',
                    treatments: 'Treatments',
                    surgeries: 'Surgeries',
                    pediatric: 'Pediatric',
                    reports: 'Reports'
                };
            }

            return translations[key] || key;
        }
    })
}));

vi.mock('@/lib/clinicInfo', () => ({
    clinicInfo: {
        phone: '+55 33 99999-9999',
        phoneDisplay: '(33) 99999-9999',
        email: 'contato@saraivavision.com.br',
        facebook: 'https://facebook.com/saraivavision',
        instagram: 'https://instagram.com/saraivavision',
        linkedin: 'https://linkedin.com/company/saraivavision',
        chatbotUrl: 'https://chatbot.saraivavision.com.br',
        responsiblePhysician: 'Dr. Philipe Saraiva',
        responsiblePhysicianCRM: 'CRM-MG 12345',
        responsibleNurse: 'Nurse Name',
        taxId: '12.345.678/0001-90',
        dpoEmail: 'dpo@saraivavision.com.br'
    }
}));

vi.mock('@/components/Logo', () => ({
    default: ({ isWhite }) => (
        <div data-testid="logo" data-white={isWhite}>
            Logo Component
        </div>
    )
}));

// Mock enhanced components for EnhancedFooter
vi.mock('@/components/ui/social-links-3d', () => ({
    SocialLinks3D: ({ socials }) => (
        <div data-testid="social-links-3d">
            {socials.map((social) => (
                <a
                    key={social.name}
                    href={social.href}
                    data-testid={`social-link-${social.name.toLowerCase()}`}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    {social.name}
                </a>
            ))}
        </div>
    )
}));

// Mock original SocialLinks for Footer
vi.mock('@/components/ui/social-links', () => ({
    SocialLinks: ({ socials }) => (
        <div data-testid="social-links">
            {socials.map((social) => (
                <a
                    key={social.name}
                    href={social.href}
                    data-testid={`original-social-link-${social.name.toLowerCase()}`}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    {social.name}
                </a>
            ))}
        </div>
    )
}));

// Mock hooks for EnhancedFooter
vi.mock('@/hooks/useGlassMorphism', () => ({
    useGlassMorphism: () => ({
        capabilities: {
            supportsBackdropFilter: true,
            performanceLevel: 'high',
            reducedMotion: false
        },
        glassIntensity: 'medium',
        shouldEnableGlass: () => true,
        getGlassStyles: () => ({})
    })
}));

vi.mock('@/hooks/useIntersectionObserver', () => ({
    useIntersectionObserver: () => [
        { current: null }, // ref
        true // isVisible
    ]
}));

vi.mock('@/hooks/useFooterAccessibility', () => ({
    useFooterAccessibility: () => ({
        getFooterAriaProps: () => ({ role: 'contentinfo' }),
        getGlassLayerAriaProps: () => ({ 'aria-hidden': true }),
        shouldReduceMotion: false,
        shouldDisableGlass: false,
        announcementText: '',
        announce: vi.fn()
    })
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }) => <div {...props}>{children}</div>,
        button: ({ children, ...props }) => <button {...props}>{children}</button>
    }
}));

const renderWithRouter = (component) => {
    return render(
        <BrowserRouter>
            {component}
        </BrowserRouter>
    );
};

describe('EnhancedFooter Integration - Drop-in Replacement', () => {
    describe('Content Parity', () => {
        it('should render the same essential content as original Footer', () => {
            const { container: originalContainer } = renderWithRouter(<Footer />);
            const { container: enhancedContainer } = renderWithRouter(<EnhancedFooter />);

            // Check that both have the same essential text content
            const essentialTexts = [
                'Your vision, our commitment',
                'Partner of',
                'Quick Links',
                'Services',
                'Contact',
                'Home',
                'About',
                'Testimonials',
                'Consultations',
                'Refraction',
                'Treatments',
                'Address Line 1',
                'Address Line 2',
                'contato@saraivavision.com.br',
                '(33) 99999-9999',
                'Chatbot',
                'Dr. Philipe Saraiva • CRM-MG 12345',
                'Privacy Policy',
                'Manage Cookies'
            ];

            essentialTexts.forEach(text => {
                expect(originalContainer).toHaveTextContent(text);
                expect(enhancedContainer).toHaveTextContent(text);
            });
        });

        it('should have the same navigation structure', () => {
            renderWithRouter(<EnhancedFooter />);

            // Check that enhanced version has the same navigation links in Quick Links section
            const quickLinksSection = screen.getByText('Quick Links').closest('div');
            const navLinks = ['Home', 'About', 'Testimonials'];

            navLinks.forEach(linkText => {
                expect(within(quickLinksSection).getByText(linkText)).toBeInTheDocument();
            });

            // Check that Services link exists in navigation
            expect(within(quickLinksSection).getByText('Services')).toBeInTheDocument();

            // Check that Contact link exists in navigation  
            expect(within(quickLinksSection).getByText('Contact')).toBeInTheDocument();
        });

        it('should preserve all external link behaviors', () => {
            renderWithRouter(<EnhancedFooter />);

            // Check WhatsApp link
            const whatsappLink = screen.getByText('(33) 99999-9999').closest('a');
            expect(whatsappLink).toHaveAttribute('href', 'https://wa.me/5533999999999');
            expect(whatsappLink).toHaveAttribute('target', '_blank');

            // Check email link
            const emailLink = screen.getByText('contato@saraivavision.com.br').closest('a');
            expect(emailLink).toHaveAttribute('href', 'mailto:contato@saraivavision.com.br');

            // Check chatbot link
            const chatbotLink = screen.getByText('Chatbot').closest('a');
            expect(chatbotLink).toHaveAttribute('href', 'https://chatbot.saraivavision.com.br');
            expect(chatbotLink).toHaveAttribute('target', '_blank');
        });
    });

    describe('Enhanced Features', () => {
        it('should use 3D social links instead of original social links', () => {
            renderWithRouter(<EnhancedFooter />);

            // Should have 3D social links
            expect(screen.getByTestId('social-links-3d')).toBeInTheDocument();

            // Should have enhanced social media links
            expect(screen.getByTestId('social-link-facebook')).toBeInTheDocument();
            expect(screen.getByTestId('social-link-instagram')).toBeInTheDocument();
            expect(screen.getByTestId('social-link-linkedin')).toBeInTheDocument();
            expect(screen.getByTestId('social-link-tiktok')).toBeInTheDocument();
        });

        it('should have glass morphism layers', () => {
            renderWithRouter(<EnhancedFooter />);

            // Should have glass morphism background layer
            const glassLayer = document.querySelector('.enhanced-footer-glass-layer');
            expect(glassLayer).toBeInTheDocument();
            expect(glassLayer).toHaveClass('footer-glass-morphism');
        });

        it('should have enhanced scroll to top button', () => {
            renderWithRouter(<EnhancedFooter />);

            const scrollButton = screen.getByLabelText('Back to top');
            expect(scrollButton).toBeInTheDocument();

            // Should have enhanced styling classes (glass morphism)
            expect(scrollButton).toHaveClass('bg-gradient-to-br');
        });

        it('should maintain accessibility features', () => {
            renderWithRouter(<EnhancedFooter />);

            // Should have proper ARIA attributes
            const footer = screen.getByRole('contentinfo');
            expect(footer).toBeInTheDocument();

            // Should have proper focus management
            const scrollButton = screen.getByLabelText('Back to top');
            expect(scrollButton).toHaveAttribute('aria-label', 'Back to top');
        });
    });

    describe('Backward Compatibility', () => {
        it('should accept the same props as original Footer', () => {
            // Should render without errors when passed common props
            expect(() => {
                renderWithRouter(<EnhancedFooter className="custom-class" />);
            }).not.toThrow();

            expect(() => {
                renderWithRouter(<EnhancedFooter data-testid="footer" />);
            }).not.toThrow();
        });

        it('should work in the same layout contexts', () => {
            // Should render properly in a typical page layout
            const TestLayout = ({ FooterComponent }) => (
                <div>
                    <header>Header</header>
                    <main>Main Content</main>
                    <FooterComponent />
                </div>
            );

            expect(() => {
                renderWithRouter(<TestLayout FooterComponent={Footer} />);
            }).not.toThrow();

            expect(() => {
                renderWithRouter(<TestLayout FooterComponent={EnhancedFooter} />);
            }).not.toThrow();
        });

        it('should maintain the same DOM structure for CSS selectors', () => {
            renderWithRouter(<EnhancedFooter />);

            // Should have the same key structural elements
            expect(document.querySelector('.container')).toBeInTheDocument();
            expect(document.querySelector('.grid')).toBeInTheDocument();
            expect(document.querySelector('.border-t')).toBeInTheDocument();
        });
    });

    describe('Performance Considerations', () => {
        it('should not break when animations are disabled', () => {
            renderWithRouter(<EnhancedFooter enableAnimations={false} />);

            // Should still render all content
            expect(screen.getByText('Your vision, our commitment')).toBeInTheDocument();
            expect(screen.getByText('Quick Links')).toBeInTheDocument();
            expect(screen.getByLabelText('Back to top')).toBeInTheDocument();
        });

        it('should handle glass effects being disabled gracefully', () => {
            // Mock disabled glass effects
            vi.mocked(vi.importActual('@/hooks/useFooterAccessibility')).useFooterAccessibility = () => ({
                getFooterAriaProps: () => ({ role: 'contentinfo' }),
                getGlassLayerAriaProps: () => ({ 'aria-hidden': true }),
                shouldReduceMotion: false,
                shouldDisableGlass: true, // Disabled
                announcementText: '',
                announce: vi.fn()
            });

            renderWithRouter(<EnhancedFooter />);

            // Should still render all content
            expect(screen.getByText('Your vision, our commitment')).toBeInTheDocument();
            expect(screen.getByLabelText('Back to top')).toBeInTheDocument();
        });
    });
});