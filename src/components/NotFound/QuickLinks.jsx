import React from 'react';
import { motion } from 'framer-motion';
import {
  Stethoscope,
  Eye,
  FileText,
  Headphones,
  User,
  HelpCircle,
  Calendar,
  ArrowRight
} from 'lucide-react';

const QuickLinks = () => {
  const quickLinks = [
    {
      icon: Stethoscope,
      title: 'Serviços',
      description: 'Conheça nossos tratamentos',
      href: '/servicos',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: Eye,
      title: 'Lentes',
      description: 'Encontre seu par ideal',
      href: '/lentes',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: FileText,
      title: 'Blog',
      description: 'Dicas e novidades',
      href: '/blog',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: Headphones,
      title: 'Podcast',
      description: 'Saúde oftalmológica',
      href: '/podcast',
      color: 'from-orange-500 to-orange-600'
    },
    {
      icon: User,
      title: 'Sobre Nós',
      description: 'Conheça a clínica',
      href: '/sobre',
      color: 'from-pink-500 to-pink-600'
    },
    {
      icon: HelpCircle,
      title: 'FAQ',
      description: 'Dúvidas frequentes',
      href: '/faq',
      color: 'from-indigo-500 to-indigo-600'
    },
    {
      icon: Calendar,
      title: 'Agendamento',
      description: 'Marque sua consulta',
      href: '/agendamento',
      color: 'from-teal-500 to-teal-600'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
    >
      <h2 className="text-2xl font-semibold text-center text-gray-900 mb-6">
        O que você está procurando?
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {quickLinks.map((link, index) => {
          const Icon = link.icon;
          return (
            <motion.a
              key={link.href}
              href={link.href}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + index * 0.1, duration: 0.5 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="group relative bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-300"
            >
              {/* Gradient Background Effect */}
              <div className={`absolute inset-0 bg-gradient-to-br ${link.color} opacity-0 group-hover:opacity-5 rounded-xl transition-opacity duration-300`}></div>

              <div className="relative z-10">
                <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${link.color} text-white mb-4`}>
                  <Icon className="w-6 h-6" />
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {link.title}
                </h3>

                <p className="text-sm text-gray-600 mb-4">
                  {link.description}
                </p>

                <div className="flex items-center text-sm font-medium text-blue-600 group-hover:text-blue-700">
                  <span>Acessar</span>
                  <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </motion.a>
          );
        })}
      </div>
    </motion.div>
  );
};

export default QuickLinks;