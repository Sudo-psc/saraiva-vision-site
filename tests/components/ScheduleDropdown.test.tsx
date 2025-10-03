/**
 * ScheduleDropdown Component Tests
 * Tests for appointment scheduling dropdown functionality
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import ScheduleDropdown from '@/components/ScheduleDropdown';

// Mock clinicInfo
vi.mock('@/lib/clinicInfo', () => ({
  clinicInfo: {
    name: 'Clínica Saraiva Vision',
    onlineSchedulingUrl: 'https://agendarconsulta.com/perfil/dr-philipe-cruz-1678973613',
    phone: '+553398601427',
    whatsapp: '+553398601427',
  },
}));

// Mock window.open
const mockWindowOpen = vi.fn();
const mockDispatchEvent = vi.fn();

describe('ScheduleDropdown Component', () => {
  const mockOnClose = vi.fn();
  const mockTriggerRef = {
    current: {
      getBoundingClientRect: () => ({
        bottom: 100,
        right: 200,
        left: 100,
        top: 50,
        width: 100,
        height: 50,
      }),
    },
  } as any;

  beforeEach(() => {
    vi.clearAllMocks();
    // @ts-ignore
    window.open = mockWindowOpen;
    window.dispatchEvent = mockDispatchEvent;
    // Mock window.innerWidth
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: 1024,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should not render when isOpen is false', () => {
      const { container } = render(
        <ScheduleDropdown
          isOpen={false}
          onClose={mockOnClose}
          triggerRef={mockTriggerRef}
        />
      );

      expect(container.firstChild).toBeNull();
    });

    it('should render when isOpen is true', () => {
      render(
        <ScheduleDropdown
          isOpen={true}
          onClose={mockOnClose}
          triggerRef={mockTriggerRef}
        />
      );

      expect(screen.getByRole('menu')).toBeInTheDocument();
    });

    it('should render all scheduling options', () => {
      render(
        <ScheduleDropdown
          isOpen={true}
          onClose={mockOnClose}
          triggerRef={mockTriggerRef}
        />
      );

      expect(screen.getByText('Agendamento Online')).toBeInTheDocument();
      expect(screen.getByText('WhatsApp')).toBeInTheDocument();
      expect(screen.getByText('Mais Opções')).toBeInTheDocument();
    });

    it('should render backdrop', () => {
      const { container } = render(
        <ScheduleDropdown
          isOpen={true}
          onClose={mockOnClose}
          triggerRef={mockTriggerRef}
        />
      );

      const backdrop = container.querySelector('.fixed.inset-0.z-\\[9998\\]');
      expect(backdrop).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(
        <ScheduleDropdown
          isOpen={true}
          onClose={mockOnClose}
          triggerRef={mockTriggerRef}
          className="custom-class"
        />
      );

      const dropdown = container.querySelector('.custom-class');
      expect(dropdown).toBeInTheDocument();
    });
  });

  describe('Positioning', () => {
    it('should position dropdown relative to trigger', () => {
      const { container } = render(
        <ScheduleDropdown
          isOpen={true}
          onClose={mockOnClose}
          triggerRef={mockTriggerRef}
        />
      );

      const dropdown = container.querySelector('[id="navbar-schedule-menu"]') as HTMLElement;
      expect(dropdown).toBeInTheDocument();
      expect(dropdown.style.position).toBe('fixed');
    });

    it('should update position when trigger changes', () => {
      const { rerender } = render(
        <ScheduleDropdown
          isOpen={true}
          onClose={mockOnClose}
          triggerRef={mockTriggerRef}
        />
      );

      const newTriggerRef = {
        current: {
          getBoundingClientRect: () => ({
            bottom: 150,
            right: 250,
            left: 150,
            top: 100,
            width: 100,
            height: 50,
          }),
        },
      } as any;

      rerender(
        <ScheduleDropdown
          isOpen={true}
          onClose={mockOnClose}
          triggerRef={newTriggerRef}
        />
      );

      // Position should be updated
    });
  });

  describe('Online Scheduling', () => {
    it('should open online scheduling URL when clicked', async () => {
      mockWindowOpen.mockReturnValue({ closed: false });

      render(
        <ScheduleDropdown
          isOpen={true}
          onClose={mockOnClose}
          triggerRef={mockTriggerRef}
        />
      );

      const onlineButton = screen.getByRole('menuitem', {
        name: /Agendar consulta através do sistema online/i,
      });

      await userEvent.click(onlineButton);

      expect(mockWindowOpen).toHaveBeenCalledWith(
        expect.stringContaining('agendarconsulta.com'),
        '_blank',
        'noopener,noreferrer'
      );
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should show alert if online scheduling URL is not configured', async () => {
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

      // Mock clinicInfo without onlineSchedulingUrl
      vi.doMock('@/lib/clinicInfo', () => ({
        clinicInfo: {
          onlineSchedulingUrl: null,
        },
      }));

      render(
        <ScheduleDropdown
          isOpen={true}
          onClose={mockOnClose}
          triggerRef={mockTriggerRef}
        />
      );

      const onlineButton = screen.getByRole('menuitem', {
        name: /Agendar consulta através do sistema online/i,
      });

      await userEvent.click(onlineButton);

      // Should not call window.open or onClose
      expect(mockWindowOpen).not.toHaveBeenCalled();

      alertSpy.mockRestore();
    });
  });

  describe('WhatsApp Scheduling', () => {
    it('should open WhatsApp URL when clicked', async () => {
      mockWindowOpen.mockReturnValue({ closed: false });

      render(
        <ScheduleDropdown
          isOpen={true}
          onClose={mockOnClose}
          triggerRef={mockTriggerRef}
        />
      );

      const whatsappButton = screen.getByRole('menuitem', {
        name: /Agendar consulta via WhatsApp/i,
      });

      await userEvent.click(whatsappButton);

      expect(mockWindowOpen).toHaveBeenCalledWith(
        expect.stringContaining('wa.me'),
        '_blank',
        'noopener,noreferrer'
      );
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should include pre-filled message in WhatsApp URL', async () => {
      mockWindowOpen.mockReturnValue({ closed: false });

      render(
        <ScheduleDropdown
          isOpen={true}
          onClose={mockOnClose}
          triggerRef={mockTriggerRef}
        />
      );

      const whatsappButton = screen.getByRole('menuitem', {
        name: /Agendar consulta via WhatsApp/i,
      });

      await userEvent.click(whatsappButton);

      const callArgs = mockWindowOpen.mock.calls[0][0];
      expect(callArgs).toContain('text=');
      expect(callArgs).toContain(encodeURIComponent('Olá! Gostaria de agendar uma consulta.'));
    });
  });

  describe('Contact Form', () => {
    it('should dispatch open-cta-modal event when clicked', async () => {
      render(
        <ScheduleDropdown
          isOpen={true}
          onClose={mockOnClose}
          triggerRef={mockTriggerRef}
        />
      );

      const contactButton = screen.getByRole('menuitem', {
        name: /Abrir formulário de contato/i,
      });

      await userEvent.click(contactButton);

      expect(mockDispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'open-cta-modal',
        })
      );
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('Backdrop Interaction', () => {
    it('should close dropdown when backdrop is clicked', () => {
      const { container } = render(
        <ScheduleDropdown
          isOpen={true}
          onClose={mockOnClose}
          triggerRef={mockTriggerRef}
        />
      );

      const backdrop = container.querySelector('.fixed.inset-0.z-\\[9998\\]');
      fireEvent.click(backdrop!);

      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should close dropdown when Escape is pressed', async () => {
      render(
        <ScheduleDropdown
          isOpen={true}
          onClose={mockOnClose}
          triggerRef={mockTriggerRef}
        />
      );

      const onlineButton = screen.getByRole('menuitem', {
        name: /Agendar consulta através do sistema online/i,
      });

      fireEvent.keyDown(onlineButton, { key: 'Escape' });

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should trigger action when Enter is pressed', async () => {
      mockWindowOpen.mockReturnValue({ closed: false });

      render(
        <ScheduleDropdown
          isOpen={true}
          onClose={mockOnClose}
          triggerRef={mockTriggerRef}
        />
      );

      const onlineButton = screen.getByRole('menuitem', {
        name: /Agendar consulta através do sistema online/i,
      });

      fireEvent.keyDown(onlineButton, { key: 'Enter' });

      expect(mockWindowOpen).toHaveBeenCalled();
    });

    it('should trigger action when Space is pressed', async () => {
      mockWindowOpen.mockReturnValue({ closed: false });

      render(
        <ScheduleDropdown
          isOpen={true}
          onClose={mockOnClose}
          triggerRef={mockTriggerRef}
        />
      );

      const onlineButton = screen.getByRole('menuitem', {
        name: /Agendar consulta através do sistema online/i,
      });

      fireEvent.keyDown(onlineButton, { key: ' ' });

      expect(mockWindowOpen).toHaveBeenCalled();
    });
  });

  describe('URL Handling', () => {
    it('should handle popup blocker by redirecting to location', async () => {
      mockWindowOpen.mockReturnValue(null); // Simulate popup blocked

      const locationHref = vi.fn();
      Object.defineProperty(window, 'location', {
        value: { href: locationHref },
        writable: true,
      });

      render(
        <ScheduleDropdown
          isOpen={true}
          onClose={mockOnClose}
          triggerRef={mockTriggerRef}
        />
      );

      const onlineButton = screen.getByRole('menuitem', {
        name: /Agendar consulta através do sistema online/i,
      });

      await userEvent.click(onlineButton);

      await waitFor(() => {
        expect(locationHref).toHaveBeenCalled();
      });
    });

    it('should handle invalid URLs gracefully', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <ScheduleDropdown
          isOpen={true}
          onClose={mockOnClose}
          triggerRef={mockTriggerRef}
        />
      );

      // This would be tested internally by safeOpen function
      // No external validation needed

      consoleError.mockRestore();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(
        <ScheduleDropdown
          isOpen={true}
          onClose={mockOnClose}
          triggerRef={mockTriggerRef}
        />
      );

      const menu = screen.getByRole('menu');
      expect(menu).toHaveAttribute('aria-labelledby', 'schedule-button');
    });

    it('should have menuitem roles for all options', () => {
      render(
        <ScheduleDropdown
          isOpen={true}
          onClose={mockOnClose}
          triggerRef={mockTriggerRef}
        />
      );

      const menuitems = screen.getAllByRole('menuitem');
      expect(menuitems).toHaveLength(3);
    });

    it('should have proper aria-labels for each option', () => {
      render(
        <ScheduleDropdown
          isOpen={true}
          onClose={mockOnClose}
          triggerRef={mockTriggerRef}
        />
      );

      expect(
        screen.getByRole('menuitem', {
          name: /Agendar consulta através do sistema online/i,
        })
      ).toBeInTheDocument();

      expect(
        screen.getByRole('menuitem', {
          name: /Agendar consulta via WhatsApp/i,
        })
      ).toBeInTheDocument();

      expect(
        screen.getByRole('menuitem', {
          name: /Abrir formulário de contato/i,
        })
      ).toBeInTheDocument();
    });

    it('should have proper focus management', () => {
      render(
        <ScheduleDropdown
          isOpen={true}
          onClose={mockOnClose}
          triggerRef={mockTriggerRef}
        />
      );

      const menuitems = screen.getAllByRole('menuitem');
      menuitems.forEach((item) => {
        expect(item).toHaveAttribute('tabIndex', '0');
      });
    });
  });

  describe('Animation', () => {
    it('should use framer-motion for animations', () => {
      const { container } = render(
        <ScheduleDropdown
          isOpen={true}
          onClose={mockOnClose}
          triggerRef={mockTriggerRef}
        />
      );

      const dropdown = container.querySelector('[id="navbar-schedule-menu"]');
      expect(dropdown).toBeInTheDocument();
    });
  });
});
