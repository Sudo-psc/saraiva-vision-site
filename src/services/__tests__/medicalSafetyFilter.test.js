/**
 * Tests for Medical Safety Filter
 */

import MedicalSafetyFilter from '../medicalSafetyFilter.js';

describe('MedicalSafetyFilter', () => {
    let filter;

    beforeEach(() => {
        filter = new MedicalSafetyFilter();
    });

    describe('analyzeSafety', () => {
        test('should detect critical emergencies', () => {
            const emergencyInputs = [
                'Socorro, perdi a visão completamente!',
                'Não consigo ver nada no olho direito',
                'Tive um acidente e há algo no meu olho',
                'Queimadura química no olho'
            ];

            emergencyInputs.forEach(input => {
                const analysis = filter.analyzeSafety(input);
                expect(analysis.riskLevel).toBe('critical');
                expect(analysis.emergencyDetected).toBe(true);
                expect(analysis.requiresIntervention).toBe(true);
                expect(analysis.recommendedResponse).toBe(filter.safetyResponses.emergency);
            });
        });

        test('should detect prohibited medical actions', () => {
            const prohibitedInputs = [
                'Pode diagnosticar meu problema?',
                'Prescreva um colírio para mim',
                'Como posso tratar essa inflamação?',
                'Receite um medicamento'
            ];

            prohibitedInputs.forEach(input => {
                const analysis = filter.analyzeSafety(input);
                expect(analysis.prohibitedActions.length).toBeGreaterThan(0);
                expect(['high', 'critical']).toContain(analysis.riskLevel);
            });
        });

        test('should detect medical advice requests', () => {
            const adviceRequests = [
                'O que pode ser essa dor no olho?',
                'Que remédio posso tomar?',
                'Como tratar conjuntivite?',
                'Isso é normal?'
            ];

            adviceRequests.forEach(input => {
                const analysis = filter.analyzeSafety(input);
                expect(analysis.safetyViolations).toContain('MEDICAL_ADVICE_REQUEST');
                expect(analysis.recommendedResponse).toBeDefined();
            });
        });

        test('should handle safe inquiries', () => {
            const safeInputs = [
                'Quais são os horários de atendimento?',
                'Como agendar uma consulta?',
                'Vocês atendem convênio médico?',
                'Onde fica a clínica?'
            ];

            safeInputs.forEach(input => {
                const analysis = filter.analyzeSafety(input);
                expect(analysis.riskLevel).toBe('low');
                expect(analysis.emergencyDetected).toBe(false);
                expect(analysis.requiresIntervention).toBe(false);
            });
        });
    });

    describe('detectEmergency', () => {
        test('should detect vision-related emergencies', () => {
            const visionEmergencies = [
                'perdi a visão de repente',
                'não consigo ver nada',
                'flashes de luz no olho',
                'cortina na visão'
            ];

            visionEmergencies.forEach(input => {
                const result = filter.detectEmergency(input);
                expect(result.detected).toBe(true);
                expect(result.factors.some(f => f.category === 'vision')).toBe(true);
            });
        });

        test('should detect pain-related emergencies', () => {
            const painEmergencies = [
                'dor intensa no olho',
                'dor insuportável',
                'dor que não passa'
            ];

            painEmergencies.forEach(input => {
                const result = filter.detectEmergency(input);
                expect(result.detected).toBe(true);
                expect(result.factors.some(f => f.category === 'pain')).toBe(true);
            });
        });

        test('should detect trauma-related emergencies', () => {
            const traumaEmergencies = [
                'acidente no olho',
                'objeto no olho',
                'química no olho',
                'queimadura ocular'
            ];

            traumaEmergencies.forEach(input => {
                const result = filter.detectEmergency(input);
                expect(result.detected).toBe(true);
                expect(result.factors.some(f => f.category === 'trauma')).toBe(true);
            });
        });

        test('should calculate emergency severity correctly', () => {
            const highSeverityInput = 'perdi a visão completamente';
            const mediumSeverityInput = 'dor intensa no olho';
            const lowSeverityInput = 'leve desconforto';

            const highResult = filter.detectEmergency(highSeverityInput);
            const mediumResult = filter.detectEmergency(mediumSeverityInput);
            const lowResult = filter.detectEmergency(lowSeverityInput);

            expect(highResult.severity).toBeGreaterThan(mediumResult.severity);
            expect(mediumResult.severity).toBeGreaterThan(lowResult.severity || 0);
        });
    });

    describe('detectMedicalAdviceRequest', () => {
        test('should detect diagnostic requests', () => {
            const diagnosticRequests = [
                'o que pode ser essa dor?',
                'qual o diagnóstico?',
                'estou com sintomas estranhos',
                'isso é normal?'
            ];

            diagnosticRequests.forEach(input => {
                const result = filter.detectMedicalAdviceRequest(input);
                expect(result.detected).toBe(true);
                expect(result.type).toBe('diagnostic');
            });
        });

        test('should detect prescription requests', () => {
            const prescriptionRequests = [
                'que remédio posso tomar?',
                'posso usar este colírio?',
                'como tratar isso?',
                'preciso de receita?'
            ];

            prescriptionRequests.forEach(input => {
                const result = filter.detectMedicalAdviceRequest(input);
                expect(result.detected).toBe(true);
                expect(result.type).toBe('prescription');
            });
        });

        test('should not detect advice requests in safe queries', () => {
            const safeQueries = [
                'horários de atendimento',
                'como agendar consulta',
                'localização da clínica'
            ];

            safeQueries.forEach(input => {
                const result = filter.detectMedicalAdviceRequest(input);
                expect(result.detected).toBe(false);
                expect(result.type).toBeNull();
            });
        });
    });

    describe('filterResponse', () => {
        test('should override response for critical emergencies', () => {
            const safetyAnalysis = {
                riskLevel: 'critical',
                emergencyDetected: true,
                medicalRiskFactors: [{ category: 'vision', indicator: 'perdi a visão', severity: 10 }]
            };

            const result = filter.filterResponse('Resposta original', safetyAnalysis);

            expect(result.response).toContain('EMERGÊNCIA DETECTADA');
            expect(result.response).toContain('192');
            expect(result.response).toContain('SAMU');
            expect(result.modifications).toContain('EMERGENCY_OVERRIDE');
            expect(result.blocked).toBe(false);
        });

        test('should neutralize medical advice', () => {
            const safetyAnalysis = {
                riskLevel: 'high',
                prohibitedActions: ['prescrever'],
                safetyViolations: []
            };

            const originalResponse = 'Você deve tomar este remédio e usar colírio diariamente.';
            const result = filter.filterResponse(originalResponse, safetyAnalysis);

            expect(result.response).not.toContain('você deve');
            expect(result.response).not.toContain('tome');
            expect(result.response).toContain('geralmente é recomendado');
            expect(result.modifications).toContain('MEDICAL_ADVICE_NEUTRALIZED');
        });

        test('should add safety disclaimers', () => {
            const safetyAnalysis = {
                riskLevel: 'medium',
                safetyViolations: ['MEDICAL_ADVICE_REQUEST'],
                prohibitedActions: ['diagnosticar']
            };

            const result = filter.filterResponse('Informação médica', safetyAnalysis);

            expect(result.response).toContain('⚠️');
            expect(result.response).toContain('informação é apenas educativa');
            expect(result.response).toContain('avaliação médica presencial');
            expect(result.modifications).toContain('SAFETY_DISCLAIMERS_ADDED');
        });

        test('should replace unsafe responses', () => {
            const safetyAnalysis = {
                riskLevel: 'low',
                safetyViolations: [],
                prohibitedActions: []
            };

            const unsafeResponse = 'Você tem definitivamente glaucoma. Tome este medicamento.';
            const result = filter.filterResponse(unsafeResponse, safetyAnalysis);

            expect(result.modifications).toContain('UNSAFE_RESPONSE_REPLACED');
            expect(result.response).toContain('não posso fornecer orientações médicas');
        });
    });

    describe('validateResponseSafety', () => {
        test('should detect unsafe diagnostic language', () => {
            const unsafeResponses = [
                'Você tem conjuntivite',
                'O diagnóstico é glaucoma',
                'Certamente é uma inflamação',
                'Definitivamente precisa de cirurgia'
            ];

            unsafeResponses.forEach(response => {
                const validation = filter.validateResponseSafety(response);
                expect(validation.isSafe).toBe(false);
                expect(validation.violations).toContain('DIAGNOSTIC_LANGUAGE');
            });
        });

        test('should detect unsafe prescription language', () => {
            const unsafeResponses = [
                'Tome este colírio três vezes ao dia',
                'Use este medicamento por uma semana',
                'A dose é de 2 gotas',
                'Prescrevo este tratamento'
            ];

            unsafeResponses.forEach(response => {
                const validation = filter.validateResponseSafety(response);
                expect(validation.isSafe).toBe(false);
                expect(validation.violations).toContain('PRESCRIPTION_LANGUAGE');
            });
        });

        test('should validate safe responses', () => {
            const safeResponses = [
                'Posso fornecer informações gerais sobre catarata.',
                'Recomendo agendar uma consulta para avaliação.',
                'Esta informação é apenas educativa.',
                'Um médico pode avaliar melhor seu caso.'
            ];

            safeResponses.forEach(response => {
                const validation = filter.validateResponseSafety(response);
                expect(validation.isSafe).toBe(true);
                expect(validation.violations).toHaveLength(0);
            });
        });
    });

    describe('calculateSafetyScore', () => {
        test('should penalize risky language', () => {
            const riskyResponse = 'Você deve tomar este remédio. Certamente é glaucoma.';
            const safeResponse = 'Recomendo consulta médica para avaliação adequada.';

            const riskyScore = filter.calculateSafetyScore(riskyResponse);
            const safeScore = filter.calculateSafetyScore(safeResponse);

            expect(safeScore).toBeGreaterThan(riskyScore);
            expect(riskyScore).toBeLessThan(100);
        });

        test('should reward safety indicators', () => {
            const responseWithSafetyIndicators = 'Esta informação é educativa e não substitui consulta médica. Recomendo avaliação presencial.';
            const responseWithRiskyLanguage = 'Você deve tomar este remédio para catarata.';

            const safetyScore = filter.calculateSafetyScore(responseWithSafetyIndicators);
            const riskyScore = filter.calculateSafetyScore(responseWithRiskyLanguage);

            expect(safetyScore).toBeGreaterThan(riskyScore);
        });

        test('should return score within valid range', () => {
            const responses = [
                'Você deve tomar remédio. Tome isso. Certamente é doença.',
                'Informação educativa. Consulta médica necessária.',
                'Resposta neutra sem indicadores.'
            ];

            responses.forEach(response => {
                const score = filter.calculateSafetyScore(response);
                expect(score).toBeGreaterThanOrEqual(0);
                expect(score).toBeLessThanOrEqual(100);
            });
        });
    });

    describe('generateEmergencyResponse', () => {
        test('should generate appropriate emergency response', () => {
            const riskFactors = [
                { category: 'vision', indicator: 'perdi a visão', severity: 10 }
            ];

            const response = filter.generateEmergencyResponse(riskFactors);

            expect(response).toContain('EMERGÊNCIA DETECTADA');
            expect(response).toContain('PROCURE AGORA');
            expect(response).toContain('192');
            expect(response).toContain('SAMU');
            expect(response).toContain('tempo é crucial');
        });
    });

    describe('generateSafeAlternativeResponse', () => {
        test('should generate safe alternative response', () => {
            const response = filter.generateSafeAlternativeResponse();

            expect(response).toContain('não posso fornecer orientações médicas');
            expect(response).toContain('agendar uma consulta');
            expect(response).toContain('avaliação presencial');
            expect(response).toContain('Como posso auxiliá-lo');
        });
    });

    describe('Edge cases and integration', () => {
        test('should handle multiple risk factors', () => {
            const complexInput = 'Socorro! Perdi a visão e estou com dor intensa após acidente!';
            const analysis = filter.analyzeSafety(complexInput);

            expect(analysis.emergencyDetected).toBe(true);
            expect(analysis.medicalRiskFactors.length).toBeGreaterThan(1);
            expect(analysis.riskLevel).toBe('critical');
        });

        test('should handle empty or invalid input', () => {
            const invalidInputs = ['', null, undefined, '   '];

            invalidInputs.forEach(input => {
                const analysis = filter.analyzeSafety(input || '');
                expect(analysis).toBeDefined();
                expect(analysis.riskLevel).toBeDefined();
            });
        });

        test('should maintain consistency between analysis and filtering', () => {
            const testInput = 'Que remédio posso tomar para dor no olho?';
            const analysis = filter.analyzeSafety(testInput);
            const filterResult = filter.filterResponse('Resposta original', analysis);

            expect(analysis.safetyViolations.length > 0).toBe(true);
            expect(filterResult.modifications.length > 0).toBe(true);
        });
    });
});