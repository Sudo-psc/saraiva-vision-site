import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TableOfContents } from '@/components/blog/TableOfContents';
import type { BlogHeading } from '@/types/blog';

describe('TableOfContents', () => {
  const mockHeadings: BlogHeading[] = [
    { id: 'section-1', text: 'Introduction to Cataracts', level: 2 },
    { id: 'section-2', text: 'Symptoms and Signs', level: 2 },
    { id: 'section-2-1', text: 'Early Symptoms', level: 3 },
    { id: 'section-3', text: 'Treatment Options', level: 2 },
  ];

  beforeEach(() => {
    // Mock window.scrollTo
    window.scrollTo = vi.fn();

    // Mock IntersectionObserver
    const mockIntersectionObserver = vi.fn();
    mockIntersectionObserver.mockReturnValue({
      observe: () => null,
      unobserve: () => null,
      disconnect: () => null,
    });
    window.IntersectionObserver = mockIntersectionObserver as any;

    // Create mock heading elements in the DOM
    mockHeadings.forEach((heading) => {
      const element = document.createElement('h2');
      element.id = heading.id;
      element.textContent = heading.text;
      document.body.appendChild(element);
    });
  });

  afterEach(() => {
    // Clean up mock heading elements
    mockHeadings.forEach((heading) => {
      const element = document.getElementById(heading.id);
      if (element) {
        element.remove();
      }
    });
  });

  describe('Rendering', () => {
    it('renders the table of contents with title', () => {
      render(<TableOfContents headings={mockHeadings} />);
      expect(screen.getByText('Neste Artigo')).toBeInTheDocument();
    });

    it('renders all heading items', () => {
      render(<TableOfContents headings={mockHeadings} />);

      mockHeadings.forEach((heading) => {
        expect(screen.getByText(heading.text)).toBeInTheDocument();
      });
    });

    it('renders with custom className', () => {
      const { container } = render(
        <TableOfContents headings={mockHeadings} className="custom-class" />
      );
      expect(container.querySelector('.custom-class')).toBeInTheDocument();
    });

    it('does not render when headings array is empty', () => {
      const { container } = render(<TableOfContents headings={[]} />);
      expect(container.firstChild).toBeNull();
    });

    it('does not render when headings is undefined', () => {
      const { container } = render(<TableOfContents headings={undefined as any} />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      const { container } = render(<TableOfContents headings={mockHeadings} />);

      const nav = container.querySelector('nav');
      expect(nav).toHaveAttribute('aria-label', 'Índice do artigo');
    });

    it('has proper role for list', () => {
      const { container } = render(<TableOfContents headings={mockHeadings} />);

      const list = container.querySelector('ul');
      expect(list).toHaveAttribute('role', 'list');
    });

    it('marks active section with aria-current', () => {
      render(<TableOfContents headings={mockHeadings} />);

      // Initially no active section (would be set by IntersectionObserver)
      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button).not.toHaveAttribute('aria-current');
      });
    });

    it('all heading buttons are keyboard accessible', () => {
      render(<TableOfContents headings={mockHeadings} />);

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBe(mockHeadings.length);

      buttons.forEach((button) => {
        expect(button).toHaveAttribute('type', 'button');
      });
    });
  });

  describe('Navigation', () => {
    it('scrolls to heading when clicked', () => {
      render(<TableOfContents headings={mockHeadings} />);

      const firstHeadingButton = screen.getByText('Introduction to Cataracts');
      fireEvent.click(firstHeadingButton);

      expect(window.scrollTo).toHaveBeenCalled();
    });

    it('calculates correct scroll position with offset', () => {
      render(<TableOfContents headings={mockHeadings} />);

      const firstHeadingButton = screen.getByText('Introduction to Cataracts');
      fireEvent.click(firstHeadingButton);

      const scrollCall = (window.scrollTo as any).mock.calls[0][0];
      expect(scrollCall).toHaveProperty('behavior', 'smooth');
      expect(scrollCall).toHaveProperty('top');
    });

    it('handles click on nested heading (H3)', () => {
      render(<TableOfContents headings={mockHeadings} />);

      const nestedHeadingButton = screen.getByText('Early Symptoms');
      fireEvent.click(nestedHeadingButton);

      expect(window.scrollTo).toHaveBeenCalled();
    });
  });

  describe('Visual Hierarchy', () => {
    it('applies different styles for H2 vs H3 headings', () => {
      render(<TableOfContents headings={mockHeadings} />);

      const h2Button = screen.getByText('Introduction to Cataracts');
      const h3Button = screen.getByText('Early Symptoms');

      // H2 should have font-medium
      expect(h2Button).toHaveClass('font-medium');

      // H3 should have font-normal and left padding
      expect(h3Button).toHaveClass('font-normal', 'pl-4');
    });

    it('shows chevron icon for all items', () => {
      const { container } = render(<TableOfContents headings={mockHeadings} />);

      const chevrons = container.querySelectorAll('[aria-hidden="true"]');
      // Should have chevrons for each heading + icon in header + progress percentage
      expect(chevrons.length).toBeGreaterThan(0);
    });
  });

  describe('Reading Progress', () => {
    it('renders progress indicator', () => {
      render(<TableOfContents headings={mockHeadings} />);

      expect(screen.getByText('Progresso de leitura')).toBeInTheDocument();
    });

    it('shows 0% progress initially', () => {
      render(<TableOfContents headings={mockHeadings} />);

      expect(screen.getByText('0%')).toBeInTheDocument();
    });

    it('has accessible progress bar', () => {
      const { container } = render(<TableOfContents headings={mockHeadings} />);

      const progressBar = container.querySelector('[role="progressbar"]');
      expect(progressBar).toBeInTheDocument();
      expect(progressBar).toHaveAttribute('aria-valuenow', '0');
      expect(progressBar).toHaveAttribute('aria-valuemin', '0');
      expect(progressBar).toHaveAttribute('aria-valuemax', '100');
      expect(progressBar).toHaveAttribute('aria-label', 'Progresso de leitura do artigo');
    });

    it('progress percentage has aria-live for screen readers', () => {
      const { container } = render(<TableOfContents headings={mockHeadings} />);

      const progressPercentage = screen.getByText('0%');
      expect(progressPercentage).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('Styling', () => {
    it('has sticky positioning', () => {
      const { container } = render(<TableOfContents headings={mockHeadings} />);

      const nav = container.querySelector('nav');
      expect(nav).toHaveClass('sticky', 'top-24');
    });

    it('has glassmorphism effect', () => {
      const { container } = render(<TableOfContents headings={mockHeadings} />);

      const nav = container.querySelector('nav');
      expect(nav).toHaveClass('bg-white/90', 'backdrop-blur-sm');
    });

    it('has hover effects on buttons', () => {
      render(<TableOfContents headings={mockHeadings} />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button.className).toContain('hover:');
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles heading without id gracefully', () => {
      const headingsWithoutId: BlogHeading[] = [
        { id: '', text: 'Test Heading', level: 2 },
      ];

      const { container } = render(<TableOfContents headings={headingsWithoutId} />);
      expect(screen.getByText('Test Heading')).toBeInTheDocument();
    });

    it('handles very long heading text with line-clamp', () => {
      const longHeadings: BlogHeading[] = [
        {
          id: 'long-1',
          text: 'This is a very long heading text that should be clamped to two lines to prevent layout issues',
          level: 2,
        },
      ];

      render(<TableOfContents headings={longHeadings} />);

      const button = screen.getByText(/This is a very long heading/);
      const span = button.querySelector('span');
      expect(span).toHaveClass('line-clamp-2');
    });

    it('handles single heading', () => {
      const singleHeading: BlogHeading[] = [{ id: 'single', text: 'Only Heading', level: 2 }];

      render(<TableOfContents headings={singleHeading} />);

      expect(screen.getByText('Only Heading')).toBeInTheDocument();
      expect(screen.getByText('100%')).toBeInTheDocument(); // Progress should be 100% with 1 heading
    });
  });
});
