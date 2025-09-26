/**
 * CFM Compliance Rules Configuration
 * Central configuration for Brazilian Medical Council (CFM) validation rules
 * Shared between main thread and Web Worker implementations
 */

export const validationRules = {
    disclaimer: {
        required: true,
        phrases: [
            'não substitui consulta médica',
            'procure orientação médica',
            'consulte um médico',
            'diagnóstico médico'
        ],
        weight: 30
    },
    crmIdentification: {
        required: true,
        pattern: /CRM[- ]?[A-Z]{2}[- ]?\d{1,6}/i,
        weight: 20
    },
    patientPrivacy: {
        required: true,
        patterns: [
            /\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/, // CPF - simplified
            /paciente\s+[A-Z][a-z]{1,15}\s+[A-Z][a-z]{1,15}\b/, // Patient names - bounded
            /\b\d{2}\/\d{2}\/\d{4}\b\s*nascimento/gi // Birth dates - simplified
        ],
        weight: 40
    },
    medicalAdvice: {
        required: false,
        patterns: [
            /recomendo que (?:tome|use|faça)\b/gi,
            /você deve tomar\b/gi,
            /o tratamento (?:é|deve ser)\b/gi,
            /a dose (?:correta|adequada) é\b/gi,
            /pare de tomar\b/gi
        ],
        weight: 25
    },
    emergencyGuidance: {
        required: false,
        weight: 10
    }
};

/**
 * Default validation options
 */
export const defaultValidationOptions = {
    strictMode: false,
    enableReporting: true,
    cacheTimeout: 5 * 60 * 1000 // 5 minutes
};

/**
 * Compliance level thresholds
 */
export const complianceLevels = {
    excellent: 90,
    good: 70,
    acceptable: 50,
    inadequate: 0
};

/**
 * Get compliance level based on score
 */
export const getComplianceLevel = (score) => {
    if (score >= complianceLevels.excellent) return 'excellent';
    if (score >= complianceLevels.good) return 'good';
    if (score >= complianceLevels.acceptable) return 'acceptable';
    return 'inadequate';
};

/**
 * Validation rule references
 */
export const legalReferences = {
    disclaimer: 'Resolução CFM 1.974/2011',
    crmIdentification: 'Código de Ética Médica Art. 119',
    patientPrivacy: 'LGPD Art. 11 e CFM Resolução 1.821/2007',
    medicalAdvice: 'Código de Ética Médica Art. 37',
    emergencyGuidance: 'Resolução CFM 1.974/2011'
};