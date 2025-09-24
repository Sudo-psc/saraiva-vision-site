/**
 * CFM Compliance Audit and Validation Tests
 * Comprehensive testing of CFM (Conselho Federal de Medicina) compliance
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { cfmComplianceEngine } from '../../services/cfmComplianceEngine';
import { medicalSafetyFilter } from '../../services/medicalSafetyFilter';
import { auditLoggingService } from '../../services/auditLoggingService';
import { geminiService } from '../../services/geminiService';

// Mock services for isolated testing
vi.mock('../../services/auditLoggingService');
vi.mock('../../services/geminiService');

describe('CFM Compliance Audit and Validation', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        // Setup audit logging mock
        auditLoggingService.logComplianceViolation.mockResolvedValue({ success: true });
        auditLoggingService.logMedicalInteraction.mockResolvedValue({ success: true });
    });

    describe('Medical Ethics Compliance (Req 4.1)', () => {
        it('should enforce medical disclaimer requirements', async () => {
            const testCases = [
                {
                    input: 'Estou com dor no olho, o que pode ser?',
                    expectedDisclaimer: 'Esta informação é apenas educativa e não substitui consulta médica.',
                    shouldRequireDisclaimer: true
                },
                {
                    input: 'Que remédio posso tomar para conjuntivite?',
                    expectedDisclaimer: 'Não posso prescrever medicamentos. Consulte um médico.',
                    shouldRequireDisclaimer: true
                },
                {
                    input: 'Qual o horário de funcionamento da clínica?',
                    expectedDisclaimer: null,
                    shouldRequireDisclaimer: false
                }
            ];

            for (const testCase of testCases) {
                const result = await cfmComplianceEngine.validateResponse({
                    content: testCase.input,
                    context: 'patient_inquiry'
                });

                if (testCase.shouldRequireDisclaimer) {
                    expect(result.requiredDisclaimers).toContain(testCase.expectedDisclaimer);
                    expect(result.isCompliant).toBe(true);
                } else {
                    expect(result.requiredDisclaimers).toHaveLength(0);
                }

                expect(auditLoggingService.logMedicalInteraction).toHaveBeenCalledWith({
                    input: testCase.input,
                    complianceResult: result,
                    timestamp: expect.any(String)
                });
            }
        });

        it('should detect and prevent diagnostic attempts', async () => {
            const diagnosticAttempts = [
                'O que eu tenho baseado nos meus sintomas?',
                'Você pode me dizer se é glaucoma?',
                'Qual é o meu diagnóstico?',
                'Isso parece ser catarata?'
            ];

            for (const attempt of diagnosticAttempts) {
                const result = await cfmComplianceEngine.validateResponse({
                    content: attempt,
                    context: 'diagnostic_inquiry'
                });

                expect(result.isCompliant).toBe(false);
                expect(result.violations).toContain('diagnostic_attempt');
                expect(result.recommendedAction).toBe('redirect_to_consultation');

                expect(auditLoggingService.logComplianceViolation).toHaveBeenCalledWith({
                    violation: 'diagnostic_attempt',
                    input: attempt,
                    severity: 'high',
                    timestamp: expect.any(String)
                });
            }
        });

        it('should detect and prevent prescription attempts', async () => {
            const prescriptionAttempts = [
                'Que colírio devo usar?',
                'Posso tomar ibuprofeno para dor nos olhos?',
                'Qual a dosagem de vitamina A para olho seco?',
                'Que medicamento é melhor para glaucoma?'
            ];

            for (const attempt of prescriptionAttempts) {
                const result = await cfmComplianceEngine.validateResponse({
                    content: attempt,
                    context: 'medication_inquiry'
                });

                expect(result.isCompliant).toBe(false);
                expect(result.violations).toContain('prescription_attempt');
                expect(result.requiredDisclaimers).toContain('Não posso prescrever medicamentos. Consulte um médico.');

                expect(auditLoggingService.logComplianceViolation).toHaveBeenCalledWith({
                    violation: 'prescription_attempt',
                    input: attempt,
                    severity: 'high',
                    timestamp: expect.any(String)
                });
            }
        });
    });

    describe('Emergency Detection and Response (Req 4.2)', () => {
        it('should detect medical emergencies and provide appropriate response', async () => {
            const emergencyScenarios = [
                {
                    input: 'Perdi a visão de repente',
                    expectedResponse: 'emergency_protocol',
                    urgencyLevel: 'critical'
                },
                {
                    input: 'Dor intensa no olho com náusea',
                    expectedResponse: 'emergency_protocol',
                    urgencyLevel: 'high'
                },
                {
                    input: 'Vejo flashes de luz e muitos pontos pretos',
                    expectedResponse: 'urgent_consultation',
                    urgencyLevel: 'high'
                },
                {
                    input: 'Trauma no olho com sangramento',
                    expectedResponse: 'emergency_protocol',
                    urgencyLevel: 'critical'
                }
            ];

            for (const scenario of emergencyScenarios) {
                const result = await cfmComplianceEngine.validateResponse({
                    content: scenario.input,
                    context: 'symptom_report'
                });

                expect(result.emergencyDetected).toBe(true);
                expect(result.urgencyLevel).toBe(scenario.urgencyLevel);
                expect(result.recommendedAction).toBe(scenario.expectedResponse);

                if (scenario.urgencyLevel === 'critical') {
                    expect(result.requiredDisclaimers).toContain('PROCURE ATENDIMENTO MÉDICO IMEDIATAMENTE');
                }

                expect(auditLoggingService.logMedicalInteraction).toHaveBeenCalledWith({
                    input: scenario.input,
                    emergencyDetected: true,
                    urgencyLevel: scenario.urgencyLevel,
                    timestamp: expect.any(String)
                });
            }
        });

        it('should provide emergency contact information for critical cases', async () => {
            const criticalInput = 'Não consigo enxergar nada de repente e sinto muita dor';

            const result = await cfmComplianceEngine.validateResponse({
                content: criticalInput,
                context: 'emergency_symptom'
            });

            expect(result.emergencyDetected).toBe(true);
            expect(result.emergencyContacts).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        type: 'emergency',
                        number: '192',
                        description: 'SAMU'
                    }),
                    expect.objectContaining({
                        type: 'hospital',
                        description: expect.stringContaining('pronto-socorro')
                    })
                ])
            );
        });
    });

    describe('Medical Record Compliance (Req 4.3)', () => {
        it('should maintain proper medical record documentation', async () => {
            const medicalInteraction = {
                patientInput: 'Tenho diabetes e estou com visão embaçada',
                botResponse: 'Diabetes pode afetar a visão. Recomendo consulta oftalmológica urgente.',
                sessionId: 'session-123',
                timestamp: new Date().toISOString()
            };

            const result = await cfmComplianceEngine.documentMedicalInteraction(medicalInteraction);

            expect(result.success).toBe(true);
            expect(result.documentationId).toBeDefined();
            expect(result.medicalRecordCompliant).toBe(true);

            // Verify required medical record fields
            expect(result.documentation).toEqual(
                expect.objectContaining({
                    patientSymptoms: expect.arrayContaining(['diabetes', 'visão embaçada']),
                    medicalAdviceGiven: false,
                    emergencyFlagged: false,
                    disclaimerProvided: true,
                    followUpRecommended: true
                })
            );

            expect(auditLoggingService.logMedicalInteraction).toHaveBeenCalledWith({
                ...medicalInteraction,
                documentationId: result.documentationId,
                complianceStatus: 'compliant'
            });
        });

        it('should track consultation recommendations', async () => {
            const consultationScenarios = [
                {
                    symptoms: ['dor de cabeça', 'visão dupla'],
                    expectedRecommendation: 'neuroftalmologia',
                    urgency: 'high'
                },
                {
                    symptoms: ['olho seco', 'irritação'],
                    expectedRecommendation: 'oftalmologia_geral',
                    urgency: 'routine'
                },
                {
                    symptoms: ['perda de visão periférica'],
                    expectedRecommendation: 'glaucoma_specialist',
                    urgency: 'urgent'
                }
            ];

            for (const scenario of consultationScenarios) {
                const result = await cfmComplianceEngine.generateConsultationRecommendation({
                    symptoms: scenario.symptoms,
                    patientHistory: {}
                });

                expect(result.recommendedSpecialty).toBe(scenario.expectedRecommendation);
                expect(result.urgencyLevel).toBe(scenario.urgency);
                expect(result.cfmCompliant).toBe(true);

                expect(auditLoggingService.logMedicalInteraction).toHaveBeenCalledWith({
                    action: 'consultation_recommended',
                    specialty: scenario.expectedRecommendation,
                    urgency: scenario.urgency,
                    symptoms: scenario.symptoms
                });
            }
        });
    });

    describe('Professional Responsibility Compliance (Req 4.4)', () => {
        it('should maintain professional boundaries in AI responses', async () => {
            const boundaryTestCases = [
                {
                    input: 'Você é melhor que meu médico',
                    expectedResponse: 'professional_boundary_reminder',
                    shouldMaintainBoundary: true
                },
                {
                    input: 'Não preciso ir ao médico, você já me ajudou',
                    expectedResponse: 'consultation_emphasis',
                    shouldMaintainBoundary: true
                },
                {
                    input: 'Confio mais em você que nos médicos',
                    expectedResponse: 'professional_boundary_reminder',
                    shouldMaintainBoundary: true
                }
            ];

            for (const testCase of boundaryTestCases) {
                const result = await cfmComplianceEngine.validateProfessionalBoundaries({
                    input: testCase.input,
                    context: 'patient_interaction'
                });

                expect(result.boundaryMaintained).toBe(testCase.shouldMaintainBoundary);
                expect(result.responseType).toBe(testCase.expectedResponse);
                expect(result.professionalDisclaimerRequired).toBe(true);

                expect(auditLoggingService.logMedicalInteraction).toHaveBeenCalledWith({
                    input: testCase.input,
                    boundaryCheck: result,
                    timestamp: expect.any(String)
                });
            }
        });

        it('should enforce telemedicine regulations compliance', async () => {
            const telemedicineScenarios = [
                {
                    request: 'Pode fazer minha consulta por aqui mesmo?',
                    expectedCompliance: false,
                    violation: 'telemedicine_limitation'
                },
                {
                    request: 'Não preciso ir presencialmente, né?',
                    expectedCompliance: false,
                    violation: 'in_person_requirement'
                }
            ];

            for (const scenario of telemedicineScenarios) {
                const result = await cfmComplianceEngine.validateTelemedicineCompliance({
                    request: scenario.request,
                    interactionType: 'consultation_request'
                });

                expect(result.isCompliant).toBe(scenario.expectedCompliance);
                if (!scenario.expectedCompliance) {
                    expect(result.violations).toContain(scenario.violation);
                    expect(result.requiredClarification).toContain('consulta presencial');
                }
            }
        });
    });

    describe('Audit Trail and Documentation (Req 4.5)', () => {
        it('should maintain comprehensive audit trail for CFM compliance', async () => {
            const auditPeriod = {
                startDate: '2024-01-01',
                endDate: '2024-01-31'
            };

            const auditResult = await cfmComplianceEngine.generateComplianceAuditReport(auditPeriod);

            expect(auditResult.success).toBe(true);
            expect(auditResult.reportId).toBeDefined();

            // Verify audit report contains required CFM compliance metrics
            expect(auditResult.metrics).toEqual(
                expect.objectContaining({
                    totalInteractions: expect.any(Number),
                    emergencyDetections: expect.any(Number),
                    complianceViolations: expect.any(Number),
                    disclaimerCompliance: expect.any(Number),
                    professionalBoundaryMaintenance: expect.any(Number)
                })
            );

            expect(auditResult.complianceScore).toBeGreaterThanOrEqual(95); // High compliance threshold
            expect(auditResult.cfmCertified).toBe(true);
        });

        it('should track and report compliance violations', async () => {
            const violations = [
                { type: 'diagnostic_attempt', severity: 'high', count: 2 },
                { type: 'prescription_attempt', severity: 'high', count: 1 },
                { type: 'boundary_violation', severity: 'medium', count: 3 }
            ];

            for (const violation of violations) {
                await cfmComplianceEngine.recordComplianceViolation({
                    type: violation.type,
                    severity: violation.severity,
                    timestamp: new Date().toISOString(),
                    sessionId: 'audit-session'
                });
            }

            const violationReport = await cfmComplianceEngine.getViolationSummary({
                period: 'last_30_days'
            });

            expect(violationReport.totalViolations).toBe(6);
            expect(violationReport.highSeverityCount).toBe(3);
            expect(violationReport.mediumSeverityCount).toBe(3);
            expect(violationReport.complianceRate).toBeGreaterThan(0.9); // 90%+ compliance
        });
    });

    describe('Continuous Compliance Monitoring (Req 4.6)', () => {
        it('should perform real-time compliance monitoring', async () => {
            const monitoringConfig = {
                enableRealTimeChecks: true,
                alertThresholds: {
                    violationRate: 0.05, // 5%
                    emergencyMissRate: 0.01 // 1%
                }
            };

            const monitoringResult = await cfmComplianceEngine.startComplianceMonitoring(monitoringConfig);

            expect(monitoringResult.success).toBe(true);
            expect(monitoringResult.monitoringActive).toBe(true);
            expect(monitoringResult.alertsConfigured).toBe(true);

            // Simulate compliance check
            const testInteraction = {
                input: 'Estou com dor no olho',
                response: 'Recomendo consulta médica. Esta informação não substitui avaliação profissional.',
                timestamp: new Date().toISOString()
            };

            const complianceCheck = await cfmComplianceEngine.performRealTimeComplianceCheck(testInteraction);

            expect(complianceCheck.isCompliant).toBe(true);
            expect(complianceCheck.disclaimerPresent).toBe(true);
            expect(complianceCheck.emergencyHandled).toBe(true);
        });

        it('should generate compliance alerts for violations', async () => {
            const highRiskInteraction = {
                input: 'Me diga o que eu tenho baseado nos sintomas',
                response: 'Baseado nos sintomas, você pode ter conjuntivite', // Non-compliant response
                timestamp: new Date().toISOString()
            };

            const alertResult = await cfmComplianceEngine.checkForComplianceAlerts(highRiskInteraction);

            expect(alertResult.alertTriggered).toBe(true);
            expect(alertResult.alertType).toBe('diagnostic_violation');
            expect(alertResult.severity).toBe('high');
            expect(alertResult.immediateAction).toBe('block_response');

            expect(auditLoggingService.logComplianceViolation).toHaveBeenCalledWith({
                violation: 'diagnostic_attempt',
                severity: 'high',
                alertTriggered: true,
                timestamp: expect.any(String)
            });
        });
    });
});