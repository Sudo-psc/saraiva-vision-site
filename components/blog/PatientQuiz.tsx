'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, HelpCircle, Award, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type {
  PatientQuizProps,
  QuizProgress,
  STORAGE_KEYS,
} from '@/types/blog-content';

/**
 * PatientQuiz - Interactive self-assessment quiz with localStorage persistence
 *
 * Features:
 * - Multiple choice questions with instant feedback
 * - Score calculation and performance tracking
 * - Progress persistence via localStorage (LGPD compliant)
 * - Accessibility: WCAG AAA compliant with keyboard navigation
 * - Framer Motion animations for smooth UX
 * - CFM compliance for medical content
 *
 * @example
 * ```tsx
 * <PatientQuiz
 *   title="Teste seus conhecimentos sobre saúde ocular"
 *   quizId="catarata-quiz"
 *   questions={[
 *     {
 *       question: "O que é catarata?",
 *       options: ["Opção A", "Opção B", "Opção C"],
 *       correctAnswer: 1,
 *       explanation: "Explicação detalhada..."
 *     }
 *   ]}
 *   resultMessages={{
 *     high: "Excelente conhecimento!",
 *     medium: "Bom, mas pode melhorar",
 *     low: "Consulte um especialista"
 *   }}
 * />
 * ```
 */
