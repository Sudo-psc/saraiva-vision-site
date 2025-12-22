import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import EnhancedFooter from '@/components/EnhancedFooter';
import SEOHead from '@/components/SEOHead';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft, Clock, CheckCircle, Star, Calendar, Eye,
  AlertCircle, ExternalLink, Phone, MessageSquare, BookOpen,
  Shield, FileText, AlertTriangle, Sparkles, Timer
} from 'lucide-react';
import { motion } from 'framer-motion';
import { clinicInfo } from '@/lib/clinicInfo';
import ImageWithFallback from '@/components/ui/ImageWithFallback';

/**
 * Página dedicada para Blefaroplastia com Jato de Plasma
 *
 * CFM/LGPD Compliant - Segue Guia de Boas Práticas na Divulgação Médica
 * Author: Dr. Philipe Saraiva Cruz
 */
const BlefaroplastiaJatoPlasmaPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // SEO otimizado para blefaroplastia com jato de plasma
  const seo = {
    title: 'Blefaroplastia com Jato de Plasma - Procedimento Minimamente Invasivo | Saraiva Vision',
    description: 'Blefaroplastia não cirúrgica com jato de plasma para rejuvenescimento palpebral. Procedimento minimamente invasivo com respaldo científico em Caratinga-MG. Alternativa segura para casos leves a moderados de dermatochalase.',
    keywords: 'blefaroplastia jato plasma, blefaroplastia não cirúrgica, plasma pen palpebral, rejuvenescimento palpebral, blefaroplastia sem cortes, plasma exeresis, oftalmologista Caratinga, dermatochalase tratamento',
  };

  // Schema.org MedicalProcedure para SEO estruturado
  const medicalProcedureSchema = {
    "@context": "https://schema.org",
    "@type": "MedicalProcedure",
    "name": "Blefaroplastia com Jato de Plasma",
    "alternateName": ["Plasma Pen Blepharoplasty", "Non-surgical Blepharoplasty", "Plasma Exeresis"],
    "description": "Procedimento estético minimamente invasivo que utiliza tecnologia de plasma para tratar flacidez, rugas e excesso de pele nas pálpebras, sem cortes ou suturas.",
    "bodyLocation": "Pálpebras superiores e inferiores",
    "procedureType": "https://schema.org/NoninvasiveProcedure",
    "howPerformed": "Aplicação de micropontos de plasma na pele palpebral com anestesia tópica, causando sublimação tecidual controlada e estimulando a produção de colágeno.",
    "preparation": "Evitar maquiagem, cremes e ácidos na região 48h antes do procedimento.",
    "followup": "Crostas superficiais desprendem-se em 5-7 dias. Resultado final em 4-6 semanas.",
    "status": "https://schema.org/EventScheduled",
    "performedBy": {
      "@type": "Physician",
      "name": clinicInfo.responsiblePhysician,
      "medicalSpecialty": "Oftalmologia",
      "identifier": {
        "@type": "PropertyValue",
        "name": "CRM",
        "value": "69870"
      }
    },
    "location": {
      "@type": "MedicalClinic",
      "name": clinicInfo.name,
      "address": {
        "@type": "PostalAddress",
        "streetAddress": clinicInfo.streetAddress,
        "addressLocality": clinicInfo.city,
        "addressRegion": clinicInfo.state,
        "postalCode": clinicInfo.postalCode,
        "addressCountry": "BR"
      }
    },
    "study": [
      {
        "@type": "MedicalStudy",
        "name": "Non-surgical blepharoplasty with the novel plasma radiofrequency ablation technology",
        "studyLocation": "Skin Research and Technology",
        "healthCondition": "Dermatochalasis",
        "url": "https://pubmed.ncbi.nlm.nih.gov/31535742/"
      },
      {
        "@type": "MedicalStudy",
        "name": "Upper eyelid blepharoplasty using plasma exeresis",
        "studyLocation": "Journal of Cosmetic Dermatology",
        "healthCondition": "Upper eyelid dermatochalasis",
        "url": "https://pubmed.ncbi.nlm.nih.gov/33252188/"
      }
    ]
  };

  // Adiciona Schema.org ao head
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-medical-procedure-schema', 'true');
    script.textContent = JSON.stringify(medicalProcedureSchema);
    document.head.appendChild(script);

    return () => {
      const existingScript = document.querySelector('script[data-medical-procedure-schema]');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  // Rastreamento de analytics para links externos
  const trackExternalLink = (linkType, url) => {
    // Google Analytics 4 event
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'click', {
        event_category: 'external_link',
        event_label: linkType,
        link_url: url,
        page_location: window.location.href
      });
    }
    // PostHog event
    if (typeof window !== 'undefined' && window.posthog) {
      window.posthog.capture('external_link_click', {
        link_type: linkType,
        url: url
      });
    }
  };

  const benefits = [
    'Procedimento minimamente invasivo, sem cortes ou suturas',
    'Recuperação mais rápida comparada à blefaroplastia cirúrgica',
    'Resultados naturais e progressivos',
    'Realizado com anestesia tópica (sem anestesia geral)',
    'Alternativa para casos leves a moderados de dermatochalase',
    'Estimula produção de colágeno na região periorbital'
  ];

  const limitations = [
    'Não substitui a blefaroplastia cirúrgica em todos os casos',
    'Mais adequado para graus leves a moderados de flacidez',
    'Pode ser necessária mais de uma sessão em alguns casos',
    'Resultados variam conforme idade, tipo de pele e adesão ao pós',
    'Não indicado para excesso de pele muito acentuado ou bolsas de gordura proeminentes'
  ];

  const risks = [
    { name: 'Edema transitório', description: 'Inchaço leve a moderado nos primeiros dias, resolvendo naturalmente' },
    { name: 'Crostas superficiais', description: 'Micropontos formam crostas que desprendem em 5-7 dias' },
    { name: 'Hiperpigmentação pós-inflamatória', description: 'Mais comum em fototipos mais altos (IV-VI); fotoproteção rigorosa é essencial' },
    { name: 'Eritema temporário', description: 'Vermelhidão que diminui gradualmente nas primeiras semanas' },
    { name: 'Complicações graves', description: 'Raras quando realizado por médico treinado com seleção adequada de pacientes' }
  ];

  const included = [
    'Avaliação oftalmológica pré-procedimento',
    'Análise de indicação e expectativas realistas',
    'Anestesia tópica para conforto',
    'Procedimento com jato de plasma',
    'Orientações pós-procedimento detalhadas',
    'Retorno de acompanhamento incluso',
    'Suporte durante todo o período de recuperação'
  ];

  // Galerias de resultados internacionais
  const resultGalleries = [
    {
      title: 'Plasma Pen - Before & Afters',
      description: 'Galeria internacional demonstrando resultados de rejuvenescimento palpebral com tecnologia de plasma.',
      url: 'https://plasmapen.com/before-afters/',
      source: 'Plasma Pen International'
    },
    {
      title: 'Plexr - Face Remodeling Gallery',
      description: 'Casos de blefaroplastia não cirúrgica e remodelamento facial com tecnologia Plexr.',
      url: 'https://www.plexrplasma.com/plexrbeforeaftergallery',
      source: 'Plexr Plasma'
    },
    {
      title: 'Fibroblast Plasma Pen Results',
      description: 'Documentação de resultados em tratamentos perioculares com plasma fibroblast.',
      url: 'https://skinstudiookc.com/fibroblast-plasma-pen-before-afters',
      source: 'Skin Studio OKC'
    }
  ];

  // Evidências científicas (estudos PubMed)
  const scientificEvidence = [
    {
      title: 'Eficácia da blefaroplastia não cirúrgica com plasma',
      authors: 'Baroni A. et al.',
      journal: 'Skin Research and Technology',
      year: '2020',
      finding: 'Demonstrou eficácia do plasma de radiofrequência para blefaroplastia não cirúrgica, com melhora significativa da aparência palpebral.',
      pubmedUrl: 'https://pubmed.ncbi.nlm.nih.gov/31535742/',
      doi: '10.1111/srt.12774'
    },
    {
      title: 'Blefaroplastia superior com plasma exeresis',
      authors: 'Ferreira FC. et al.',
      journal: 'Journal of Cosmetic Dermatology',
      year: '2021',
      finding: 'Procedimento minimamente invasivo com impacto positivo na qualidade de vida e alta satisfação dos pacientes.',
      pubmedUrl: 'https://pubmed.ncbi.nlm.nih.gov/33252188/',
      doi: '10.1111/jocd.13868'
    },
    {
      title: 'Plasma Jet vs Eletrocarbonização em rugas palpebrais',
      authors: 'JCAD Study',
      journal: 'Journal of Clinical and Aesthetic Dermatology',
      year: '2024',
      finding: 'Plasma jet mostrou melhora tecidual histológica superior e menos efeitos adversos comparado à eletrocarbonização.',
      pubmedUrl: 'https://jcadonline.com/plasma-jet-electrocarbonization-treatment-wrinkles/',
      doi: null
    },
    {
      title: 'Segurança do plasma em tecido ocular',
      authors: 'PMC Research',
      journal: 'Ophthalmology Research',
      year: '2021',
      finding: 'Ausência de efeitos adversos relevantes em seguimento prolongado com plasma de baixa temperatura na região periocular.',
      pubmedUrl: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC8439071/',
      doi: null
    }
  ];

  // Linha do tempo de recuperação
  const recoveryTimeline = [
    {
      day: 'Dia 0',
      title: 'Procedimento',
      description: 'Realização com anestesia tópica. Duração aproximada de 30-60 minutos. Formação imediata de micropontos na pele.',
      icon: Sparkles
    },
    {
      day: 'Dias 1-3',
      title: 'Fase inicial',
      description: 'Edema e crostas leves previstos. Aplicar compressas frias, manter cabeça elevada ao dormir, evitar maquiagem.',
      icon: Timer
    },
    {
      day: 'Dias 4-7',
      title: 'Descamação',
      description: 'Queda espontânea das crostas. NÃO arrancar manualmente. Manter fotoproteção rigorosa (FPS 50+).',
      icon: Shield
    },
    {
      day: 'Semanas 2-4',
      title: 'Recuperação',
      description: 'Redução da vermelhidão, resultado parcial em evolução. Continuar proteção solar.',
      icon: Eye
    },
    {
      day: '6+ semanas',
      title: 'Resultado final',
      description: 'Resultado mais estável visível. Remodelação de colágeno continua por alguns meses adicionais.',
      icon: Star
    }
  ];

  const faqs = [
    {
      question: "O que é blefaroplastia com jato de plasma?",
      answer: "É um procedimento estético minimamente invasivo que utiliza tecnologia de plasma para tratar flacidez, rugas finas e excesso de pele leve nas pálpebras, sem necessidade de cortes, suturas ou anestesia geral. O plasma gera micropontos de sublimação que estimulam a retração tecidual e a produção de colágeno."
    },
    {
      question: "Qual a diferença para a blefaroplastia cirúrgica?",
      answer: "A blefaroplastia cirúrgica tradicional envolve incisões, remoção de pele e suturas, sendo mais indicada para casos severos. O jato de plasma é uma alternativa para casos leves a moderados de dermatochalase, com recuperação mais rápida e sem cortes, mas não substitui a cirurgia em todos os casos."
    },
    {
      question: "O procedimento dói?",
      answer: "Não. Utilizamos anestesia tópica que elimina qualquer desconforto durante o procedimento. Você pode sentir apenas uma leve sensação de calor, que é bem tolerada pela maioria dos pacientes."
    },
    {
      question: "Quantas sessões são necessárias?",
      answer: "Na maioria dos casos de flacidez leve a moderada, uma única sessão produz resultados satisfatórios. Casos com maior excesso de pele podem necessitar de uma segunda sessão após 2-3 meses, conforme avaliação médica individualizada."
    },
    {
      question: "Quem pode fazer o procedimento?",
      answer: "Indicado para pessoas com flacidez leve a moderada nas pálpebras, rugas finas e excesso de pele periorbital discreto. Contraindicações incluem: gestantes, portadores de marca-passo, histórico de queloides, infecções ativas na região, e expectativas irreais de resultado."
    },
    {
      question: "Os resultados são permanentes?",
      answer: "Os resultados são duradouros, geralmente de 2 a 4 anos, dependendo de fatores como idade, genética, exposição solar e cuidados com a pele. O envelhecimento natural continua, e sessões de manutenção podem ser consideradas."
    },
    {
      question: "Quais são os riscos?",
      answer: "Quando realizado por profissional qualificado com seleção adequada de pacientes, os riscos são baixos. Efeitos transitórios esperados incluem: edema, crostas e vermelhidão temporária. Hiperpigmentação pós-inflamatória pode ocorrer especialmente em fototipos mais escuros, exigindo fotoproteção rigorosa."
    },
    {
      question: "Como é a recuperação?",
      answer: "Nos primeiros 5-7 dias, crostas superficiais se formam e desprendem naturalmente. Edema leve é esperado nos primeiros dias. Evite exposição solar direta, não arranque as crostas, e use FPS 50+ por pelo menos 30 dias. Resultado final visível em 4-6 semanas."
    }
  ];

  const relatedServices = [
    { id: 'remocao-xantelasma', title: 'Remoção de Xantelasma com Plasma' },
    { id: 'tratamento-dpn', title: 'Tratamento de DPN (Dermatose Papulosa Nigra)' },
    { id: 'cirurgias-oftalmologicas', title: 'Cirurgias Oftalmológicas' },
    { id: 'consultas-oftalmologicas', title: 'Consultas Oftalmológicas' }
  ];

  const references = [
    "Baroni A. et al. Non-surgical blepharoplasty with the novel plasma radiofrequency ablation technology. Skin Research and Technology. 2020;26(1):128-132. DOI: 10.1111/srt.12774",
    "Ferreira FC. et al. Upper eyelid blepharoplasty using plasma exeresis: Evaluation of outcomes, satisfaction, and symptoms after procedure. Journal of Cosmetic Dermatology. 2021;20(10):3302-3309. DOI: 10.1111/jocd.13868",
    "Plasma Jet versus Electrocarbonization in the Treatment of Wrinkles of the Upper Palpebral Region. Journal of Clinical and Aesthetic Dermatology. 2024.",
    "Safety of cold atmospheric plasma in ocular tissue: Long-term follow-up study. PMC. 2021. PMC8439071",
    "Sociedade Brasileira de Dermatologia. Procedimentos Estéticos Minimamente Invasivos - Diretrizes. 2023.",
    "International Society of Aesthetic Plastic Surgery. Non-Surgical Blepharoplasty Guidelines. 2022.",
    "Conselho Federal de Medicina. Resolução CFM nº 2.336/2023 - Publicidade médica."
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <SEOHead {...seo} />
      <Navbar />

      <main className="flex-1 pt-20 sm:pt-24 md:pt-28 lg:pt-32 scroll-block-internal mx-[5%] lg:mx-[10%]">
        <div className="container mx-auto px-4 md:px-6 py-12">
          {/* Breadcrumb e voltar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <button
              onClick={() => navigate('/servicos')}
              className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors mb-4 font-medium group"
            >
              <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
              Voltar para Serviços
            </button>

            <nav className="text-sm text-slate-500">
              <span>Serviços</span> / <span>Procedimentos com Plasma</span> / <span className="text-slate-900">Blefaroplastia com Jato de Plasma</span>
            </nav>
          </motion.div>

          {/* Header da página - Hero com credibilidade */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-12"
          >
            <div className="flex items-start gap-6 mb-6">
              <div className="flex-shrink-0">
                <ImageWithFallback
                  src="/icone_blefaroplastia_plasma.JPG"
                  alt="Blefaroplastia com Jato de Plasma"
                  className="w-20 h-20 object-contain rounded-lg"
                  width="80"
                  height="80"
                />
              </div>
              <div className="flex-1">
                <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 drop-shadow-sm">
                  Blefaroplastia com Jato de Plasma
                </h1>
                <p className="text-xl text-slate-600 leading-relaxed">
                  Procedimento minimamente invasivo para rejuvenescimento palpebral — sem cortes, suturas ou anestesia geral
                </p>
              </div>
            </div>

            {/* Badges de credibilidade */}
            <div className="flex flex-wrap gap-3 mb-6">
              <span className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-200">
                <Shield className="w-4 h-4 mr-1.5" />
                Minimamente Invasivo
              </span>
              <span className="inline-flex items-center px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm font-medium border border-green-200">
                <FileText className="w-4 h-4 mr-1.5" />
                Estudos PubMed
              </span>
              <span className="inline-flex items-center px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full text-sm font-medium border border-purple-200">
                <Eye className="w-4 h-4 mr-1.5" />
                Segurança Palpebral
              </span>
            </div>

            {/* Banner informativo com credibilidade */}
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-l-4 border-blue-500 p-6 rounded-r-xl">
              <div className="flex items-start gap-4">
                <Shield className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">Procedimento com Respaldo Científico</h3>
                  <p className="text-slate-700 leading-relaxed">
                    A blefaroplastia com jato de plasma é um procedimento <strong>minimamente invasivo</strong> com eficácia documentada em estudos publicados em <strong>periódicos indexados (PubMed)</strong>. É uma alternativa moderna à cirurgia tradicional de pálpebras, adequada para <strong>casos leves a moderados de dermatochalase</strong>, quando bem indicada após avaliação médica completa.
                  </p>
                  <p className="text-slate-600 text-sm mt-2">
                    <strong>Responsável Técnico:</strong> {clinicInfo.responsiblePhysician} ({clinicInfo.responsiblePhysicianCRM}) — Oftalmologista com foco em segurança na região periorbital.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Conteúdo principal */}
            <div className="lg:col-span-2 space-y-8">
              {/* O que é o procedimento */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl p-6 shadow-soft-light border border-slate-200/50"
              >
                <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
                  <BookOpen className="w-6 h-6 mr-3 text-blue-600" />
                  O que é Blefaroplastia com Jato de Plasma?
                </h2>
                <div className="space-y-4 text-slate-700 leading-relaxed">
                  <p>
                    A <strong>blefaroplastia com jato de plasma</strong> é um procedimento estético <strong>minimamente invasivo</strong> que utiliza tecnologia de plasma para tratar a flacidez, rugas finas e excesso de pele nas pálpebras superiores e inferiores — <strong>sem necessidade de cortes, suturas ou anestesia geral</strong>.
                  </p>
                  <p>
                    O procedimento funciona através de um dispositivo que gera plasma a partir da ionização de gases atmosféricos. Quando aplicado à pele, cria <strong>micropontos de sublimação</strong> que estimulam a retração imediata do tecido e a produção de colágeno, resultando em um efeito lifting natural e progressivo na região periorbital.
                  </p>
                  <p>
                    É uma <strong>alternativa moderna à cirurgia tradicional</strong> de pálpebras, sendo especialmente indicada para:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Dermatochalase leve a moderada</strong> (excesso de pele palpebral)</li>
                    <li><strong>Rugas finas</strong> na região periorbital</li>
                    <li><strong>Pálpebras com aspecto cansado</strong></li>
                    <li>Pacientes que desejam <strong>evitar cirurgia</strong> ou não são candidatos ideais</li>
                  </ul>
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <p className="text-amber-900 text-sm">
                        <strong>Importante:</strong> Este procedimento <strong>não substitui a blefaroplastia cirúrgica tradicional em todos os casos</strong>. Pacientes com excesso de pele muito acentuado, bolsas de gordura proeminentes ou ptose palpebral severa podem ter melhor indicação para cirurgia convencional. A avaliação médica individualizada é fundamental para definir a melhor abordagem.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.section>

              {/* Benefícios esperados */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="bg-white rounded-2xl p-6 shadow-soft-light border border-slate-200/50"
              >
                <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
                  <Star className="w-6 h-6 mr-3 text-yellow-500" />
                  Benefícios Esperados
                </h2>
                <ul className="space-y-3">
                  {benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-700">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </motion.section>

              {/* Limitações - transparência CFM */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.28 }}
                className="bg-slate-50 rounded-2xl p-6 border border-slate-200"
              >
                <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
                  <AlertTriangle className="w-6 h-6 mr-3 text-amber-500" />
                  Limitações do Procedimento
                </h2>
                <p className="text-slate-600 mb-4 text-sm">
                  Para sua segurança e expectativas realistas, é importante conhecer as limitações:
                </p>
                <ul className="space-y-3">
                  {limitations.map((limitation, index) => (
                    <li key={index} className="flex items-start">
                      <AlertCircle className="w-5 h-5 text-amber-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-700">{limitation}</span>
                    </li>
                  ))}
                </ul>
              </motion.section>

              {/* Riscos e efeitos colaterais */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl p-6 shadow-soft-light border border-slate-200/50"
              >
                <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
                  <Shield className="w-6 h-6 mr-3 text-blue-600" />
                  Riscos e Efeitos Colaterais
                </h2>
                <p className="text-slate-600 mb-4 text-sm">
                  Como qualquer procedimento médico, existem efeitos colaterais esperados e riscos potenciais:
                </p>
                <div className="space-y-4">
                  {risks.map((risk, index) => (
                    <div key={index} className="bg-slate-50 rounded-lg p-4">
                      <h3 className="font-semibold text-slate-900 mb-1">{risk.name}</h3>
                      <p className="text-slate-700 text-sm">{risk.description}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 mt-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <p className="text-green-900 text-sm">
                      <strong>Segurança:</strong> Complicações graves são raras quando o procedimento é realizado por médico treinado, com seleção adequada de pacientes e adesão rigorosa às orientações pós-procedimento.
                    </p>
                  </div>
                </div>
              </motion.section>

              {/* Linha do Tempo da Recuperação */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl p-6 border border-cyan-200"
              >
                <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
                  <Timer className="w-6 h-6 mr-3 text-cyan-600" />
                  Linha do Tempo da Recuperação
                </h2>
                <div className="relative">
                  {/* Linha vertical conectando os itens */}
                  <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-cyan-300" />

                  <div className="space-y-6">
                    {recoveryTimeline.map((item, index) => {
                      const IconComponent = item.icon;
                      return (
                        <div key={index} className="relative flex items-start gap-4">
                          <div className="relative z-10 flex-shrink-0 w-12 h-12 bg-white rounded-full border-2 border-cyan-400 flex items-center justify-center shadow-sm">
                            <IconComponent className="w-5 h-5 text-cyan-600" />
                          </div>
                          <div className="flex-1 bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-bold text-cyan-600 uppercase tracking-wide">{item.day}</span>
                              <span className="text-slate-400">•</span>
                              <span className="font-semibold text-slate-900">{item.title}</span>
                            </div>
                            <p className="text-slate-700 text-sm leading-relaxed">{item.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.section>

              {/* Infográfico - Protocolo Pré e Pós */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.38 }}
                className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-200"
              >
                <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
                  <FileText className="w-6 h-6 mr-3 text-blue-600" />
                  Protocolo Pré e Pós-Procedimento
                </h2>
                <div className="flex justify-center">
                  <ImageWithFallback
                    src="/infografico_protocolo_blefaroplastia_plasma.jpg"
                    alt="Protocolo Pré e Pós-Blefaroplastia com Jato de Plasma - Prevenção da Hiperpigmentação Pós-Inflamatória"
                    className="max-w-full h-auto rounded-xl shadow-lg border border-slate-200"
                    loading="lazy"
                  />
                </div>
                <p className="text-center text-sm text-slate-500 mt-4">
                  Clique na imagem para ampliar • Responsável Técnico: {clinicInfo.responsiblePhysician} ({clinicInfo.responsiblePhysicianCRM})
                </p>
              </motion.section>

              {/* Resultados Clínicos Documentados - Galerias Externas */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-2xl p-6 shadow-soft-light border border-slate-200/50"
              >
                <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center">
                  <Eye className="w-6 h-6 mr-3 text-purple-600" />
                  Resultados Clínicos Documentados
                </h2>
                <p className="text-slate-600 mb-6 text-sm leading-relaxed">
                  As galerias abaixo apresentam casos internacionais que ilustram o potencial da tecnologia de plasma para rejuvenescimento palpebral. <strong>Resultados são individuais</strong> e dependem de fatores como idade, tipo de pele, grau de fotoenvelhecimento e adesão aos cuidados pós-procedimento.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {resultGalleries.map((gallery, index) => (
                    <a
                      key={index}
                      href={gallery.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackExternalLink('result_gallery', gallery.url)}
                      className="block bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-200 hover:border-purple-400 hover:shadow-md transition-all group"
                    >
                      <h3 className="font-semibold text-slate-900 mb-2 group-hover:text-purple-700 flex items-center">
                        {gallery.title}
                        <ExternalLink className="w-4 h-4 ml-2 opacity-50 group-hover:opacity-100" />
                      </h3>
                      <p className="text-slate-600 text-sm mb-2">{gallery.description}</p>
                      <span className="text-xs text-purple-600 font-medium">{gallery.source}</span>
                    </a>
                  ))}
                </div>

                {/* Disclaimer obrigatório */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="text-amber-900 text-sm">
                      <p className="font-semibold mb-1">Aviso Importante:</p>
                      <p>
                        Os resultados apresentados nas galerias são de <strong>casos internacionais</strong> e servem apenas para ilustrar o potencial da técnica. <strong>Resultados variam significativamente</strong> conforme idade, tipo de pele (escala de Fitzpatrick), grau de fotoenvelhecimento, estilo de vida e adesão rigorosa aos cuidados pós-procedimento. <strong>A avaliação médica presencial é indispensável</strong> para determinar se o procedimento é adequado para seu caso específico.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.section>

              {/* Evidências Científicas */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="bg-white rounded-2xl p-6 shadow-soft-light border border-slate-200/50"
              >
                <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center">
                  <FileText className="w-6 h-6 mr-3 text-green-600" />
                  Evidências Científicas
                </h2>
                <p className="text-slate-600 mb-6 text-sm leading-relaxed">
                  A segurança e eficácia da blefaroplastia com jato de plasma são respaldadas por estudos publicados em periódicos científicos indexados:
                </p>

                <div className="space-y-4">
                  {scientificEvidence.map((study, index) => (
                    <div key={index} className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900 mb-1">{study.title}</h3>
                          <p className="text-sm text-slate-600 mb-2">
                            <span className="font-medium">{study.authors}</span> — {study.journal}, {study.year}
                          </p>
                          <p className="text-slate-700 text-sm leading-relaxed">{study.finding}</p>
                        </div>
                        <a
                          href={study.pubmedUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => trackExternalLink('scientific_study', study.pubmedUrl)}
                          className="flex-shrink-0 inline-flex items-center px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-xs font-medium hover:bg-green-200 transition-colors"
                        >
                          Ver estudo
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Rodapé com responsável técnico */}
                <div className="mt-6 pt-4 border-t border-slate-200">
                  <p className="text-slate-600 text-sm">
                    <strong>Responsável Técnico:</strong> {clinicInfo.responsiblePhysician} ({clinicInfo.responsiblePhysicianCRM}). Os protocolos adotados na Clínica Saraiva Vision estão alinhados às melhores evidências científicas disponíveis e às diretrizes do Conselho Federal de Medicina.
                  </p>
                </div>
              </motion.section>

              {/* O que está incluído */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.48 }}
                className="bg-white rounded-2xl p-6 shadow-soft-light border border-slate-200/50"
              >
                <h2 className="text-2xl font-bold text-slate-900 mb-6">
                  O que está incluído
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {included.map((item, index) => (
                    <div key={index} className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-blue-500 mr-3 mt-1 flex-shrink-0" />
                      <span className="text-slate-700 text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </motion.section>

              {/* FAQs */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-2xl p-6 shadow-soft-light border border-slate-200/50"
              >
                <h2 className="text-2xl font-bold text-slate-900 mb-6">
                  Perguntas Frequentes
                </h2>
                <div className="space-y-4">
                  {faqs.map((faq, index) => (
                    <details key={index} className="group bg-slate-50 rounded-xl p-4 hover:bg-slate-100 transition-colors">
                      <summary className="font-semibold text-slate-900 cursor-pointer flex items-start">
                        <span className="text-blue-600 mr-2 flex-shrink-0">Q:</span>
                        <span className="flex-1">{faq.question}</span>
                      </summary>
                      <div className="mt-3 pl-6 text-slate-700 leading-relaxed">
                        <span className="text-green-600 font-semibold mr-2">R:</span>
                        {faq.answer}
                      </div>
                    </details>
                  ))}
                </div>
              </motion.section>

              {/* Serviços relacionados */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
                className="bg-white rounded-2xl p-6 shadow-soft-light border border-slate-200/50"
              >
                <h2 className="text-2xl font-bold text-slate-900 mb-6">
                  Serviços Relacionados
                </h2>
                <div className="space-y-3">
                  {relatedServices.map((service) => (
                    <button
                      key={service.id}
                      onClick={() => navigate(`/servicos/${service.id}`)}
                      className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-blue-50 hover:border-blue-200 border border-slate-200 transition-all group"
                    >
                      <span className="text-slate-900 font-medium group-hover:text-blue-700">
                        {service.title}
                      </span>
                      <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                    </button>
                  ))}
                </div>
              </motion.section>

              {/* Referências científicas */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-slate-50 rounded-2xl p-6 border border-slate-200"
              >
                <h2 className="text-xl font-bold text-slate-900 mb-4">
                  Referências Científicas
                </h2>
                <ol className="list-decimal pl-5 space-y-2 text-xs text-slate-600">
                  {references.map((ref, index) => (
                    <li key={index} className="leading-relaxed">{ref}</li>
                  ))}
                </ol>
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <p className="text-slate-700 text-sm">
                    <strong>Responsabilidade Técnica:</strong> {clinicInfo.responsiblePhysician} ({clinicInfo.responsiblePhysicianCRM})<br />
                    <span className="text-slate-500 text-xs">Protocolos alinhados às melhores evidências disponíveis e diretrizes do CFM.</span>
                  </p>
                </div>
              </motion.section>
            </div>

            {/* Sidebar com informações */}
            <div className="space-y-6">
              {/* Duração */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100 shadow-sm"
              >
                <div className="flex items-center mb-3">
                  <Clock className="w-5 h-5 text-blue-600 mr-2" />
                  <h3 className="font-semibold text-slate-900">Duração</h3>
                </div>
                <p className="text-slate-700">30-60 minutos</p>
              </motion.div>

              {/* Preparação */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-100 shadow-sm"
              >
                <h3 className="font-semibold text-slate-900 mb-3">Como se preparar</h3>
                <ul className="text-slate-700 space-y-2 text-sm">
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-amber-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Evitar maquiagem no dia</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-amber-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Não usar cremes/ácidos 48h antes</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-amber-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Trazer exames anteriores</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-amber-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Comparecer sem lentes de contato</span>
                  </li>
                </ul>
              </motion.div>

              {/* CTA para agendamento */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl p-6 text-white sticky top-24"
              >
                <h3 className="font-bold text-lg mb-3">Agende sua avaliação</h3>
                <p className="text-blue-100 mb-4 text-sm">
                  Descubra se a blefaroplastia com jato de plasma é indicada para seu caso em uma consulta personalizada.
                </p>
                <button
                  onClick={() => window.open(clinicInfo.onlineSchedulingUrl, '_blank')}
                  className="w-full bg-white text-blue-600 font-semibold py-3 px-6 rounded-xl hover:bg-blue-50 hover:shadow-lg transition-all duration-300 transform hover:scale-105 border border-blue-100 mb-3"
                >
                  <span className="flex items-center justify-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    Agendar Avaliação
                  </span>
                </button>

                <div className="border-t border-blue-400 pt-4 mt-4 space-y-3">
                  <a
                    href={`https://wa.me/55${clinicInfo.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent('Olá! Gostaria de agendar uma avaliação para blefaroplastia com jato de plasma.')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackExternalLink('whatsapp_cta', clinicInfo.whatsapp)}
                    className="flex items-center text-white hover:text-blue-100 text-sm transition-colors"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    WhatsApp: {clinicInfo.phoneDisplay}
                  </a>
                  <a
                    href={`tel:${clinicInfo.phone}`}
                    className="flex items-center text-white hover:text-blue-100 text-sm transition-colors"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Telefone: {clinicInfo.phoneDisplay}
                  </a>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      <EnhancedFooter />
    </div>
  );
};

export default BlefaroplastiaJatoPlasmaPage;
