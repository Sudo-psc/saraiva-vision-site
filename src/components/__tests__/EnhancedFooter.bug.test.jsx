import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import EnhancedFooter from '../EnhancedFooter';

// Mock dependencies
vi.mock('@/hooks/useGlassMorphism', () => ({
    useGlassMorphism: () => ({
        capabilities: { reducedMotion: false },
        shouldEnableGlass: () => false,
    }),
}));

vi.mock('@/hooks/useIntersectionObserver', () => ({
    useIntersectionObserver: () => [{ current: null }, true],
}));

vi.mock('framer-motion', () => ({
    motion: {
        div: React.forwardRef(({ children, ...props }, ref) => <div {...props} ref={ref}>{children}</div>),
        button: React.forwardRef(({ children, ...props }, ref) => <button {...props} ref={ref}>{children}</button>),
    },
    useReducedMotion: () => true,
}));

vi.mock('@/hooks/useFooterAccessibility', () => ({
    useFooterAccessibility: () => ({
        getFooterAriaProps: () => ({}),
        getGlassLayerAriaProps: () => ({}),
        shouldReduceMotion: true,
        shouldDisableGlass: true,
        announcementText: '',
        announce: vi.fn(),
    }),
}));

vi.mock('@/utils/footerCompatibility', () => ({
    initializeCompatibility: vi.fn(),
    applyCompatibilityFixes: vi.fn(),
    getCompatibilityConfig: () => ({ shouldUseGlass: false, shouldUse3D: false }),
}));

vi.mock('@/lib/clinicInfo', () => ({
    clinicInfo: {
        phone: '33999999999',
        phoneDisplay: '(33) 99999-9999',
        email: 'test@example.com',
        facebook: 'https://facebook.com/test',
        instagram: 'https://instagram.com/test',
        linkedin: 'https://linkedin.com/test',
        spotify: 'https://spotify.com/test',
        chatbotUrl: 'https://chatbot.test',
        responsiblePhysician: 'Dr. Test',
        responsiblePhysicianCRM: 'CRM 12345',
        responsiblePhysicianTitle: 'Ophthalmologist',
        responsibleNurse: 'Nurse Test',
        responsibleNurseTitle: 'Head Nurse',
        taxId: '12.345.678/0001-90',
        dpoEmail: 'dpo@test.com',
    },
}));

// Mock SocialLinks3D to avoid its complex dependencies
vi.mock('@/components/ui/social-links-3d', () => ({
    SocialLinks3D: () => <div data-testid="social-links-3d-mock"></div>,
}));


const renderWithRouter = (component) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('EnhancedFooter Bug Fix', () => {
    beforeEach(() => {
         // Mock useTranslation to simulate missing 'footer.service_links'
         vi.mock('react-i18next', () => ({
            useTranslation: () => ({
                t: (key, options) => {
                    if (key === 'footer.service_links') {
                        // Simulate missing translation by returning the key itself, which is what i18next does
                        return key;
                    }
                    if (options && options.returnObjects) {
                        return {
                            "consultations": "footer.service_links.consultations",
                            "refraction": "footer.service_links.refraction",
                            "treatments": "footer.service_links.treatments",
                            "surgeries": "footer.service_links.surgeries",
                            "pediatric": "footer.service_links.pediatric",
                            "reports": "footer.service_links.reports"
                        };
                    }
                    return key;
                },
            }),
        }));
    });

    afterEach(() => {
        vi.clearAllMocks();
        vi.resetModules();
    });

    it('should not render hardcoded English services when translation is missing', () => {
        renderWithRouter(<EnhancedFooter />);

        // These assertions are expected to pass, demonstrating the bug's presence.
        // The component should not render these, but due to the bug, it does.
        expect(screen.queryByText('Consultations')).not.toBeInTheDocument();
        expect(screen.queryByText('Refraction')).not.toBeInTheDocument();
        expect(screen.queryByText('Treatments')).not.toBeInTheDocument();
        expect(screen.queryByText('Surgeries')).not.toBeInTheDocument();
        expect(screen.queryByText('Pediatric')).not.toBeInTheDocument();
        expect(screen.queryByText('Reports')).not.toBeInTheDocument();
    });
});