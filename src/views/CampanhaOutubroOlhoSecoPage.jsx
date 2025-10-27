import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
  Eye, Calendar, CheckCircle, ArrowRight,
  Star, Gift, Clock, Users, MessageCircle
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import EnhancedFooter from '@/components/EnhancedFooter';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

/**
 * Landing Page - Campanha Outubro Olho Seco
 * Promoção: R$ 100 OFF em Meibografia
 *
 * @author Dr. Philipe Saraiva Cruz
 */

const CampanhaOutubroOlhoSecoPage = () => {
  const beneficios = [
    {
      icon: Eye,
      titulo: 'Diagnóstico Preciso',
      descricao: 'Meibografia visualiza suas glândulas de Meibômio em alta definição'
    },
    {
      icon: Clock,
      titulo: 'Exame Rápido',
      descricao: 'Procedimento não invasivo que leva apenas 5-10 minutos'
    },
    {
      icon: CheckCircle,
      titulo: 'Sem Dor',
      descricao: 'Exame totalmente indolor, sem necessidade de anestesia'
    },
    {
      icon: Star,
      titulo: 'Tecnologia Avançada',
      descricao: 'Equipamento de última geração para máxima precisão'
    }
  ];

  const passos = [
    {
      numero: '1',
      titulo: 'Faça o Questionário',
      descricao: 'Complete nossa avaliação online gratuita em 2 minutos',
      link: '/questionario-olho-seco'
    },
    {
      numero: '2',
      titulo: 'Agende sua Consulta',
      descricao: 'Use o código OUTUBRO100 para garantir o desconto',
      link: 'https://wa.me/553333212293?text=Olá! Quero agendar consulta com desconto OUTUBRO100'
    },
    {
      numero: '3',
      titulo: 'Realize a Meibografia',
      descricao: 'Exame completo com diagnóstico detalhado'
    },
    {
      numero: '4',
      titulo: 'Receba seu Plano',
      descricao: 'Tratamento personalizado para suas necessidades'
    }
  ];

  return (
    <>
      <Helmet>
        <title>Campanha Outubro - R$ 100 OFF Meibografia | Saraiva Vision</title>
        <meta
          name="description"
          content="Promoção especial de outubro: R$ 100 de desconto no exame de meibografia. Diagnóstico preciso de olho seco com tecnologia avançada em Caratinga-MG."
        />
        <meta name="keywords" content="meibografia desconto, olho seco campanha, promoção meibografia Caratinga, exame olho seco" />

        {/* Open Graph */}
        <meta property="og:title" content="Outubro Olho Seco - R$ 100 OFF em Meibografia" />
        <meta property="og:description" content="Aproveite a campanha especial de outubro e cuide da saúde dos seus olhos!" />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-sky-50">
        <Navbar />

        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-sky-600 to-blue-700 text-white py-20">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
              backgroundSize: '50px 50px'
            }} />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              className="max-w-4xl mx-auto text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-block bg-green-500 text-white px-6 py-2 rounded-full font-bold mb-6">
                🎉 CAMPANHA OUTUBRO 2025
              </div>

              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                Mês de Conscientização
                <br />
                sobre <span className="text-yellow-300">Olho Seco</span>
              </h1>

              <p className="text-2xl md:text-3xl font-semibold mb-4">
                <Gift className="inline w-8 h-8 mr-2" />
                R$ 100 OFF em Meibografia
              </p>

              <p className="text-xl mb-8 text-sky-100 max-w-2xl mx-auto">
                Diagnóstico preciso com tecnologia de ponta para identificar
                disfunção das glândulas de Meibômio - principal causa de olho seco
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/questionario-olho-seco">
                  <Button size="lg" className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold text-lg px-8">
                    <Eye className="mr-2 w-5 h-5" />
                    Fazer Teste Gratuito
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-white/10 backdrop-blur border-white text-white hover:bg-white/20 text-lg px-8"
                  onClick={() => window.open('https://wa.me/553333212293?text=Olá! Quero agendar consulta com desconto OUTUBRO100', '_blank')}
                >
                  <MessageCircle className="mr-2 w-5 h-5" />
                  Agendar Agora
                </Button>
              </div>

              <p className="mt-6 text-sm text-sky-200">
                <Calendar className="inline w-4 h-4 mr-1" />
                Promoção válida durante todo o mês de outubro de 2025
              </p>
            </motion.div>
          </div>
        </section>

        {/* Benefícios da Meibografia */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Por que Fazer Meibografia?
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                A meibografia é o exame mais avançado para diagnosticar
                disfunção das glândulas de Meibômio
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {beneficios.map((beneficio, index) => {
                const Icon = beneficio.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Card className="h-full hover:shadow-lg transition-shadow">
                      <CardContent className="pt-6">
                        <div className="w-12 h-12 bg-sky-100 rounded-lg flex items-center justify-center mb-4">
                          <Icon className="w-6 h-6 text-sky-600" />
                        </div>
                        <h3 className="font-bold text-lg mb-2">{beneficio.titulo}</h3>
                        <p className="text-gray-600 text-sm">{beneficio.descricao}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Como Funciona */}
        <section className="py-16 bg-gradient-to-b from-sky-50 to-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Como Participar da Campanha
              </h2>
              <p className="text-xl text-gray-600">
                4 passos simples para cuidar da saúde dos seus olhos
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              {passos.map((passo, index) => (
                <motion.div
                  key={index}
                  className="flex gap-4 mb-8 last:mb-0"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.15 }}
                  viewport={{ once: true }}
                >
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-sky-600 text-white font-bold text-xl flex items-center justify-center">
                      {passo.numero}
                    </div>
                  </div>
                  <Card className="flex-1">
                    <CardContent className="pt-4">
                      <h3 className="font-bold text-lg mb-2">{passo.titulo}</h3>
                      <p className="text-gray-600 mb-3">{passo.descricao}</p>
                      {passo.link && (
                        passo.link.startsWith('http') ? (
                          <Button
                            variant="link"
                            className="p-0 h-auto text-sky-600"
                            onClick={() => window.open(passo.link, '_blank')}
                          >
                            Acessar <ArrowRight className="ml-1 w-4 h-4" />
                          </Button>
                        ) : (
                          <Link to={passo.link}>
                            <Button variant="link" className="p-0 h-auto text-sky-600">
                              Acessar <ArrowRight className="ml-1 w-4 h-4" />
                            </Button>
                          </Link>
                        )
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Final */}
        <section className="py-16 bg-gradient-to-r from-green-600 to-emerald-700 text-white">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              className="max-w-3xl mx-auto"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold mb-4">
                Não Perca Esta Oportunidade!
              </h2>
              <p className="text-xl mb-2">
                <strong className="text-3xl">R$ 100 OFF</strong> no exame de meibografia
              </p>
              <p className="text-green-100 mb-8">
                Use o código: <strong className="bg-white/20 px-3 py-1 rounded">OUTUBRO100</strong>
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/questionario-olho-seco">
                  <Button size="lg" className="bg-white text-green-700 hover:bg-gray-100 font-bold">
                    <Eye className="mr-2 w-5 h-5" />
                    Fazer Questionário Grátis
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-white text-white hover:bg-white/10"
                  onClick={() => window.open('https://wa.me/553333212293?text=Olá! Quero aproveitar a promoção OUTUBRO100', '_blank')}
                >
                  <Calendar className="mr-2 w-5 h-5" />
                  Agendar Consulta
                </Button>
              </div>

              <div className="mt-8 pt-8 border-t border-white/20">
                <p className="text-sm text-green-100">
                  <Users className="inline w-4 h-4 mr-1" />
                  Campanha válida apenas em outubro de 2025 | Vagas limitadas
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Informações de Contato */}
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="text-center">Entre em Contato</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6 text-center">
                  <div>
                    <h3 className="font-semibold mb-2">Telefone</h3>
                    <p className="text-gray-600">(33) 3321-2293</p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">WhatsApp</h3>
                    <p className="text-gray-600">(33) 99999-9999</p>
                  </div>
                  <div className="md:col-span-2">
                    <h3 className="font-semibold mb-2">Endereço</h3>
                    <p className="text-gray-600">
                      Rua Coronel Manoel Alves, 555 - Centro
                      <br />
                      Caratinga, MG - CEP 35300-035
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <EnhancedFooter />
      </div>
    </>
  );
};

export default CampanhaOutubroOlhoSecoPage;
