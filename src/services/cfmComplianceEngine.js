/**
 * CFM Compliance Engine
 * Implements medical safety filters and compliance validation according to CFM regulations
 */

class CFMComplianceEngine {
    constructor() {
        this.emergencyKeywords = [
            'socorro', 'emergência', 'urgente', 'dor intensa', 'perdi a visão',
            'não consigo ver', 'sangramento', 'trauma', 'acidente', 'desmaiei',
            'tontura severa', 'vômito', 'náusea intensa', 'febre alta',
            'dificuldade para respirar', 'dor no peito', 'palpitação'
        ];

        this.medicalTerms = [
            'diagnóstico', 'doença', 'sintoma', 'tratamento', 'medicamento',
            'remédio', 'prescrição', 'receita', 'cirurgia', 'operação',
            'exame', 'resultado', 'análise', 'patologia', 'infecção',
            'inflamação', 'alergia', 'reação', 'efeito colateral'
        ];

        this.prohibitedAdvice = [
            'tome', 'use', 'aplique', 'faça', 'evite', 'pare de tomar',
            'aumente a dose', 'diminua a dose', 'substitua', 'troque',
            'você tem', 'é provável que seja', 'pode ser', 'certamente é'
        ];

        this.disclaimers = {
            general: 'Esta informação é apenas educativa e não substitui uma consulta médica. Sempre procure orientação profissional.',
            emergency: 'Em caso de emergência, procure imediatamente atendimento médico ou ligue para 192 (SAMU).',
            appointment: 'Para uma avaliação adequada, recomendamos agendar uma consulta com nosso especialista.',
            referral: 'O encaminhamento para especialistas deve ser avaliado por um médico durante consulta presencial.'
        };
    }

    /**
     * Analyzes message content for compliance issues
     * @param {string} message - User message to analyze
     * @returns {Object} Compliance analysis result
     */
    analyzeMessage(message) {
        const lowerMessage = message.toLowerCase();

        const result = {
            isCompliant: true,
            emergencyDetected: false,
            medicalAdviceDetected: false,
            diagnosticAttempt: false,
            prescriptionAttempt: false,
            requiredDisclaimers: [],
            recommendedActions: [],
            riskLevel: 'low'
        };

        // Check for emergency keywords
        const emergencyDetected = this.emergencyKeywords.some(keyword =>
            lowerMessage.includes(keyword.toLowerCase())
        );

        if (emergencyDetected) {
            result.emergencyDetected = true;
            result.riskLevel = 'critical';
            result.requiredDisclaimers.push(this.disclaimers.emergency);
            result.recommendedActions.push('EMERGENCY_RESPONSE');
            result.isCompliant = false; // Requires special handling
        }

        // Check for medical advice attempts (in responses, not user messages)
        // This checks if the AI is trying to give medical advice
        const medicalAdvicePatterns = [
            /você deve/i,
            /recomendo que/i,
            /sugiro que/i,
            /é melhor/i,
            /deveria/i
        ];

        const medicalAdviceDetected = medicalAdvicePatterns.some(pattern =>
            pattern.test(message)
        );

        if (medicalAdviceDetected) {
            result.medicalAdviceDetected = true;
            result.riskLevel = result.riskLevel === 'critical' ? 'critical' : 'high';
            result.requiredDisclaimers.push(this.disclaimers.general);
            result.recommendedActions.push('REDIRECT_TO_CONSULTATION');
        }

        // Check for diagnostic attempts
        const diagnosticPatterns = [
            /o que (?:pode ser|é|seria)/i,
            /qual (?:o diagnóstico|a doença)/i,
            /estou com/i,
            /tenho (?:sintomas|sinais|dor)/i
        ];

        const diagnosticAttempt = diagnosticPatterns.some(pattern =>
            pattern.test(message)
        );

        if (diagnosticAttempt) {
            result.diagnosticAttempt = true;
            result.riskLevel = result.riskLevel === 'critical' ? 'critical' : 'medium';
            result.requiredDisclaimers.push(this.disclaimers.appointment);
            result.recommendedActions.push('SUGGEST_APPOINTMENT');
        }

        // Check for prescription attempts
        const prescriptionPatterns = [
            /que (?:remédio|medicamento)/i,
            /posso tomar/i,
            /devo tomar/i,
            /receita/i,
            /prescrição/i
        ];

        const prescriptionAttempt = prescriptionPatterns.some(pattern =>
            pattern.test(message)
        );

        if (prescriptionAttempt) {
            result.prescriptionAttempt = true;
            result.riskLevel = result.riskLevel === 'critical' ? 'critical' : 'high';
            result.requiredDisclaimers.push(this.disclaimers.general);
            result.recommendedActions.push('NO_PRESCRIPTION_ADVICE');
        }

        // Check for general medical content
        const containsMedicalTerms = this.medicalTerms.some(term =>
            lowerMessage.includes(term.toLowerCase())
        );

        if (containsMedicalTerms && result.requiredDisclaimers.length === 0) {
            result.requiredDisclaimers.push(this.disclaimers.general);
        }

        return result;
    }

