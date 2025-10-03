/**
 * WCAG 2.1 Level AAA Compliance Utilities
 * Healthcare-focused accessibility helpers
 */

/**
 * Color Contrast Calculation (WCAG 1.4.6 - AAA requires 7:1)
 */
export interface ContrastResult {
  ratio: number;
  passes: {
    AA: boolean;
    AAA: boolean;
    AALarge: boolean;
    AAALarge: boolean;
  };
  recommendation?: string;
}

/**
 * Calculate relative luminance of a color (WCAG formula)
 */
function getLuminance(rgb: [number, number, number]): number {
  const [r, g, b] = rgb.map((val) => {
    const sRGB = val / 255;
    return sRGB <= 0.03928 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex: string): [number, number, number] | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
    : null;
}

/**
 * Calculate contrast ratio between two colors
 * Returns ratio and WCAG compliance levels
 */
export function getContrastRatio(color1: string, color2: string): ContrastResult {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  if (!rgb1 || !rgb2) {
    throw new Error('Invalid color format. Use hex colors (e.g., #FFFFFF)');
  }

  const lum1 = getLuminance(rgb1);
  const lum2 = getLuminance(rgb2);

  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  const ratio = (lighter + 0.05) / (darker + 0.05);

  const result: ContrastResult = {
    ratio: Math.round(ratio * 100) / 100,
    passes: {
      AA: ratio >= 4.5, // Normal text
      AAA: ratio >= 7.0, // Normal text (enhanced)
      AALarge: ratio >= 3.0, // Large text (18pt+ or 14pt bold)
      AAALarge: ratio >= 4.5 // Large text (enhanced)
    }
  };

  // Recommendations for senior profile
  if (!result.passes.AAA) {
    if (ratio < 4.5) {
      result.recommendation =
        'Contrast too low for any text. Use darker/lighter colors. Target: 7:1 for AAA.';
    } else if (ratio < 7.0) {
      result.recommendation = 'Passes AA but not AAA. Increase contrast to 7:1 for senior users.';
    }
  }

  return result;
}

/**
 * Validate if color pair meets AAA standard
 */
export function meetsAAAStandard(foreground: string, background: string): boolean {
  const result = getContrastRatio(foreground, background);
  return result.passes.AAA;
}

/**
 * Reading Level Analysis (WCAG 3.1.5 - AAA requires 9th grade or lower)
 */
export interface ReadabilityResult {
  fleschScore: number;
  gradeLevel: number;
  passesAAA: boolean;
  recommendations: string[];
}

/**
 * Calculate Flesch Reading Ease and Grade Level
 * Simplified for Portuguese text
 */
export function analyzeReadability(text: string): ReadabilityResult {
  // Remove special characters and extra spaces
  const cleanText = text.replace(/[^a-zA-ZÀ-ÿ\s]/g, ' ').replace(/\s+/g, ' ').trim();

  // Count sentences (approximate for Portuguese)
  const sentences = cleanText.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const sentenceCount = sentences.length || 1;

  // Count words
  const words = cleanText.split(/\s+/).filter((w) => w.length > 0);
  const wordCount = words.length;

  // Count syllables (simplified approximation for Portuguese)
  const syllableCount = words.reduce((count, word) => {
    // Portuguese vowel clusters
    const vowels = word.match(/[aeiouáéíóúâêôãõ]+/gi);
    return count + (vowels ? vowels.length : 1);
  }, 0);

  // Flesch Reading Ease (adapted for Portuguese)
  const avgWordsPerSentence = wordCount / sentenceCount;
  const avgSyllablesPerWord = syllableCount / wordCount;
  const fleschScore = 206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord;

  // Grade level estimation
  let gradeLevel = 0;
  if (fleschScore >= 90) gradeLevel = 5;
  else if (fleschScore >= 80) gradeLevel = 6;
  else if (fleschScore >= 70) gradeLevel = 7;
  else if (fleschScore >= 60) gradeLevel = 8;
  else if (fleschScore >= 50) gradeLevel = 9;
  else if (fleschScore >= 30) gradeLevel = 12;
  else gradeLevel = 16;

  const passesAAA = gradeLevel <= 9;

  const recommendations: string[] = [];
  if (!passesAAA) {
    if (avgWordsPerSentence > 20) {
      recommendations.push('Sentenças muito longas. Divida em frases menores (máximo 15-20 palavras).');
    }
    if (avgSyllablesPerWord > 2) {
      recommendations.push('Palavras muito complexas. Use termos mais simples quando possível.');
    }
    recommendations.push('Nível de leitura acima do 9º ano. Simplifique o texto para idosos.');
  }

  return {
    fleschScore: Math.round(fleschScore),
    gradeLevel,
    passesAAA,
    recommendations
  };
}

/**
 * Medical Terms Dictionary for Pronunciation Guides (WCAG 3.1.6)
 */
export interface MedicalTerm {
  term: string;
  pronunciation: string;
  definition: string;
  category: 'disease' | 'procedure' | 'anatomy' | 'medication' | 'symptom';
}

export const medicalTermsDictionary: MedicalTerm[] = [
  {
    term: 'Catarata',
    pronunciation: 'ka-ta-RA-ta',
    definition: 'Opacidade do cristalino (lente natural do olho) que causa visão embaçada.',
    category: 'disease'
  },
  {
    term: 'Glaucoma',
    pronunciation: 'glau-KO-ma',
    definition:
      'Doença que danifica o nervo óptico, geralmente por pressão alta dentro do olho.',
    category: 'disease'
  },
  {
    term: 'Retina',
    pronunciation: 'he-TI-na',
    definition: 'Camada fina de tecido na parte de trás do olho que capta as imagens.',
    category: 'anatomy'
  },
  {
    term: 'Degeneração Macular',
    pronunciation: 'de-je-ne-ra-ÇÃO ma-ku-LAR',
    definition: 'Doença que afeta a parte central da retina (mácula), causando perda de visão.',
    category: 'disease'
  },
  {
    term: 'Retinopatia Diabética',
    pronunciation: 'he-ti-no-pa-TI-a di-a-BÉ-ti-ka',
    definition: 'Complicação do diabetes que danifica os vasos sanguíneos da retina.',
    category: 'disease'
  },
  {
    term: 'Facoemulsificação',
    pronunciation: 'fa-ko-e-mul-si-fi-ka-ÇÃO',
    definition:
      'Técnica moderna de cirurgia de catarata usando ultrassom para fragmentar a lente.',
    category: 'procedure'
  },
  {
    term: 'Intraocular',
    pronunciation: 'in-tra-o-ku-LAR',
    definition: 'Dentro do olho.',
    category: 'anatomy'
  },
  {
    term: 'Pressão Intraocular',
    pronunciation: 'pre-SÃO in-tra-o-ku-LAR',
    definition: 'Pressão do líquido dentro do olho. Deve ser controlada no glaucoma.',
    category: 'symptom'
  },
  {
    term: 'Cristalino',
    pronunciation: 'kris-ta-LI-no',
    definition: 'Lente natural e transparente do olho, localizada atrás da íris.',
    category: 'anatomy'
  },
  {
    term: 'Nervo Óptico',
    pronunciation: 'NER-vo Ó-pi-ko',
    definition: 'Nervo que transmite informações visuais do olho para o cérebro.',
    category: 'anatomy'
  }
];

/**
 * Get pronunciation guide for medical term
 */
export function getPronunciation(term: string): MedicalTerm | undefined {
  return medicalTermsDictionary.find(
    (item) => item.term.toLowerCase() === term.toLowerCase()
  );
}

/**
 * Touch Target Size Validation (WCAG 2.5.5 - AAA requires 44x44px minimum)
 */
export interface TouchTargetResult {
  width: number;
  height: number;
  passesAA: boolean; // 44x44px
  passesAAA: boolean; // 48x48px for senior
  recommendation?: string;
}

export function validateTouchTarget(width: number, height: number): TouchTargetResult {
  const passesAA = width >= 44 && height >= 44;
  const passesAAA = width >= 48 && height >= 48;

  const result: TouchTargetResult = {
    width,
    height,
    passesAA,
    passesAAA
  };

  if (!passesAAA) {
    if (!passesAA) {
      result.recommendation = `Touch target too small (${width}x${height}px). Minimum: 48x48px for seniors.`;
    } else {
      result.recommendation = `Passes AA (${width}x${height}px) but not AAA. Increase to 48x48px for better senior accessibility.`;
    }
  }

  return result;
}

/**
 * Text Spacing Validation (WCAG 1.4.12 - AAA)
 */
export interface TextSpacingResult {
  lineHeight: number;
  letterSpacing: number;
  wordSpacing: number;
  paragraphSpacing: number;
  passesAAA: boolean;
  issues: string[];
}

export function validateTextSpacing(
  lineHeight: number,
  letterSpacing: number = 0,
  wordSpacing: number = 0,
  paragraphSpacing: number = 0
): TextSpacingResult {
  const issues: string[] = [];

  // WCAG AAA requirements for senior profile
  if (lineHeight < 1.5) {
    issues.push(`Line height ${lineHeight} is too small. Minimum: 1.5 for AAA.`);
  }

  if (letterSpacing < 0.12) {
    issues.push(`Letter spacing ${letterSpacing}em is too small. Minimum: 0.12em for readability.`);
  }

  if (paragraphSpacing < 2.0) {
    issues.push(
      `Paragraph spacing ${paragraphSpacing}em is too small. Minimum: 2.0em for AAA (1.4.8).`
    );
  }

  return {
    lineHeight,
    letterSpacing,
    wordSpacing,
    paragraphSpacing,
    passesAAA: issues.length === 0,
    issues
  };
}

/**
 * Abbreviation Expander (WCAG 3.1.4)
 */
export interface AbbreviationResult {
  abbreviation: string;
  expanded: string;
  context?: string;
}

export const commonAbbreviations: Record<string, AbbreviationResult> = {
  CFM: {
    abbreviation: 'CFM',
    expanded: 'Conselho Federal de Medicina',
    context: 'Órgão regulador da prática médica no Brasil'
  },
  CRM: {
    abbreviation: 'CRM',
    expanded: 'Conselho Regional de Medicina',
    context: 'Registro profissional de médicos no estado'
  },
  LGPD: {
    abbreviation: 'LGPD',
    expanded: 'Lei Geral de Proteção de Dados',
    context: 'Lei brasileira de privacidade de dados pessoais'
  },
  PIO: {
    abbreviation: 'PIO',
    expanded: 'Pressão Intraocular',
    context: 'Medida da pressão dentro do olho'
  },
  DMRI: {
    abbreviation: 'DMRI',
    expanded: 'Degeneração Macular Relacionada à Idade',
    context: 'Doença que afeta a visão central em idosos'
  }
};

/**
 * Expand abbreviation with context
 */
export function expandAbbreviation(abbr: string): AbbreviationResult | undefined {
  return commonAbbreviations[abbr.toUpperCase()];
}

/**
 * Focus Order Validator (WCAG 2.4.3)
 */
export interface FocusOrderResult {
  isLogical: boolean;
  issues: string[];
  recommendations: string[];
}

/**
 * Validate focus order in component
 */
export function validateFocusOrder(elements: HTMLElement[]): FocusOrderResult {
  const issues: string[] = [];
  const recommendations: string[] = [];

  // Check tabindex usage
  elements.forEach((el, index) => {
    const tabindex = el.getAttribute('tabindex');
    if (tabindex && parseInt(tabindex) > 0) {
      issues.push(
        `Element ${index} has tabindex="${tabindex}". Avoid positive tabindex values.`
      );
      recommendations.push('Use tabindex="0" for focusable elements, "-1" to remove from tab order.');
    }
  });

  // Check visual vs DOM order
  const positions = elements.map((el) => ({
    el,
    rect: el.getBoundingClientRect()
  }));

  for (let i = 1; i < positions.length; i++) {
    const prev = positions[i - 1];
    const curr = positions[i];

    // Check if focus order matches visual order (top to bottom, left to right)
    if (curr.rect.top < prev.rect.top - 10) {
      // 10px tolerance
      issues.push(`Element ${i} appears above element ${i - 1} but comes after in tab order.`);
      recommendations.push('Reorder DOM elements to match visual layout.');
    }
  }

  return {
    isLogical: issues.length === 0,
    issues,
    recommendations
  };
}

/**
 * Error Prevention Helper (WCAG 3.3.6 - AAA)
 */
export interface ErrorPreventionOptions {
  confirmationRequired: boolean;
  undoAvailable: boolean;
  checkBeforeSubmit: boolean;
}

export const criticalActions: Record<string, ErrorPreventionOptions> = {
  cancel_appointment: {
    confirmationRequired: true,
    undoAvailable: false,
    checkBeforeSubmit: true
  },
  delete_account: {
    confirmationRequired: true,
    undoAvailable: false,
    checkBeforeSubmit: true
  },
  submit_payment: {
    confirmationRequired: true,
    undoAvailable: false,
    checkBeforeSubmit: true
  },
  change_email: {
    confirmationRequired: true,
    undoAvailable: true,
    checkBeforeSubmit: true
  }
};

/**
 * Check if action requires error prevention
 */
export function requiresErrorPrevention(action: string): ErrorPreventionOptions | undefined {
  return criticalActions[action];
}

/**
 * WCAG AAA Compliance Checker
 */
export interface ComplianceReport {
  score: number; // 0-100
  level: 'A' | 'AA' | 'AAA' | 'Fail';
  checks: {
    name: string;
    criterion: string;
    passed: boolean;
    details: string;
  }[];
  recommendations: string[];
}

/**
 * Generate compliance report for component
 */
export function generateComplianceReport(checks: {
  contrast?: ContrastResult;
  readability?: ReadabilityResult;
  touchTargets?: TouchTargetResult[];
  textSpacing?: TextSpacingResult;
  focusOrder?: FocusOrderResult;
}): ComplianceReport {
  const reportChecks: ComplianceReport['checks'] = [];
  const recommendations: string[] = [];
  let totalPassed = 0;
  let totalChecks = 0;

  // Contrast check
  if (checks.contrast) {
    totalChecks++;
    const passed = checks.contrast.passes.AAA;
    if (passed) totalPassed++;

    reportChecks.push({
      name: 'Color Contrast',
      criterion: 'WCAG 1.4.6 (AAA)',
      passed,
      details: `Contrast ratio: ${checks.contrast.ratio}:1 (minimum: 7:1)`
    });

    if (checks.contrast.recommendation) {
      recommendations.push(checks.contrast.recommendation);
    }
  }

  // Readability check
  if (checks.readability) {
    totalChecks++;
    const passed = checks.readability.passesAAA;
    if (passed) totalPassed++;

    reportChecks.push({
      name: 'Reading Level',
      criterion: 'WCAG 3.1.5 (AAA)',
      passed,
      details: `Grade level: ${checks.readability.gradeLevel} (maximum: 9)`
    });

    recommendations.push(...checks.readability.recommendations);
  }

  // Touch targets check
  if (checks.touchTargets) {
    totalChecks++;
    const allPass = checks.touchTargets.every((t) => t.passesAAA);
    if (allPass) totalPassed++;

    reportChecks.push({
      name: 'Touch Target Size',
      criterion: 'WCAG 2.5.5 (AAA)',
      passed: allPass,
      details: `Checked ${checks.touchTargets.length} interactive elements`
    });

    checks.touchTargets.forEach((target) => {
      if (target.recommendation) {
        recommendations.push(target.recommendation);
      }
    });
  }

  // Text spacing check
  if (checks.textSpacing) {
    totalChecks++;
    const passed = checks.textSpacing.passesAAA;
    if (passed) totalPassed++;

    reportChecks.push({
      name: 'Text Spacing',
      criterion: 'WCAG 1.4.8 (AAA)',
      passed,
      details: `Line height: ${checks.textSpacing.lineHeight}, Letter spacing: ${checks.textSpacing.letterSpacing}em`
    });

    recommendations.push(...checks.textSpacing.issues);
  }

  // Focus order check
  if (checks.focusOrder) {
    totalChecks++;
    const passed = checks.focusOrder.isLogical;
    if (passed) totalPassed++;

    reportChecks.push({
      name: 'Focus Order',
      criterion: 'WCAG 2.4.3 (A)',
      passed,
      details: passed ? 'Focus order is logical' : 'Focus order issues detected'
    });

    recommendations.push(...checks.focusOrder.recommendations);
  }

  const score = totalChecks > 0 ? Math.round((totalPassed / totalChecks) * 100) : 0;

  let level: 'A' | 'AA' | 'AAA' | 'Fail' = 'Fail';
  if (score === 100) level = 'AAA';
  else if (score >= 80) level = 'AA';
  else if (score >= 60) level = 'A';

  return {
    score,
    level,
    checks: reportChecks,
    recommendations: [...new Set(recommendations)] // Remove duplicates
  };
}