const PatientQuiz: React.FC<PatientQuizProps> = ({
  title = 'Faça sua autoavaliação',
  questions = [],
  resultMessages = {},
  className = '',
  quizId = 'default-quiz',
  onComplete,
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved progress from localStorage (client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(`saraiva_quiz_progress_${quizId}`);
        if (saved) {
          const progress: QuizProgress = JSON.parse(saved);
          // Only restore if quiz structure matches (same number of questions)
          if (progress.totalQuestions === questions.length) {
            setAnswers(progress.answers);
            setScore(progress.score);
            // If quiz was completed, show results
            if (Object.keys(progress.answers).length === questions.length) {
              setShowResults(true);
            }
          }
        }
      } catch (error) {
        console.error('Failed to load quiz progress:', error);
      }
      setIsLoaded(true);
    }
  }, [quizId, questions.length]);

  // Save progress to localStorage
  const saveProgress = (newAnswers: Record<number, number>, newScore: number) => {
    if (typeof window !== 'undefined') {
      try {
        const progress: QuizProgress = {
          quizId,
          answers: newAnswers,
          score: newScore,
          completedAt: new Date().toISOString(),
          totalQuestions: questions.length,
        };
        localStorage.setItem(`saraiva_quiz_progress_${quizId}`, JSON.stringify(progress));
      } catch (error) {
        console.error('Failed to save quiz progress:', error);
      }
    }
  };

  if (!questions || questions.length === 0) return null;
  if (!isLoaded) return null; // Wait for client-side hydration

  const handleAnswer = (questionIndex: number, answerIndex: number) => {
    const newAnswers = { ...answers, [questionIndex]: answerIndex };
    setAnswers(newAnswers);

    // Calculate score
    const correctAnswers = Object.keys(newAnswers).filter(
      (idx) => newAnswers[parseInt(idx)] === questions[parseInt(idx)].correctAnswer
    ).length;
    setScore(correctAnswers);

    // Save progress
    saveProgress(newAnswers, correctAnswers);

    // Move to next question or show results
    if (questionIndex < questions.length - 1) {
      setTimeout(() => setCurrentQuestion(questionIndex + 1), 500);
    } else {
      setTimeout(() => {
        setShowResults(true);
        // Trigger callback if provided
        if (onComplete) {
          onComplete(correctAnswers, questions.length);
        }
      }, 500);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
    setScore(0);
    // Clear localStorage
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(`saraiva_quiz_progress_${quizId}`);
      } catch (error) {
        console.error('Failed to clear quiz progress:', error);
      }
    }
  };

  const getResultMessage = () => {
    const percentage = (score / questions.length) * 100;
    if (percentage >= 80) {
      return resultMessages.high || 'Excelente! Você demonstra bom conhecimento sobre o assunto.';
    }
    if (percentage >= 50) {
      return resultMessages.medium || 'Bom trabalho! Mas há espaço para aprender mais.';
    }
    return resultMessages.low || 'Recomendamos consultar um especialista para esclarecer suas dúvidas.';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`my-12 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 md:p-8 shadow-xl border-2 border-blue-100 ${className}`}
      role="region"
      aria-label={title}
      data-testid="patient-quiz"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-full p-3 shadow-md">
          <HelpCircle className="w-6 h-6 text-white" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <p className="text-sm text-gray-600">Teste seus conhecimentos</p>
        </div>
      </div>

      {/* CFM Medical Disclaimer */}
      <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
        <p className="font-semibold mb-1">⚕️ Aviso Médico (CFM)</p>
        <p>Este quiz é apenas educativo. Não substitui consulta médica profissional. Consulte sempre um oftalmologista.</p>
      </div>

      <AnimatePresence mode="wait">
        {!showResults ? (
          <motion.div
            key={`question-${currentQuestion}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>
                  Questão {currentQuestion + 1} de {questions.length}
                </span>
                <span>{Math.round((currentQuestion / questions.length) * 100)}% concluído</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2" role="progressbar" aria-valuenow={currentQuestion} aria-valuemin={0} aria-valuemax={questions.length}>
                <motion.div
                  className="bg-gradient-to-r from-blue-600 to-blue-700 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(currentQuestion / questions.length) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            {/* Question */}
            <div className="bg-white rounded-xl p-6 shadow-md mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-6" id={`question-${currentQuestion}`}>
                {questions[currentQuestion].question}
              </h3>

              {/* Answer Options */}
              <div className="space-y-3" role="radiogroup" aria-labelledby={`question-${currentQuestion}`}>
                {questions[currentQuestion].options.map((option, idx) => {
                  const isAnswered = answers[currentQuestion] !== undefined;
                  const isSelected = answers[currentQuestion] === idx;
                  const isCorrect = idx === questions[currentQuestion].correctAnswer;

                  return (
                    <motion.button
                      key={idx}
                      onClick={() => !isAnswered && handleAnswer(currentQuestion, idx)}
                      disabled={isAnswered}
                      whileHover={{ scale: !isAnswered ? 1.02 : 1 }}
                      whileTap={{ scale: !isAnswered ? 0.98 : 1 }}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        isAnswered
                          ? isSelected
                            ? isCorrect
                              ? 'bg-green-50 border-green-500'
                              : 'bg-red-50 border-red-500'
                            : isCorrect
                            ? 'bg-green-50 border-green-500'
                            : 'bg-gray-50 border-gray-200'
                          : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                      }`}
                      role="radio"
                      aria-checked={isSelected}
                      aria-disabled={isAnswered}
                      tabIndex={isAnswered ? -1 : 0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          !isAnswered && handleAnswer(currentQuestion, idx);
                        }
                      }}
                    >
                      <div className="flex items-center gap-3">
                        {isAnswered && (
                          <div>
                            {isCorrect ? (
                              <CheckCircle className="w-5 h-5 text-green-600" aria-label="Resposta correta" />
                            ) : isSelected ? (
                              <XCircle className="w-5 h-5 text-red-600" aria-label="Resposta incorreta" />
                            ) : (
                              <div className="w-5 h-5" />
                            )}
                          </div>
                        )}
                        <span className={`${isAnswered ? (isCorrect || isSelected ? 'font-semibold' : '') : ''}`}>
                          {option}
                        </span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Explanation (after answering) */}
              {answers[currentQuestion] !== undefined && questions[currentQuestion].explanation && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200"
                  role="region"
                  aria-label="Explicação da resposta"
                >
                  <p className="text-sm text-blue-900">
                    <strong>💡 Explicação:</strong> {questions[currentQuestion].explanation}
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        ) : (
          /* Results Screen */
          <motion.div
            key="results"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center"
            role="region"
            aria-label="Resultados do quiz"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              className="w-24 h-24 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl"
            >
              <Award className="w-12 h-12 text-white" aria-hidden="true" />
            </motion.div>

            <h3 className="text-3xl font-bold text-gray-900 mb-2">
              Você acertou {score} de {questions.length}!
            </h3>
            <p className="text-lg text-gray-700 mb-6">{getResultMessage()}</p>

            <div className="bg-white rounded-xl p-6 shadow-md mb-6">
              <div className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-700 mb-2">
                {Math.round((score / questions.length) * 100)}%
              </div>
              <p className="text-sm text-gray-600">Taxa de acerto</p>
            </div>

            {/* LGPD Notice */}
            <div className="mb-6 p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-600">
              <p>🔒 Seus resultados são salvos apenas no seu navegador (LGPD compliant).</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={resetQuiz} variant="outline" className="font-semibold" aria-label="Refazer o quiz">
                <RotateCcw className="w-4 h-4 mr-2" />
                Refazer Quiz
              </Button>
              <Button
                onClick={() => (window.location.href = '/sobre#contact')}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold"
              >
                Agendar Consulta
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default PatientQuiz;
