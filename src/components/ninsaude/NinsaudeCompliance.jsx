/**
 * Ninsaúde Compliance Component
 * CFM medical disclaimers, LGPD consent, and PII detection warnings
 * @module components/ninsaude/NinsaudeCompliance
 */

import React, { useState } from 'react';
import { Shield, AlertTriangle, FileText, ChevronDown, ChevronUp, ExternalLink, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * NinsaudeCompliance - Component for displaying compliance information
 * @param {Object} props
 * @param {Boolean} props.showCFMDisclaimer - Show CFM medical disclaimer
 * @param {Boolean} props.showLGPDConsent - Show LGPD consent text
 * @param {Boolean} props.showPIIWarning - Show PII detection warning
 * @param {Boolean} props.expandable - Make sections expandable/collapsible
 * @param {Boolean} props.defaultExpanded - Default expanded state for collapsible sections
 * @param {String} props.variant - Display variant: 'full', 'compact', 'minimal'
 */
const NinsaudeCompliance = ({
  showCFMDisclaimer = true,
  showLGPDConsent = true,
  showPIIWarning = false,
  expandable = true,
  defaultExpanded = false,
  variant = 'full',
  className
}) => {
  const [expandedSections, setExpandedSections] = useState({
    cfm: defaultExpanded,
    lgpd: defaultExpanded,
    pii: defaultExpanded
  });

  const toggleSection = (section) => {
    if (expandable) {
      setExpandedSections(prev => ({
        ...prev,
        [section]: !prev[section]
      }));
    }
  };

  const isCompact = variant === 'compact';
  const isMinimal = variant === 'minimal';

  return (
    <div className={cn('space-y-4', className)} data-testid="ninsaude-compliance">
      {/* CFM Medical Disclaimer */}
      {showCFMDisclaimer && (
        <div className="border border-blue-200 bg-blue-50 rounded-lg overflow-hidden">
          {/* Header */}
          <button
            onClick={() => toggleSection('cfm')}
            className={cn(
              'w-full p-4 flex items-center justify-between transition-colors',
              expandable && 'hover:bg-blue-100 cursor-pointer',
              !expandable && 'cursor-default'
            )}
            aria-expanded={expandedSections.cfm}
            aria-controls="cfm-content"
            disabled={!expandable}
          >
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <Shield className="h-5 w-5 text-blue-600" />
              </div>
              <div className="text-left">
                <h3 className="text-sm font-semibold text-gray-900">
                  Aviso Médico (CFM)
                </h3>
                {isMinimal && (
                  <p className="text-xs text-gray-600 mt-0.5">
                    Informações reguladas pelo Conselho Federal de Medicina
                  </p>
                )}
              </div>
            </div>
            {expandable && (
              <div className="flex-shrink-0">
                {expandedSections.cfm ? (
                  <ChevronUp className="h-5 w-5 text-gray-600" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-600" />
                )}
              </div>
            )}
          </button>

          {/* Content */}
          {(!expandable || expandedSections.cfm) && (
            <div
              id="cfm-content"
              className="px-4 pb-4 space-y-3"
              role="region"
              aria-label="Aviso médico CFM"
            >
              {!isMinimal && (
                <>
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="h-4 w-4 text-orange-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-700 leading-relaxed">
                      <strong>Caráter Informativo:</strong> Este sistema de agendamento tem caráter informativo
                      e não substitui consulta médica presencial. Para diagnóstico e tratamento, procure sempre
                      orientação médica qualificada.
                    </p>
                  </div>

                  {!isCompact && (
                    <>
                      <div className="flex items-start space-x-2">
                        <Info className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-gray-700 leading-relaxed">
                          <strong>Emergências:</strong> Em caso de emergência médica, procure atendimento
                          médico imediato ou ligue para o SAMU (192). Não utilize este sistema para casos urgentes.
                        </p>
                      </div>

                      <div className="flex items-start space-x-2">
                        <FileText className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-gray-700 leading-relaxed">
                          <strong>Responsável Técnico:</strong> Dr. Philipe Saraiva Cruz - CRM-MG 69.870
                          <br />
                          Especialista em Oftalmologia
                        </p>
                      </div>
                    </>
                  )}

                  <div className="pt-2 border-t border-blue-200">
                    <p className="text-xs text-gray-600">
                      Conforme Resolução CFM nº 1.974/2011 e Código de Ética Médica (Resolução CFM nº 2.217/2018)
                    </p>
                  </div>
                </>
              )}

              {isMinimal && (
                <p className="text-xs text-gray-700 leading-relaxed">
                  Este sistema tem caráter informativo. Em emergências, ligue 192 (SAMU).
                  Responsável: Dr. Philipe Saraiva Cruz - CRM-MG 69.870
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* LGPD Consent and Privacy */}
      {showLGPDConsent && (
        <div className="border border-green-200 bg-green-50 rounded-lg overflow-hidden">
          {/* Header */}
          <button
            onClick={() => toggleSection('lgpd')}
            className={cn(
              'w-full p-4 flex items-center justify-between transition-colors',
              expandable && 'hover:bg-green-100 cursor-pointer',
              !expandable && 'cursor-default'
            )}
            aria-expanded={expandedSections.lgpd}
            aria-controls="lgpd-content"
            disabled={!expandable}
          >
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <Shield className="h-5 w-5 text-green-600" />
              </div>
              <div className="text-left">
                <h3 className="text-sm font-semibold text-gray-900">
                  Privacidade e Proteção de Dados (LGPD)
                </h3>
                {isMinimal && (
                  <p className="text-xs text-gray-600 mt-0.5">
                    Seus dados são protegidos pela Lei 13.709/2018
                  </p>
                )}
              </div>
            </div>
            {expandable && (
              <div className="flex-shrink-0">
                {expandedSections.lgpd ? (
                  <ChevronUp className="h-5 w-5 text-gray-600" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-600" />
                )}
              </div>
            )}
          </button>

          {/* Content */}
          {(!expandable || expandedSections.lgpd) && (
            <div
              id="lgpd-content"
              className="px-4 pb-4 space-y-3"
              role="region"
              aria-label="Informações sobre LGPD"
            >
              {!isMinimal && (
                <>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    <strong>Coleta e Uso de Dados:</strong> Seus dados pessoais são coletados e tratados
                    exclusivamente para fins de agendamento de consultas, identificação do paciente e
                    comunicação relacionada ao atendimento médico.
                  </p>

                  {!isCompact && (
                    <>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-900">Dados Coletados:</p>
                        <ul className="text-sm text-gray-700 space-y-1 pl-5 list-disc">
                          <li>CPF (para identificação única do paciente)</li>
                          <li>Nome completo, data de nascimento</li>
                          <li>Telefone e e-mail (para contato e confirmações)</li>
                          <li>Endereço (para registro cadastral)</li>
                          <li>Histórico de agendamentos</li>
                        </ul>
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-900">Seus Direitos:</p>
                        <ul className="text-sm text-gray-700 space-y-1 pl-5 list-disc">
                          <li>Acesso aos seus dados pessoais</li>
                          <li>Correção de dados incompletos ou desatualizados</li>
                          <li>Exclusão de dados (observadas as obrigações legais)</li>
                          <li>Portabilidade de dados</li>
                          <li>Revogação do consentimento</li>
                        </ul>
                      </div>

                      <div className="bg-white border border-green-200 rounded-lg p-3">
                        <p className="text-sm text-gray-700 leading-relaxed">
                          <strong>Segurança:</strong> Implementamos medidas técnicas e organizacionais
                          para proteger seus dados, incluindo criptografia, controle de acesso e
                          auditoria de logs conforme LGPD.
                        </p>
                      </div>
                    </>
                  )}

                  <div className="pt-2 border-t border-green-200 flex items-center justify-between">
                    <p className="text-xs text-gray-600">
                      Conforme Lei Geral de Proteção de Dados (Lei 13.709/2018)
                    </p>
                    <a
                      href="/privacidade"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-green-700 hover:text-green-900 font-medium flex items-center space-x-1 underline"
                    >
                      <span>Política de Privacidade</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </>
              )}

              {isMinimal && (
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-700 leading-relaxed">
                    Seus dados são protegidos conforme LGPD (Lei 13.709/2018)
                  </p>
                  <a
                    href="/privacidade"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-green-700 hover:text-green-900 font-medium flex items-center space-x-1 underline flex-shrink-0 ml-2"
                  >
                    <span>Saiba mais</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* PII Detection Warning */}
      {showPIIWarning && (
        <div className="border border-orange-200 bg-orange-50 rounded-lg overflow-hidden">
          {/* Header */}
          <button
            onClick={() => toggleSection('pii')}
            className={cn(
              'w-full p-4 flex items-center justify-between transition-colors',
              expandable && 'hover:bg-orange-100 cursor-pointer',
              !expandable && 'cursor-default'
            )}
            aria-expanded={expandedSections.pii}
            aria-controls="pii-content"
            disabled={!expandable}
          >
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
              </div>
              <div className="text-left">
                <h3 className="text-sm font-semibold text-gray-900">
                  Aviso de Dados Sensíveis
                </h3>
                {isMinimal && (
                  <p className="text-xs text-gray-600 mt-0.5">
                    Detectamos possíveis informações sensíveis
                  </p>
                )}
              </div>
            </div>
            {expandable && (
              <div className="flex-shrink-0">
                {expandedSections.pii ? (
                  <ChevronUp className="h-5 w-5 text-gray-600" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-600" />
                )}
              </div>
            )}
          </button>

          {/* Content */}
          {(!expandable || expandedSections.pii) && (
            <div
              id="pii-content"
              className="px-4 pb-4 space-y-3"
              role="region"
              aria-label="Aviso de dados sensíveis"
            >
              <div className="flex items-start space-x-2">
                <Info className="h-4 w-4 text-orange-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-700 leading-relaxed">
                  Detectamos que você pode estar fornecendo informações pessoais sensíveis
                  (como CPF, documentos, dados médicos) neste formulário.
                </p>
              </div>

              {!isMinimal && (
                <>
                  <div className="bg-white border border-orange-200 rounded-lg p-3 space-y-2">
                    <p className="text-sm font-medium text-gray-900">Recomendações de Segurança:</p>
                    <ul className="text-sm text-gray-700 space-y-1 pl-5 list-disc">
                      <li>Verifique se está em uma conexão segura (https://)</li>
                      <li>Não compartilhe senhas ou informações bancárias</li>
                      <li>Confirme que está no site oficial da clínica</li>
                      <li>Em caso de dúvidas, entre em contato conosco diretamente</li>
                    </ul>
                  </div>

                  <p className="text-xs text-gray-600 leading-relaxed">
                    Este aviso é exibido automaticamente quando detectamos padrões de dados sensíveis.
                    Seus dados permanecem protegidos conforme nossa Política de Privacidade e a LGPD.
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Global Accessibility Announcement */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {showCFMDisclaimer && 'Informações de compliance CFM disponíveis'}
        {showLGPDConsent && 'Informações de privacidade LGPD disponíveis'}
        {showPIIWarning && 'Aviso de dados sensíveis ativo'}
      </div>
    </div>
  );
};

export default NinsaudeCompliance;
