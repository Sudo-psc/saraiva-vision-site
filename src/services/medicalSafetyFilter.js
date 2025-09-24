/**
 * Medical Safety Filter
 * Advanced medical content filtering and safety validation system
 */

class MedicalSafetyFilter {
    constructor() {
        this.emergencyIndicators = {
            vision: [
                'perdi a visão', 'não consigo ver', 'visão turva repentina',
                'flashes de luz', 'cortina na visão', 'sombra no campo visual',
                'perda de campo visual', 'visão dupla súbita'
            ],
            pain: [
                'dor intensa', 'dor insuportável', 'dor aguda', 'dor lancinante',
                'dor que não passa', 'dor severa', 'dor forte no olho'
            ],
            trauma: [
                'acidente', 'trauma', 'pancada', 'objeto no olho',
                'química no olho', 'queimadura', 'corte', 'perfuração'
            ],
            symptoms: [
                'sangramento', 'pus', 'secreção intensa', 'inchaço súbito',
                'vermelhidão intensa', 'febre alta', 'náusea', 'vômito'
            ]
        };

        this.prohibitedMedicalActions = [
            /diagnosticar/i, /prescrever/i, /receitar/i, /medicar/i,
            /tratar/i, /curar/i, /operar/i, /fazer cirurgia/i,
            /prescreva/i, /receite/i, /pode diagnosticar/i
        ];

        this.riskLevels = {
            CRITICAL: 'critical',
            HIGH: 'high',
            MEDIUM: 'medium',
            LOW: 'low'
        };

        this.safetyResponses = {
            emergency: {
                message: 'Detectei que você pode estar enfrentando uma situação de emergência. Por favor, procure atendimento médico imediatamente.',
                actions: ['EMERGENCY_CONTACT', 'STOP_CONVERSATION']
            },
            diagnostic: {
                message: 'Não posso fornecer diagnósticos. Para uma avaliação adequada, é necessária uma consulta presencial.',
                actions: ['SUGGEST_APPOINTMENT', 'PROVIDE_GENERAL_INFO']
            },
            prescription: {
                message: 'Não posso prescrever medicamentos. Apenas um médico pode avaliar e prescrever tratamentos adequados.',
                actions: ['REDIRECT_TO_DOCTOR', 'SUGGEST_APPOINTMENT']
            }
        };
    }

    /**
     * Performs comprehensive safety analysis of user input
     * @param {string} input - User input to analyze
     * @returns {Object} Safety analysis result
     */
    analyzeSafety(input) {
        const analysis = {
            riskLevel: this.riskLevels.LOW,
            emergencyDetected: false,
            medicalRiskFactors: [],
            prohibitedActions: [],
            safetyViolations: [],
            recommendedResponse: null,
            requiresIntervention: false
        };

        const lowerInput = input.toLowerCase();

        // Emergency detection
        const emergencyDetected = this.detectEmergency(lowerInput);
        if (emergencyDetected.detected) {
            analysis.riskLevel = this.riskLevels.CRITICAL;
            analysis.emergencyDetected = true;
            analysis.medicalRiskFactors = emergencyDetected.factors;
            analysis.recommendedResponse = this.safetyResponses.emergency;
            analysis.requiresIntervention = true;
        }

        // Prohibited medical actions detection
        const prohibitedActions = this.detectProhibitedActions(lowerInput);
        if (prohibitedActions.length > 0) {
            analysis.prohibitedActions = prohibitedActions;
            analysis.riskLevel = analysis.riskLevel === this.riskLevels.CRITICAL ?
                this.riskLevels.CRITICAL : this.riskLevels.HIGH;
        }

        // Medical advice request detection
        const medicalAdviceRequest = this.detectMedicalAdviceRequest(lowerInput);
        if (medicalAdviceRequest.detected) {
            analysis.safetyViolations.push('MEDICAL_ADVICE_REQUEST');
            analysis.recommendedResponse = medicalAdviceRequest.type === 'diagnostic' ?
                this.safetyResponses.diagnostic : this.safetyResponses.prescription;
        }

        return analysis;
    }

    /**
     * Detects emergency situations in user input
     * @param {string} input - Lowercase user input
     * @returns {Object} Emergency detection result
     */
    detectEmergency(input) {
        const detectedFactors = [];

        // Check each emergency category
        Object.entries(this.emergencyIndicators).forEach(([category, indicators]) => {
            indicators.forEach(indicator => {
                if (input.includes(indicator.toLowerCase())) {
                    detectedFactors.push({
                        category,
                        indicator,
                        severity: this.getEmergencySeverity(indicator)
                    });
                }
            });
        });

        return {
            detected: detectedFactors.length > 0,
            factors: detectedFactors,
            severity: detectedFactors.length > 0 ?
                Math.max(...detectedFactors.map(f => f.severity)) : 0
        };
    }

