/**
 * Blog Content Components Tests
 *
 * Tests for static blog content components (ExpertTip, InfoBox, LearningSummary, etc.)
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ExpertTip from '@/components/blog/ExpertTip';
import InfoBox from '@/components/blog/InfoBox';
import LearningSummary from '@/components/blog/LearningSummary';
import QuickTakeaways from '@/components/blog/QuickTakeaways';

describe('ExpertTip Component', () => {
  describe('Rendering', () => {
    it('should render with default title', () => {
      render(
        <ExpertTip>
          <p>Expert advice here</p>
        </ExpertTip>
      );

      expect(screen.getByText('Dica do Especialista')).toBeInTheDocument();
      expect(screen.getByText('Expert advice here')).toBeInTheDocument();
    });

    it('should render with custom title', () => {
      render(
        <ExpertTip title="Atenção Importante">
          <p>Important information</p>
        </ExpertTip>
      );

      expect(screen.getByText('Atenção Importante')).toBeInTheDocument();
    });

    it('should render warning type with correct styling', () => {
      render(
        <ExpertTip type="warning" title="Warning">
          <p>Warning content</p>
        </ExpertTip>
      );

      const tip = screen.getByRole('complementary');
      expect(tip).toHaveClass('border-amber-300');
    });

    it('should render alert type', () => {
      render(
        <ExpertTip type="alert">
          <p>Alert content</p>
        </ExpertTip>
      );

      expect(screen.getByText('Quando Buscar Ajuda?')).toBeInTheDocument();
    });

    it('should render info type', () => {
      render(
        <ExpertTip type="info">
          <p>Info content</p>
        </ExpertTip>
      );

      expect(screen.getByText('Resumo Prático')).toBeInTheDocument();
    });
  });

  describe('Doctor Attribution', () => {
    it('should show doctor name when provided', () => {
      render(
        <ExpertTip doctorName="Dr. João Silva">
          <p>Medical advice</p>
        </ExpertTip>
      );

      expect(screen.getByText('Dr. João Silva')).toBeInTheDocument();
    });

    it('should show doctor role when provided', () => {
      render(
        <ExpertTip doctorName="Dr. João Silva" doctorRole="Oftalmologista - CRM 12345">
          <p>Medical advice</p>
        </ExpertTip>
      );

      expect(screen.getByText(/Oftalmologista - CRM 12345/i)).toBeInTheDocument();
    });
  });

  describe('CFM Compliance', () => {
    it('should show CFM disclaimer when required', () => {
      render(
        <ExpertTip
          disclaimer={{
            required: true,
            level: 'educational',
          }}
        >
          <p>Medical content</p>
        </ExpertTip>
      );

      expect(screen.getByText(/Aviso Médico CFM:/i)).toBeInTheDocument();
      expect(screen.getByText(/Este conteúdo tem propósito educativo/i)).toBeInTheDocument();
    });

    it('should show diagnostic disclaimer', () => {
      render(
        <ExpertTip
          disclaimer={{
            required: true,
            level: 'diagnostic',
          }}
        >
          <p>Diagnostic content</p>
        </ExpertTip>
      );

      expect(screen.getByText(/NÃO constitui diagnóstico médico/i)).toBeInTheDocument();
    });

    it('should show treatment disclaimer', () => {
      render(
        <ExpertTip
          disclaimer={{
            required: true,
            level: 'treatment',
          }}
        >
          <p>Treatment content</p>
        </ExpertTip>
      );

      expect(screen.getByText(/NÃO constitui prescrição médica/i)).toBeInTheDocument();
    });

    it('should use custom disclaimer text when provided', () => {
      render(
        <ExpertTip
          disclaimer={{
            required: true,
            text: 'Custom disclaimer text here',
          }}
        >
          <p>Content</p>
        </ExpertTip>
      );

      expect(screen.getByText('Custom disclaimer text here')).toBeInTheDocument();
    });

    it('should not show disclaimer when not required', () => {
      render(
        <ExpertTip
          disclaimer={{
            required: false,
          }}
        >
          <p>Content</p>
        </ExpertTip>
      );

      expect(screen.queryByText(/Aviso Médico CFM:/i)).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have complementary role', () => {
      render(
        <ExpertTip>
          <p>Content</p>
        </ExpertTip>
      );

      expect(screen.getByRole('complementary')).toBeInTheDocument();
    });

    it('should have aria-label', () => {
      render(
        <ExpertTip title="Test Title">
          <p>Content</p>
        </ExpertTip>
      );

      expect(screen.getByLabelText('Test Title')).toBeInTheDocument();
    });
  });
});

describe('InfoBox Component', () => {
  describe('Rendering', () => {
    it('should render with content', () => {
      render(
        <InfoBox>
          <p>Info box content</p>
        </InfoBox>
      );

      expect(screen.getByText('Info box content')).toBeInTheDocument();
    });

    it('should render with title', () => {
      render(
        <InfoBox title="Important Information">
          <p>Content</p>
        </InfoBox>
      );

      expect(screen.getByText('Important Information')).toBeInTheDocument();
    });

    it('should render tip type with emoji', () => {
      render(
        <InfoBox type="tip" title="Helpful Tip">
          <p>Tip content</p>
        </InfoBox>
      );

      const heading = screen.getByText('Helpful Tip').closest('h3');
      expect(heading?.textContent).toContain('💡');
    });

    it('should render warning type', () => {
      render(
        <InfoBox type="warning" title="Warning">
          <p>Warning content</p>
        </InfoBox>
      );

      const heading = screen.getByText('Warning').closest('h3');
      expect(heading?.textContent).toContain('⚠️');
    });

    it('should render success type', () => {
      render(
        <InfoBox type="success" title="Success">
          <p>Success content</p>
        </InfoBox>
      );

      const heading = screen.getByText('Success').closest('h3');
      expect(heading?.textContent).toContain('✓');
    });

    it('should render summary type', () => {
      render(
        <InfoBox type="summary" title="Summary">
          <p>Summary content</p>
        </InfoBox>
      );

      const heading = screen.getByText('Summary').closest('h3');
      expect(heading?.textContent).toContain('📋');
    });
  });

  describe('Accessibility', () => {
    it('should have complementary role', () => {
      render(
        <InfoBox>
          <p>Content</p>
        </InfoBox>
      );

      expect(screen.getByRole('complementary')).toBeInTheDocument();
    });

    it('should have default aria-label when no title', () => {
      render(
        <InfoBox>
          <p>Content</p>
        </InfoBox>
      );

      expect(screen.getByLabelText('Informação adicional')).toBeInTheDocument();
    });
  });
});

describe('LearningSummary Component', () => {
  const mockItems = ['Learn about eye health', 'Understand common conditions', 'Know when to see a doctor'];

  describe('Rendering', () => {
    it('should render with default title', () => {
      render(<LearningSummary items={mockItems} />);

      expect(screen.getByText('O que você vai aprender?')).toBeInTheDocument();
    });

    it('should render all learning items', () => {
      render(<LearningSummary items={mockItems} />);

      mockItems.forEach((item) => {
        expect(screen.getByText(item)).toBeInTheDocument();
      });
    });

    it('should calculate reading time automatically', () => {
      render(<LearningSummary items={mockItems} />);

      // 3 items * 1.5 = 4.5 rounded up = 5 minutes
      expect(screen.getByText(/~5 minutos/i)).toBeInTheDocument();
    });

    it('should use provided estimated reading time', () => {
      render(<LearningSummary items={mockItems} estimatedMinutes={10} />);

      expect(screen.getByText(/~10 minutos/i)).toBeInTheDocument();
    });

    it('should render with custom title', () => {
      render(<LearningSummary items={mockItems} title="Principais Tópicos" />);

      expect(screen.getByText('Principais Tópicos')).toBeInTheDocument();
    });

    it('should return null if no items', () => {
      const { container } = render(<LearningSummary items={[]} />);

      expect(container.firstChild).toBeNull();
    });
  });

  describe('Accessibility', () => {
    it('should have complementary role', () => {
      render(<LearningSummary items={mockItems} />);

      expect(screen.getByRole('complementary')).toBeInTheDocument();
    });

    it('should have proper heading with id', () => {
      render(<LearningSummary items={mockItems} />);

      const heading = screen.getByRole('heading', { name: 'O que você vai aprender?' });
      expect(heading).toHaveAttribute('id', 'learning-summary-title');
    });

    it('should have list role', () => {
      render(<LearningSummary items={mockItems} />);

      expect(screen.getByRole('list')).toBeInTheDocument();
    });
  });
});

describe('QuickTakeaways Component', () => {
  const mockItems = ['Regular exams prevent diseases', 'Early symptoms are often silent', 'Early treatment is essential'];

  describe('Rendering', () => {
    it('should render with default title', () => {
      render(<QuickTakeaways items={mockItems} />);

      expect(screen.getByText('O que você vai aprender?')).toBeInTheDocument();
    });

    it('should render all takeaway items', () => {
      render(<QuickTakeaways items={mockItems} />);

      mockItems.forEach((item) => {
        expect(screen.getByText(item)).toBeInTheDocument();
      });
    });

    it('should render with custom title', () => {
      render(<QuickTakeaways items={mockItems} title="Principais Pontos" />);

      expect(screen.getByText('Principais Pontos')).toBeInTheDocument();
    });

    it('should render decorative footer', () => {
      render(<QuickTakeaways items={mockItems} />);

      expect(screen.getByText(/Informação clara e confiável/i)).toBeInTheDocument();
    });

    it('should return null if no items', () => {
      const { container } = render(<QuickTakeaways items={[]} />);

      expect(container.firstChild).toBeNull();
    });
  });

  describe('Accessibility', () => {
    it('should have complementary role', () => {
      render(<QuickTakeaways items={mockItems} />);

      expect(screen.getByRole('complementary')).toBeInTheDocument();
    });

    it('should have aria-label', () => {
      render(<QuickTakeaways items={mockItems} />);

      expect(screen.getByLabelText('Resumo do que você vai aprender')).toBeInTheDocument();
    });

    it('should have list role', () => {
      render(<QuickTakeaways items={mockItems} />);

      expect(screen.getByRole('list')).toBeInTheDocument();
    });
  });
});
