import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AuthorProfile } from '@/components/blog/AuthorProfile';

describe('AuthorProfile', () => {
  const defaultProps = {
    name: 'Dr. Philipe Saraiva Cruz',
    role: 'Oftalmologista',
    crm: 'CRM-MG 69.870',
    specialty: 'Cirurgia Refrativa e Catarata',
    image: '/img/team/dr-philipe.jpg',
    bio: 'Especialista em oftalmologia com mais de 10 anos de experiência.',
    email: 'contato@saraivavision.com.br',
    phone: '(33) 99860-1427',
  };

  describe('Rendering', () => {
    it('renders author name', () => {
      render(<AuthorProfile {...defaultProps} />);
      expect(screen.getByText('Dr. Philipe Saraiva Cruz')).toBeInTheDocument();
    });

    it('renders author role', () => {
      render(<AuthorProfile {...defaultProps} />);
      expect(screen.getByText('Oftalmologista')).toBeInTheDocument();
    });

    it('renders CRM registration', () => {
      render(<AuthorProfile {...defaultProps} />);
      expect(screen.getByText('CRM-MG 69.870')).toBeInTheDocument();
    });

    it('renders specialty', () => {
      render(<AuthorProfile {...defaultProps} />);
      expect(screen.getByText('Especialidade')).toBeInTheDocument();
      expect(screen.getByText('Cirurgia Refrativa e Catarata')).toBeInTheDocument();
    });

    it('renders bio', () => {
      render(<AuthorProfile {...defaultProps} />);
      expect(screen.getByText(/Especialista em oftalmologia/)).toBeInTheDocument();
    });

    it('renders with default values when props not provided', () => {
      render(<AuthorProfile />);
      expect(screen.getByText('Dr. Philipe Saraiva Cruz')).toBeInTheDocument();
      expect(screen.getByText('Oftalmologista')).toBeInTheDocument();
    });

    it('renders with custom className', () => {
      const { container } = render(<AuthorProfile {...defaultProps} className="custom-class" />);
      expect(container.querySelector('.custom-class')).toBeInTheDocument();
    });
  });

  describe('Contact Information', () => {
    it('hides contact info by default', () => {
      render(<AuthorProfile {...defaultProps} />);
      expect(screen.queryByText('Contato')).not.toBeInTheDocument();
    });

    it('shows contact info when showContact is true', () => {
      render(<AuthorProfile {...defaultProps} showContact={true} />);
      expect(screen.getByText('Contato')).toBeInTheDocument();
    });

    it('renders email link when contact is shown', () => {
      render(<AuthorProfile {...defaultProps} showContact={true} />);

      const emailLink = screen.getByText('contato@saraivavision.com.br') as HTMLAnchorElement;
      expect(emailLink).toBeInTheDocument();
      expect(emailLink.href).toBe('mailto:contato@saraivavision.com.br');
    });

    it('renders phone link when contact is shown', () => {
      render(<AuthorProfile {...defaultProps} showContact={true} />);

      const phoneLink = screen.getByText('(33) 99860-1427') as HTMLAnchorElement;
      expect(phoneLink).toBeInTheDocument();
      expect(phoneLink.href).toBe('tel:33998601427');
    });

    it('strips non-numeric characters from phone href', () => {
      render(<AuthorProfile {...defaultProps} phone="(33) 9 9860-1427" showContact={true} />);

      const phoneLink = screen.getByText('(33) 9 9860-1427') as HTMLAnchorElement;
      expect(phoneLink.href).toBe('tel:33998601427');
    });
  });

  describe('Image Handling', () => {
    it('renders author image with Next.js Image', () => {
      render(<AuthorProfile {...defaultProps} />);

      const image = screen.getByAlt('Foto de Dr. Philipe Saraiva Cruz') as HTMLImageElement;
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src');
    });

    it('has correct image dimensions', () => {
      render(<AuthorProfile {...defaultProps} />);

      const image = screen.getByAlt('Foto de Dr. Philipe Saraiva Cruz') as HTMLImageElement;
      expect(image).toHaveAttribute('width', '80');
      expect(image).toHaveAttribute('height', '80');
    });

    it('has proper image styling', () => {
      render(<AuthorProfile {...defaultProps} />);

      const image = screen.getByAlt('Foto de Dr. Philipe Saraiva Cruz');
      expect(image).toHaveClass('rounded-full', 'border-4', 'border-white');
    });
  });

  describe('Credibility Indicators', () => {
    it('renders verified badge', () => {
      const { container } = render(<AuthorProfile {...defaultProps} />);

      expect(screen.getByText('Verificado')).toBeInTheDocument();
      expect(container.querySelector('[aria-label="Médico verificado"]')).toBeInTheDocument();
    });

    it('renders specialist badge', () => {
      render(<AuthorProfile {...defaultProps} />);
      expect(screen.getByText('Especialista')).toBeInTheDocument();
    });

    it('renders award icon for verification', () => {
      const { container } = render(<AuthorProfile {...defaultProps} />);

      const awardIcons = container.querySelectorAll('[aria-hidden="true"]');
      expect(awardIcons.length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA label for profile section', () => {
      const { container } = render(<AuthorProfile {...defaultProps} />);

      const aside = container.querySelector('aside');
      expect(aside).toHaveAttribute('aria-label', 'Perfil do autor');
    });

    it('uses semantic HTML with aside element', () => {
      const { container } = render(<AuthorProfile {...defaultProps} />);

      expect(container.querySelector('aside')).toBeInTheDocument();
    });

    it('has proper heading hierarchy', () => {
      render(<AuthorProfile {...defaultProps} />);

      const h3 = screen.getByText('Dr. Philipe Saraiva Cruz');
      expect(h3.tagName).toBe('H3');
    });

    it('icons are properly hidden from screen readers', () => {
      const { container } = render(<AuthorProfile {...defaultProps} />);

      const icons = container.querySelectorAll('[aria-hidden="true"]');
      icons.forEach((icon) => {
        expect(icon).toHaveAttribute('aria-hidden', 'true');
      });
    });

    it('contact links have hover states for keyboard users', () => {
      render(<AuthorProfile {...defaultProps} showContact={true} />);

      const emailLink = screen.getByText('contato@saraivavision.com.br');
      expect(emailLink.className).toContain('hover:');
    });
  });

  describe('Styling', () => {
    it('has sticky positioning', () => {
      const { container } = render(<AuthorProfile {...defaultProps} />);

      const aside = container.querySelector('aside');
      expect(aside).toHaveClass('sticky', 'top-24');
    });

    it('has gradient background', () => {
      const { container } = render(<AuthorProfile {...defaultProps} />);

      const aside = container.querySelector('aside');
      expect(aside).toHaveClass('bg-gradient-to-br', 'from-blue-50', 'to-white');
    });

    it('has proper spacing and borders', () => {
      const { container } = render(<AuthorProfile {...defaultProps} />);

      const aside = container.querySelector('aside');
      expect(aside).toHaveClass('p-6', 'rounded-2xl', 'shadow-lg', 'border', 'border-blue-100');
    });

    it('specialty badge has distinct styling', () => {
      const { container } = render(<AuthorProfile {...defaultProps} />);

      const specialtySection = screen.getByText('Especialidade').parentElement;
      expect(specialtySection).toHaveClass(
        'bg-white',
        'rounded-lg',
        'p-3',
        'border',
        'border-blue-100'
      );
    });
  });

  describe('Edge Cases', () => {
    it('handles missing image gracefully', () => {
      render(<AuthorProfile {...defaultProps} image="" />);
      // Should still render without crashing
      expect(screen.getByText('Dr. Philipe Saraiva Cruz')).toBeInTheDocument();
    });

    it('handles very long bio text', () => {
      const longBio =
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(10);
      render(<AuthorProfile {...defaultProps} bio={longBio} />);

      expect(screen.getByText(longBio)).toBeInTheDocument();
    });

    it('handles special characters in name', () => {
      render(<AuthorProfile {...defaultProps} name="Dr. José María García-López" />);
      expect(screen.getByText('Dr. José María García-López')).toBeInTheDocument();
    });

    it('handles email with break-all class for long addresses', () => {
      const longEmail = 'very.long.email.address@saraivavision.com.br';
      render(<AuthorProfile {...defaultProps} email={longEmail} showContact={true} />);

      const emailSpan = screen.getByText(longEmail);
      expect(emailSpan).toHaveClass('break-all');
    });
  });

  describe('Custom Props', () => {
    it('accepts custom name', () => {
      render(<AuthorProfile name="Dra. Maria Santos" />);
      expect(screen.getByText('Dra. Maria Santos')).toBeInTheDocument();
    });

    it('accepts custom role', () => {
      render(<AuthorProfile role="Cirurgião Oftalmologista" />);
      expect(screen.getByText('Cirurgião Oftalmologista')).toBeInTheDocument();
    });

    it('accepts custom specialty', () => {
      render(<AuthorProfile specialty="Glaucoma e Retina" />);
      expect(screen.getByText('Glaucoma e Retina')).toBeInTheDocument();
    });

    it('accepts custom bio', () => {
      const customBio = 'Custom biography text';
      render(<AuthorProfile bio={customBio} />);
      expect(screen.getByText(customBio)).toBeInTheDocument();
    });
  });
});
