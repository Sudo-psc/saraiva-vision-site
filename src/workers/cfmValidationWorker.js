/**
 * CFM Compliance Validation Worker
 * Handles CPU-intensive compliance validation in a separate thread
 * to prevent blocking the main UI thread
 */

// Import CFM validation rules from shared configuration
import { validationRules } from '../config/cfmRules.js';

/**
 * Validate content against CFM regulations
 */
function validateContent(content, options = {}) {
    if (!content || typeof content !== 'string') {
        return {
            valid: false,
            score: 0,
            violations: [{ type: 'invalid_content', message: 'Conteúdo inválido ou vazio' }],
            recommendations: []
        };
    }

    const violations = [];
    const recommendations = [];
    let score = 100;

    // Rule 1: Medical disclaimer validation
    const disclaimerCheck = validationRules.disclaimer.phrases.some(phrase =>
        content.toLowerCase().includes(phrase.toLowerCase())
    );

    if (!disclaimerCheck) {
        violations.push({
            type: 'disclaimer_missing',
            severity: 'critical',
            message: 'Disclaimer médico obrigatório ausente',
            rule: 'Resolução CFM 1.974/2011',
            weight: validationRules.disclaimer.weight
        });
        score -= validationRules.disclaimer.weight;
        recommendations.push({
            type: 'add_disclaimer',
            message: 'Adicionar disclaimer médico conforme resolução CFM',
            template: 'medical_disclaimer'
        });
    }

    // Rule 2: CRM identification
    const crmCheck = validationRules.crmIdentification.pattern.test(content);
    if (!crmCheck) {
        violations.push({
            type: 'crm_missing',
            severity: 'high',
            message: 'Identificação CRM do médico responsável ausente',
            rule: 'Código de Ética Médica Art. 119',
            weight: validationRules.crmIdentification.weight
        });
        score -= validationRules.crmIdentification.weight;
        recommendations.push({
            type: 'add_crm',
            message: 'Incluir número CRM do médico responsável',
            template: 'crm_identification'
        });
    }

    // Rule 3: Patient privacy protection
    const privacyViolationFound = validationRules.patientPrivacy.patterns.some(pattern => {
        const matches = content.match(pattern);
        if (matches && matches.length > 0) {
            violations.push({
                type: 'privacy_violation',
                severity: 'critical',
                message: `Possível exposição de dados pessoais de pacientes (${matches.length} ocorrências)`,
                rule: 'LGPD Art. 11 e CFM Resolução 1.821/2007',
                weight: validationRules.patientPrivacy.weight,
                count: matches.length
            });
            score -= validationRules.patientPrivacy.weight;
            recommendations.push({
                type: 'anonymize_data',
                message: 'Remover ou anonimizar dados pessoais identificados',
                template: 'data_anonymization'
            });
            return true; // Stop iteration after first match
        }
        return false;
    });

    // Rule 4: Medical advice restrictions
    const medicalAdviceViolationFound = validationRules.medicalAdvice.patterns.some(pattern => {
        if (pattern.test(content)) {
            violations.push({
                type: 'unauthorized_advice',
                severity: 'high',
                message: 'Possível prescrição ou orientação médica específica sem consulta',
                rule: 'Código de Ética Médica Art. 37',
                weight: validationRules.medicalAdvice.weight
            });
            score -= validationRules.medicalAdvice.weight;
            recommendations.push({
                type: 'generic_advice',
                message: 'Converter orientações específicas em informações gerais',
                template: 'generic_medical_info'
            });
            return true; // Stop iteration after first match
        }
        return false;
    });

    // Rule 5: Emergency guidance
    const mentionsEmergency = content.toLowerCase().includes('emergência');
    const hasProperEmergencyGuidance = content.includes('192') || content.includes('SAMU') || content.includes('atendimento médico imediato');

    if (mentionsEmergency && !hasProperEmergencyGuidance) {
        violations.push({
            type: 'emergency_guidance',
            severity: 'medium',
            message: 'Menção a emergência sem orientação adequada para atendimento',
            rule: 'Resolução CFM 1.974/2011',
            weight: validationRules.emergencyGuidance.weight
        });
        score -= validationRules.emergencyGuidance.weight;
        recommendations.push({
            type: 'add_emergency_guidance',
            message: 'Incluir orientação para SAMU (192) em casos de emergência',
            template: 'emergency_guidance'
        });
    }

    const result = {
        valid: score >= (options.strictMode ? 90 : 70),
        score: Math.max(score, 0),
        violations,
        recommendations,
        level: score >= 90 ? 'excellent' : score >= 70 ? 'good' : score >= 50 ? 'acceptable' : 'inadequate',
        timestamp: new Date().toISOString(),
        contentLength: content.length
    };

    return result;
}

/**
 * Handle messages from main thread
 */
self.onmessage = function(e) {
    const { id, type, content, options = {} } = e.data;

    try {
        switch (type) {
            case 'validate':
                const result = validateContent(content, options);
                self.postMessage({
                    id,
                    type: 'validation_result',
                    result,
                    success: true
                });
                break;

            case 'batch_validate':
                const { contents, batchOptions = {} } = e.data;
                const results = contents.map((content, index) => {
                    try {
                        return validateContent(content, options);
                    } catch (error) {
                        return {
                            valid: false,
                            score: 0,
                            violations: [{
                                type: 'validation_error',
                                message: `Erro na validação: ${error.message}`
                            }],
                            recommendations: []
                        };
                    }
                });

                self.postMessage({
                    id,
                    type: 'batch_validation_result',
                    results,
                    success: true
                });
                break;

            default:
                self.postMessage({
                    id,
                    type: 'error',
                    error: `Unknown message type: ${type}`,
                    success: false
                });
        }
    } catch (error) {
        self.postMessage({
            id,
            type: 'error',
            error: error.message,
            success: false
        });
    }
};