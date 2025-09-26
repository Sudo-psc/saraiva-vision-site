/**
 * CFM Compliance Component
 * Ensures all medical content meets Brazilian Medical Council (CFM) regulations
 * Includes automatic content validation and disclaimer injection
 */

import React, { useState, useEffect } from 'react';
import { AlertTriangle, Shield, FileText, CheckCircle } from 'lucide-react';
import useCFMCompliance from '../../hooks/useCFMCompliance';

const CFMCompliance = ({ content, onComplianceCheck }) => {
    const [complianceStatus, setComplianceStatus] = useState({
        validated: false,
        violations: [],
        score: 0,
        recommendations: []
    });

    const [showDetails, setShowDetails] = useState(false);
    const { validateContent } = useCFMCompliance();

    useEffect(() => {
        if (content) {
            validateContent(content)
                .then(result => {
                    setComplianceStatus({
                        validated: true,
                        violations: result.violations,
                        score: result.score,
                        recommendations: result.recommendations,
                        level: result.level
                    });

                    if (onComplianceCheck) {
                        onComplianceCheck(result);
                    }
                })
                .catch(error => {
                    console.error('CFM validation error:', error);
                    setComplianceStatus({
                        validated: true,
                        violations: [{
                            type: 'validation_error',
                            severity: 'high',
                            message: 'Erro na validação de compliance CFM',
                            article: 'Sistema'
                        }],
                        score: 0,
                        recommendations: [{
                            type: 'retry_validation',
                            message: 'Tentar validação novamente'
                        }],
                        level: 'inadequate'
                    });
                });
        }
    }, [content, validateContent, onComplianceCheck]);


    const getScoreColor = (score) => {
        if (score >= 90) return 'text-green-600';
        if (score >= 70) return 'text-yellow-600';
        if (score >= 50) return 'text-orange-600';
        return 'text-red-600';
    };

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'critical': return 'text-red-600 bg-red-50 border-red-200';
            case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
            case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            default: return 'text-blue-600 bg-blue-50 border-blue-200';
        }
    };

    if (!complianceStatus.validated) {
        return (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                    <Shield className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-600">Aguardando validação CFM...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <Shield className="h-6 w-6 text-blue-600" />
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                                Compliance CFM
                            </h3>
                            <p className="text-sm text-gray-500">
                                Validação automática conforme regulamentações médicas
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className={`text-2xl font-bold ${getScoreColor(complianceStatus.score)}`}>
                            {complianceStatus.score}/100
                        </div>
                        <div className="text-sm text-gray-500 capitalize">
                            {complianceStatus.level}
                        </div>
                    </div>
                </div>
            </div>

            {/* Status Summary */}
            <div className="px-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2">
                        {complianceStatus.violations.length === 0 ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                            <AlertTriangle className="h-5 w-5 text-orange-500" />
                        )}
                        <span className="text-sm font-medium">
                            {complianceStatus.violations.length} violações encontradas
                        </span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <FileText className="h-5 w-5 text-blue-500" />
                        <span className="text-sm font-medium">
                            {complianceStatus.recommendations.length} recomendações
                        </span>
                    </div>
                    <button
                        onClick={() => setShowDetails(!showDetails)}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium text-left md:text-right"
                    >
                        {showDetails ? 'Ocultar detalhes' : 'Ver detalhes'}
                    </button>
                </div>
            </div>

            {/* Detailed Results */}
            {showDetails && (
                <div className="px-6 py-4 border-t border-gray-200 space-y-6">
                    {/* Violations */}
                    {complianceStatus.violations.length > 0 && (
                        <div>
                            <h4 className="text-lg font-semibold text-gray-900 mb-3">
                                Violações Identificadas
                            </h4>
                            <div className="space-y-3">
                                {complianceStatus.violations.map((violation, index) => (
                                    <div
                                        key={index}
                                        className={`p-4 rounded-lg border ${getSeverityColor(violation.severity)}`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2 mb-1">
                                                    <span className="text-sm font-semibold uppercase">
                                                        {violation.severity}
                                                    </span>
                                                    <span className="text-sm text-gray-500">
                                                        {violation.type}
                                                    </span>
                                                </div>
                                                <p className="text-sm font-medium mb-1">
                                                    {violation.message}
                                                </p>
                                                <p className="text-xs text-gray-600">
                                                    Base legal: {violation.article}
                                                </p>
                                            </div>
                                            <AlertTriangle className="h-5 w-5 flex-shrink-0 ml-2" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Recommendations */}
                    {complianceStatus.recommendations.length > 0 && (
                        <div>
                            <h4 className="text-lg font-semibold text-gray-900 mb-3">
                                Recomendações de Melhoria
                            </h4>
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <ul className="space-y-2">
                                    {complianceStatus.recommendations.map((rec, index) => (
                                        <li key={index} className="flex items-start space-x-2">
                                            <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                            <span className="text-sm text-blue-800">{rec.message}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}

                    {/* Medical Disclaimer Template */}
                    <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">
                            Template de Disclaimer Médico
                        </h4>
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <p className="text-sm text-gray-700 leading-relaxed">
                                <strong>⚕️ Aviso Médico:</strong> Este conteúdo tem caráter informativo e não substitui consulta médica.
                                Para diagnóstico e tratamento, procure sempre orientação médica qualificada.
                                Em caso de emergência, procure atendimento médico imediato ou ligue para o SAMU (192).
                                <br /><br />
                                <strong>📋 CRM Responsável:</strong> Dr. Philipe Saraiva Cruz - CRM-MG 69.870
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CFMCompliance;