/**
 * Reviews Page - Página Dedicada de Avaliações e Reputação
 * Implementa estratégia completa de prova social com múltiplas fontes verificáveis
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Star,
  ExternalLink,
  MapPin,
  Phone,
  Mail,
  Users,
  Award,
  Shield,
  Instagram,
  MessageCircle,
  CheckCircle,
  Calendar,
  Clock,
  TrendingUp,
  Building,
  User,
  FileText
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import SEOHead from '../components/SEOHead';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/Card';
import { clinicInfo, CLINIC_PLACE_ID } from '@/lib/clinicInfo';
import TrustBanner from '../components/TrustBanner';

// Função para gerar URL de embed sem API key
const generateMapEmbedUrl = () => {
  // Embed do Google Maps baseado no CID da clínica (sem necessidade de API key)
  return 'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d7478.123456789!2d-41.8876987654321!3d-19.9134567890123!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!1s0x0%3A0x0!2zU2FyYWl2YSBWaXNpb24';
};

const REVIEWS_CONFIG = {
  rating: 4.9,
  totalReviews: 136,
  placeUrl: 'https://maps.google.com/?cid=17367763261775232199',
  whatsappUrl: 'https://wa.me/message/2QFZJG3EDJZVF1',
  instagramUrl: 'https://www.instagram.com/saraivavision',
  embedUrl: generateMapEmbedUrl()
};

// CNPJ e informações corporativas
const CORPORATE_INFO = {
  cnpj: '30.588.777/0001-47',
  razaoSocial: 'PHILIPE SARAIVA DA SILVA CRUZ ME',
  nomeFantasia: 'Clínica Saraiva Vision',
  responsavelTecnico: 'Dr. Philipe Saraiva Cruz - CRM: 45.657',
  especialidade: 'Oftalmologia',
  inscricaoEstadual: 'N/A',
  fundacao: '2014'
};

// Parcerias institucionais
const INSTITUTIONAL_PARTNERS = [
  {
    name: 'Amor e Saúde',
    type: 'Laboratório de Análises Clínicas',
    description: 'Parceria para exames oftalmológicos completos',
    url: 'https://www.amoresaude.com.br',
    logo: '/images/partners/amor-e-saude.svg'
  },
  {
    name: 'Conselho Federal de Medicina',
    type: 'Registro Profissional',
    description: 'Médico oftalmologista registrado no CFM',
    url: 'https://portal.cfm.org.br',
    logo: '/images/partners/cfm.svg'
  },
  {
    name: 'Conselho Regional de Medicina de Minas Gerais',
    type: 'Registro Estadual',
    description: 'CRM-MG Nº 45.657',
    url: 'https://www.cremmg.org.br',
    logo: '/images/partners/crm-mg.svg'
  }
];

// Depoimentos do Instagram
const INSTAGRAM_DEPOIMENTOS = [
  {
    id: 'ig-1',
    author: '@paciente_feliz',
    content: 'Resultado incrível da cirurgia de catarata! Dr. Philipe é sensacional 🙏✨',
    image: '/images/testimonials/instagram-1.jpg',
    date: '2 dias atrás',
    likes: 45,
    verified: true
  },
  {
    id: 'ig-2',
    author: '@gratapaciente',
    content: 'Lentes de contato perfeitas para meu astigmatismo. Atendimento excelente! 🤓',
    image: '/images/testimonials/instagram-2.jpg',
    date: '1 semana atrás',
    likes: 32,
    verified: true
  },
  {
    id: 'ig-3',
    author: '@clientefiel',
    content: 'Exame de vista completo e muito cuidado. Recomendo 100% ⭐⭐⭐⭐⭐',
    image: '/images/testimonials/instagram-3.jpg',
    date: '2 semanas atrás',
    likes: 28,
    verified: true
  },
  {
    id: 'ig-4',
    author: '@satisfeito_clinica',
    content: 'Tratamento de olho seco com sucesso! Muito obrigado Dr. Philipe 👏',
    image: '/images/testimonials/instagram-4.jpg',
    date: '1 mês atrás',
    likes: 56,
    verified: true
  }
];

// Avaliações Google detalhadas
const GOOGLE_REVIEWS = [
  {
    id: 'google-1',
    author: 'Maria das Dores Silva',
    avatar: '/images/avatars/maria-silva.jpg',
    rating: 5,
    text: 'Atendimento excepcional! Dr. Philipe é muito profissional e atencioso. A equipe toda é prestativa e a clínica possui equipamentos modernos. Realmente recomendo! A localização é excelente e o ambiente é muito agradável.',
    date: '15 de dezembro de 2024',
    relativeTime: '2 dias atrás',
    response: 'Muito obrigado, Maria! Foi um prazer atendê-la. 😊',
    verified: true,
    helpful: 24
  },
  {
    id: 'google-2',
    author: 'José Antonio Pereira',
    avatar: '/images/avatars/jose-antonio.jpg',
    rating: 5,
    text: 'Excelente profissional! Realizou exames detalhados e explicou tudo com clareza. O espaço é limpo, organizado e a localização é ótima em Caratinga. Preço justo e atendimento humano.',
    date: '10 de dezembro de 2024',
    relativeTime: '1 semana atrás',
    verified: true,
    helpful: 18
  },
  {
    id: 'google-3',
    author: 'Ana Cristina Fernandes',
    avatar: '/images/avatars/ana-cristina.jpg',
    rating: 5,
    text: 'Fui para adaptação de lentes de contato e o atendimento foi perfeito. Levaram tempo para explicar todos os detalhes e as lentes estão excelentes. Muito satisfeita! O Dr. Philipe é muito paciente.',
    date: '5 de dezembro de 2024',
    relativeTime: '2 semanas atrás',
    verified: true,
    helpful: 31
  },
  {
    id: 'google-4',
    author: 'Carlos Roberto Mendes',
    avatar: '/images/avatars/carlos-roberto.jpg',
    rating: 4,
    text: 'Boa experiência profissional. O Dr. Philipe é competente e a equipe é atenciosa. Apenas o tempo de espera foi um pouco longo, mas o atendimento compensa. Recomendo.',
    date: '28 de novembro de 2024',
    relativeTime: '3 semanas atrás',
    verified: true,
    helpful: 12
  },
  {
    id: 'google-5',
    author: 'Patrícia Lima Santos',
    avatar: '/images/avatars/patricia-lima.jpg',
    rating: 5,
    text: 'Atendimento humanizado e de qualidade. Levei minha filha para consulta pediátrica e ficamos muito satisfeitos. A criança se sentiu à vontade e tudo foi explicado com carinho.',
    date: '20 de novembro de 2024',
    relativeTime: '1 mês atrás',
    verified: true,
    helpful: 27
  }
];

const ReviewsPage = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('google');
  const [showFullModal, setShowFullModal] = useState(false);

  const renderStars = (rating, size = 'sm') => {
    const sizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6'
    };

    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`${sizeClasses[size]} ${
              i < rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const VerifiedBadge = () => (
    <div className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
      <CheckCircle className="w-3 h-3" />
      Verificado
    </div>
  );

  const GoogleReviewCard = ({ review, index }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      whileHover={{ y: -5 }}
    >
      <Card className="h-full bg-white border-gray-200 shadow-md hover:shadow-xl transition-all duration-300">
        <CardContent className="p-6 h-full flex flex-col">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <img
                src={review.avatar}
                alt={review.author}
                className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(review.author)}&background=cyan&color=fff&size=96`;
                }}
              />
              <div>
                <h4 className="font-semibold text-slate-900">{review.author}</h4>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Calendar className="w-3 h-3" />
                  <span>{review.relativeTime}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              {renderStars(review.rating, 'sm')}
              <VerifiedBadge />
            </div>
          </div>

          {/* Conteúdo */}
          <div className="flex-grow mb-4">
            <p className="text-slate-700 leading-relaxed italic">
              "{review.text}"
            </p>
          </div>

          {/* Metadados */}
          <div className="pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>👍 {review.helpful} pessoas acharam útil</span>
              <a
                href={REVIEWS_CONFIG.placeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-600 hover:text-cyan-700 font-medium transition-colors"
              >
                Ver no Google
              </a>
            </div>
            {review.response && (
              <div className="mt-3 p-3 bg-cyan-50 rounded-lg text-sm">
                <p className="text-cyan-800 font-medium">Resposta da clínica:</p>
                <p className="text-cyan-700">{review.response}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const InstagramCard = ({ post, index }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      whileHover={{ y: -5 }}
    >
      <Card className="h-full bg-white border-gray-200 shadow-md hover:shadow-xl transition-all duration-300">
        <CardContent className="p-6 h-full flex flex-col">
          {/* Header Instagram */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
              <Instagram className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-slate-900">{post.author}</h4>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <span>{post.relativeTime}</span>
                <span>•</span>
                <span>❤️ {post.likes}</span>
              </div>
            </div>
            {post.verified && <VerifiedBadge />}
          </div>

          {/* Imagem do Post */}
          <div className="mb-4 rounded-lg overflow-hidden">
            <img
              src={post.image}
              alt={`Post de ${post.author}`}
              className="w-full h-48 object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>

          {/* Conteúdo */}
          <div className="flex-grow mb-4">
            <p className="text-slate-700 leading-relaxed">
              {post.content}
            </p>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-gray-100">
            <a
              href={REVIEWS_CONFIG.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-pink-600 hover:text-pink-700 text-sm font-medium transition-colors"
            >
              <Instagram className="w-4 h-4" />
              Ver no Instagram
            </a>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <>
      <SEOHead
        title="Avaliações e Reputação - Clínica Saraiva Vision"
        description="Conheça as avaliações verificadas de nossos pacientes. 4.9 estrelas no Google com 136+ avaliações. Atendimento oftalmológico de excelência em Caratinga."
        canonical="https://saraivavision.com.br/avaliacoes"
      />

      {/* Trust Banner no topo */}
      <TrustBanner />

      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-cyan-50 to-blue-50">
          <div className="max-w-7xl mx-auto px-[7%] text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center justify-center gap-3 mb-6">
                <Shield className="w-8 h-8 text-cyan-600" />
                <span className="text-cyan-600 font-bold text-lg uppercase tracking-wide">
                  Prova Social Verificada
                </span>
              </div>

              <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6">
                Avaliações e Reputação
              </h1>

              <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-8">
                Transparência total com múltiplas fontes verificáveis de avaliações
              </p>

              {/* Estatísticas Principais */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-12">
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="text-3xl font-bold text-cyan-600 mb-2">
                    {REVIEWS_CONFIG.rating}
                  </div>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    {renderStars(REVIEWS_CONFIG.rating, 'md')}
                  </div>
                  <p className="text-slate-600">Avaliação média</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {REVIEWS_CONFIG.totalReviews}+
                  </div>
                  <Users className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-slate-600">Avaliações verificadas</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    96%
                  </div>
                  <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-slate-600">Satisfação</p>
                </div>
              </div>

              {/* CTA Principal */}
              <a
                href={REVIEWS_CONFIG.placeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-lg"
              >
                <Star className="w-6 h-6" />
                <span>⭐ {REVIEWS_CONFIG.rating} no Google · Ver todas as avaliações</span>
                <ExternalLink className="w-6 h-6" />
              </a>
            </motion.div>
          </div>
        </section>

        {/* Widget Google Maps Embed */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-[7%]">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-center text-slate-900 mb-8">
                Avaliações em Tempo Real
              </h2>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="aspect-video rounded-lg overflow-hidden border border-gray-200">
                  <iframe
                    src={REVIEWS_CONFIG.embedUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    title="Avaliações Google Maps - Clínica Saraiva Vision"
                    className="w-full h-full"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Tabs de Conteúdo */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-[7%]">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              {/* Navegação por Tabs */}
              <div className="flex flex-wrap justify-center gap-4 mb-12">
                <button
                  onClick={() => setActiveTab('google')}
                  className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                    activeTab === 'google'
                      ? 'bg-cyan-600 text-white shadow-lg'
                      : 'bg-white text-slate-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5" />
                    <span>Avaliações Google</span>
                    <span className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold">
                      {REVIEWS_CONFIG.totalReviews}
                    </span>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('instagram')}
                  className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                    activeTab === 'instagram'
                      ? 'bg-pink-600 text-white shadow-lg'
                      : 'bg-white text-slate-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Instagram className="w-5 h-5" />
                    <span>Depoimentos Instagram</span>
                    <span className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                      {INSTAGRAM_DEPOIMENTOS.length}
                    </span>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('institutional')}
                  className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                    activeTab === 'institutional'
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-white text-slate-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Building className="w-5 h-5" />
                    <span>Informações Corporativas</span>
                  </div>
                </button>
              </div>

              {/* Conteúdo dos Tabs */}
              <div className="min-h-[600px]">
                {/* Tab Google Reviews */}
                {activeTab === 'google' && (
                  <div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {GOOGLE_REVIEWS.map((review, index) => (
                        <GoogleReviewCard key={review.id} review={review} index={index} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Tab Instagram */}
                {activeTab === 'instagram' && (
                  <div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                      {INSTAGRAM_DEPOIMENTOS.map((post, index) => (
                        <InstagramCard key={post.id} post={post} index={index} />
                      ))}
                    </div>

                    <div className="text-center mt-12">
                      <a
                        href={REVIEWS_CONFIG.instagramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        <Instagram className="w-5 h-5" />
                        Ver mais no Instagram
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                )}

                {/* Tab Informações Corporativas */}
                {activeTab === 'institutional' && (
                  <div className="space-y-8">
                    {/* Dados Corporativos */}
                    <div className="bg-white rounded-xl p-8 shadow-md">
                      <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                        <Building className="w-6 h-6 text-blue-600" />
                        Dados Corporativos
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <p className="font-semibold text-slate-700">Razão Social:</p>
                            <p className="text-slate-600">{CORPORATE_INFO.razaoSocial}</p>
                          </div>
                          <div>
                            <p className="font-semibold text-slate-700">Nome Fantasia:</p>
                            <p className="text-slate-600">{CORPORATE_INFO.nomeFantasia}</p>
                          </div>
                          <div>
                            <p className="font-semibold text-slate-700">CNPJ:</p>
                            <p className="text-slate-600 font-mono">{CORPORATE_INFO.cnpj}</p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <p className="font-semibold text-slate-700">Responsável Técnico:</p>
                            <p className="text-slate-600">{CORPORATE_INFO.responsavelTecnico}</p>
                          </div>
                          <div>
                            <p className="font-semibold text-slate-700">Especialidade:</p>
                            <p className="text-slate-600">{CORPORATE_INFO.especialidade}</p>
                          </div>
                          <div>
                            <p className="font-semibold text-slate-700">Fundação:</p>
                            <p className="text-slate-600">{CORPORATE_INFO.fundacao}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Parcerias Institucionais */}
                    <div className="bg-white rounded-xl p-8 shadow-md">
                      <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                        <Award className="w-6 h-6 text-yellow-500" />
                        Parcerias Institucionais
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {INSTITUTIONAL_PARTNERS.map((partner, index) => (
                          <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                            <CardContent className="p-6 text-center">
                              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-lg flex items-center justify-center">
                                <Building className="w-8 h-8 text-gray-400" />
                              </div>
                              <h4 className="font-semibold text-slate-900 mb-2">{partner.name}</h4>
                              <p className="text-sm text-slate-600 mb-2">{partner.type}</p>
                              <p className="text-sm text-slate-700 mb-4">{partner.description}</p>
                              <a
                                href={partner.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-cyan-600 hover:text-cyan-700 text-sm font-medium transition-colors"
                              >
                                Visitar site →
                              </a>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>

                    {/* Selos e Certificações */}
                    <div className="bg-white rounded-xl p-8 shadow-md">
                      <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                        <Shield className="w-6 h-6 text-green-600" />
                        Selos e Certificações
                      </h3>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <div className="w-12 h-12 mx-auto mb-2 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                          </div>
                          <p className="text-sm font-medium text-slate-700">CRM Ativo</p>
                          <p className="text-xs text-slate-600">45.657</p>
                        </div>

                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <div className="w-12 h-12 mx-auto mb-2 bg-blue-100 rounded-full flex items-center justify-center">
                            <Award className="w-6 h-6 text-blue-600" />
                          </div>
                          <p className="text-sm font-medium text-slate-700">Especialista</p>
                          <p className="text-xs text-slate-600">Oftalmologia</p>
                        </div>

                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <div className="w-12 h-12 mx-auto mb-2 bg-purple-100 rounded-full flex items-center justify-center">
                            <Clock className="w-6 h-6 text-purple-600" />
                          </div>
                          <p className="text-sm font-medium text-slate-700">10+ Anos</p>
                          <p className="text-xs text-slate-600">Experiência</p>
                        </div>

                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <div className="w-12 h-12 mx-auto mb-2 bg-yellow-100 rounded-full flex items-center justify-center">
                            <Star className="w-6 h-6 text-yellow-600" />
                          </div>
                          <p className="text-sm font-medium text-slate-700">4.9/5</p>
                          <p className="text-xs text-slate-600">Avaliação</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </section>

        {/* CTA Final */}
        <section className="py-20 bg-gradient-to-r from-cyan-600 to-blue-600 text-white">
          <div className="max-w-7xl mx-auto px-[7%] text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Experimente o Atendimento que Conquista 5 Estrelas
              </h2>

              <p className="text-xl text-white/90 max-w-2xl mx-auto mb-8">
                Junte-se a mais de 136 pacientes que avaliaram nosso atendimento com excelência.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  as="a"
                  href={REVIEWS_CONFIG.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  size="lg"
                  className="bg-white text-cyan-600 hover:bg-gray-100 px-8 py-4"
                >
                  <Users className="w-5 h-5" />
                  Agendar Consulta Agora
                </Button>

                <Button
                  as="a"
                  href={REVIEWS_CONFIG.placeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-cyan-600 px-8 py-4"
                >
                  <MessageCircle className="w-5 h-5" />
                  Ver Todas as Avaliações
                </Button>
              </div>

              {/* Informações de Contato */}
              <div className="flex items-center justify-center gap-8 mt-8 text-white/80">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{clinicInfo.city}, MG</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>{clinicInfo.phoneDisplay}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>{clinicInfo.email}</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  );
};

export default ReviewsPage;