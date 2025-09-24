/**
 * Comprehensive Medical Compliance Engine Tests
 * Requirements: 4.1, 4.2, 4.3 - CFM compliance and medical safety filters
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import CFMComplianceEngine from '../cfmComplianceEngine.js';
import MedicalSafetyFilter from '../medicalSafetyFilter.js';

describe('Medical Compliance Engine - Comprehensive Tests', () => {
    let complianceEngine;
    let safetyFilter;

    beforeEach(() => {
        complianceEngine = new CFMComplianceEngine();
        safetyFilter = new MedicalSafetyFilter();
    });

    describe('CFM Regulation 4.1 - Medical Information Disclaimers', () => {
        const medicalInformationQueries = [
            'O que é glaucoma?',
            'Como funciona a cirurgia de catarata?',
            'Quais são os sintomas de conjuntivite?',
            'Preciso usar óculos?',
            'Como prevenir problemas de visão?'
        ];

        it.each(medicalInformationQueries)('should add medical disclaimers to informational responses: "%s"', async (query) => {
            const result = complianceEngine.analyzeMessage(query);

            expect(result.requiresDisclaimer).toBe(true);
            expect(result.requiredDisclaimers).toContain(complianceEngine.disclaimers.general);
            expect(result.complianceLevel).toBe('MEDIUM_RISK');

            const filteredResponse = complianceEngine.filterResponse('Informação médica sobre ' + query, result);
            expect(filteredResponse.response).toContain('Esta informação é apenas educativa');
            expect(filteredResponse.response).toContain('Consulte sempre um médico oftalmologista');
        });

        it('should include CFM registration information in disclaimers', () => {
            const result = complianceEngine.analyzeMessage('O que é miopia?');
            const filteredResponse = complianceEngine.filterResponse('Informação sobre miopia', result);

            expect(filteredResponse.response).toContain('CRM');
            expect(filteredResponse.response).toContain('Conselho Federal de Medicina');
        });

        it('should validate disclaimer completeness', () => {
            const responseWithoutDisclaimer = 'A miopia é um problema de visão comum.';
            const validation = complianceEngine.validateResponse(responseWithoutDisclaimer);

            expect(validation.isValid).toBe(false);
            expect(validation.violations).toContain('MISSING_MEDICAL_DISCLAIMER');
            expect(validation.requiredActions).toContain('ADD_DISCLAIMER');
        });
    });

    describe('CFM Regulation 4.2 - Prohibition of Medical Diagnosis', () => {
        const diagnosticAttempts = [
            'Você tem conjuntivite',
            'É provável que seja glaucoma',
            'Certamente é uma inflamação',
            'O diagnóstico é catarata',
            'Você está com presbiopia',
            'Isso parece ser degeneração macular'
        ];

        it.each(diagnosticAttempts)('should detect and prevent diagnostic language: "%s"', (diagnosticStatement) => {
            const result = complianceEngine.analyzeMessage(diagnosticStatement);

            expect(result.diagnosticAttempt).toBe(true);
            expect(result.complianceLevel).toBe('HIGH_RISK');
            expect(result.recommendedActions).toContain('REDIRECT_TO_CONSULTATION');

            const validation = complianceEngine.validateResponse(diagnosticStatement);
            expect(validation.isValid).toBe(false);
            expect(validation.violations).toContain('DIAGNOSTIC_LANGUAGE_DETECTED');
        });

        it('should redirect diagnostic attempts to appointment booking', () => {
            const result = complianceEngine.analyzeMessage('O que pode ser essa dor no olho?');
            const filteredResponse = complianceEngine.filterResponse('Pode ser várias coisas', result);

            expect(filteredResponse.response).toContain('agendar uma consulta');
            expect(filteredResponse.response).toContain('avaliação presencial');
            expect(filteredResponse.modifications).toContain('APPOINTMENT_SUGGESTED');
        });

        it('should neutralize diagnostic language in responses', () => {
            const diagnosticResponse = 'Você tem conjuntivite e deve usar colírio antibiótico.';
            const complianceResult = { diagnosticAttempt: true, medicalAdviceDetected: true };

            const filtered = complianceEngine.filterResponse(diagnosticResponse, complianceResult);

            expect(filtered.response).not.toContain('você tem');
            expect(filtered.response).not.toContain('deve usar');
            expect(filtered.modifications).toContain('DIAGNOSTIC_LANGUAGE_NEUTRALIZED');
        });
    });

    describe('CFM Regulation 4.3 - Prohibition of Medical Prescriptions', () => {
        const prescriptionAttempts = [
            'Tome este medicamento duas vezes ao dia',
            'Use este colírio por uma semana',
            'A dose recomendada é de 2 gotas',
            'Você deve tomar ibuprofeno',
            'Aplique compressa fria por 10 minutos',
            'Faça exercícios oculares diariamente'
        ];

        it.each(prescriptionAttempts)('should detect and prevent prescription language: "%s"', (prescriptionStatement) => {
            const result = complianceEngine.analyzeMessage(prescriptionStatement);

            expect(result.prescriptionAttempt).toBe(true);
            expect(result.complianceLevel).toBe('HIGH_RISK');
            expect(result.recommendedActions).toContain('NO_PRESCRIPTION_ADVICE');

            const validation = complianceEngine.validateResponse(prescriptionStatement);
            expect(validation.isValid).toBe(false);
            expect(validation.violations).toContain('PRESCRIPTION_LANGUAGE_DETECTED');
        });

        it('should handle medication inquiries appropriately', () => {
            const medicationQuery = 'Que remédio posso tomar para conjuntivite?';
            const result = complianceEngine.analyzeMessage(medicationQuery);
            const filteredResponse = complianceEngine.filterResponse('Você pode tomar...', result);

            expect(filteredResponse.response).toContain('não posso recomendar medicamentos');
            expect(filteredResponse.response).toContain('consulte um médico');
            expect(filteredResponse.modifications).toContain('PRESCRIPTION_BLOCKED');
        });

        it('should neutralize prescription language in responses', () => {
            const prescriptionResponse = 'Tome este colírio três vezes ao dia e use compressa fria.';
            const complianceResult = { prescriptionAttempt: true };

            const filtered = complianceEngine.filterResponse(prescriptionResponse, complianceResult);

            expect(filtered.response).not.toContain('tome');
            expect(filtered.response).not.toContain('use');
            expect(filtered.response).not.toContain('três vezes ao dia');
            expect(filtered.modifications).toContain('PRESCRIPTION_LANGUAGE_NEUTRALIZED');
        });
    });

    describe('Medical Safety Filter Integration', () => {
        it('should detect emergency keywords accurately', () => {
            const emergencyScenarios = [
                'Socorro, perdi a visão de repente!',
                'Estou com dor intensa no olho',
                'Tive um acidente e algo entrou no meu olho',
                'Não consigo enxergar nada',
                'Meu olho está sangrando'
            ];

            emergencyScenarios.forEach(scenario => {
                const safetyResult = safetyFilter.analyzeMessage(scenario);
                const complianceResult = complianceEngine.analyzeMessage(scenario);

                expect(safetyResult.emergencyDetected).toBe(true);
                expect(complianceResult.emergencyDetected).toBe(true);
                expect(complianceResult.complianceLevel).toBe('CRITICAL');
            });
        });

        it('should generate appropriate emergency responses', () => {
            const emergencyMessage = 'Socorro, perdi a visão de repente!';
            const result = complianceEngine.analyzeMessage(emergencyMessage);
            const emergencyResponse = complianceEngine.generateEmergencyResponse();

            expect(emergencyResponse).toContain('EMERGÊNCIA OFTALMOLÓGICA');
            expect(emergencyResponse).toContain('SAMU (192)');
            expect(emergencyResponse).toContain('Pronto Socorro');
            expect(emergencyResponse).toContain('atendimento 24 horas');
            expect(emergencyResponse).toContain('não perca tempo');
        });

        it('should classify medical content risk levels', () => {
            const testCases = [
                { message: 'Quais são os horários?', expectedLevel: 'LOW' },
                { message: 'O que é miopia?', expectedLevel: 'MEDIUM_RISK' },
                { message: 'Que remédio tomar?', expectedLevel: 'HIGH_RISK' },
                { message: 'Socorro, não enxergo!', expectedLevel: 'CRITICAL' }
            ];

            testCases.forEach(({ message, expectedLevel }) => {
                const result = complianceEngine.analyzeMessage(message);
                expect(result.complianceLevel).toBe(expectedLevel);
            });
        });
    });

    describe('Complex Compliance Scenarios', () => {
        it('should handle multiple compliance violations in one message', () => {
            const complexMessage = 'Socorro, perdi a visão! O que pode ser? Que remédio devo tomar?';
            const result = complianceEngine.analyzeMessage(complexMessage);

            expect(result.emergencyDetected).toBe(true);
            expect(result.diagnosticAttempt).toBe(true);
            expect(result.prescriptionAttempt).toBe(true);
            expect(result.complianceLevel).toBe('CRITICAL');
            expect(result.recommendedActions).toContain('EMERGENCY_RESPONSE');
        });

        it('should prioritize emergency response over other violations', () => {
            const emergencyWithDiagnostic = 'Socorro, não enxergo! Você acha que é glaucoma?';
            const result = complianceEngine.analyzeMessage(emergencyWithDiagnostic);
            const filteredResponse = complianceEngine.filterResponse('Pode ser glaucoma', result);

            expect(filteredResponse.response).toContain('EMERGÊNCIA');
            expect(filteredResponse.response).toContain('SAMU');
            expect(filteredResponse.modifications).toContain('EMERGENCY_OVERRIDE');
        });

        it('should maintain compliance across conversation context', () => {
            const conversationHistory = [
                { role: 'user', content: 'Olá' },
                { role: 'assistant', content: 'Olá! Como posso ajudar?' },
                { role: 'user', content: 'Estou com dor no olho' }
            ];

            const contextualMessage = 'O que pode ser?';
            const result = complianceEngine.analyzeMessageWithContext(contextualMessage, conversationHistory);

            expect(result.diagnosticAttempt).toBe(true);
            expect(result.contextualRisk).toBe('ELEVATED');
            expect(result.recommendedActions).toContain('SUGGEST_APPOINTMENT');
        });
    });

    describe('Compliance Monitoring and Reporting', () => {
        it('should track compliance violations for audit', () => {
            const violations = [
                'Você tem conjuntivite',
                'Tome este colírio',
                'É certamente glaucoma'
            ];

            violations.forEach(violation => {
                complianceEngine.analyzeMessage(violation);
            });

            const auditReport = complianceEngine.generateComplianceReport();

            expect(auditReport.totalViolations).toBe(3);
            expect(auditReport.violationTypes).toContain('DIAGNOSTIC_ATTEMPT');
            expect(auditReport.violationTypes).toContain('PRESCRIPTION_ATTEMPT');
            expect(auditReport.riskDistribution.HIGH_RISK).toBeGreaterThan(0);
        });

        it('should generate compliance metrics', () => {
            const messages = [
                'Olá',
                'O que é miopia?',
                'Você tem glaucoma',
                'Socorro, não enxergo!'
            ];

            messages.forEach(message => complianceEngine.analyzeMessage(message));

            const metrics = complianceEngine.getComplianceMetrics();

            expect(metrics.totalMessages).toBe(4);
            expect(metrics.complianceRate).toBeLessThan(1.0);
            expect(metrics.emergencyDetections).toBe(1);
            expect(metrics.averageRiskLevel).toBeDefined();
        });
    });

    describe('Edge Cases and Error Handling', () => {
        it('should handle empty or null messages', () => {
            const invalidInputs = ['', null, undefined, '   ', '\n\t'];

            invalidInputs.forEach(input => {
                const result = complianceEngine.analyzeMessage(input || '');
                expect(result).toBeDefined();
                expect(result.isCompliant).toBeDefined();
                expect(result.complianceLevel).toBe('LOW');
            });
        });

        it('should handle very long messages', () => {
            const longMessage = 'Estou com dor no olho. '.repeat(1000);
            const result = complianceEngine.analyzeMessage(longMessage);

            expect(result).toBeDefined();
            expect(result.diagnosticAttempt).toBe(true);
            expect(result.messageLength).toBeGreaterThan(10000);
        });

        it('should handle special characters and encoding', () => {
            const specialMessages = [
                'Olá! Estou com dor no olho... 😢',
                'Não consigo enxergar direito (muito preocupado)',
                'Dor intensa!!! Socorro!!!',
                'Olho vermelho & lacrimejando'
            ];

            specialMessages.forEach(message => {
                const result = complianceEngine.analyzeMessage(message);
                expect(result).toBeDefined();
                expect(result.isCompliant).toBeDefined();
            });
        });

        it('should handle concurrent compliance checks', async () => {
            const messages = Array.from({ length: 100 }, (_, i) => `Mensagem ${i} sobre dor no olho`);

            const promises = messages.map(message =>
                Promise.resolve(complianceEngine.analyzeMessage(message))
            );

            const results = await Promise.all(promises);

            expect(results).toHaveLength(100);
            results.forEach(result => {
                expect(result).toBeDefined();
                expect(result.diagnosticAttempt).toBe(true);
            });
        });
    });

    describe('Performance and Scalability', () => {
        it('should process compliance checks within acceptable time limits', () => {
            const message = 'Estou com dor no olho, o que pode ser? Que remédio posso tomar?';

            const startTime = performance.now();
            const result = complianceEngine.analyzeMessage(message);
            const endTime = performance.now();

            const processingTime = endTime - startTime;

            expect(processingTime).toBeLessThan(100); // Should complete within 100ms
            expect(result).toBeDefined();
        });

        it('should handle batch compliance processing', () => {
            const messages = Array.from({ length: 50 }, (_, i) =>
                `Mensagem ${i}: ${i % 2 === 0 ? 'Olá' : 'Estou com dor no olho'}`
            );

            const startTime = performance.now();
            const results = complianceEngine.batchAnalyzeMessages(messages);
            const endTime = performance.now();

            const processingTime = endTime - startTime;

            expect(results).toHaveLength(50);
            expect(processingTime).toBeLessThan(1000); // Should complete within 1 second
        });
    });
});