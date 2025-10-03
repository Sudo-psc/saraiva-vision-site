/**
 * HealthChecklist Component Tests
 *
 * Tests for interactive checklist with progress tracking and localStorage
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import HealthChecklist from '@/components/blog/HealthChecklist';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock window.open for print functionality
const mockWindowOpen = vi.fn();
window.open = mockWindowOpen as any;

describe('HealthChecklist', () => {
  const mockItems = [
    'Faça exames oftalmológicos regulares (pelo menos 1x ao ano)',
    'Use óculos de sol com proteção UV',
    'Mantenha distância segura de telas (40-70cm)',
    'Pisque com frequência para evitar ressecamento',
    'Mantenha alimentação rica em vitaminas A, C e E',
  ];

  beforeEach(() => {
    localStorageMock.clear();
    mockWindowOpen.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render checklist with default title', () => {
      render(<HealthChecklist items={mockItems} />);

      expect(screen.getByText('Checklist de Saúde')).toBeInTheDocument();
    });

    it('should render checklist with custom title', () => {
      render(<HealthChecklist items={mockItems} title="Checklist de Saúde Ocular" />);

      expect(screen.getByText('Checklist de Saúde Ocular')).toBeInTheDocument();
    });

    it('should render all checklist items', () => {
      render(<HealthChecklist items={mockItems} />);

      mockItems.forEach((item) => {
        expect(screen.getByText(item)).toBeInTheDocument();
      });
    });

    it('should show progress bar when showProgress is true', () => {
      render(<HealthChecklist items={mockItems} showProgress={true} />);

      expect(screen.getByText('Progresso')).toBeInTheDocument();
      expect(screen.getByText('0%')).toBeInTheDocument();
    });

    it('should show print button when allowPrint is true', () => {
      render(<HealthChecklist items={mockItems} allowPrint={true} />);

      expect(screen.getByLabelText('Imprimir checklist')).toBeInTheDocument();
    });

    it('should show reset button', () => {
      render(<HealthChecklist items={mockItems} />);

      expect(screen.getByLabelText('Resetar checklist')).toBeInTheDocument();
    });

    it('should return null if no items provided', () => {
      const { container } = render(<HealthChecklist items={[]} />);

      expect(container.firstChild).toBeNull();
    });

    it('should render CFM disclaimer', () => {
      render(<HealthChecklist items={mockItems} />);

      expect(screen.getByText(/Este checklist é apenas um guia educativo/i)).toBeInTheDocument();
    });

    it('should render LGPD notice', () => {
      render(<HealthChecklist items={mockItems} />);

      expect(screen.getByText(/Seu progresso é salvo apenas no seu navegador/i)).toBeInTheDocument();
    });
  });

  describe('Checkbox Interaction', () => {
    it('should check item when clicked', () => {
      render(<HealthChecklist items={mockItems} />);

      const firstCheckbox = screen.getAllByRole('checkbox')[0];
      fireEvent.click(firstCheckbox);

      expect(firstCheckbox).toHaveAttribute('aria-checked', 'true');
    });

    it('should uncheck item when clicked again', () => {
      render(<HealthChecklist items={mockItems} />);

      const firstCheckbox = screen.getAllByRole('checkbox')[0];

      // Check
      fireEvent.click(firstCheckbox);
      expect(firstCheckbox).toHaveAttribute('aria-checked', 'true');

      // Uncheck
      fireEvent.click(firstCheckbox);
      expect(firstCheckbox).toHaveAttribute('aria-checked', 'false');
    });

    it('should update progress when items checked', () => {
      render(<HealthChecklist items={mockItems} showProgress={true} />);

      const checkboxes = screen.getAllByRole('checkbox');

      // Check first item (1/5 = 20%)
      fireEvent.click(checkboxes[0]);
      expect(screen.getByText('20%')).toBeInTheDocument();

      // Check second item (2/5 = 40%)
      fireEvent.click(checkboxes[1]);
      expect(screen.getByText('40%')).toBeInTheDocument();
    });

    it('should show completion count', () => {
      render(<HealthChecklist items={mockItems} showProgress={true} />);

      const checkboxes = screen.getAllByRole('checkbox');

      expect(screen.getByText('0 de 5 concluídos')).toBeInTheDocument();

      fireEvent.click(checkboxes[0]);
      expect(screen.getByText('1 de 5 concluídos')).toBeInTheDocument();

      fireEvent.click(checkboxes[1]);
      expect(screen.getByText('2 de 5 concluídos')).toBeInTheDocument();
    });
  });

  describe('Progress Tracking', () => {
    it('should calculate correct progress percentage', () => {
      render(<HealthChecklist items={mockItems} showProgress={true} />);

      const checkboxes = screen.getAllByRole('checkbox');

      // Check 3 out of 5 items (60%)
      fireEvent.click(checkboxes[0]);
      fireEvent.click(checkboxes[1]);
      fireEvent.click(checkboxes[2]);

      expect(screen.getByText('60%')).toBeInTheDocument();
    });

    it('should show completion message when all items checked', () => {
      render(<HealthChecklist items={mockItems} />);

      const checkboxes = screen.getAllByRole('checkbox');

      // Check all items
      checkboxes.forEach((checkbox) => {
        fireEvent.click(checkbox);
      });

      expect(screen.getByText(/Parabéns! Você completou todos os itens!/i)).toBeInTheDocument();
    });

    it('should update progress bar visually', () => {
      render(<HealthChecklist items={mockItems} showProgress={true} />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '0');

      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[0]);

      expect(progressBar).toHaveAttribute('aria-valuenow', '20');
    });
  });

  describe('Reset Functionality', () => {
    it('should reset all checkboxes when reset clicked', () => {
      render(<HealthChecklist items={mockItems} />);

      const checkboxes = screen.getAllByRole('checkbox');

      // Check some items
      fireEvent.click(checkboxes[0]);
      fireEvent.click(checkboxes[1]);

      // Reset
      const resetButton = screen.getByLabelText('Resetar checklist');
      fireEvent.click(resetButton);

      // Verify all unchecked
      checkboxes.forEach((checkbox) => {
        expect(checkbox).toHaveAttribute('aria-checked', 'false');
      });
    });

    it('should reset progress to 0%', () => {
      render(<HealthChecklist items={mockItems} showProgress={true} />);

      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[0]);
      expect(screen.getByText('20%')).toBeInTheDocument();

      const resetButton = screen.getByLabelText('Resetar checklist');
      fireEvent.click(resetButton);

      expect(screen.getByText('0%')).toBeInTheDocument();
    });
  });

  describe('Print Functionality', () => {
    it('should open print window when print button clicked', () => {
      render(<HealthChecklist items={mockItems} allowPrint={true} />);

      const printButton = screen.getByLabelText('Imprimir checklist');
      fireEvent.click(printButton);

      expect(mockWindowOpen).toHaveBeenCalledWith('', '_blank');
    });
  });

  describe('LocalStorage Persistence', () => {
    it('should save progress to localStorage', async () => {
      const checklistId = 'test-checklist-123';
      render(<HealthChecklist checklistId={checklistId} items={mockItems} />);

      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[0]);

      await waitFor(() => {
        const saved = localStorageMock.getItem(`saraiva_checklist_progress_${checklistId}`);
        expect(saved).toBeTruthy();
      });
    });

    it('should clear localStorage on reset', () => {
      const checklistId = 'test-checklist-456';
      render(<HealthChecklist checklistId={checklistId} items={mockItems} />);

      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[0]);

      const resetButton = screen.getByLabelText('Resetar checklist');
      fireEvent.click(resetButton);

      const saved = localStorageMock.getItem(`saraiva_checklist_progress_${checklistId}`);
      expect(saved).toBeNull();
    });
  });

  describe('Callbacks', () => {
    it('should call onProgressChange callback when progress changes', () => {
      const onProgressChange = vi.fn();
      render(<HealthChecklist items={mockItems} onProgressChange={onProgressChange} />);

      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[0]);

      expect(onProgressChange).toHaveBeenCalled();
    });

    it('should call onProgressChange with 0 on reset', () => {
      const onProgressChange = vi.fn();
      render(<HealthChecklist items={mockItems} onProgressChange={onProgressChange} />);

      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[0]);

      const resetButton = screen.getByLabelText('Resetar checklist');
      fireEvent.click(resetButton);

      expect(onProgressChange).toHaveBeenCalledWith(0);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<HealthChecklist title="Checklist Acessível" items={mockItems} />);

      expect(screen.getByRole('region', { name: 'Checklist Acessível' })).toBeInTheDocument();
    });

    it('should support keyboard navigation', () => {
      render(<HealthChecklist items={mockItems} />);

      const firstCheckbox = screen.getAllByRole('checkbox')[0];
      expect(firstCheckbox).toHaveAttribute('tabIndex', '0');
    });

    it('should toggle checkbox with keyboard', () => {
      render(<HealthChecklist items={mockItems} />);

      const firstCheckbox = screen.getAllByRole('checkbox')[0];

      // Press Enter
      fireEvent.keyDown(firstCheckbox, { key: 'Enter', code: 'Enter' });
      expect(firstCheckbox).toHaveAttribute('aria-checked', 'true');

      // Press Space
      fireEvent.keyDown(firstCheckbox, { key: ' ', code: 'Space' });
      expect(firstCheckbox).toHaveAttribute('aria-checked', 'false');
    });

    it('should have progress bar with proper ARIA attributes', () => {
      render(<HealthChecklist items={mockItems} showProgress={true} />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow');
      expect(progressBar).toHaveAttribute('aria-valuemin', '0');
      expect(progressBar).toHaveAttribute('aria-valuemax', '100');
    });
  });

  describe('Edge Cases', () => {
    it('should handle single item checklist', () => {
      render(<HealthChecklist items={['Single item']} showProgress={true} />);

      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);

      expect(screen.getByText('100%')).toBeInTheDocument();
    });

    it('should handle ChecklistItem objects with text property', () => {
      const itemObjects = [{ text: 'Item 1', id: '1' }, { text: 'Item 2', id: '2' }];

      render(<HealthChecklist items={itemObjects as any} />);

      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
    });
  });
});
