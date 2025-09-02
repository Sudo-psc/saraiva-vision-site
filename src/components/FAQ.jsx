import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronUp, HelpCircle, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SchemaMarkup from '@/components/SchemaMarkup';

const FAQ = () => {
  const { t } = useTranslation();
  const [openFAQ, setOpenFAQ] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // High-volume FAQ questions optimized for rich snippets
  const faqs = [
    {
      id: 1,
      question: "Vocês atendem convênio ou particular?",
      answer: "Atendemos os convênios Amor e Saúde e Sindicato, além de atendimento particular. Caso não possua um desses convênios, o atendimento é realizado de forma particular com valores acessíveis. Fale com nossa equipe para confirmar a cobertura do seu atendimento.",
      category: 'convenio'
    },
    {
      id: 2,
      question: "Que tipos de exames oftalmológicos vocês realizam?",
      answer: "Realizamos uma ampla gama de exames oftalmológicos, incluindo: exame de refração, exame de fundo de olho, tonometria (pressão ocular), biomicroscopia, campimetria visual, retinografia, ecobiometria, paquimetria e outros exames especializados conforme a necessidade de cada paciente.",
      category: 'exames'
    },
    {
      id: 3,
      question: "Atendem crianças e fazem exames pediátricos?",
      answer: "Sim, temos especialização em oftalmologia pediátrica. Realizamos exames oftalmológicos em bebês, crianças e adolescentes utilizando técnicas específicas para cada idade. Nosso consultório é preparado para receber os pequenos pacientes de forma acolhedora, e nossa equipe tem experiência em detectar e tratar problemas visuais infantis precocemente.",
      category: 'pediatrico'
    },
    {
      id: 4,
      question: "Fazem cirurgias oftalmológicas?",
      answer: "Sim, realizamos diversos tipos de cirurgias oftalmológicas, incluindo cirurgia de catarata, cirurgia de pterígio, cirurgias de pálpebras, e outros procedimentos. Utilizamos equipamentos modernos e técnicas minimamente invasivas para garantir os melhores resultados e uma recuperação mais rápida para nossos pacientes.",
      category: 'cirurgias'
    },
    {
      id: 5,
      question: "Como funciona o agendamento online?",
      answer: "Nosso sistema de agendamento online está disponível 24 horas por dia. Você pode escolher o tipo de consulta, selecionar data e horário disponíveis, e receber confirmação instantânea. Também enviamos lembretes por WhatsApp. É a forma mais rápida e conveniente de agendar sua consulta conosco.",
      category: 'agendamento'
    },
    {
      id: 6,
      question: "Qual o tempo de espera para conseguir uma consulta?",
      answer: "Trabalhamos para oferecer consultas com agilidade. Para casos de rotina, normalmente temos disponibilidade na mesma semana. Para urgências, priorizamos o atendimento no mesmo dia ou no próximo dia útil. Recomendamos usar nosso agendamento online para visualizar as opções disponíveis em tempo real.",
      category: 'agendamento'
    },
    {
      id: 7,
      question: "Vocês fazem teste de lentes de contato?",
      answer: "Sim, oferecemos adaptação completa de lentes de contato. Realizamos teste de tolerância, ensino sobre o uso correto, higienização e cuidados necessários. Trabalhamos com lentes das principais marcas do mercado, incluindo lentes para correção de miopia, hipermetropia, astigmatismo e presbiopia.",
      category: 'lentes'
    },
    {
      id: 8,
      question: "Onde fica localizada a clínica?",
      answer: "Nossa clínica fica localizada na Rua Coronel Celestino, 07, no centro de Caratinga-MG. Estamos em uma localização de fácil acesso, próximo ao comércio central da cidade, com estacionamento disponível nas proximidades.",
      category: 'localizacao'
    }
  ];

  const filteredFAQs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleFAQ = (id) => {
    setOpenFAQ(openFAQ === id ? null : id);
  };

  return (
    <>
      <SchemaMarkup faqItems={faqs} />
      <section id="faq" className="py-24 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-4">
            <HelpCircle size={16} className="mr-2" />
            {t('faq.badge')}
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            {t('faq.title')}
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            {t('faq.subtitle')}
          </p>
        </motion.div>

        {/* Barra de Pesquisa */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto mb-12"
        >
          <div className="relative">
            <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-600" />
            <input
              type="text"
              placeholder={t('faq.search.placeholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
            />
          </div>
        </motion.div>

        {/* Lista de FAQs */}
        <div className="max-w-4xl mx-auto">
          {filteredFAQs.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <p className="text-slate-600 text-lg">
                {t('faq.search.noResults')}
              </p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {filteredFAQs.map((faq, index) => (
                <motion.div
                  key={faq.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-xl shadow-soft-light border border-slate-100 overflow-hidden"
                >
                  <button
                    onClick={() => toggleFAQ(faq.id)}
                    className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-slate-50 transition-colors"
                    aria-expanded={openFAQ === faq.id}
                  >
                    <h3 className="text-lg font-semibold text-slate-900 pr-4">
                      {faq.question}
                    </h3>
                    <motion.div
                      animate={{ rotate: openFAQ === faq.id ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ChevronDown size={24} className="text-slate-600 flex-shrink-0" />
                    </motion.div>
                  </button>
                  
                  <AnimatePresence>
                    {openFAQ === faq.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="px-8 pb-6 text-slate-600 leading-relaxed">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* CTA para mais informações */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <p className="text-slate-600 mb-6">
            {t('faq.cta.text')}
          </p>
          <Button
            onClick={() => {
              const whatsappLink = `https://wa.me/5533998601427?text=${encodeURIComponent("Olá! Tenho uma dúvida que não encontrei no FAQ.")}`;
              window.open(whatsappLink, '_blank', 'noopener,noreferrer');
            }}
            size="lg"
            className="gap-2"
          >
            <HelpCircle size={20} />
            {t('faq.cta.button')}
          </Button>
        </motion.div>
      </div>
    </section>
    </>
  );
};

export default FAQ;