    /**
     * Filters and modifies response based on compliance requirements
     * @param {string} response - Original AI response
     * @param {Object} complianceResult - Result from analyzeMessage
     * @returns {Object} Filtered response with compliance modifications
     */
    filterResponse(response, complianceResult) {
        let filteredResponse = response;
        const modifications = [];

        // Handle emergency situations
        if (complianceResult.emergencyDetected) {
            filteredResponse = `${this.disclaimers.emergency}\n\nPara situações de emergência oftalmológica, procure imediatamente:\n- Pronto Socorro Oftalmológico mais próximo\n- Hospital com atendimento 24h\n- Ligue 192 (SAMU)\n\nSe não for uma emergência, posso ajudá-lo a agendar uma consulta.`;
            modifications.push('EMERGENCY_OVERRIDE');
            return { response: filteredResponse, modifications };
        }

        // Remove prohibited medical advice
        if (complianceResult.medicalAdviceDetected || complianceResult.prescriptionAttempt) {
            // Replace advice-giving language with informational language
            filteredResponse = filteredResponse
                .replace(/você deve/gi, 'geralmente recomenda-se')
                .replace(/tome/gi, 'pode ser prescrito')
                .replace(/use/gi, 'pode ser indicado')
                .replace(/faça/gi, 'pode ser recomendado');

            modifications.push('ADVICE_NEUTRALIZED');
        }

        // Add required disclaimers
        if (complianceResult.requiredDisclaimers.length > 0) {
            const uniqueDisclaimers = [...new Set(complianceResult.requiredDisclaimers)];
            filteredResponse += '\n\n' + uniqueDisclaimers.join('\n\n');
            modifications.push('DISCLAIMERS_ADDED');
        }

        // Add appointment suggestion for diagnostic attempts
        if (complianceResult.diagnosticAttempt) {
            filteredResponse += '\n\nPara uma avaliação precisa, recomendo agendar uma consulta. Posso ajudá-lo com isso?';
            modifications.push('APPOINTMENT_SUGGESTED');
        }

        return {
            response: filteredResponse,
            modifications,
            complianceLevel: this.getComplianceLevel(complianceResult)
        };
    }

    /**
     * Validates if a response meets CFM compliance standards
     * @param {string} response - Response to validate
     * @returns {Object} Validation result
     */
    validateResponse(response) {
        const validation = {
            isValid: true,
            violations: [],
            warnings: [],
            requiredActions: []
        };

        // Check for diagnostic language
        const diagnosticPatterns = [
            /você tem/i,
            /é provável que seja/i,
            /certamente é/i,
            /o diagnóstico é/i
        ];

        diagnosticPatterns.forEach(pattern => {
            if (pattern.test(response)) {
                validation.violations.push('DIAGNOSTIC_LANGUAGE_DETECTED');
                validation.isValid = false;
            }
        });

        // Check for prescription language
        const prescriptionPatterns = [
            /tome este medicamento/i,
            /use este remédio/i,
            /a dose recomendada/i
        ];

        prescriptionPatterns.forEach(pattern => {
            if (pattern.test(response)) {
                validation.violations.push('PRESCRIPTION_LANGUAGE_DETECTED');
                validation.isValid = false;
            }
        });

        // Check for required disclaimers when medical content is present
        const hasMedicalContent = this.medicalTerms.some(term =>
            response.toLowerCase().includes(term.toLowerCase())
        );

        const hasDisclaimer = Object.values(this.disclaimers).some(disclaimer =>
            response.includes(disclaimer)
        );

        if (hasMedicalContent && !hasDisclaimer) {
            validation.warnings.push('MISSING_MEDICAL_DISCLAIMER');
            validation.requiredActions.push('ADD_DISCLAIMER');
        }

        return validation;
    }

    /**
     * Gets compliance level based on analysis result
     * @param {Object} complianceResult - Analysis result
     * @returns {string} Compliance level
     */
    getComplianceLevel(complianceResult) {
        if (complianceResult.emergencyDetected) return 'CRITICAL';
        if (complianceResult.prescriptionAttempt || complianceResult.medicalAdviceDetected) return 'HIGH_RISK';
        if (complianceResult.diagnosticAttempt) return 'MEDIUM_RISK';
        return 'COMPLIANT';
    }

    /**
     * Generates emergency response
     * @returns {string} Emergency response message
     */
    generateEmergencyResponse() {
        return `${this.disclaimers.emergency}

🚨 EMERGÊNCIA OFTALMOLÓGICA 🚨

Procure IMEDIATAMENTE:
• Pronto Socorro Oftalmológico
• Hospital com atendimento 24h
• Ligue 192 (SAMU)

Sintomas que requerem atendimento urgente:
• Perda súbita de visão
• Dor ocular intensa
• Trauma ocular
• Flashes de luz com perda de campo visual
• Halos coloridos ao redor das luzes

Se não for uma emergência, posso ajudá-lo a agendar uma consulta para avaliação adequada.`;
    }

    /**
     * Generates CFM-compliant informational response
     * @param {string} topic - Medical topic
     * @returns {string} Compliant informational response
     */
    generateInformationalResponse(topic) {
        return `Posso fornecer informações gerais sobre ${topic}, mas é importante lembrar que ${this.disclaimers.general}

Para uma avaliação personalizada e orientações específicas para seu caso, recomendo agendar uma consulta com nosso especialista. Posso ajudá-lo com o agendamento?`;
    }
}

export default CFMComplianceEngine;