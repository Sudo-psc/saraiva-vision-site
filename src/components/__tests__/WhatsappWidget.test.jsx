import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import WhatsappWidget from '../WhatsappWidget';

const TEST_PHONE = '5533998601427';

describe('WhatsappWidget Component', () => {
  it('renders WhatsApp widget', () => {
    render(<WhatsappWidget phoneNumber={TEST_PHONE} />);
    
    // Check if widget is rendered (it's a link, not button)
    const widget = screen.getByRole('link');
    expect(widget).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(<WhatsappWidget phoneNumber={TEST_PHONE} />);
    
    const widget = screen.getByRole('link');
    expect(widget).toHaveAttribute('aria-label');
    expect(widget.getAttribute('aria-label')).toContain('WhatsApp');
  });

  it('opens WhatsApp when clicked', () => {
    render(<WhatsappWidget phoneNumber={TEST_PHONE} />);
    
    const widget = screen.getByRole('link');
    expect(widget).toHaveAttribute('href', `https://wa.me/${TEST_PHONE}`);
    expect(widget).toHaveAttribute('target', '_blank');
    expect(widget).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('has proper styling for fixed positioning', () => {
    render(<WhatsappWidget phoneNumber={TEST_PHONE} />);
    
    // Check the container div (not the link itself)
    const container = screen.getByRole('link').parentElement;
    expect(container).toHaveClass('fixed');
    expect(container.className).toMatch(/bottom-(20|28)/); // bottom-20 on mobile, bottom-28 on desktop
    expect(container.className).toMatch(/right-(4|6)/); // right-4 on mobile, right-6 on desktop
  });

  it('displays WhatsApp icon', () => {
    render(<WhatsappWidget phoneNumber={TEST_PHONE} />);
    
    // Check for MessageCircle icon (SVG)
    const widget = screen.getByRole('link');
    const icon = widget.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('has proper z-index for overlay', () => {
    render(<WhatsappWidget phoneNumber={TEST_PHONE} />);
    
    const container = screen.getByRole('link').parentElement;
    expect(container.className).toContain('z-[80]');
  });

  it('provides visual feedback on hover', () => {
    render(<WhatsappWidget phoneNumber={TEST_PHONE} />);
    
    const widget = screen.getByRole('link');
    expect(widget.className).toContain('hover:');
  });
});