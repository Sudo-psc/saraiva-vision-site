/**
 * PatientQuiz Component Tests
 *
 * Tests for interactive quiz component with localStorage persistence
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PatientQuiz from '@/components/blog/PatientQuiz';
import type { QuizQuestion } from '@/types/blog-content';

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

describe('PatientQuiz', () => {
  const mockQuestions: QuizQuestion[] = [
    {
      question: 'O que é catarata?',
      options: ['Infecção ocular', 'Opacificação do cristalino', 'Problema na retina', 'Pressão alta no olho'],
      correctAnswer: 1,
      explanation: 'Catarata é a opacificação do cristalino, a lente natural do olho.',
    },
    {
      question: 'Qual a principal causa de catarata?',
      options: ['Envelhecimento', 'Uso de computador', 'Falta de vitaminas', 'Estresse'],
      correctAnswer: 0,
      explanation: 'O envelhecimento é a principal causa de catarata.',
    },
    {
      question: 'A catarata tem cura?',
      options: ['Não tem cura', 'Cura com colírios', 'Cura com cirurgia', 'Cura sozinha'],
      correctAnswer: 2,
      explanation: 'A catarata é tratada efetivamente através de cirurgia.',
    },
  ];

  const mockResultMessages = {
    high: 'Excelente conhecimento sobre catarata!',
    medium: 'Bom conhecimento, mas pode aprender mais.',
    low: 'Recomendamos consultar um oftalmologista.',
  };

  beforeEach(() => {
    localStorageMock.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render quiz with title', () => {
      render(<PatientQuiz title="Quiz sobre Catarata" questions={mockQuestions} />);

      expect(screen.getByText('Quiz sobre Catarata')).toBeInTheDocument();
      expect(screen.getByText('Teste seus conhecimentos')).toBeInTheDocument();
    });

    it('should render first question', () => {
      render(<PatientQuiz questions={mockQuestions} />);

      expect(screen.getByText('O que é catarata?')).toBeInTheDocument();
      expect(screen.getByText('Questão 1 de 3')).toBeInTheDocument();
    });

    it('should render all answer options for first question', () => {
      render(<PatientQuiz questions={mockQuestions} />);

      expect(screen.getByText('Infecção ocular')).toBeInTheDocument();
      expect(screen.getByText('Opacificação do cristalino')).toBeInTheDocument();
      expect(screen.getByText('Problema na retina')).toBeInTheDocument();
      expect(screen.getByText('Pressão alta no olho')).toBeInTheDocument();
    });

    it('should render CFM medical disclaimer', () => {
      render(<PatientQuiz questions={mockQuestions} />);

      expect(screen.getByText(/Aviso Médico \(CFM\)/i)).toBeInTheDocument();
      expect(screen.getByText(/Este quiz é apenas educativo/i)).toBeInTheDocument();
    });

    it('should return null if no questions provided', () => {
      const { container } = render(<PatientQuiz questions={[]} />);

      expect(container.firstChild).toBeNull();
    });
  });

  describe('Quiz Interaction', () => {
    it('should allow selecting an answer', async () => {
      render(<PatientQuiz questions={mockQuestions} />);

      const correctAnswer = screen.getByText('Opacificação do cristalino');
      fireEvent.click(correctAnswer);

      await waitFor(() => {
        expect(screen.getByText(/Explicação:/i)).toBeInTheDocument();
      });
    });

    it('should show correct/incorrect feedback after answering', async () => {
      render(<PatientQuiz questions={mockQuestions} />);

      const wrongAnswer = screen.getByText('Infecção ocular');
      fireEvent.click(wrongAnswer);

      await waitFor(() => {
        const correctAnswerElement = screen.getByText('Opacificação do cristalino').closest('button');
        expect(correctAnswerElement).toHaveClass('bg-green-50');
      });
    });

    it('should show explanation after answering', async () => {
      render(<PatientQuiz questions={mockQuestions} />);

      const answer = screen.getByText('Opacificação do cristalino');
      fireEvent.click(answer);

      await waitFor(() => {
        expect(screen.getByText(/Catarata é a opacificação do cristalino/i)).toBeInTheDocument();
      });
    });

    it('should disable answers after selection', async () => {
      render(<PatientQuiz questions={mockQuestions} />);

      const answer = screen.getByText('Opacificação do cristalino');
      fireEvent.click(answer);

      await waitFor(() => {
        const allButtons = screen.getAllByRole('radio');
        allButtons.forEach((button) => {
          expect(button).toHaveAttribute('aria-disabled', 'true');
        });
      });
    });

    it('should progress to next question after answering', async () => {
      render(<PatientQuiz questions={mockQuestions} />);

      // Answer first question
      const firstAnswer = screen.getByText('Opacificação do cristalino');
      fireEvent.click(firstAnswer);

      // Wait for transition and check second question
      await waitFor(
        () => {
          expect(screen.getByText('Qual a principal causa de catarata?')).toBeInTheDocument();
        },
        { timeout: 1000 }
      );
    });
  });

  describe('Quiz Completion', () => {
    it('should show results after answering all questions', async () => {
      render(<PatientQuiz questions={mockQuestions} resultMessages={mockResultMessages} />);

      // Answer all questions
      fireEvent.click(screen.getByText('Opacificação do cristalino'));

      await waitFor(() => screen.getByText('Envelhecimento'), { timeout: 1000 });
      fireEvent.click(screen.getByText('Envelhecimento'));

      await waitFor(() => screen.getByText('Cura com cirurgia'), { timeout: 1000 });
      fireEvent.click(screen.getByText('Cura com cirurgia'));

      // Check results screen
      await waitFor(
        () => {
          expect(screen.getByText(/Você acertou/i)).toBeInTheDocument();
          expect(screen.getByText('100%')).toBeInTheDocument();
        },
        { timeout: 1000 }
      );
    });

    it('should show correct result message based on score', async () => {
      render(<PatientQuiz questions={mockQuestions} resultMessages={mockResultMessages} />);

      // Answer all questions correctly
      fireEvent.click(screen.getByText('Opacificação do cristalino'));
      await waitFor(() => screen.getByText('Envelhecimento'), { timeout: 1000 });
      fireEvent.click(screen.getByText('Envelhecimento'));
      await waitFor(() => screen.getByText('Cura com cirurgia'), { timeout: 1000 });
      fireEvent.click(screen.getByText('Cura com cirurgia'));

      await waitFor(
        () => {
          expect(screen.getByText('Excelente conhecimento sobre catarata!')).toBeInTheDocument();
        },
        { timeout: 1500 }
      );
    });

    it('should show reset button on results screen', async () => {
      render(<PatientQuiz questions={mockQuestions} />);

      // Complete quiz
      fireEvent.click(screen.getByText('Opacificação do cristalino'));
      await waitFor(() => screen.getByText('Envelhecimento'), { timeout: 1000 });
      fireEvent.click(screen.getByText('Envelhecimento'));
      await waitFor(() => screen.getByText('Cura com cirurgia'), { timeout: 1000 });
      fireEvent.click(screen.getByText('Cura com cirurgia'));

      await waitFor(
        () => {
          expect(screen.getByText(/Refazer Quiz/i)).toBeInTheDocument();
        },
        { timeout: 1500 }
      );
    });

    it('should reset quiz when reset button clicked', async () => {
      render(<PatientQuiz questions={mockQuestions} />);

      // Complete quiz
      fireEvent.click(screen.getByText('Opacificação do cristalino'));
      await waitFor(() => screen.getByText('Envelhecimento'), { timeout: 1000 });
      fireEvent.click(screen.getByText('Envelhecimento'));
      await waitFor(() => screen.getByText('Cura com cirurgia'), { timeout: 1000 });
      fireEvent.click(screen.getByText('Cura com cirurgia'));

      // Click reset
      await waitFor(() => screen.getByText(/Refazer Quiz/i), { timeout: 1500 });
      fireEvent.click(screen.getByText(/Refazer Quiz/i));

      // Check first question is shown again
      await waitFor(() => {
        expect(screen.getByText('O que é catarata?')).toBeInTheDocument();
      });
    });
  });

  describe('LocalStorage Persistence', () => {
    it('should save progress to localStorage', async () => {
      const quizId = 'test-quiz-123';
      render(<PatientQuiz quizId={quizId} questions={mockQuestions} />);

      fireEvent.click(screen.getByText('Opacificação do cristalino'));

      await waitFor(() => {
        const saved = localStorageMock.getItem(`saraiva_quiz_progress_${quizId}`);
        expect(saved).toBeTruthy();
      });
    });

    it('should clear localStorage on reset', async () => {
      const quizId = 'test-quiz-456';
      render(<PatientQuiz quizId={quizId} questions={mockQuestions} />);

      // Complete quiz
      fireEvent.click(screen.getByText('Opacificação do cristalino'));
      await waitFor(() => screen.getByText('Envelhecimento'), { timeout: 1000 });
      fireEvent.click(screen.getByText('Envelhecimento'));
      await waitFor(() => screen.getByText('Cura com cirurgia'), { timeout: 1000 });
      fireEvent.click(screen.getByText('Cura com cirurgia'));

      // Reset
      await waitFor(() => screen.getByText(/Refazer Quiz/i), { timeout: 1500 });
      fireEvent.click(screen.getByText(/Refazer Quiz/i));

      // Check localStorage cleared
      const saved = localStorageMock.getItem(`saraiva_quiz_progress_${quizId}`);
      expect(saved).toBeNull();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<PatientQuiz title="Quiz Acessível" questions={mockQuestions} />);

      expect(screen.getByRole('region', { name: 'Quiz Acessível' })).toBeInTheDocument();
    });

    it('should support keyboard navigation', () => {
      render(<PatientQuiz questions={mockQuestions} />);

      const firstOption = screen.getByText('Infecção ocular').closest('button');
      expect(firstOption).toHaveAttribute('tabIndex', '0');
    });

    it('should have progress bar with proper ARIA attributes', () => {
      render(<PatientQuiz questions={mockQuestions} />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '0');
      expect(progressBar).toHaveAttribute('aria-valuemin', '0');
      expect(progressBar).toHaveAttribute('aria-valuemax', '3');
    });
  });

  describe('Callbacks', () => {
    it('should call onComplete callback when quiz finished', async () => {
      const onComplete = vi.fn();
      render(<PatientQuiz questions={mockQuestions} onComplete={onComplete} />);

      // Complete quiz
      fireEvent.click(screen.getByText('Opacificação do cristalino'));
      await waitFor(() => screen.getByText('Envelhecimento'), { timeout: 1000 });
      fireEvent.click(screen.getByText('Envelhecimento'));
      await waitFor(() => screen.getByText('Cura com cirurgia'), { timeout: 1000 });
      fireEvent.click(screen.getByText('Cura com cirurgia'));

      await waitFor(
        () => {
          expect(onComplete).toHaveBeenCalledWith(3, 3);
        },
        { timeout: 1500 }
      );
    });
  });
});
