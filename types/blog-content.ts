/**
 * Blog Content Enhancement Types
 *
 * TypeScript interfaces for interactive blog components including:
 * - Patient quizzes with scoring and progress tracking
 * - Health checklists with persistence
 * - Expert tips with CFM compliance
 * - Info boxes for contextual content
 * - Learning summaries and takeaways
 * - FAQ sections with Schema.org markup
 */

// ============================================
// Quiz Types
// ============================================

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export interface QuizResultMessages {
  high?: string;
  medium?: string;
  low?: string;
}

export interface QuizProgress {
  quizId: string;
  answers: Record<number, number>;
  score: number;
  completedAt: string;
  totalQuestions: number;
}

export interface PatientQuizProps {
  title?: string;
  questions: QuizQuestion[];
  resultMessages?: QuizResultMessages;
  className?: string;
  quizId?: string;
  onComplete?: (score: number, total: number) => void;
}

// ============================================
// Checklist Types
// ============================================

export interface ChecklistItem {
  id?: string;
  text: string;
  checked?: boolean;
}

export interface ChecklistProgress {
  checklistId: string;
  checkedItems: Record<number, boolean>;
  progress: number;
  lastUpdated: string;
}

export interface HealthChecklistProps {
  items: string[] | ChecklistItem[];
  title?: string;
  className?: string;
  checklistId?: string;
  showProgress?: boolean;
  allowPrint?: boolean;
  onProgressChange?: (progress: number) => void;
}

// ============================================
// Expert Tip Types
// ============================================

export type ExpertTipType = 'tip' | 'warning' | 'alert' | 'info';

export interface ExpertTipConfig {
  icon: any;
  bgColor: string;
  borderColor: string;
  iconBg: string;
  titleColor: string;
  textColor: string;
  defaultTitle: string;
}

export interface MedicalDisclaimer {
  required: boolean;
  text?: string;
  level?: 'educational' | 'diagnostic' | 'treatment';
}

export interface ExpertTipProps {
  type?: ExpertTipType;
  title?: string;
  children: React.ReactNode;
  className?: string;
  disclaimer?: MedicalDisclaimer;
  doctorName?: string;
  doctorRole?: string;
}

// ============================================
// InfoBox Types
// ============================================

export type InfoBoxType = 'tip' | 'warning' | 'summary' | 'info' | 'success';

export interface InfoBoxConfig {
  icon: any;
  bgColor: string;
  borderColor: string;
  iconBg: string;
  iconColor: string;
  titleColor: string;
  emoji: string;
}

export interface InfoBoxProps {
  type?: InfoBoxType;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

// ============================================
// Learning Summary Types
// ============================================

export interface LearningSummaryProps {
  items: string[];
  title?: string;
  className?: string;
  estimatedMinutes?: number;
}

// ============================================
// Quick Takeaways Types
// ============================================

export interface QuickTakeawaysProps {
  items: string[];
  title?: string;
  className?: string;
}

// ============================================
// FAQ Types
// ============================================

export interface FAQItem {
  question: string;
  answer: string;
}

export interface FAQSchemaItem {
  '@type': 'Question';
  name: string;
  acceptedAnswer: {
    '@type': 'Answer';
    text: string;
  };
}

export interface FAQSchema {
  '@context': 'https://schema.org';
  '@type': 'FAQPage';
  mainEntity: FAQSchemaItem[];
}

export interface PostFAQProps {
  questions: FAQItem[];
  title?: string;
  className?: string;
  showCTA?: boolean;
  ctaText?: string;
  ctaLink?: string;
  generateSchema?: boolean;
}

// ============================================
// Local Storage Keys
// ============================================

export const STORAGE_KEYS = {
  QUIZ_PROGRESS: 'saraiva_quiz_progress',
  CHECKLIST_PROGRESS: 'saraiva_checklist_progress',
  QUIZ_HISTORY: 'saraiva_quiz_history',
} as const;

// ============================================
// CFM Compliance Types
// ============================================

export interface CFMComplianceData {
  disclaimerRequired: boolean;
  medicalContentLevel: 'educational' | 'diagnostic' | 'treatment';
  reviewedBy?: string;
  reviewDate?: string;
  crmNumber?: string;
}

export interface LGPDComplianceData {
  dataCollection: boolean;
  purpose: string;
  retention: string;
  userConsent: boolean;
}

// ============================================
// Accessibility Types
// ============================================

export interface A11yAttributes {
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-expanded'?: boolean;
  'aria-controls'?: string;
  role?: string;
}

// ============================================
// Animation Types
// ============================================

export interface AnimationConfig {
  initial?: Record<string, any>;
  animate?: Record<string, any>;
  exit?: Record<string, any>;
  transition?: Record<string, any>;
  viewport?: {
    once?: boolean;
    amount?: number;
  };
}

// ============================================
// Utility Types
// ============================================

export type ComponentVariant = 'default' | 'compact' | 'expanded';

export interface BaseComponentProps {
  className?: string;
  'data-testid'?: string;
}
