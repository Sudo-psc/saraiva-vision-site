'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Users,
  Zap,
  Heart,
  ArrowRight,
  ChevronRight,
  Clock,
  Award,
  Shield,
  Smartphone,
  Accessibility
} from 'lucide-react';

interface ProfileOption {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  features: string[];
  link: string;
}

const ProfileSelector: React.FC = () => {
  const profiles: ProfileOption[] = [
    {
      id: 'familiar',
      name: 'Família',
      description: 'Cuidado oftalmológico completo para todas as idades',
      icon: <Users className="w-8 h-8" />,
      color: 'from-blue-500 to-cyan-600',
      features: [
        'Atendimento pediátrico',
        'Exames preventivos',
        'Cuidado com idosos',
        'Acompanhamento familiar'
      ],
      link: '/familiar'
    },
    {
      id: 'jovem',
      name: 'Jovem',
      description: 'Tecnologia de ponta e estilo para sua visão',
      icon: <Zap className="w-8 h-8" />,
      color: 'from-purple-500 to-pink-600',
      features: [
        'Lentes de contato premium',
        'Cirurgia refrativa',
        'Tecnologia avançada',
        'Assinatura de lentes'
      ],
      link: '/jovem'
    },
    {
      id: 'senior',
      name: 'Sênior',
      description: 'Atendimento especializado com acessibilidade',
      icon: <Heart className="w-8 h-8" />,
      color: 'from-green-500 to-teal-600',
      features: [
        'Cirurgia de catarata',
        'Tratamento de glaucoma',
        'Acessibilidade total',
        'Cuidados geriátricos'
      ],
      link: '/senior'
    }
  ];

  return (
    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
      {profiles.map((profile, index) => (
        <motion.div
          key={profile.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="group"
        >
          <Link href={profile.link}>
            <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden h-full flex flex-col">
              {/* Header */}
              <div className={`bg-gradient-to-r ${profile.color} p-6 text-white relative overflow-hidden`}>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                      {profile.icon}
                    </div>
                    <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">{profile.name}</h2>
                  <p className="text-white/90 text-sm">{profile.description}</p>
                </div>
                {/* Decorative background */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
              </div>

              {/* Features */}
              <div className="flex-1 p-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-800 mb-3">Serviços Especializados:</h3>
                  {profile.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center text-sm text-gray-600">
                      <ChevronRight className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 bg-gray-50 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>24h</span>
                    </div>
                    <div className="flex items-center">
                      <Award className="w-4 h-4 mr-1" />
                      <span>Especialista</span>
                    </div>
                    <div className="flex items-center">
                      <Shield className="w-4 h-4 mr-1" />
                      <span>CFM</span>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-blue-600 group-hover:text-blue-700 transition-colors">
                    Acessar
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </motion.div>
      ))}

      {/* Emergency Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="md:col-span-3 bg-red-50 border border-red-200 rounded-xl p-6 mt-8"
      >
        <div className="flex items-center space-x-3">
          <div className="bg-red-100 p-2 rounded-lg">
            <Smartphone className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h3 className="font-semibold text-red-800">Emergência Oftalmológica</h3>
            <p className="text-sm text-red-600">
              Para casos urgentes, ligue: (33) 9 9999-9999 | Atendimento 24h
            </p>
          </div>
        </div>
      </motion.div>

      {/* Accessibility Notice */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="md:col-span-3 bg-blue-50 border border-blue-200 rounded-xl p-6 mt-4"
      >
        <div className="flex items-center space-x-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            <Accessibility className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-blue-800">Acessibilidade</h3>
            <p className="text-sm text-blue-600">
              Perfil Sênior disponível com interface adaptada para melhor experiência
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProfileSelector;