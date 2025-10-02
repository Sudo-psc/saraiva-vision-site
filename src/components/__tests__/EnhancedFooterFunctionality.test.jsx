import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { BrowserRouter } from '@/utils/router';
import { vi } from 'vitest';
import EnhancedFooter from '../EnhancedFooter';

// Mock dependencies
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

vi.mock('@/components/ui/social-links-3d', () => ({
    SocialLinks3D: ({ socials, spacing, enableGlassContainer, className }) => (
        <div
            data-testid="social-links-3d"
            data-spacing={spacing}
            data-glass-container={enableGlassContainer}
            className={className}
        >
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

// Mock hooks
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

// Mock scroll behavior
const mockScrollTo = vi.fn();
Object.defineProperty(window, 'scrollTo', {
    value: mockScrollTo,
    writable: true
});

const renderWithRouter = (component) => {
    return render(
        <BrowserRouter>
            {component}
        </BrowserRouter>
    );
};

describe('EnhancedFooter - Existing Functionality Preservation', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Logo and Branding', () => {
        it('should render the logo with white variant', () => {
            renderWithRouter(<EnhancedFooter />);

            const logo = screen.getByTestId('logo');
            expect(logo).toBeInTheDocument();
            expect(logo).toHaveAttribute('data-white', 'true');
        });

        it('should display the footer slogan', () => {
            renderWithRouter(<EnhancedFooter />);

            expect(screen.getByText('Your vision, our commitment')).toBeInTheDocument();
        });

        it('should render the Amor e Saúde partner logo with correct attributes', () => {
            renderWithRouter(<EnhancedFooter />);

            const partnerLogo = screen.getByAltText('Amor e Saúde Logo');
            expect(partnerLogo).toBeInTheDocument();
            expect(partnerLogo).toHaveAttribute('loading', 'lazy');
            expect(partnerLogo).toHaveAttribute('decoding', 'async');
            expect(partnerLogo.closest('a')).toHaveAttribute('href', 'https://www.amorsaude.com.br/clinica/caratinga-mg/');
            expect(partnerLogo.closest('a')).toHaveAttribute('target', '_blank');
        });
    });

    describe('Navigation Links', () => {
        it('should render all navigation links', () => {
            renderWithRouter(<EnhancedFooter />);

            // Find navigation links specifically within the Quick Links section
            const quickLinksSection = screen.getByText('Quick Links').closest('div');

            expect(within(quickLinksSection).getByText('Home')).toBeInTheDocument();
            expect(within(quickLinksSection).getByText('Services')).toBeInTheDocument();
            expect(within(quickLinksSection).getByText('About')).toBeInTheDocument();
            expect(within(quickLinksSection).getByText('Testimonials')).toBeInTheDocument();
            expect(within(quickLinksSection).getByText('Contact')).toBeInTheDocument();
        });

        it('should have correct href attributes for navigation links', () => {
            renderWithRouter(<EnhancedFooter />);

            // Find navigation links specifically within the Quick Links section
            const quickLinksSection = screen.getByText('Quick Links').closest('div');

            expect(within(quickLinksSection).getByText('Home').closest('a')).toHaveAttribute('href', '/');
            expect(within(quickLinksSection).getByText('Services').closest('a')).toHaveAttribute('href', '/servicos');
            expect(within(quickLinksSection).getByText('About').closest('a')).toHaveAttribute('href', '/sobre');
            expect(within(quickLinksSection).getByText('Testimonials').closest('a')).toHaveAttribute('href', '/depoimentos');
            expect(within(quickLinksSection).getByText('Contact').closest('a')).toHaveAttribute('href', '/contato');
        });
    });

    describe('Service Links', () => {
        it('should render all service links', () => {
            renderWithRouter(<EnhancedFooter />);

            expect(screen.getByText('Consultations')).toBeInTheDocument();
            expect(screen.getByText('Refraction')).toBeInTheDocument();
            expect(screen.getByText('Treatments')).toBeInTheDocument();
            expect(screen.getByText('Surgeries')).toBeInTheDocument();
            expect(screen.getByText('Pediatric')).toBeInTheDocument();
            expect(screen.getByText('Reports')).toBeInTheDocument();
        });

        it('should link all service items to /servicos', () => {
            renderWithRouter(<EnhancedFooter />);

            const serviceLinks = [
                'Consultations', 'Refraction', 'Treatments',
                'Surgeries', 'Pediatric', 'Reports'
            ];

            serviceLinks.forEach(service => {
                expect(screen.getByText(service).closest('a')).toHaveAttribute('href', '/servicos');
            });
        });
    });

    describe('Contact Information', () => {
        it('should display all contact information', () => {
            renderWithRouter(<EnhancedFooter />);

            expect(screen.getByText('Address Line 1')).toBeInTheDocument();
            expect(screen.getByText('Address Line 2')).toBeInTheDocument();
            expect(screen.getByText('contato@saraivavision.com.br')).toBeInTheDocument();
            expect(screen.getByText('(33) 99999-9999')).toBeInTheDocument();
            expect(screen.getByText('Chatbot')).toBeInTheDocument();
            expect(screen.getByText('Business Hours')).toBeInTheDocument();
        });

        it('should have correct email link', () => {
            renderWithRouter(<EnhancedFooter />);

            const emailLink = screen.getByText('contato@saraivavision.com.br').closest('a');
            expect(emailLink).toHaveAttribute('href', 'mailto:contato@saraivavision.com.br');
        });

        it('should have correct WhatsApp link', () => {
            renderWithRouter(<EnhancedFooter />);

            const whatsappLink = screen.getByText('(33) 99999-9999').closest('a');
            expect(whatsappLink).toHaveAttribute('href', 'https://wa.me/5533999999999');
            expect(whatsappLink).toHaveAttribute('target', '_blank');
        });

        it('should have correct chatbot link', () => {
            renderWithRouter(<EnhancedFooter />);

            const chatbotLink = screen.getByText('Chatbot').closest('a');
            expect(chatbotLink).toHaveAttribute('href', 'https://chatbot.saraivavision.com.br');
            expect(chatbotLink).toHaveAttribute('target', '_blank');
        });
    });

    describe('Enhanced Social Media Icons', () => {
        it('should render 3D social links component', () => {
            renderWithRouter(<EnhancedFooter />);

            const socialLinks3D = screen.getByTestId('social-links-3d');
            expect(socialLinks3D).toBeInTheDocument();
            expect(socialLinks3D).toHaveAttribute('data-spacing', 'normal');
            expect(socialLinks3D).toHaveAttribute('data-glass-container', 'true');
        });

        it('should render all social media links with correct URLs', () => {
            renderWithRouter(<EnhancedFooter />);

            const facebookLink = screen.getByTestId('social-link-facebook');
            expect(facebookLink).toHaveAttribute('href', 'https://facebook.com/saraivavision');

            const instagramLink = screen.getByTestId('social-link-instagram');
            expect(instagramLink).toHaveAttribute('href', 'https://instagram.com/saraivavision');

            const linkedinLink = screen.getByTestId('social-link-linkedin');
            expect(linkedinLink).toHaveAttribute('href', 'https://linkedin.com/company/saraivavision');

            const tiktokLink = screen.getByTestId('social-link-tiktok');
            expect(tiktokLink).toHaveAttribute('href', 'https://www.tiktok.com/@saraivavision');
        });
    });

    describe('Scroll to Top Functionality', () => {
        it('should render scroll to top button', () => {
            renderWithRouter(<EnhancedFooter />);

            const scrollButton = screen.getByLabelText('Back to top');
            expect(scrollButton).toBeInTheDocument();
            expect(scrollButton).toHaveAttribute('title', 'Back to top');
        });

        it('should call scrollTo when scroll to top button is clicked', () => {
            renderWithRouter(<EnhancedFooter />);

            const scrollButton = screen.getByLabelText('Back to top');
            fireEvent.click(scrollButton);

            expect(mockScrollTo).toHaveBeenCalledWith({
                top: 0,
                behavior: 'smooth'
            });
        });
    });

    describe('Legal and Compliance Information', () => {
        it('should display physician and nurse information', () => {
            renderWithRouter(<EnhancedFooter />);

            expect(screen.getByText(/Dr\. Philipe Saraiva • CRM-MG 12345/)).toBeInTheDocument();
            expect(screen.getByText('Nurse Name')).toBeInTheDocument();
        });

        it('should display CNPJ information', () => {
            renderWithRouter(<EnhancedFooter />);

            expect(screen.getByText(/CNPJ: 12\.345\.678\/0001-90/)).toBeInTheDocument();
        });

        it('should display DPO email with correct link', () => {
            renderWithRouter(<EnhancedFooter />);

            const dpoLink = screen.getByText('dpo@saraivavision.com.br');
            expect(dpoLink).toBeInTheDocument();
            expect(dpoLink.closest('a')).toHaveAttribute('href', 'mailto:dpo@saraivavision.com.br');
        });

        it('should display privacy policy link', () => {
            renderWithRouter(<EnhancedFooter />);

            const privacyLink = screen.getByText('Privacy Policy');
            expect(privacyLink).toBeInTheDocument();
            expect(privacyLink.closest('a')).toHaveAttribute('href', '/privacy');
        });

        it('should have manage cookies button', () => {
            renderWithRouter(<EnhancedFooter />);

            const cookiesButton = screen.getByText('Manage Cookies');
            expect(cookiesButton).toBeInTheDocument();
            expect(cookiesButton.tagName).toBe('BUTTON');
        });

        it('should display copyright with current year', () => {
            renderWithRouter(<EnhancedFooter />);

            const currentYear = new Date().getFullYear();
            expect(screen.getByText(`© ${currentYear} All rights reserved`)).toBeInTheDocument();
        });

        it('should display privacy and CFM disclaimers', () => {
            renderWithRouter(<EnhancedFooter />);

            expect(screen.getByText('Privacy disclaimer')).toBeInTheDocument();
            expect(screen.getByText('CFM disclaimer')).toBeInTheDocument();
        });
    });

    describe('Cookie Management', () => {
        it('should dispatch privacy settings event when manage cookies is clicked', () => {
            const dispatchEventSpy = vi.spyOn(window, 'dispatchEvent');

            renderWithRouter(<EnhancedFooter />);

            const cookiesButton = screen.getByText('Manage Cookies');
            fireEvent.click(cookiesButton);

            expect(dispatchEventSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: 'open-privacy-settings'
                })
            );

            dispatchEventSpy.mockRestore();
        });
    });

    describe('Accessibility', () => {
        it('should have proper ARIA attributes', () => {
            renderWithRouter(<EnhancedFooter />);

            const footer = screen.getByRole('contentinfo');
            expect(footer).toBeInTheDocument();
        });

        it('should have proper external link attributes', () => {
            renderWithRouter(<EnhancedFooter />);

            const externalLinks = [
                screen.getByText('(33) 99999-9999').closest('a'),
                screen.getByText('Chatbot').closest('a'),
                screen.getByAltText('Amor e Saúde Logo').closest('a')
            ];

            externalLinks.forEach(link => {
                expect(link).toHaveAttribute('target', '_blank');
                expect(link).toHaveAttribute('rel', 'noopener noreferrer');
            });
        });
    });

    describe('Responsive Layout', () => {
        it('should have responsive grid classes', () => {
            renderWithRouter(<EnhancedFooter />);

            const gridContainer = screen.getByText('Your vision, our commitment').closest('.grid');
            expect(gridContainer).toHaveClass('grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-4');
        });

        it('should have responsive flex layout for bottom section', () => {
            renderWithRouter(<EnhancedFooter />);

            // Find the main bottom section container (not the social links container)
            const bottomSection = screen.getByText(/Dr\. Philipe Saraiva • CRM-MG 12345/).closest('.flex');
            expect(bottomSection).toHaveClass('flex-col', 'lg:flex-row');
        });
    });
});