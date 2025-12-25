import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Droplets, Microscope, ShieldCheck, Award, ArrowRight, Sparkles, Zap, CheckCircle, ClipboardCheck, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';

/**
 * DryEyeCenterSection - Componente que destaca o Centro de Excelência em Olho Seco
 *
 * Posiciona a Saraiva Vision como referência no tratamento de olho seco no interior de Minas Gerais,
 * destacando tecnologias exclusivas (IRPL®, Meibografia) e protocolos internacionais (TFOS DEWS III).
 */
const DryEyeCenterSection = () => {
  const features = [
    {
      icon: Microscope,
      title: 'Meibografia em Caratinga',
      description: 'Exame de imagem que documenta a estrutura das glândulas de Meibômio, permitindo acompanhamento seriado da DGM.',
      highlight: 'Exclusivo na cidade'
    },
    {
      icon: Zap,
      title: 'IRPL® E-Eye',
      description: 'Tecnologia francesa pioneira no interior de MG que promove reeducação neurológica das glândulas.',
      highlight: 'Padrão ouro mundial'
    },
    {
      icon: ShieldCheck,
      title: 'Protocolo TFOS DEWS III',
      description: 'Diagnóstico e tratamento baseados no consenso internacional mais atual sobre olho seco.',
      highlight: 'Base científica 2025'
    },
    {
      icon: ClipboardCheck,
      title: 'Autoavaliação Gratuita',
      description: 'Questionário interativo para identificar a gravidade dos seus sintomas.',
      highlight: 'Resultado imediato'
    }
  ];

  const stats = [
    { value: '70%', label: 'dos casos são evaporativos (DGM)' },
    { value: '6 meses a 3 anos', label: 'de duração do tratamento IRPL®' },
    { value: '+1000', label: 'pacientes tratados' },
    { value: 'Pioneiros', label: 'no interior de Minas Gerais' }
  ];

  return (
    <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-900 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16 lg:py-24 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 lg:mb-16"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-cyan-500/20 text-cyan-300 px-4 py-2 text-sm font-semibold mb-6 border border-cyan-400/30">
            <Award className="w-4 h-4" />
            <span>Centro de Excelência em Olho Seco</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            Referência no Tratamento de Olho Seco
            <span className="block text-cyan-400 mt-2">no Interior de Minas Gerais</span>
          </h2>
          <p className="text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Serviço especializado com diagnóstico completo, meibografia e tratamentos avançados como IRPL®.
            Protocolos alinhados ao TFOS DEWS III para resultados objetivos e duradouros.
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12 lg:mb-16"
        >
          {stats.map((stat, idx) => (
            <div key={idx} className="text-center p-4 lg:p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
              <p className="text-2xl lg:text-3xl font-bold text-cyan-400 mb-1">{stat.value}</p>
              <p className="text-sm text-slate-300">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="group bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-cyan-400/30 hover:bg-white/10 transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold text-white">{feature.title}</h3>
                      <span className="text-xs bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-400/30">
                        {feature.highlight}
                      </span>
                    </div>
                    <p className="text-slate-300 text-sm leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-gradient-to-r from-cyan-600 to-cyan-700 rounded-2xl p-8 lg:p-10 text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Droplets className="w-8 h-8 text-white" />
            <h3 className="text-2xl lg:text-3xl font-bold text-white">
              Agende sua Avaliação Completa de Olho Seco
            </h3>
          </div>
          <p className="text-white/90 mb-6 max-w-2xl mx-auto">
            Diagnóstico objetivo com meibografia, documentação fotográfica e protocolos baseados nas diretrizes internacionais TFOS DEWS III.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-white text-cyan-700 hover:bg-cyan-50 px-8 py-4 text-base font-semibold shadow-xl"
            >
              <Link to="/agendamento" className="gap-2">
                <Calendar className="w-5 h-5" />
                Agendar Avaliação
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-2 border-white bg-transparent text-white hover:bg-white/20 px-8 py-4 text-base font-semibold"
            >
              <Link to="/olho-seco" className="gap-2">
                <Sparkles className="w-5 h-5" />
                Conhecer o Serviço
              </Link>
            </Button>
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-sm text-white/90 font-medium">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>Meibografia em Caratinga</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>IRPL® E-Eye</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>Protocolo TFOS DEWS III</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default DryEyeCenterSection;
