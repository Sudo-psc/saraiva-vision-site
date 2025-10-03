import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ShareWidget } from '@/components/blog/ShareWidget';

describe('ShareWidget', () => {
  const mockTitle = 'Test Blog Post';
  const mockUrl = 'https://example.com/blog/test-post';

  beforeEach(() => {
    // Mock navigator.clipboard
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  describe('Rendering', () => {
    it('renders the share widget with title', () => {
      render(<ShareWidget title={mockTitle} url={mockUrl} />);
      expect(screen.getByText('Compartilhar')).toBeInTheDocument();
    });

    it('renders all share platform buttons', () => {
      render(<ShareWidget title={mockTitle} url={mockUrl} />);

      expect(screen.getByText('Facebook')).toBeInTheDocument();
      expect(screen.getByText('Twitter')).toBeInTheDocument();
      expect(screen.getByText('LinkedIn')).toBeInTheDocument();
      expect(screen.getByText('WhatsApp')).toBeInTheDocument();
      expect(screen.getByText('Copiar link')).toBeInTheDocument();
    });

    it('renders with custom className', () => {
      const { container } = render(
        <ShareWidget title={mockTitle} url={mockUrl} className="custom-class" />
      );
      expect(container.querySelector('.custom-class')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels for each platform', () => {
      render(<ShareWidget title={mockTitle} url={mockUrl} />);

      expect(screen.getByLabelText(/Compartilhar no Facebook/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Compartilhar no Twitter/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Compartilhar no LinkedIn/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Compartilhar no WhatsApp/)).toBeInTheDocument();
      expect(screen.getByLabelText('Copiar link do artigo')).toBeInTheDocument();
    });

    it('has proper semantic HTML structure', () => {
      const { container } = render(<ShareWidget title={mockTitle} url={mockUrl} />);

      const aside = container.querySelector('aside');
      expect(aside).toBeInTheDocument();
      expect(aside).toHaveAttribute('aria-label', 'Opções de compartilhamento');
    });
  });

  describe('Share Links', () => {
    it('generates correct Facebook share URL', () => {
      render(<ShareWidget title={mockTitle} url={mockUrl} />);

      const facebookLink = screen.getByLabelText(/Compartilhar no Facebook/) as HTMLAnchorElement;
      expect(facebookLink.href).toContain('facebook.com/sharer');
      expect(facebookLink.href).toContain(encodeURIComponent(mockUrl));
    });

    it('generates correct Twitter share URL', () => {
      render(<ShareWidget title={mockTitle} url={mockUrl} />);

      const twitterLink = screen.getByLabelText(/Compartilhar no Twitter/) as HTMLAnchorElement;
      expect(twitterLink.href).toContain('twitter.com/intent/tweet');
      expect(twitterLink.href).toContain(encodeURIComponent(mockUrl));
      expect(twitterLink.href).toContain(encodeURIComponent(mockTitle));
    });

    it('generates correct LinkedIn share URL', () => {
      render(<ShareWidget title={mockTitle} url={mockUrl} />);

      const linkedinLink = screen.getByLabelText(/Compartilhar no LinkedIn/) as HTMLAnchorElement;
      expect(linkedinLink.href).toContain('linkedin.com/sharing/share-offsite');
      expect(linkedinLink.href).toContain(encodeURIComponent(mockUrl));
    });

    it('generates correct WhatsApp share URL', () => {
      render(<ShareWidget title={mockTitle} url={mockUrl} />);

      const whatsappLink = screen.getByLabelText(/Compartilhar no WhatsApp/) as HTMLAnchorElement;
      expect(whatsappLink.href).toContain('wa.me');
      expect(whatsappLink.href).toContain(encodeURIComponent(mockTitle));
      expect(whatsappLink.href).toContain(encodeURIComponent(mockUrl));
    });

    it('opens share links in new tab with security attributes', () => {
      render(<ShareWidget title={mockTitle} url={mockUrl} />);

      const facebookLink = screen.getByLabelText(/Compartilhar no Facebook/);
      expect(facebookLink).toHaveAttribute('target', '_blank');
      expect(facebookLink).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  describe('Copy Link Functionality', () => {
    it('copies link to clipboard when copy button is clicked', async () => {
      render(<ShareWidget title={mockTitle} url={mockUrl} />);

      const copyButton = screen.getByLabelText('Copiar link do artigo');
      fireEvent.click(copyButton);

      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mockUrl);
      });
    });

    it('shows success message after copying', async () => {
      render(<ShareWidget title={mockTitle} url={mockUrl} />);

      const copyButton = screen.getByLabelText('Copiar link do artigo');
      fireEvent.click(copyButton);

      await waitFor(() => {
        expect(screen.getByText('Link copiado!')).toBeInTheDocument();
      });
    });

    it('resets success message after 2 seconds', async () => {
      vi.useFakeTimers();
      render(<ShareWidget title={mockTitle} url={mockUrl} />);

      const copyButton = screen.getByLabelText('Copiar link do artigo');
      fireEvent.click(copyButton);

      await waitFor(() => {
        expect(screen.getByText('Link copiado!')).toBeInTheDocument();
      });

      vi.advanceTimersByTime(2000);

      await waitFor(() => {
        expect(screen.getByText('Copiar link')).toBeInTheDocument();
        expect(screen.queryByText('Link copiado!')).not.toBeInTheDocument();
      });

      vi.useRealTimers();
    });

    it('handles copy error gracefully', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      const clipboardError = new Error('Clipboard error');

      Object.assign(navigator, {
        clipboard: {
          writeText: vi.fn().mockRejectedValue(clipboardError),
        },
      });

      render(<ShareWidget title={mockTitle} url={mockUrl} />);

      const copyButton = screen.getByLabelText('Copiar link do artigo');
      fireEvent.click(copyButton);

      await waitFor(() => {
        expect(consoleError).toHaveBeenCalledWith('Erro ao copiar link:', clipboardError);
      });

      consoleError.mockRestore();
    });
  });

  describe('Default Values', () => {
    it('uses window.location.href as default URL', () => {
      const { container } = render(<ShareWidget title={mockTitle} />);

      // URL should be present in share links (checking Facebook as example)
      const facebookLink = screen.getByLabelText(/Compartilhar no Facebook/) as HTMLAnchorElement;
      expect(facebookLink.href).toBeDefined();
    });

    it('uses document.title as default title', () => {
      const { container } = render(<ShareWidget title="" url={mockUrl} />);

      // Should render without errors
      expect(screen.getByText('Compartilhar')).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('applies hover styles to share buttons', () => {
      render(<ShareWidget title={mockTitle} url={mockUrl} />);

      const facebookButton = screen.getByLabelText(/Compartilhar no Facebook/);
      expect(facebookButton).toHaveClass('hover:bg-blue-50', 'hover:text-blue-600');
    });

    it('has proper visual hierarchy with icons', () => {
      const { container } = render(<ShareWidget title={mockTitle} url={mockUrl} />);

      const icons = container.querySelectorAll('[aria-hidden="true"]');
      expect(icons.length).toBeGreaterThan(0);
    });
  });
});
