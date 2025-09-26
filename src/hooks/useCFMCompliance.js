/**
 * CFM Compliance Hook
 * React hook for managing CFM compliance validation and monitoring
 */

import { useState, useCallback, useEffect } from 'react';
import { validationRules } from '../config/cfmRules';

const useCFMCompliance = () => {
    const [complianceCache, setComplianceCache] = useState(new Map());
    const [globalSettings, setGlobalSettings] = useState({
        autoValidate: true,
        strictMode: false,
        cacheTimeout: 5 * 60 * 1000, // 5 minutes
        enableReporting: true
    });


    /**
     * Validate content against CFM regulations using Web Worker
     */
    const validateContent = useCallback(async (content, options = {}) => {
        if (!content || typeof content !== 'string') {
            return Promise.resolve({
                valid: false,
                score: 0,
                violations: [{ type: 'invalid_content', message: 'Conteúdo inválido ou vazio' }],
                recommendations: []
            });
        }

        const contentHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(content.substring(0, 100)))
            .then(buffer => Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 16));
        const cacheKey = `${contentHash}_${JSON.stringify(options)}`;

        // Check cache first
        if (complianceCache.has(cacheKey)) {
            const cached = complianceCache.get(cacheKey);
            if (Date.now() - cached.timestamp < globalSettings.cacheTimeout) {
                return Promise.resolve(cached.result);
            }
        }

        // Use Web Worker for CPU-intensive validation
        return new Promise((resolve, reject) => {
            try {
                const worker = new Worker(new URL('../workers/cfmValidationWorker.js', import.meta.url));
                const messageId = Date.now() + Math.random();

                const timeout = setTimeout(() => {
                    worker.terminate();
                    reject(new Error('Validation timeout'));
                }, 10000); // 10 second timeout

                worker.onmessage = (e) => {
                    clearTimeout(timeout);
                    const { id, type, result, success, error } = e.data;

                    if (id === messageId) {
                        worker.terminate();

                        if (success && type === 'validation_result') {
                            // Cache the result
                            setComplianceCache(prev => {
                                const newCache = new Map(prev);
                                newCache.set(cacheKey, {
                                    result,
                                    timestamp: Date.now()
                                });
                                return newCache;
                            });

                            resolve(result);
                        } else {
                            reject(new Error(error || 'Validation failed'));
                        }
                    }
                };

                worker.onerror = (error) => {
                    clearTimeout(timeout);
                    worker.terminate();
                    reject(error);
                };

                worker.postMessage({
                    id: messageId,
                    type: 'validate',
                    content,
                    options: { ...options, strictMode: globalSettings.strictMode }
                });

            } catch (error) {
                // Fallback to synchronous validation if Web Worker fails
                console.warn('Web Worker not available, falling back to synchronous validation');
                const fallbackResult = validateContentSync(content, options);

                // Cache the result
                setComplianceCache(prev => {
                    const newCache = new Map(prev);
                    newCache.set(cacheKey, {
                        result: fallbackResult,
                        timestamp: Date.now()
                    });
                    return newCache;
                });

                resolve(fallbackResult);
            }
        });
    }, [complianceCache, globalSettings]);

    /**
     * Synchronous fallback validation (simplified)
     */
    const validateContentSync = useCallback((content, options = {}) => {
        const violations = [];
        const recommendations = [];
        let score = 100;

        // Basic disclaimer check
        const hasDisclaimer = validationRules.disclaimer.phrases.some(phrase =>
            content.toLowerCase().includes(phrase.toLowerCase())
        );
        if (!hasDisclaimer) {
            violations.push({
                type: 'disclaimer_missing',
                severity: 'critical',
                message: 'Disclaimer médico obrigatório ausente',
                rule: 'Resolução CFM 1.974/2011',
                weight: 30
            });
            score -= 30;
            recommendations.push({
                type: 'add_disclaimer',
                message: 'Adicionar disclaimer médico conforme resolução CFM',
                template: 'medical_disclaimer'
            });
        }

        return {
            valid: score >= 70,
            score: Math.max(score, 0),
            violations,
            recommendations,
            level: score >= 90 ? 'excellent' : score >= 70 ? 'good' : 'inadequate',
            timestamp: new Date().toISOString(),
            contentLength: content.length,
            fallback: true
        };
    }, []);

    /**
     * Get compliance templates for common medical content
     */
    const getTemplate = useCallback((templateType) => {
        const templates = {
            medical_disclaimer: {
                pt: '⚕️ Aviso Médico: Este conteúdo tem caráter informativo e não substitui consulta médica. Para diagnóstico e tratamento, procure sempre orientação médica qualificada. Em caso de emergência, procure atendimento médico imediato ou ligue para o SAMU (192).',
                en: '⚕️ Medical Notice: This content is for informational purposes and does not replace medical consultation. For diagnosis and treatment, always seek qualified medical guidance. In case of emergency, seek immediate medical attention or call emergency services.'
            },
            crm_identification: {
                pt: '📋 CRM Responsável: Dr. Philipe Saraiva Cruz - CRM-MG 69.870',
                en: '📋 Responsible Physician: Dr. Philipe Saraiva Cruz - CRM-MG 69.870'
            },
            emergency_guidance: {
                pt: 'Em caso de emergência médica, procure atendimento imediato no hospital mais próximo ou ligue para o SAMU (192).',
                en: 'In case of medical emergency, seek immediate care at the nearest hospital or call emergency services.'
            },
            data_anonymization: {
                pt: 'Dados pessoais identificados devem ser removidos ou substituídos por termos genéricos como "paciente", "indivíduo" ou "pessoa".',
                en: 'Personal data should be removed or replaced with generic terms like "patient", "individual" or "person".'
            }
        };

        return templates[templateType] || null;
    }, []);

    /**
     * Batch validate multiple content pieces with non-blocking processing
     */
    const batchValidate = useCallback(async (contents, options = {}) => {
        const results = [];
        const { concurrency = 3, yieldInterval = 10 } = options;

        const processWithYield = async (content, index) => {
            const result = await validateContent(content, options);
            return { index, result };
        };

        // Process in batches with yielding to avoid blocking the main thread
        for (let i = 0; i < contents.length; i += concurrency) {
            const batch = contents.slice(i, i + concurrency);
            const batchPromises = batch.map((content, localIndex) =>
                processWithYield(content, i + localIndex)
            );

            const batchResults = await Promise.all(batchPromises);
            results.push(...batchResults);

            // Yield control back to main thread every yieldInterval batches
            if ((i / concurrency) % yieldInterval === 0 && i + concurrency < contents.length) {
                await new Promise(resolve => setTimeout(resolve, 0));
            }
        }

        return results.sort((a, b) => a.index - b.index).map(r => r.result);
    }, [validateContent]);

    /**
     * Generate compliance report
     */
    const generateReport = useCallback((validationResults) => {
        const totalScore = validationResults.reduce((sum, r) => sum + r.score, 0) / validationResults.length;
        const violationsByType = {};
        const violationsBySeverity = { critical: 0, high: 0, medium: 0, low: 0 };

        validationResults.forEach(result => {
            result.violations.forEach(violation => {
                violationsByType[violation.type] = (violationsByType[violation.type] || 0) + 1;
                violationsBySeverity[violation.severity] = (violationsBySeverity[violation.severity] || 0) + 1;
            });
        });

        return {
            overallScore: Math.round(totalScore),
            totalContent: validationResults.length,
            compliantContent: validationResults.filter(r => r.valid).length,
            violationsByType,
            violationsBySeverity,
            recommendations: validationResults.flatMap(r => r.recommendations),
            generatedAt: new Date().toISOString()
        };
    }, []);

    /**
     * Clear compliance cache
     */
    const clearCache = useCallback(() => {
        setComplianceCache(new Map());
    }, []);

    /**
     * Update global settings
     */
    const updateSettings = useCallback((newSettings) => {
        setGlobalSettings(prev => ({ ...prev, ...newSettings }));
    }, []);

    // Auto-clear expired cache entries
    useEffect(() => {
        const interval = setInterval(() => {
            setComplianceCache(prev => {
                const now = Date.now();
                const filtered = new Map();
                prev.forEach((value, key) => {
                    if (now - value.timestamp < globalSettings.cacheTimeout) {
                        filtered.set(key, value);
                    }
                });
                return filtered;
            });
        }, globalSettings.cacheTimeout);

        return () => clearInterval(interval);
    }, [globalSettings.cacheTimeout]);

    return {
        validateContent,
        batchValidate,
        getTemplate,
        generateReport,
        clearCache,
        updateSettings,
        settings: globalSettings,
        cacheSize: complianceCache.size
    };
};

export default useCFMCompliance;