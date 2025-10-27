import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
  CheckCircle, Calendar, Phone, MessageCircle,
  Clock, MapPin, Mail, ArrowRight, Home
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import EnhancedFooter from '@/components/EnhancedFooter';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

/**
 * Página de Thank You após Agendamento
 *
 * Mostra:
 * - Confirmação de recebimento
 * - Próximos passos claros
 * - Informações de contato
 * - Tempo estimado de resposta
 * - Opções alternativas de contato
 *
 * @author Dr. Philipe Saraiva Cruz
 */

const AppointmentThankYouPage = () => {
  useEffect(() => {
    // Track conversion
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'conversion', {
        send_to: 'AW-CONVERSION_ID/CONVERSION_LABEL',
        event_category: 'appointment',
        event_label: 'appointment_completed'
      });
    }

    // Scroll to top
    window.scrollTo(0, 0);
  }, []);

  const proximosPassos = [
    {
      numero: '1',
      titulo: 'Verificamos seu Pedido',
      descricao: 'Nossa equipe está analisando sua solicitação de agendamento',
      tempo: 'Agora',
      icone: CheckCircle,
      cor: 'text-green-600',
      corBg: 'bg-green-100'
    },
    {
      numero: '2',
      titulo: 'Entraremos em Contato',
      descricao: 'Ligaremos ou enviaremos WhatsApp para confirmar horário e data',
      tempo: 'Em até 2 horas úteis',
      icone: Phone,
      cor: 'text-blue-600',
      corBg: 'bg-blue-100'
    },
    {
      numero: '3',
      titulo: 'Sua Consulta Agendada',
      descricao: 'Você receberá confirmação com todos os detalhes da consulta',
      tempo: 'Após confirmação',
      icone: Calendar,
      cor: 'text-purple-600',
      corBg: 'bg-purple-100'
    }
  ];

  return (
    <>
      <Helmet>
        <title>Agendamento Recebido - Saraiva Vision</title>
        <meta name="description" content="Seu agendamento foi recebido com sucesso. Entraremos em contato em breve para confirmar." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-sky-50">
        <Navbar />

        <main className="container mx-auto px-4 py-12 md:py-20">
          <div className="max-w-4xl mx-auto">

            {/* Success Message */}
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-6">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Agendamento Recebido!
              </h1>

              <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-6">
                Obrigado por escolher a Saraiva Vision. Sua solicitação de agendamento
                foi recebida com sucesso.
              </p>

              <div className="inline-flex items-center gap-2 px-6 py-3 bg-green-100 border border-green-300 rounded-full text-green-800 font-medium">
                <Clock className="w-5 h-5" />
                <span>Responderemos em até 2 horas úteis</span>
              </div>
            </motion.div>

            {/* Próximos Passos */}
            <motion.div
              className="mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                O que acontece agora?
              </h2>

              <div className="space-y-4">
                {proximosPassos.map((passo, index) => {
                  const Icon = passo.icone;
                  return (
                    <motion.div
                      key={index}
                      className="relative"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                    >
                      <Card className="border-2 hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            {/* Número */}
                            <div className="flex-shrink-0">
                              <div className={`w-12 h-12 rounded-full ${passo.corBg} flex items-center justify-center`}>
                                <span className={`text-xl font-bold ${passo.cor}`}>
                                  {passo.numero}
                                </span>
                              </div>
                            </div>

                            {/* Conteúdo */}
                            <div className="flex-1">
                              <div className="flex items-start justify-between gap-4 mb-2">
                                <h3 className="text-lg font-semibold text-gray-900">
                                  {passo.titulo}
                                </h3>
                                <Icon className={`w-6 h-6 ${passo.cor} flex-shrink-0`} />
                              </div>
                              <p className="text-gray-600 mb-2">{passo.descricao}</p>
                              <p className="text-sm text-gray-500 flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {passo.tempo}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* Contato Urgente */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <Card className="border-sky-200 bg-gradient-to-br from-sky-50 to-blue-50">
                <CardHeader>
                  <CardTitle className="text-center">
                    Precisa Falar com Urgência?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-gray-700 mb-6">
                    Se preferir, você pode entrar em contato conosco diretamente:
                  </p>

                  <div className="grid md:grid-cols-2 gap-4">
                    {/* WhatsApp */}
                    <Button
                      variant="outline"
                      className="h-auto py-4 border-2 border-green-300 hover:bg-green-50 flex-col items-start gap-2"
                      onClick={() => window.open('https://wa.me/553333212293?text=Olá! Acabei de fazer um agendamento pelo site.', '_blank')}
                    >
                      <div className="flex items-center gap-2 w-full">
                        <MessageCircle className="w-5 h-5 text-green-600" />
                        <span className="font-semibold text-gray-900">WhatsApp</span>
                      </div>
                      <span className="text-sm text-gray-600">(33) 99999-9999</span>
                    </Button>

                    {/* Telefone */}
                    <Button
                      variant="outline"
                      className="h-auto py-4 border-2 border-blue-300 hover:bg-blue-50 flex-col items-start gap-2"
                      onClick={() => window.location.href = 'tel:+553333212293'}
                    >
                      <div className="flex items-center gap-2 w-full">
                        <Phone className="w-5 h-5 text-blue-600" />
                        <span className="font-semibold text-gray-900">Telefone</span>
                      </div>
                      <span className="text-sm text-gray-600">(33) 3321-2293</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Informações da Clínica */}
            <motion.div
              className="mt-12 grid md:grid-cols-2 gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
            >
              {/* Endereço */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-sky-600" />
                    Endereço da Clínica
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">
                    Rua Coronel Manoel Alves, 555<br />
                    Centro - Caratinga, MG<br />
                    CEP 35300-035
                  </p>
                  <Button
                    variant="link"
                    className="p-0 h-auto mt-3 text-sky-600"
                    onClick={() => window.open('https://maps.google.com/?q=Saraiva+Vision+Caratinga', '_blank')}
                  >
                    Ver no Mapa <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </CardContent>
              </Card>

              {/* Horário de Atendimento */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="w-5 h-5 text-sky-600" />
                    Horário de Atendimento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-gray-700">
                    <div className="flex justify-between">
                      <span>Segunda a Sexta:</span>
                      <span className="font-medium">8h às 18h</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sábado:</span>
                      <span className="font-medium">8h às 12h</span>
                    </div>
                    <div className="flex justify-between text-gray-500">
                      <span>Domingo:</span>
                      <span>Fechado</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* CTAs */}
            <motion.div
              className="mt-12 flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
            >
              <Link to="/">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  <Home className="w-5 h-5 mr-2" />
                  Voltar ao Início
                </Button>
              </Link>

              <Link to="/servicos">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Nossos Serviços
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </motion.div>

            {/* Footer Note */}
            <motion.div
              className="mt-12 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4 }}
            >
              <p className="text-sm text-gray-500">
                <Mail className="w-4 h-4 inline mr-1" />
                Dúvidas? Entre em contato:{' '}
                <a
                  href="mailto:contato@saraivavision.com.br"
                  className="text-sky-600 hover:underline"
                >
                  contato@saraivavision.com.br
                </a>
              </p>
            </motion.div>

          </div>
        </main>

        <EnhancedFooter />
      </div>
    </>
  );
};

export default AppointmentThankYouPage;
