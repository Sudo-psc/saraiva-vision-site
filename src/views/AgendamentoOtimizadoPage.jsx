import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
  Calendar, Clock, Phone, MessageCircle,
  CheckCircle, Shield, Award, Users
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import EnhancedFooter from '@/components/EnhancedFooter';
import OptimizedAppointmentForm from '@/components/OptimizedAppointmentForm';

/**
 * Página de Agendamento Otimizado com A/B Testing
 *
 * Implementa teste A/B:
 * - Versão A: 3 campos (nome, telefone, motivo)
 * - Versão B: 4 campos (+ convênio)
 *
 * Tracking completo de conversão e abandono
 * Auto-save de progresso do formulário
 *
 * @author Dr. Philipe Saraiva Cruz
 */

const AgendamentoOtimizadoPage = () => {
  const navigate = useNavigate();
  const [variant, setVariant] = useState(null);

  useEffect(() => {
    // Determina variante A/B na primeira renderização
    // 50% chance para cada versão
    const assignedVariant = Math.random() < 0.5 ? 'A' : 'B';
    setVariant(assignedVariant);

    // Track page view com variante
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'page_view', {
        page_title: 'Agendamento Otimizado',
        page_location: window.location.href,
        form_variant: assignedVariant
      });
    }

    // Scroll to top
    window.scrollTo(0, 0);
  }, []);

  const handleSuccess = () => {
    // Navega para página de agradecimento
    navigate('/agendamento/obrigado');
  };

  const beneficios = [
    {
      icone: Clock,
      titulo: 'Resposta Rápida',
      descricao: 'Retornamos em até 2 horas úteis',
      cor: 'text-blue-600',
      corBg: 'bg-blue-100'
    },
    {
      icone: Calendar,
      titulo: 'Horários Flexíveis',
      descricao: 'Agende no melhor dia e horário para você',
      cor: 'text-green-600',
      corBg: 'bg-green-100'
    },
    {
      icone: Shield,
      titulo: 'Privacidade Garantida',
      descricao: 'Seus dados protegidos pela LGPD',
      cor: 'text-purple-600',
      corBg: 'bg-purple-100'
    },
    {
      icone: Award,
      titulo: 'Atendimento Especializado',
      descricao: 'Equipe qualificada e experiente',
      cor: 'text-yellow-600',
      corBg: 'bg-yellow-100'
    }
  ];

  const depoimentos = [
    {
      nome: 'Maria Silva',
      texto: 'Agendamento super fácil! Recebi retorno em menos de 1 hora.',
      nota: 5
    },
    {
      nome: 'João Santos',
      texto: 'Adorei a praticidade. Não precisei ligar, fiz tudo online.',
      nota: 5
    },
    {
      nome: 'Ana Costa',
      texto: 'Equipe muito atenciosa. Confirmaram rapidinho pelo WhatsApp.',
      nota: 5
    }
  ];

  // Não renderiza até ter variante definida (evita flash de conteúdo)
  if (!variant) {
    return null;
  }

  return (
    <>
      <Helmet>
        <title>Agende sua Consulta - Saraiva Vision | Oftalmologia Caratinga</title>
        <meta
          name="description"
          content="Agende sua consulta oftalmológica de forma rápida e fácil. Retornamos em até 2 horas úteis. Atendimento com hora marcada."
        />
        <meta name="robots" content="index, follow" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-blue-50">
        <Navbar />

        <main className="container mx-auto px-4 py-12 md:py-20">
          <div className="max-w-6xl mx-auto">

            {/* Hero Section */}
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Agende Sua Consulta
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
                Preencha o formulário abaixo e nossa equipe entrará em contato em até 2 horas úteis
                para confirmar seu horário.
              </p>

              {/* Trust Indicators */}
              <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>Sem compromisso</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>Resposta rápida</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>Dados protegidos</span>
                </div>
              </div>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-12 items-start">

              {/* Formulário - Coluna Esquerda */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                <OptimizedAppointmentForm
                  variant={variant}
                  onSuccess={handleSuccess}
                />
              </motion.div>

              {/* Benefícios e Social Proof - Coluna Direita */}
              <motion.div
                className="space-y-8"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >

                {/* Por que agendar conosco */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Por que agendar conosco?
                  </h2>

                  <div className="space-y-4">
                    {beneficios.map((beneficio, index) => {
                      const Icon = beneficio.icone;
                      return (
                        <motion.div
                          key={index}
                          className="flex items-start gap-4"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 + index * 0.1 }}
                        >
                          <div className={`flex-shrink-0 w-12 h-12 rounded-full ${beneficio.corBg} flex items-center justify-center`}>
                            <Icon className={`w-6 h-6 ${beneficio.cor}`} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 mb-1">
                              {beneficio.titulo}
                            </h3>
                            <p className="text-gray-600 text-sm">
                              {beneficio.descricao}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                {/* Depoimentos */}
                <div className="bg-gradient-to-br from-blue-600 to-sky-500 rounded-2xl shadow-lg p-8 text-white">
                  <h2 className="text-2xl font-bold mb-6">
                    O que nossos pacientes dizem
                  </h2>

                  <div className="space-y-4">
                    {depoimentos.map((depoimento, index) => (
                      <motion.div
                        key={index}
                        className="bg-white/10 backdrop-blur-sm rounded-lg p-4"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.7 + index * 0.1 }}
                      >
                        <div className="flex items-center gap-1 mb-2">
                          {[...Array(depoimento.nota)].map((_, i) => (
                            <span key={i} className="text-yellow-300">★</span>
                          ))}
                        </div>
                        <p className="text-sm mb-2 italic">"{depoimento.texto}"</p>
                        <p className="text-xs font-semibold">— {depoimento.nome}</p>
                      </motion.div>
                    ))}
                  </div>

                  <div className="mt-6 pt-6 border-t border-white/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        <span className="text-sm">136+ avaliações</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Award className="w-5 h-5" />
                        <span className="text-sm font-bold">4.9/5.0</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Atendimento Alternativo */}
                <div className="bg-gray-50 rounded-2xl p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">
                    Prefere falar conosco agora?
                  </h3>

                  <div className="space-y-3">
                    <a
                      href="https://wa.me/553333212293?text=Olá! Gostaria de agendar uma consulta."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-white rounded-lg hover:shadow-md transition-shadow"
                    >
                      <MessageCircle className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium text-gray-900">WhatsApp</p>
                        <p className="text-sm text-gray-600">(33) 3321-2293</p>
                      </div>
                    </a>

                    <a
                      href="tel:+553333212293"
                      className="flex items-center gap-3 p-3 bg-white rounded-lg hover:shadow-md transition-shadow"
                    >
                      <Phone className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-gray-900">Telefone</p>
                        <p className="text-sm text-gray-600">(33) 3321-2293</p>
                      </div>
                    </a>
                  </div>
                </div>

              </motion.div>
            </div>

            {/* FAQ Rápido */}
            <motion.div
              className="mt-16 bg-white rounded-2xl shadow-lg p-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                Dúvidas Frequentes
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Quanto tempo leva para confirmar?
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Nossa equipe retorna em até 2 horas úteis via WhatsApp ou telefone para
                    confirmar seu horário.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Preciso pagar para agendar?
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Não! O agendamento é totalmente gratuito e sem compromisso. Você paga apenas
                    no dia da consulta.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Posso remarcar depois?
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Sim! Você pode remarcar ou cancelar a qualquer momento. Entre em contato
                    conosco pelo WhatsApp.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Meus dados estão seguros?
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Sim! Seguimos rigorosamente a LGPD. Seus dados são usados apenas para
                    agendamento e não são compartilhados.
                  </p>
                </div>
              </div>
            </motion.div>

          </div>
        </main>

        <EnhancedFooter />
      </div>
    </>
  );
};

export default AgendamentoOtimizadoPage;
