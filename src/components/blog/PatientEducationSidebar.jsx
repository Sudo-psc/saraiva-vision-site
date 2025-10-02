import React from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, AlertCircle, BookOpen, FileText, Download } from 'lucide-react';
import { Button } from '../ui/button';
import { Link } from '@/utils/router';

/**
 * Patient Education Sidebar Component
 * Provides quick access to educational resources, FAQs, and helpful guides
 */
const PatientEducationSidebar = () => {
  const commonQuestions = [
    {
      question: 'Posso usar colírio diariamente?',
      answer: 'Depende do tipo. Colírios lubrificantes sem conservantes podem ser usados várias vezes ao dia, mas medicamentos devem seguir prescrição médica.',
      link: '/blog',
    },
    {
      question: 'Quando devo procurar um oftalmologista?',
      answer: 'Consultas preventivas anuais são recomendadas. Procure imediatamente se tiver visão embaçada súbita, dor ocular intensa ou perda de visão.',
      link: '/blog',
    },
    {
      question: 'Ler no escuro faz mal?',
      answer: 'Não causa danos permanentes, mas pode causar fadiga ocular temporária. Boa iluminação torna a leitura mais confortável.',
      link: '/blog',
    },
    {
      question: 'Como proteger os olhos no computador?',
      answer: 'Regra 20-20-20: a cada 20 minutos, olhe para algo a 20 pés (6 metros) de distância por 20 segundos. Ajuste brilho e contraste da tela.',
      link: '/blog',
    },
  ];

  const quickGuides = [
    {
      icon: FileText,
      title: 'Guia da Primeira Consulta',
      description: 'O que esperar na sua primeira visita ao oftalmologista',
      color: 'bg-blue-50 text-blue-600',
      hoverColor: 'hover:bg-blue-100',
    },
    {
      icon: AlertCircle,
      title: 'Sinais de Alerta',
      description: 'Sintomas que requerem atenção médica imediata',
      color: 'bg-red-50 text-red-600',
      hoverColor: 'hover:bg-red-100',
    },
    {
      icon: BookOpen,
      title: 'Cuidados Pós-Consulta',
      description: 'Orientações para medicação e recuperação',
      color: 'bg-blue-50 text-blue-600',
      hoverColor: 'hover:bg-blue-100',
    },
  ];

  const preventionTips = [
    'Use óculos de sol com proteção UV',
    'Mantenha uma dieta rica em vitaminas A, C e E',
    'Pisque regularmente ao usar telas',
    'Não compartilhe toalhas ou maquiagem',
    'Lave as mãos antes de tocar os olhos',
    'Faça pausas durante leitura prolongada',
  ];

  return (
    <div className="space-y-6">
      {/* FAQ Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <HelpCircle className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Dúvidas Frequentes</h3>
        </div>

        <div className="space-y-4">
          {commonQuestions.map((item, index) => (
            <div key={index} className="pb-4 border-b border-gray-200 last:border-0 last:pb-0">
              <p className="text-sm font-semibold text-gray-900 mb-2">{item.question}</p>
              <p className="text-xs text-gray-600 leading-relaxed">{item.answer}</p>
            </div>
          ))}
        </div>

        <Link to="/blog" className="block mt-4">
          <Button variant="outline" className="w-full text-sm">
            Ver Todas as Dúvidas
          </Button>
        </Link>
      </motion.div>

      {/* Quick Guides */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6"
      >
        <h3 className="text-lg font-bold text-gray-900 mb-4">Guias Rápidos</h3>

        <div className="space-y-3">
          {quickGuides.map((guide, index) => {
            const Icon = guide.icon;
            return (
              <button
                key={index}
                className={`w-full text-left p-4 rounded-xl transition-all ${guide.color} ${guide.hoverColor} border border-transparent hover:border-current/20`}
              >
                <div className="flex items-start gap-3">
                  <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm mb-1">{guide.title}</p>
                    <p className="text-xs opacity-80">{guide.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Prevention Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-lg border border-blue-200/50 p-6"
      >
        <h3 className="text-lg font-bold text-gray-900 mb-4">Dicas de Prevenção</h3>

        <ul className="space-y-2.5">
          {preventionTips.map((tip, index) => (
            <li key={index} className="flex items-start gap-3 text-sm text-gray-700">
              <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg
                  className="w-3 h-3 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </motion.div>

      {/* Download Resources */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6"
      >
        <div className="text-center">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Download className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Material Educativo</h3>
          <p className="text-sm text-gray-600 mb-4">
            Baixe nossos guias e checklists para impressão
          </p>
          <Button variant="outline" className="w-full text-sm">
            Ver Materiais Disponíveis
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default PatientEducationSidebar;