/**
 * Tests for CFM Compliance Engine
 */

import CFMComplianceEngine from '../cfmComplianceEngine.js';

describe('CFMComplianceEngine', () => {
    let engine;

    beforeEach(() => {
        engine = new CFMComplianceEngine();
    });

    describe('analyzeMessage', () => {
        test('should detect emergency situations', () => {
            const emergencyMessages = [
                'Socorro, perdi a visão de repente!',
                'Estou com dor intensa no olho',
                'Tive um acidente e algo entrou no meu olho'
            ];

            emergencyMessages.forEach(message => {
                const result = engine.analyzeMessage(message);
                expect(result.emergencyDetected).toBe(true);
                expect(result.riskLevel).toBe('critical');
                expect(result.recommendedActions).toContain('EMERGENCY_RESPONSE');
                expect(result.requiredDisclaimers).toContain(engine.disclaimers.emergency);
            });
        });

        test('should detect diagnostic attempts', () => {
            const diagnosticMessages = [
                'O que pode ser essa dor no olho?',
                'Estou com visão embaçada, qual o diagnóstico?',
                'Tenho sintomas de conjuntivite'
            ];

            diagnosticMessages.forEach(message => {
                const result = engine.analyzeMessage(message);
                expect(result.diagnosticAttempt).toBe(true);
                expect(result.recommendedActions).toContain('SUGGEST_APPOINTMENT');
                expect(result.requiredDisclaimers).toContain(engine.disclaimers.appointment);
            });
        });

        test('should detect prescription attempts', () => {
            const prescriptionMessages = [
                'Que remédio posso tomar para conjuntivite?',
                'Posso tomar colírio antibiótico?',
                'Preciso de uma receita para este medicamento'
            ];

            prescriptionMessages.forEach(message => {
                const result = engine.analyzeMessage(message);
                expect(result.prescriptionAttempt).toBe(true);
                expect(result.recommendedActions).toContain('NO_PRESCRIPTION_ADVICE');
                expect(result.requiredDisclaimers).toContain(engine.disclaimers.general);
            });
        });

        test('should handle safe general inquiries', () => {
            const safeMessages = [
                'Quais são os horários de atendimento?',
                'Como posso agendar uma consulta?',
                'Vocês atendem convênio?'
            ];

            safeMessages.forEach(message => {
                const result = engine.analyzeMessage(message);
                expect(result.emergencyDetected).toBe(false);
                expect(result.diagnosticAttempt).toBe(false);
                expect(result.prescriptionAttempt).toBe(false);
                expect(result.riskLevel).toBe('low');
            });
        });

        test('should detect medical advice attempts', () => {
            const adviceMessages = [
                'Você deve tomar este colírio',
                'Recomendo que use compressa fria',
                'É melhor fazer exercícios oculares'
            ];

            adviceMessages.forEach(message => {
                const result = engine.analyzeMessage(message);
                expect(result.medicalAdviceDetected).toBe(true);
                expect(result.recommendedActions).toContain('REDIRECT_TO_CONSULTATION');
            });
        });
    });

    describe('filterResponse', () => {
        test('should override response for emergencies', () => {
            const complianceResult = {
                emergencyDetected: true,
                riskLevel: 'critical',
                requiredDisclaimers: [engine.disclaimers.emergency],
                recommendedActions: ['EMERGENCY_RESPONSE']
            };

            const result = engine.filterResponse('Resposta original', complianceResult);

            expect(result.response).toContain('emergência');
            expect(result.response).toContain('192');
            expect(result.response).toContain('SAMU');
            expect(result.modifications).toContain('EMERGENCY_OVERRIDE');
        });

        test('should neutralize medical advice', () => {
            const complianceResult = {
                medicalAdviceDetected: true,
                riskLevel: 'high',
                requiredDisclaimers: [engine.disclaimers.general]
            };

            const originalResponse = 'Você deve tomar este remédio e usar colírio.';
            const result = engine.filterResponse(originalResponse, complianceResult);

            expect(result.response).not.toContain('você deve');
            expect(result.response).not.toContain('tome');
            expect(result.response).not.toContain('use');
            expect(result.modifications).toContain('ADVICE_NEUTRALIZED');
        });

        test('should add required disclaimers', () => {
            const complianceResult = {
                diagnosticAttempt: true,
                riskLevel: 'medium',
                requiredDisclaimers: [engine.disclaimers.general, engine.disclaimers.appointment]
            };

            const result = engine.filterResponse('Informação médica', complianceResult);

            expect(result.response).toContain(engine.disclaimers.general);
            expect(result.response).toContain(engine.disclaimers.appointment);
            expect(result.modifications).toContain('DISCLAIMERS_ADDED');
        });

        test('should suggest appointments for diagnostic attempts', () => {
            const complianceResult = {
                diagnosticAttempt: true,
                riskLevel: 'medium',
                requiredDisclaimers: [engine.disclaimers.appointment]
            };

            const result = engine.filterResponse('Resposta sobre sintomas', complianceResult);

            expect(result.response).toContain('agendar uma consulta');
            expect(result.modifications).toContain('APPOINTMENT_SUGGESTED');
        });
    });

    describe('validateResponse', () => {
        test('should detect diagnostic language violations', () => {
            const responses = [
                'Você tem conjuntivite',
                'É provável que seja glaucoma',
                'Certamente é uma inflamação',
                'O diagnóstico é catarata'
            ];

            responses.forEach(response => {
                const validation = engine.validateResponse(response);
                expect(validation.isValid).toBe(false);
                expect(validation.violations).toContain('DIAGNOSTIC_LANGUAGE_DETECTED');
            });
        });

        test('should detect prescription language violations', () => {
            const responses = [
                'Tome este medicamento duas vezes ao dia',
                'Use este remédio por uma semana',
                'A dose recomendada é de 2 gotas'
            ];

            responses.forEach(response => {
                const validation = engine.validateResponse(response);
                expect(validation.isValid).toBe(false);
                expect(validation.violations).toContain('PRESCRIPTION_LANGUAGE_DETECTED');
            });
        });

        test('should warn about missing disclaimers', () => {
            const response = 'Informações sobre glaucoma e tratamento.';
            const validation = engine.validateResponse(response);

            expect(validation.warnings).toContain('MISSING_MEDICAL_DISCLAIMER');
            expect(validation.requiredActions).toContain('ADD_DISCLAIMER');
        });

        test('should validate compliant responses', () => {
            const compliantResponse = `Informações gerais sobre catarata. ${engine.disclaimers.general}`;
            const validation = engine.validateResponse(compliantResponse);

            expect(validation.isValid).toBe(true);
            expect(validation.violations).toHaveLength(0);
        });
    });

    describe('getComplianceLevel', () => {
        test('should return correct compliance levels', () => {
            expect(engine.getComplianceLevel({ emergencyDetected: true })).toBe('CRITICAL');
            expect(engine.getComplianceLevel({ prescriptionAttempt: true })).toBe('HIGH_RISK');
            expect(engine.getComplianceLevel({ medicalAdviceDetected: true })).toBe('HIGH_RISK');
            expect(engine.getComplianceLevel({ diagnosticAttempt: true })).toBe('MEDIUM_RISK');
            expect(engine.getComplianceLevel({})).toBe('COMPLIANT');
        });
    });

    describe('generateEmergencyResponse', () => {
        test('should generate proper emergency response', () => {
            const response = engine.generateEmergencyResponse();

            expect(response).toContain('EMERGÊNCIA OFTALMOLÓGICA');
            expect(response).toContain('192');
            expect(response).toContain('SAMU');
            expect(response).toContain('Pronto Socorro');
            expect(response).toContain('atendimento 24h');
        });
    });

    describe('generateInformationalResponse', () => {
        test('should generate compliant informational response', () => {
            const topic = 'catarata';
            const response = engine.generateInformationalResponse(topic);

            expect(response).toContain(topic);
            expect(response).toContain(engine.disclaimers.general);
            expect(response).toContain('agendar uma consulta');
        });
    });

    describe('Edge cases and complex scenarios', () => {
        test('should handle multiple compliance issues in one message', () => {
            const complexMessage = 'Socorro, perdi a visão! O que pode ser? Que remédio devo tomar?';
            const result = engine.analyzeMessage(complexMessage);

            expect(result.emergencyDetected).toBe(true);
            expect(result.diagnosticAttempt).toBe(true);
            expect(result.prescriptionAttempt).toBe(true);
            expect(result.riskLevel).toBe('critical');
        });

        test('should handle empty or invalid input', () => {
            const invalidInputs = ['', null, undefined, '   '];

            invalidInputs.forEach(input => {
                const result = engine.analyzeMessage(input || '');
                expect(result).toBeDefined();
                expect(result.isCompliant).toBeDefined();
            });
        });

        test('should handle very long messages', () => {
            const longMessage = 'Olá, '.repeat(1000) + 'tenho dor no olho';
            const result = engine.analyzeMessage(longMessage);

            expect(result).toBeDefined();
            expect(result.diagnosticAttempt).toBe(true);
        });
    });
});