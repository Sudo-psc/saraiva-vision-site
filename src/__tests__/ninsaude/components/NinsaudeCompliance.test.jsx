/**
 * NinsaudeCompliance Component Tests (TDD)
 * Tests for the CFM/LGPD compliance component for Ninsaúde integration
 *
 * Expected: These tests will FAIL initially until the component is created
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NinsaudeCompliance from '@/components/ninsaude/NinsaudeCompliance';

describe('NinsaudeCompliance', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('CFM Medical Disclaimer Rendering', () => {
        it('renders CFM medical disclaimer', () => {
            render(<NinsaudeCompliance showCFMDisclaimer={true} />);

            expect(screen.getByText(/conselho federal de medicina/i)).toBeInTheDocument();
            expect(screen.getByText(/informações de caráter informativo/i)).toBeInTheDocument();
        });

        it('displays telemedicine compliance notice', () => {
            render(<NinsaudeCompliance showCFMDisclaimer={true} />);

            expect(screen.getByText(/não substitui consulta presencial/i)).toBeInTheDocument();
        });

        it('shows professional registration information', () => {
            render(<NinsaudeCompliance showCFMDisclaimer={true} professionalCRM="MG-12345" />);

            expect(screen.getByText(/CRM.*MG-12345/i)).toBeInTheDocument();
        });

        it('includes link to CFM regulations', () => {
            render(<NinsaudeCompliance showCFMDisclaimer={true} />);

            const cfmLink = screen.getByRole('link', { name: /resolução cfm/i });
            expect(cfmLink).toHaveAttribute('href', expect.stringContaining('cfm.org.br'));
            expect(cfmLink).toHaveAttribute('target', '_blank');
            expect(cfmLink).toHaveAttribute('rel', 'noopener noreferrer');
        });

        it('displays emergency warning', () => {
            render(<NinsaudeCompliance showCFMDisclaimer={true} />);

            expect(screen.getByText(/emergência.*192.*193/i)).toBeInTheDocument();
        });

        it('hides CFM disclaimer when showCFMDisclaimer is false', () => {
            render(<NinsaudeCompliance showCFMDisclaimer={false} />);

            expect(screen.queryByText(/conselho federal de medicina/i)).not.toBeInTheDocument();
        });
    });

    describe('LGPD Consent Text Display', () => {
        it('renders LGPD consent information', () => {
            render(<NinsaudeCompliance showLGPDConsent={true} />);

            expect(screen.getByText(/lei geral de proteção de dados/i)).toBeInTheDocument();
            expect(screen.getByText(/LGPD.*13\.709\/2018/i)).toBeInTheDocument();
        });

        it('displays data processing purpose', () => {
            render(<NinsaudeCompliance showLGPDConsent={true} />);

            expect(screen.getByText(/finalidade.*agendamento.*consultas/i)).toBeInTheDocument();
        });

        it('lists collected data types', () => {
            render(<NinsaudeCompliance showLGPDConsent={true} />);

            expect(screen.getByText(/nome completo/i)).toBeInTheDocument();
            expect(screen.getByText(/CPF/i)).toBeInTheDocument();
            expect(screen.getByText(/e-mail/i)).toBeInTheDocument();
            expect(screen.getByText(/telefone/i)).toBeInTheDocument();
        });

        it('shows data retention period', () => {
            render(<NinsaudeCompliance showLGPDConsent={true} />);

            expect(screen.getByText(/prazo de armazenamento/i)).toBeInTheDocument();
            expect(screen.getByText(/5 anos/i)).toBeInTheDocument();
        });

        it('displays patient rights under LGPD', () => {
            render(<NinsaudeCompliance showLGPDConsent={true} />);

            expect(screen.getByText(/direitos do titular/i)).toBeInTheDocument();
            expect(screen.getByText(/acesso aos dados/i)).toBeInTheDocument();
            expect(screen.getByText(/correção/i)).toBeInTheDocument();
            expect(screen.getByText(/eliminação/i)).toBeInTheDocument();
            expect(screen.getByText(/portabilidade/i)).toBeInTheDocument();
        });

        it('includes contact information for data protection officer', () => {
            render(<NinsaudeCompliance showLGPDConsent={true} dpoEmail="dpo@saraivavision.com.br" />);

            expect(screen.getByText(/encarregado.*proteção de dados/i)).toBeInTheDocument();
            expect(screen.getByText('dpo@saraivavision.com.br')).toBeInTheDocument();
        });

        it('links to privacy policy', () => {
            render(<NinsaudeCompliance showLGPDConsent={true} />);

            const privacyLink = screen.getByRole('link', { name: /política de privacidade/i });
            expect(privacyLink).toHaveAttribute('href', expect.stringMatching(/privacidade/i));
        });

        it('hides LGPD consent when showLGPDConsent is false', () => {
            render(<NinsaudeCompliance showLGPDConsent={false} />);

            expect(screen.queryByText(/lei geral de proteção de dados/i)).not.toBeInTheDocument();
        });
    });

    describe('Compliance Validation', () => {
        it('validates required CFM elements are present', () => {
            const { container } = render(<NinsaudeCompliance showCFMDisclaimer={true} />);

            const cfmSection = within(container).getByTestId('cfm-compliance');

            expect(within(cfmSection).getByText(/conselho federal de medicina/i)).toBeInTheDocument();
            expect(within(cfmSection).getByText(/não substitui consulta presencial/i)).toBeInTheDocument();
            expect(within(cfmSection).getByRole('link', { name: /resolução cfm/i })).toBeInTheDocument();
        });

        it('validates required LGPD elements are present', () => {
            const { container } = render(<NinsaudeCompliance showLGPDConsent={true} />);

            const lgpdSection = within(container).getByTestId('lgpd-compliance');

            expect(within(lgpdSection).getByText(/lei geral de proteção de dados/i)).toBeInTheDocument();
            expect(within(lgpdSection).getByText(/finalidade/i)).toBeInTheDocument();
            expect(within(lgpdSection).getByText(/direitos do titular/i)).toBeInTheDocument();
        });

        it('passes compliance check when all required elements present', () => {
            const mockOnValidation = vi.fn();
            render(
                <NinsaudeCompliance
                    showCFMDisclaimer={true}
                    showLGPDConsent={true}
                    onValidation={mockOnValidation}
                />
            );

            expect(mockOnValidation).toHaveBeenCalledWith({
                cfmCompliant: true,
                lgpdCompliant: true,
                missingElements: []
            });
        });

        it('fails compliance check when required elements missing', () => {
            const mockOnValidation = vi.fn();
            render(
                <NinsaudeCompliance
                    showCFMDisclaimer={true}
                    professionalCRM="" // Missing CRM
                    onValidation={mockOnValidation}
                />
            );

            expect(mockOnValidation).toHaveBeenCalledWith({
                cfmCompliant: false,
                lgpdCompliant: true,
                missingElements: ['professionalCRM']
            });
        });
    });

    describe('PII Detection Warnings', () => {
        it('detects and warns about CPF in free text fields', () => {
            render(
                <NinsaudeCompliance
                    showPIIWarnings={true}
                    textContent="Meu CPF é 123.456.789-09"
                />
            );

            expect(screen.getByText(/dados sensíveis detectados/i)).toBeInTheDocument();
            expect(screen.getByText(/CPF/i)).toBeInTheDocument();
        });

        it('detects email addresses in text', () => {
            render(
                <NinsaudeCompliance
                    showPIIWarnings={true}
                    textContent="Contato: joao@example.com"
                />
            );

            expect(screen.getByText(/dados sensíveis detectados/i)).toBeInTheDocument();
            expect(screen.getByText(/e-mail/i)).toBeInTheDocument();
        });

        it('detects phone numbers in text', () => {
            render(
                <NinsaudeCompliance
                    showPIIWarnings={true}
                    textContent="Telefone: (33) 99999-9999"
                />
            );

            expect(screen.getByText(/dados sensíveis detectados/i)).toBeInTheDocument();
            expect(screen.getByText(/telefone/i)).toBeInTheDocument();
        });

        it('shows warning icon for PII detection', () => {
            render(
                <NinsaudeCompliance
                    showPIIWarnings={true}
                    textContent="CPF: 123.456.789-09"
                />
            );

            expect(screen.getByRole('img', { name: /aviso/i })).toBeInTheDocument();
        });

        it('provides guidance on handling PII', () => {
            render(
                <NinsaudeCompliance
                    showPIIWarnings={true}
                    textContent="Meu CPF é 123.456.789-09"
                />
            );

            expect(screen.getByText(/utilize os campos apropriados/i)).toBeInTheDocument();
        });

        it('does not show warnings when no PII detected', () => {
            render(
                <NinsaudeCompliance
                    showPIIWarnings={true}
                    textContent="Preciso agendar uma consulta"
                />
            );

            expect(screen.queryByText(/dados sensíveis detectados/i)).not.toBeInTheDocument();
        });

        it('hides PII warnings when showPIIWarnings is false', () => {
            render(
                <NinsaudeCompliance
                    showPIIWarnings={false}
                    textContent="CPF: 123.456.789-09"
                />
            );

            expect(screen.queryByText(/dados sensíveis detectados/i)).not.toBeInTheDocument();
        });
    });

    describe('Visual Presentation', () => {
        it('renders with proper styling for medical context', () => {
            const { container } = render(<NinsaudeCompliance showCFMDisclaimer={true} />);

            const cfmSection = within(container).getByTestId('cfm-compliance');
            expect(cfmSection).toHaveClass('medical-disclaimer');
        });

        it('uses accessible color contrast', () => {
            const { container } = render(<NinsaudeCompliance showLGPDConsent={true} />);

            const lgpdSection = within(container).getByTestId('lgpd-compliance');
            // Should have readable text with proper contrast
            expect(lgpdSection).toBeVisible();
        });

        it('displays disclaimers in collapsible sections', async () => {
            render(<NinsaudeCompliance showCFMDisclaimer={true} collapsible={true} />);

            const expandButton = screen.getByRole('button', { name: /ver mais.*cfm/i });
            expect(expandButton).toBeInTheDocument();

            await userEvent.click(expandButton);

            expect(screen.getByText(/resolução cfm/i)).toBeVisible();
        });
    });

    describe('Internationalization', () => {
        it('displays content in Portuguese by default', () => {
            render(<NinsaudeCompliance showCFMDisclaimer={true} showLGPDConsent={true} />);

            expect(screen.getByText(/conselho federal de medicina/i)).toBeInTheDocument();
            expect(screen.getByText(/lei geral de proteção de dados/i)).toBeInTheDocument();
        });

        it('supports custom translations', () => {
            const customTranslations = {
                cfmTitle: 'Federal Medical Council',
                lgpdTitle: 'General Data Protection Law'
            };

            render(
                <NinsaudeCompliance
                    showCFMDisclaimer={true}
                    showLGPDConsent={true}
                    translations={customTranslations}
                />
            );

            expect(screen.getByText('Federal Medical Council')).toBeInTheDocument();
            expect(screen.getByText('General Data Protection Law')).toBeInTheDocument();
        });
    });

    describe('Accessibility', () => {
        it('has proper heading hierarchy', () => {
            render(<NinsaudeCompliance showCFMDisclaimer={true} showLGPDConsent={true} />);

            const headings = screen.getAllByRole('heading');
            expect(headings.length).toBeGreaterThan(0);
        });

        it('provides ARIA labels for important sections', () => {
            render(<NinsaudeCompliance showCFMDisclaimer={true} />);

            const cfmSection = screen.getByRole('region', { name: /regulamentação médica/i });
            expect(cfmSection).toBeInTheDocument();
        });

        it('ensures links are keyboard accessible', () => {
            render(<NinsaudeCompliance showCFMDisclaimer={true} />);

            const cfmLink = screen.getByRole('link', { name: /resolução cfm/i });
            cfmLink.focus();
            expect(document.activeElement).toBe(cfmLink);
        });

        it('announces warnings to screen readers', () => {
            render(
                <NinsaudeCompliance
                    showPIIWarnings={true}
                    textContent="CPF: 123.456.789-09"
                />
            );

            const warningRegion = screen.getByRole('alert');
            expect(warningRegion).toHaveTextContent(/dados sensíveis detectados/i);
        });
    });

    describe('Integration with Forms', () => {
        it('can be embedded in forms without interfering with submission', () => {
            const mockOnSubmit = vi.fn(e => e.preventDefault());

            render(
                <form onSubmit={mockOnSubmit}>
                    <NinsaudeCompliance showLGPDConsent={true} />
                    <button type="submit">Submit</button>
                </form>
            );

            const submitButton = screen.getByRole('button', { name: /submit/i });
            submitButton.click();

            expect(mockOnSubmit).toHaveBeenCalled();
        });

        it('provides compliance validation for form validation', () => {
            const mockValidate = vi.fn();

            render(
                <NinsaudeCompliance
                    showCFMDisclaimer={true}
                    showLGPDConsent={true}
                    onValidation={mockValidate}
                />
            );

            expect(mockValidate).toHaveBeenCalledWith(
                expect.objectContaining({
                    cfmCompliant: true,
                    lgpdCompliant: true
                })
            );
        });
    });
});
