import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import WhatsappWidget from '../WhatsappWidget';

// Mock WhatsApp hook
vi.mock('@/hooks/useWhatsApp', () => ({
  useWhatsApp: () => ({
    generateWhatsAppUrl: vi.fn(() => 'https://wa.me/5533998601427'),
    defaultWhatsAppUrl: 'https://wa.me/5533998601427',
    openFloatingCTA: vi.fn(),
    openWhatsApp: vi.fn(),
    whatsappNumber: '5533998601427'
  })
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    button: ({ children, ...props }) => <button {...props}>{children}</button>
  }
}));

describe('WhatsappWidget Component', () => {
  it('renders WhatsApp widget', () => {
    render(<WhatsappWidget />);
    
    // Check if widget is rendered
    const widget = screen.getByRole('button');
    expect(widget).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(<WhatsappWidget />);
    
    const widget = screen.getByRole('button');
    expect(widget).toHaveAttribute('aria-label');
    expect(widget).toHaveAttribute('title');
  });

  it('opens WhatsApp when clicked', () => {
    const mockOpenWhatsApp = vi.fn();
    vi.mocked(require('@/hooks/useWhatsApp').useWhatsApp).mockReturnValue({
      generateWhatsAppUrl: vi.fn(() => 'https://wa.me/5533998601427'),
      defaultWhatsAppUrl: 'https://wa.me/5533998601427',
      openFloatingCTA: vi.fn(),
      openWhatsApp: mockOpenWhatsApp,
      whatsappNumber: '5533998601427'
    });

    render(<WhatsappWidget />);
    
    const widget = screen.getByRole('button');
    fireEvent.click(widget);
    
    expect(mockOpenWhatsApp).toHaveBeenCalled();
  });

  it('has proper styling for fixed positioning', () => {
    render(<WhatsappWidget />);
    
    const widget = screen.getByRole('button');
    expect(widget).toHaveClass('fixed');
    expect(widget).toHaveClass('bottom-6');
    expect(widget).toHaveClass('right-6');
  });

  it('displays WhatsApp icon', () => {
    render(<WhatsappWidget />);
    
    // Check for WhatsApp icon (SVG or image)
    const widget = screen.getByRole('button');
    const icon = widget.querySelector('svg, img');
    expect(icon).toBeInTheDocument();
  });

  it('has proper z-index for overlay', () => {
    render(<WhatsappWidget />);
    
    const widget = screen.getByRole('button');
    expect(widget).toHaveClass('z-50');
  });

  it('provides visual feedback on hover', () => {
    render(<WhatsappWidget />);
    
    const widget = screen.getByRole('button');
    expect(widget.className).toContain('hover:');
  });
});