import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import CategoryIcon from '@/components/blog/CategoryIcon';

describe('CategoryIcon', () => {
  const categories = [
    'Tecnologia',
    'Tecnologia e Inovação',
    'Tratamento',
    'Prevenção',
    'Guias Práticos',
    'Mitos e Verdades',
    'Dúvidas Frequentes',
    'Categoria Desconhecida'
  ];

  it('should render without crashing', () => {
    const { container } = render(<CategoryIcon category="Tecnologia" />);
    expect(container.querySelector('svg')).toBeTruthy();
  });

  it('should render for all known categories', () => {
    categories.forEach(category => {
      const { container } = render(<CategoryIcon category={category} />);
      const svg = container.querySelector('svg');
      
      expect(svg).toBeTruthy();
      expect(svg.classList.contains('w-12')).toBe(true);
      expect(svg.classList.contains('h-12')).toBe(true);
    });
  });

  it('should apply custom className', () => {
    const { container } = render(<CategoryIcon category="Tecnologia" className="w-24 h-24" />);
    const svg = container.querySelector('svg');
    
    expect(svg.classList.contains('w-24')).toBe(true);
    expect(svg.classList.contains('h-24')).toBe(true);
  });

  it('should handle undefined category', () => {
    const { container } = render(<CategoryIcon />);
    const svg = container.querySelector('svg');
    
    expect(svg).toBeTruthy();
  });

  it('should render default icon for unknown category', () => {
    const { container } = render(<CategoryIcon category="Unknown Category" />);
    const svg = container.querySelector('svg');
    
    expect(svg).toBeTruthy();
  });

  it('should be case-insensitive for category matching', () => {
    const { container: upper } = render(<CategoryIcon category="TECNOLOGIA" />);
    const { container: lower } = render(<CategoryIcon category="tecnologia" />);
    const { container: mixed } = render(<CategoryIcon category="TeCnOlOgIa" />);
    
    expect(upper.querySelector('svg')).toBeTruthy();
    expect(lower.querySelector('svg')).toBeTruthy();
    expect(mixed.querySelector('svg')).toBeTruthy();
  });

  it('should have aria-hidden for accessibility', () => {
    const { container } = render(<CategoryIcon category="Tecnologia" />);
    const wrapper = container.firstChild;
    
    expect(wrapper.getAttribute('aria-hidden')).toBe('true');
  });

  describe('Category-specific icons', () => {
    it('should render technology icon for Tecnologia', () => {
      const { container } = render(<CategoryIcon category="Tecnologia" />);
      const svg = container.querySelector('svg');
      const circles = svg.querySelectorAll('circle');
      
      expect(circles.length).toBeGreaterThan(0);
    });

    it('should render treatment icon for Tratamento', () => {
      const { container } = render(<CategoryIcon category="Tratamento" />);
      const svg = container.querySelector('svg');
      
      expect(svg).toBeTruthy();
    });

    it('should render prevention icon for Prevenção', () => {
      const { container } = render(<CategoryIcon category="Prevenção" />);
      const svg = container.querySelector('svg');
      
      expect(svg).toBeTruthy();
    });

    it('should render guide icon for Guias Práticos', () => {
      const { container } = render(<CategoryIcon category="Guias Práticos" />);
      const svg = container.querySelector('svg');
      
      expect(svg).toBeTruthy();
    });

    it('should render myth icon for Mitos e Verdades', () => {
      const { container } = render(<CategoryIcon category="Mitos e Verdades" />);
      const svg = container.querySelector('svg');
      
      expect(svg).toBeTruthy();
    });

    it('should render FAQ icon for Dúvidas Frequentes', () => {
      const { container } = render(<CategoryIcon category="Dúvidas Frequentes" />);
      const svg = container.querySelector('svg');
      
      expect(svg).toBeTruthy();
    });
  });
});
