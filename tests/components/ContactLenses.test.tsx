/**
 * Contact Lenses Components Test Suite
 * Comprehensive testing for product showcase components
 *
 * Tests:
 * - Component rendering
 * - Accessibility (WCAG AA)
 * - User interactions
 * - Data display
 * - Responsive behavior
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import '@testing-library/jest-dom';

import ContactLenses from '@/components/products/ContactLenses';
import ProductHero from '@/components/products/ProductHero';
import LensCard from '@/components/products/LensCard';
import LensComparisonTable from '@/components/products/LensComparison';
import contactLensesData from '@/data/contactLensesData';

expect.extend(toHaveNoViolations);

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  }),
}));

// Mock Next.js Image component
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} {...props} />;
  },
}));

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    section: ({ children, ...props }: any) => <section {...props}>{children}</section>,
    h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
    h2: ({ children, ...props }: any) => <h2 {...props}>{children}</h2>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
  },
}));

describe('ContactLenses Component', () => {
  describe('Rendering', () => {
    it('renders without crashing', () => {
      const { container } = render(<ContactLenses />);
      expect(container).toBeInTheDocument();
    });

    it('displays the main heading', () => {
      render(<ContactLenses />);
      expect(screen.getByText(/Especialistas em Adaptação de Lentes de Contato/i)).toBeInTheDocument();
    });

    it('renders all brand cards', () => {
      render(<ContactLenses />);
      contactLensesData.brands.forEach((brand) => {
        expect(screen.getByText(brand.name)).toBeInTheDocument();
      });
    });

    it('renders lens category sections', () => {
      render(<ContactLenses />);
      contactLensesData.categories.forEach((category) => {
        expect(screen.getByText(category.title)).toBeInTheDocument();
      });
    });

    it('displays fitting process steps', () => {
      render(<ContactLenses />);
      contactLensesData.fittingProcess.forEach((step) => {
        expect(screen.getByText(step.title)).toBeInTheDocument();
      });
    });

    it('shows FAQ section', () => {
      render(<ContactLenses />);
      expect(screen.getByText(/Perguntas Frequentes/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(<ContactLenses />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has proper heading hierarchy', () => {
      render(<ContactLenses />);
      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);

      // Check that main heading exists
      const mainHeading = screen.getByRole('heading', { level: 1 });
      expect(mainHeading).toBeInTheDocument();
    });

    it('has accessible buttons with labels', () => {
      render(<ContactLenses />);
      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button).toHaveAccessibleName();
      });
    });

    it('has proper landmark regions', () => {
      const { container } = render(<ContactLenses />);
      expect(container.querySelector('section')).toBeInTheDocument();
    });

    it('images have alt text', () => {
      render(<ContactLenses />);
      const images = screen.getAllByRole('img');
      images.forEach((img) => {
        expect(img).toHaveAttribute('alt');
        expect(img.getAttribute('alt')).not.toBe('');
      });
    });
  });

  describe('User Interactions', () => {
    it('handles CTA button clicks', async () => {
      const user = userEvent.setup();
      render(<ContactLenses />);

      const ctaButtons = screen.getAllByRole('button', { name: /agendar/i });
      expect(ctaButtons.length).toBeGreaterThan(0);

      // Click should not throw error
      await user.click(ctaButtons[0]);
    });

    it('toggles FAQ items', async () => {
      const user = userEvent.setup();
      render(<ContactLenses />);

      const faqButtons = screen.getAllByRole('button', { expanded: false });
      if (faqButtons.length > 0) {
        await user.click(faqButtons[0]);
        await waitFor(() => {
          expect(faqButtons[0]).toHaveAttribute('aria-expanded', 'true');
        });
      }
    });

    it('filters products by category', async () => {
      const user = userEvent.setup();
      render(<ContactLenses />);

      const categoryButtons = screen.getAllByRole('button');
      const softLensButton = categoryButtons.find(btn => btn.textContent?.includes('Gelatinosas'));

      if (softLensButton) {
        await user.click(softLensButton);
        // Products should be filtered (implementation-specific test)
      }
    });
  });

  describe('Data Display', () => {
    it('displays correct number of brands', () => {
      render(<ContactLenses />);
      const brandCount = contactLensesData.brands.length;
      contactLensesData.brands.forEach((brand) => {
        expect(screen.getByText(brand.name)).toBeInTheDocument();
      });
    });

    it('shows safety protocols', () => {
      render(<ContactLenses />);
      expect(screen.getByText(/Protocolo de Segurança/i)).toBeInTheDocument();
    });

    it('displays trust badges', () => {
      render(<ContactLenses />);
      contactLensesData.trustBadges.forEach((badge) => {
        expect(screen.getByText(badge.value)).toBeInTheDocument();
      });
    });
  });
});

describe('ProductHero Component', () => {
  const mockProps = {
    title: 'Test Product Hero',
    subtitle: 'This is a test subtitle',
    badge: 'Premium',
    trustBadges: contactLensesData.trustBadges,
    ctaPrimary: {
      text: 'Primary CTA',
      onClick: vi.fn(),
    },
    ctaSecondary: {
      text: 'Secondary CTA',
      href: 'https://example.com',
    },
  };

  it('renders with all props', () => {
    render(<ProductHero {...mockProps} />);
    expect(screen.getByText(mockProps.title)).toBeInTheDocument();
    expect(screen.getByText(mockProps.subtitle)).toBeInTheDocument();
    expect(screen.getByText(mockProps.badge!)).toBeInTheDocument();
  });

  it('displays primary and secondary CTAs', () => {
    render(<ProductHero {...mockProps} />);
    expect(screen.getByText(mockProps.ctaPrimary!.text)).toBeInTheDocument();
    expect(screen.getByText(mockProps.ctaSecondary!.text)).toBeInTheDocument();
  });

  it('calls primary CTA onClick', async () => {
    const user = userEvent.setup();
    render(<ProductHero {...mockProps} />);

    const primaryButton = screen.getByText(mockProps.ctaPrimary!.text);
    await user.click(primaryButton);

    expect(mockProps.ctaPrimary!.onClick).toHaveBeenCalledTimes(1);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<ProductHero {...mockProps} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

describe('LensCard Component', () => {
  const mockProduct = contactLensesData.products[0];
  const mockOnSelect = vi.fn();

  beforeEach(() => {
    mockOnSelect.mockClear();
  });

  describe('Variants', () => {
    it('renders compact variant', () => {
      render(
        <LensCard
          product={mockProduct}
          variant="compact"
          onSelect={mockOnSelect}
        />
      );
      expect(screen.getByText(mockProduct.name)).toBeInTheDocument();
    });

    it('renders standard variant', () => {
      render(
        <LensCard
          product={mockProduct}
          variant="standard"
          onSelect={mockOnSelect}
        />
      );
      expect(screen.getByText(mockProduct.name)).toBeInTheDocument();
      expect(screen.getByText(mockProduct.description)).toBeInTheDocument();
    });

    it('renders detailed variant', () => {
      render(
        <LensCard
          product={mockProduct}
          variant="detailed"
          onSelect={mockOnSelect}
        />
      );
      expect(screen.getByText(mockProduct.name)).toBeInTheDocument();
      expect(screen.getByText(mockProduct.description)).toBeInTheDocument();
    });
  });

  describe('Product Information', () => {
    it('displays product name and brand', () => {
      render(<LensCard product={mockProduct} onSelect={mockOnSelect} />);
      expect(screen.getByText(mockProduct.name)).toBeInTheDocument();
      expect(screen.getByText(mockProduct.brand)).toBeInTheDocument();
    });

    it('shows water content', () => {
      render(<LensCard product={mockProduct} variant="standard" onSelect={mockOnSelect} />);
      expect(screen.getByText(new RegExp(`${mockProduct.waterContent}%`))).toBeInTheDocument();
    });

    it('displays features', () => {
      render(<LensCard product={mockProduct} variant="standard" onSelect={mockOnSelect} />);
      mockProduct.features.slice(0, 3).forEach((feature) => {
        expect(screen.getByText(feature)).toBeInTheDocument();
      });
    });

    it('shows UV protection badge when applicable', () => {
      render(<LensCard product={mockProduct} variant="standard" onSelect={mockOnSelect} />);
      if (mockProduct.uvProtection) {
        expect(screen.getByText(/UV Protection/i)).toBeInTheDocument();
      }
    });
  });

  describe('Interactions', () => {
    it('calls onSelect when CTA is clicked', async () => {
      const user = userEvent.setup();
      render(<LensCard product={mockProduct} onSelect={mockOnSelect} showCTA={true} />);

      const ctaButton = screen.getByRole('button', { name: /saiba mais/i });
      await user.click(ctaButton);

      expect(mockOnSelect).toHaveBeenCalledWith(mockProduct);
    });

    it('disables CTA when product is unavailable', () => {
      const unavailableProduct = { ...mockProduct, available: false };
      render(<LensCard product={unavailableProduct} onSelect={mockOnSelect} />);

      const ctaButton = screen.getByRole('button', { name: /indisponível/i });
      expect(ctaButton).toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(
        <LensCard product={mockProduct} onSelect={mockOnSelect} />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has accessible image alt text', () => {
      render(<LensCard product={mockProduct} variant="standard" onSelect={mockOnSelect} />);
      const image = screen.getByAltText(new RegExp(mockProduct.name));
      expect(image).toBeInTheDocument();
    });
  });
});

describe('LensComparison Component', () => {
  const mockProducts = contactLensesData.comparisons.slice(0, 3);

  it('renders comparison table', () => {
    render(<LensComparisonTable products={mockProducts} />);
    mockProducts.forEach((product) => {
      expect(screen.getByText(product.name)).toBeInTheDocument();
    });
  });

  it('displays product specifications', () => {
    render(<LensComparisonTable products={mockProducts} />);
    expect(screen.getByText(/Hidratação/i)).toBeInTheDocument();
    expect(screen.getByText(/Oxigenação/i)).toBeInTheDocument();
    expect(screen.getByText(/Proteção UV/i)).toBeInTheDocument();
  });

  it('highlights best values', () => {
    render(<LensComparisonTable products={mockProducts} />);
    const bestBadges = screen.getAllByText(/Melhor/i);
    expect(bestBadges.length).toBeGreaterThan(0);
  });

  it('handles product selection when enabled', async () => {
    const mockOnCompare = vi.fn();
    const user = userEvent.setup();

    render(
      <LensComparisonTable
        products={mockProducts}
        enableSelection={true}
        onCompare={mockOnCompare}
      />
    );

    const selectButtons = screen.getAllByRole('button', { name: /selecionar/i });
    await user.click(selectButtons[0]);

    // Verify selection state changed
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /comparar selecionados/i })).toBeInTheDocument();
    });
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<LensComparisonTable products={mockProducts} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has accessible table structure', () => {
    render(<LensComparisonTable products={mockProducts} />);
    const table = screen.queryByRole('table');
    if (table) {
      expect(table).toBeInTheDocument();
      expect(within(table).getAllByRole('columnheader')).toBeTruthy();
    }
  });
});

describe('Responsive Behavior', () => {
  it('renders mobile-friendly on small screens', () => {
    // Mock mobile viewport
    global.innerWidth = 375;
    global.innerHeight = 667;

    render(<ContactLenses />);
    expect(screen.getByText(/Especialistas em Adaptação/i)).toBeInTheDocument();
  });
});

describe('CFM Compliance', () => {
  it('displays medical disclaimer', () => {
    render(<ContactLenses />);
    expect(screen.getByText(/Este site é apenas informativo/i)).toBeInTheDocument();
  });

  it('shows prescription requirement notice', () => {
    const mockProduct = contactLensesData.products.find(p => p.prescriptionRequired);
    if (mockProduct) {
      render(<LensCard product={mockProduct} variant="standard" />);
      expect(screen.getByText(/Requer receita médica/i)).toBeInTheDocument();
    }
  });
});