    /**
     * Detects prohibited medical actions in user input
     * @param {string} input - Lowercase user input
     * @returns {Array} List of detected prohibited actions
     */
    detectProhibitedActions(input) {
        return this.prohibitedMedicalActions.filter(action =>
            action.test(input)
        ).map(action => action.source);
    }

    /**
     * Detects medical advice requests
     * @param {string} input - Lowercase user input
     * @returns {Object} Medical advice detection result
     */
    detectMedicalAdviceRequest(input) {
        const diagnosticPatterns = [
            /o que (?:pode ser|é|seria)/,
            /qual (?:o diagnóstico|a doença)/,
            /estou com/,
            /tenho (?:sintomas|sinais)/,
            /isso é normal/,
            /é grave/
        ];

        const prescriptionPatterns = [
            /que (?:remédio|medicamento)/,
            /posso (?:tomar|usar)/,
            /como tratar/,
            /receita/,
            /prescrição/,
            /dose/,
            /preciso de receita/
        ];

        const diagnosticDetected = diagnosticPatterns.some(pattern => pattern.test(input));
        const prescriptionDetected = prescriptionPatterns.some(pattern => pattern.test(input));

        if (diagnosticDetected) {
            return { detected: true, type: 'diagnostic' };
        }

        if (prescriptionDetected) {
            return { detected: true, type: 'prescription' };
        }

        return { detected: false, type: null };
    }

    /**
     * Gets emergency severity score
     * @param {string} indicator - Emergency indicator
     * @returns {number} Severity score (1-10)
     */
    getEmergencySeverity(indicator) {
        const highSeverity = [
            'perdi a visão', 'não consigo ver', 'trauma', 'acidente',
            'objeto no olho', 'química no olho', 'queimadura'
        ];

        const mediumSeverity = [
            'dor intensa', 'dor insuportável', 'sangramento',
            'flashes de luz', 'cortina na visão'
        ];

        if (highSeverity.some(severe => indicator.includes(severe))) return 10;
        if (mediumSeverity.some(medium => indicator.includes(medium))) return 7;
        return 4;
    }

    /**
     * Filters AI response for medical safety compliance
     * @param {string} response - Original AI response
     * @param {Object} safetyAnalysis - Safety analysis result
     * @returns {Object} Filtered response with safety modifications
     */
    filterResponse(response, safetyAnalysis) {
        let filteredResponse = response;
        const modifications = [];

        // Handle critical emergencies
        if (safetyAnalysis.riskLevel === this.riskLevels.CRITICAL) {
            filteredResponse = this.generateEmergencyResponse(safetyAnalysis.medicalRiskFactors);
            modifications.push('EMERGENCY_OVERRIDE');
            return { response: filteredResponse, modifications, blocked: false };
        }

        // Remove prohibited medical actions
        if (safetyAnalysis.prohibitedActions && safetyAnalysis.prohibitedActions.length > 0) {
            filteredResponse = this.neutralizeMedicalAdvice(filteredResponse);
            modifications.push('MEDICAL_ADVICE_NEUTRALIZED');
        }

        // Handle safety violations
        if (safetyAnalysis.safetyViolations && safetyAnalysis.safetyViolations.length > 0) {
            filteredResponse = this.addSafetyDisclaimers(filteredResponse, safetyAnalysis);
            modifications.push('SAFETY_DISCLAIMERS_ADDED');
        }

        // Validate final response
        const finalValidation = this.validateResponseSafety(filteredResponse);
        if (!finalValidation.isSafe) {
            filteredResponse = this.generateSafeAlternativeResponse();
            modifications.push('UNSAFE_RESPONSE_REPLACED');
        }

        return {
            response: filteredResponse,
            modifications,
            blocked: false,
            safetyScore: this.calculateSafetyScore(filteredResponse)
        };
    }

    /**
     * Neutralizes medical advice in response
     * @param {string} response - Response to neutralize
     * @returns {string} Neutralized response
     */
    neutralizeMedicalAdvice(response) {
        return response
            .replace(/você deve/gi, 'geralmente é recomendado')
            .replace(/tome/gi, 'pode ser prescrito')
            .replace(/use/gi, 'pode ser indicado')
            .replace(/faça/gi, 'pode ser sugerido')
            .replace(/é provável que seja/gi, 'pode estar relacionado a')
            .replace(/certamente é/gi, 'pode ser')
            .replace(/você tem/gi, 'os sintomas podem indicar');
    }

