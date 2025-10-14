import React from 'react';
import { Shield, RefreshCw, FileText, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

const ReturnPolicy = () => {
  const cancellationRules = [
    {
      icon: Clock,
      title: 'Direito de Arrependimento',
      description: '7 dias corridos após contratação, desde que não haja consumo dos serviços',
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50'
    },
    {
      icon: FileText,
      title: 'Exceção Médica',
      description: 'Cancelamento permitido com relatório médico de oftalmologista contraindicando o uso de lentes',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      icon: AlertTriangle,
      title: 'Sem Cancelamento',
      description: 'Para demais motivos após período de arrependimento',
      color: 'text-amber-600',
      bgColor: 'bg-amber-50'
    }
  ];

  const returnRules = [
    {
      icon: Clock,
      title: 'Prazo',
      description: '30 dias corridos após recebimento',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      icon: RefreshCw,
      title: 'Custos de Frete',
      description: 'Por conta do cliente (exceto defeitos de fabricação ou erro na entrega)',
      color: 'text-slate-600',
      bgColor: 'bg-slate-50'
    },
    {
      icon: CheckCircle,
      title: 'Produtos Elegíveis',
      description: 'Apenas lentes em embalagem original lacrada',
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50'
    }
  ];

  return (
    <section className="mb-8 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-100 to-blue-100 text-cyan-700 px-4 py-2 rounded-full text-sm font-semibold mb-3 shadow-sm">
            <Shield className="w-4 h-4" />
            <span>Política de Troca e Devolução</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Seus Direitos e Garantias
          </h2>
          <p className="text-base text-gray-600 max-w-2xl mx-auto">
            Transparência e clareza em todos os procedimentos
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Cancelamento do Plano Anual */}
          <div className="bg-white rounded-2xl p-6 border-2 border-cyan-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl p-3 shadow-md">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Cancelamento do Plano Anual
              </h3>
            </div>

            <div className="space-y-3">
              {cancellationRules.map((rule, index) => {
                const IconComponent = rule.icon;
                return (
                  <div
                    key={index}
                    className={`flex items-start gap-3 ${rule.bgColor} rounded-xl p-3 border border-gray-200 hover:scale-[1.02] transition-transform duration-200`}
                  >
                    <div className={`${rule.color} flex-shrink-0 mt-0.5`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm mb-1">{rule.title}</p>
                      <p className="text-xs text-gray-700 leading-relaxed">{rule.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Troca e Devolução */}
          <div className="bg-white rounded-2xl p-6 border-2 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-3 shadow-md">
                <RefreshCw className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Troca e Devolução
              </h3>
            </div>

            <div className="space-y-3">
              {returnRules.map((rule, index) => {
                const IconComponent = rule.icon;
                return (
                  <div
                    key={index}
                    className={`flex items-start gap-3 ${rule.bgColor} rounded-xl p-3 border border-gray-200 hover:scale-[1.02] transition-transform duration-200`}
                  >
                    <div className={`${rule.color} flex-shrink-0 mt-0.5`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm mb-1">{rule.title}</p>
                      <p className="text-xs text-gray-700 leading-relaxed">{rule.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Procedimentos Claros */}
        <div className="mt-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-5 border border-gray-300 shadow-md">
          <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-600" />
            Procedimentos Claros
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <p className="text-xs font-semibold text-gray-900 mb-1">Canais de Atendimento</p>
              <p className="text-xs text-gray-600">WhatsApp, Email e Telefone bem definidos</p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <p className="text-xs font-semibold text-gray-900 mb-1">Prazos Específicos</p>
              <p className="text-xs text-gray-600">Tempos claros para processamento de solicitações</p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <p className="text-xs font-semibold text-gray-900 mb-1">Documentação Necessária</p>
              <p className="text-xs text-gray-600">Lista detalhada de documentos para cada caso</p>
            </div>
          </div>
        </div>

        {/* Contact CTA */}
        <div className="mt-6 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl p-4 text-center text-white shadow-lg">
          <p className="text-sm font-semibold mb-2">Dúvidas sobre nossa política?</p>
          <a
            href="https://wa.me/message/2QFZJG3EDJZVF1"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white text-cyan-600 hover:bg-cyan-50 font-bold py-2 px-5 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 text-sm"
          >
            Fale Conosco
          </a>
        </div>
      </div>
    </section>
  );
};

export default ReturnPolicy;
