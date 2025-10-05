/**
 * AgendamentoPage - Main Appointment Booking Page
 * Route: /agendamento
 *
 * Features:
 * - Renders AppointmentBookingForm component
 * - SEO metadata for appointment booking
 * - Error boundary for graceful error handling
 * - Breadcrumb navigation
 * - Mobile-responsive layout
 * - Analytics integration
 */

import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Calendar, Clock, User, Shield } from 'lucide-react';
import AppointmentBookingForm from '@/components/ninsaude/AppointmentBookingForm';
import ErrorBoundary from '@/components/ErrorBoundary';

export default function AgendamentoPage() {
  return (
    <>
      <Helmet>
        <title>Agendar Consulta Online - Clínica Saraiva Vision | Caratinga - MG</title>
        <meta
          name="description"
          content="Agende sua consulta oftalmológica online de forma rápida e segura. Sistema integrado com horários em tempo real e confirmação imediata via email e WhatsApp."
        />
        <meta
          name="keywords"
          content="agendamento online, consulta oftalmológica, oftalmologista Caratinga, Saraiva Vision, agendar consulta, Ninsaúde"
        />

        {/* Open Graph */}
        <meta property="og:title" content="Agendar Consulta - Saraiva Vision" />
        <meta
          property="og:description"
          content="Agende sua consulta oftalmológica online de forma rápida e segura na Clínica Saraiva Vision em Caratinga/MG."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://saraivavision.com.br/agendamento" />
        <meta property="og:image" content="https://saraivavision.com.br/images/og-agendamento.jpg" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Agendar Consulta - Saraiva Vision" />
        <meta name="twitter:description" content="Agende sua consulta oftalmológica online de forma rápida e segura." />

        {/* Canonical URL */}
        <link rel="canonical" href="https://saraivavision.com.br/agendamento" />

        {/* Structured Data - MedicalWebPage */}
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'MedicalWebPage',
            name: 'Agendamento de Consulta Oftalmológica',
            description: 'Sistema de agendamento online para consultas oftalmológicas na Clínica Saraiva Vision',
            url: 'https://saraivavision.com.br/agendamento',
            about: {
              '@type': 'MedicalProcedure',
              name: 'Consulta Oftalmológica',
              procedureType: 'Consulta Médica'
            },
            provider: {
              '@type': 'MedicalClinic',
              name: 'Clínica Saraiva Vision',
              url: 'https://saraivavision.com.br',
              address: {
                '@type': 'PostalAddress',
                streetAddress: 'Rua Santa Cruz, 233 - Centro',
                addressLocality: 'Caratinga',
                addressRegion: 'MG',
                postalCode: '35300-036',
                addressCountry: 'BR'
              }
            },
            mainContentOfPage: {
              '@type': 'WebPageElement',
              description: 'Formulário de agendamento online para consultas oftalmológicas'
            }
          })}
        </script>
      </Helmet>

      <div
        className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50"
        data-testid="agendamento-page"
      >
        {/* Breadcrumb Navigation */}
        <nav className="bg-white border-b border-gray-200" aria-label="Breadcrumb" role="navigation">
          <div className="container mx-auto px-4 py-3">
            <ol className="flex items-center space-x-2 text-sm">
              <li>
                <a
                  href="/"
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                  aria-label="Voltar ao início"
                >
                  Início
                </a>
              </li>
              <li className="text-gray-400">/</li>
              <li className="text-gray-700 font-medium" aria-current="page">
                Agendamento
              </li>
            </ol>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Agendamento Online - Saraiva Vision
              </h1>
              <p className="text-lg text-blue-100 mb-2">
                Clínica Oftalmológica Dr. Philipe Saraiva
              </p>
              <p className="text-xl md:text-2xl text-blue-100 mb-8">
                Sistema rápido, seguro e com horários em tempo real
              </p>

              {/* Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
                <div className="flex flex-col items-center">
                  <div className="bg-white/10 backdrop-blur-sm rounded-full p-4 mb-3">
                    <Calendar className="w-8 h-8" />
                  </div>
                  <h3 className="font-semibold mb-1">Horários em Tempo Real</h3>
                  <p className="text-sm text-blue-100">Disponibilidade atualizada</p>
                </div>

                <div className="flex flex-col items-center">
                  <div className="bg-white/10 backdrop-blur-sm rounded-full p-4 mb-3">
                    <Clock className="w-8 h-8" />
                  </div>
                  <h3 className="font-semibold mb-1">Confirmação Imediata</h3>
                  <p className="text-sm text-blue-100">Email e WhatsApp</p>
                </div>

                <div className="flex flex-col items-center">
                  <div className="bg-white/10 backdrop-blur-sm rounded-full p-4 mb-3">
                    <User className="w-8 h-8" />
                  </div>
                  <h3 className="font-semibold mb-1">Simples e Rápido</h3>
                  <p className="text-sm text-blue-100">Apenas 3 passos</p>
                </div>

                <div className="flex flex-col items-center">
                  <div className="bg-white/10 backdrop-blur-sm rounded-full p-4 mb-3">
                    <Shield className="w-8 h-8" />
                  </div>
                  <h3 className="font-semibold mb-1">100% Seguro</h3>
                  <p className="text-sm text-blue-100">Proteção LGPD</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content - Booking Form */}
        <section className="py-12" role="main" id="main-content">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <ErrorBoundary
                fallback={
                  <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
                    <h2 className="text-2xl font-bold text-red-900 mb-4">
                      Algo deu errado
                    </h2>
                    <p className="text-red-700 mb-4">
                      Erro ao carregar página. Tente um contato alternativo.
                    </p>
                    <div className="text-red-600 mb-4">
                      <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-red-900 mb-2">
                      Erro ao Carregar Agendamento
                    </h2>
                    <p className="text-red-700 mb-6">
                      Ocorreu um erro ao carregar o formulário de agendamento.
                      Por favor, tente novamente ou entre em contato conosco.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <button
                        onClick={() => window.location.reload()}
                        className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                      >
                        Recarregar Página
                      </button>
                      <a
                        href="https://wa.me/5533998774890"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                      >
                        Contatar via WhatsApp
                      </a>
                    </div>
                  </div>
                }
              >
                <AppointmentBookingForm />
              </ErrorBoundary>
            </div>
          </div>
        </section>

        {/* Medical Disclaimer - CFM Compliance */}
        <section className="bg-gray-50 border-t border-gray-200 py-8">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-amber-900 mb-3 flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Aviso Importante
                </h3>
                <div className="text-sm text-amber-800 space-y-2">
                  <p>
                    <strong>Este sistema não substitui consulta médica presencial.</strong> O agendamento online é apenas para marcação de horários. Todos os procedimentos diagnósticos e terapêuticos serão realizados durante a consulta presencial na clínica.
                  </p>
                  <p>
                    Em caso de emergência oftalmológica (perda súbita de visão, dor ocular intensa, trauma ocular), procure imediatamente atendimento médico de urgência. Não aguarde agendamento.
                  </p>
                  <p>
                    Seus dados são protegidos de acordo com a Lei Geral de Proteção de Dados (LGPD - Lei 13.709/2018) e serão utilizados exclusivamente para fins de agendamento e atendimento médico.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-8">Dúvidas Frequentes</h2>

              <div className="space-y-4">
                <details className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors">
                  <summary className="font-semibold cursor-pointer text-lg">
                    Como funciona o agendamento online?
                  </summary>
                  <p className="mt-4 text-gray-700">
                    O processo é simples: (1) Informe seu CPF para verificação, (2) Selecione data e horário disponíveis, (3) Confirme seus dados pessoais. Você receberá confirmação por email e WhatsApp imediatamente.
                  </p>
                </details>

                <details className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors">
                  <summary className="font-semibold cursor-pointer text-lg">
                    Já sou paciente da clínica. Preciso preencher tudo novamente?
                  </summary>
                  <p className="mt-4 text-gray-700">
                    Não! Se você já é paciente, ao informar seu CPF o sistema recupera automaticamente seus dados. Você só precisa selecionar o horário desejado.
                  </p>
                </details>

                <details className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors">
                  <summary className="font-semibold cursor-pointer text-lg">
                    Posso cancelar ou reagendar minha consulta?
                  </summary>
                  <p className="mt-4 text-gray-700">
                    Sim! Você pode gerenciar seus agendamentos diretamente pelo sistema. Para cancelamento ou reagendamento, entre em contato através do WhatsApp (33) 99877-4890.
                  </p>
                </details>

                <details className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors">
                  <summary className="font-semibold cursor-pointer text-lg">
                    Meus dados estão seguros?
                  </summary>
                  <p className="mt-4 text-gray-700">
                    Sim! Utilizamos criptografia de ponta a ponta e estamos em total conformidade com a LGPD. Seus dados são armazenados de forma segura e utilizados exclusivamente para fins médicos.
                  </p>
                </details>

                <details className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors">
                  <summary className="font-semibold cursor-pointer text-lg">
                    E se não houver horários disponíveis?
                  </summary>
                  <p className="mt-4 text-gray-700">
                    O sistema mostra horários atualizados em tempo real. Se não encontrar disponibilidade, entre em contato conosco pelo WhatsApp (33) 99877-4890 para verificar outras opções.
                  </p>
                </details>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