    /**
     * Adds safety disclaimers to response
     * @param {string} response - Original response
     * @param {Object} safetyAnalysis - Safety analysis
     * @returns {string} Response with disclaimers
     */
    addSafetyDisclaimers(response, safetyAnalysis) {
        let disclaimers = [];

        if (safetyAnalysis.safetyViolations.includes('MEDICAL_ADVICE_REQUEST')) {
            disclaimers.push('⚠️ Esta informação é apenas educativa e não substitui uma consulta médica.');
        }

        if (safetyAnalysis.prohibitedActions.length > 0) {
            disclaimers.push('📋 Para diagnósticos e prescrições, é necessária avaliação médica presencial.');
        }

        if (disclaimers.length > 0) {
            return response + '\n\n' + disclaimers.join('\n');
        }

        return response;
    }

    /**
     * Validates response safety
     * @param {string} response - Response to validate
     * @returns {Object} Safety validation result
     */
    validateResponseSafety(response) {
        const validation = {
            isSafe: true,
            violations: [],
            riskFactors: []
        };

        // Check for diagnostic language
        const diagnosticPatterns = [
            /você tem/i,
            /o diagnóstico é/i,
            /certamente é/i,
            /definitivamente/i
        ];

        diagnosticPatterns.forEach(pattern => {
            if (pattern.test(response)) {
                validation.violations.push('DIAGNOSTIC_LANGUAGE');
                validation.isSafe = false;
            }
        });

        // Check for prescription language
        const prescriptionPatterns = [
            /tome este/i,
            /use este/i,
            /a dose é/i,
            /prescrevo/i
        ];

        prescriptionPatterns.forEach(pattern => {
            if (pattern.test(response)) {
                validation.violations.push('PRESCRIPTION_LANGUAGE');
                validation.isSafe = false;
            }
        });

        return validation;
    }

    /**
     * Generates emergency response
     * @param {Array} riskFactors - Detected risk factors
     * @returns {string} Emergency response
     */
    generateEmergencyResponse(riskFactors) {
        const highestRisk = riskFactors.reduce((max, factor) =>
            factor.severity > max.severity ? factor : max, riskFactors[0]);

        return `🚨 SITUAÇÃO DE EMERGÊNCIA DETECTADA 🚨

Com base no que você descreveu, esta pode ser uma situação que requer atendimento médico IMEDIATO.

PROCURE AGORA:
• Pronto Socorro Oftalmológico
• Hospital com atendimento 24h
• Ligue 192 (SAMU)

⚠️ Não aguarde - em emergências oftalmológicas, o tempo é crucial para preservar a visão.

Se não for uma emergência real, posso ajudá-lo a agendar uma consulta para avaliação adequada.`;
    }

    /**
     * Generates safe alternative response
     * @returns {string} Safe alternative response
     */
    generateSafeAlternativeResponse() {
        return `Entendo sua preocupação, mas não posso fornecer orientações médicas específicas através deste canal.

Para sua segurança e para receber o melhor atendimento, recomendo:

📅 Agendar uma consulta para avaliação presencial
📞 Entrar em contato diretamente com nossa clínica
🏥 Procurar atendimento médico se for urgente

Posso ajudá-lo a agendar uma consulta ou fornecer informações gerais sobre nossos serviços. Como posso auxiliá-lo?`;
    }

    /**
     * Calculates safety score for response
     * @param {string} response - Response to score
     * @returns {number} Safety score (0-100)
     */
    calculateSafetyScore(response) {
        let score = 100;

        // Deduct points for risky language
        const riskPatterns = [
            { pattern: /você deve/gi, penalty: 20 },
            { pattern: /tome/gi, penalty: 15 },
            { pattern: /certamente/gi, penalty: 10 },
            { pattern: /diagnóstico/gi, penalty: 5 }
        ];

        riskPatterns.forEach(({ pattern, penalty }) => {
            const matches = (response.match(pattern) || []).length;
            score -= matches * penalty;
        });

        // Add points for safety indicators
        const safetyIndicators = [
            /consulta médica/gi,
            /avaliação presencial/gi,
            /informação educativa/gi,
            /não substitui/gi
        ];

        safetyIndicators.forEach(pattern => {
            if (pattern.test(response)) {
                score += 5;
            }
        });

        return Math.max(0, Math.min(100, score));
    }
}

export default MedicalSafetyFilter;