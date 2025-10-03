/**
 * Contact Lenses Product Catalog Data
 * Saraiva Vision - Medical Ophthalmology Clinic
 *
 * CFM Compliance: Product information for educational purposes only
 * All products require professional prescription and fitting
 */

import {
  ContactLensProduct,
  LensCategory,
  LensBrand,
  FittingProcessStep,
  SafetyProtocol,
  LensFAQ,
  TrustBadge,
  LensComparison
} from '@/types/products';
import { Heart, Shield, Zap, Eye, Clock, Users, Award, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

/**
 * Contact Lens Products Catalog
 */
export const contactLensProducts: ContactLensProduct[] = [
  // Acuvue Products
  {
    id: 'acuvue-oasys-daily',
    name: 'Acuvue Oasys 1-Day',
    brand: 'Acuvue',
    type: 'daily',
    material: 'silicone-hydrogel',
    replacementSchedule: 'daily',
    purposes: ['vision-correction', 'astigmatism'],
    waterContent: 38,
    oxygenPermeability: 121,
    uvProtection: true,
    description: 'Lentes de contato diárias com tecnologia HydraLuxe para conforto excepcional durante todo o dia.',
    features: [
      'Tecnologia HydraLuxe para hidratação',
      'Proteção UV Classe 1',
      'Alta permeabilidade ao oxigênio',
      'Descarte diário - máxima higiene'
    ],
    benefits: [
      'Conforto durante todo o dia',
      'Visão nítida e estável',
      'Praticidade sem manutenção',
      'Ideal para olhos secos'
    ],
    idealFor: [
      'Usuários ativos',
      'Pessoas com olhos sensíveis',
      'Quem busca praticidade',
      'Ambientes com ar-condicionado'
    ],
    images: {
      main: '/img/acuvue2.jpeg',
      thumbnail: '/img/acuvue2.jpeg'
    },
    available: true,
    prescriptionRequired: true,
    metadata: {
      manufacturer: 'Johnson & Johnson',
      country: 'EUA',
      fda_approved: true,
      anvisa_approved: true
    }
  },
  {
    id: 'acuvue-oasys-monthly',
    name: 'Acuvue Oasys',
    brand: 'Acuvue',
    type: 'monthly',
    material: 'silicone-hydrogel',
    replacementSchedule: 'biweekly',
    purposes: ['vision-correction'],
    waterContent: 38,
    oxygenPermeability: 147,
    uvProtection: true,
    description: 'Lentes quinzenais com tecnologia Hydraclear Plus para conforto prolongado.',
    features: [
      'Tecnologia Hydraclear Plus',
      'Proteção UV',
      'Alta transmissibilidade de oxigênio',
      'Resistente a depósitos'
    ],
    benefits: [
      'Conforto em ambientes desafiadores',
      'Visão nítida consistente',
      'Custo-benefício excelente',
      'Longa durabilidade'
    ],
    idealFor: [
      'Uso regular',
      'Pessoas com estilo de vida ativo',
      'Quem busca economia',
      'Ambientes climatizados'
    ],
    images: {
      main: '/img/acuvue2.jpeg',
      thumbnail: '/img/acuvue2.jpeg'
    },
    available: true,
    prescriptionRequired: true,
    metadata: {
      manufacturer: 'Johnson & Johnson',
      country: 'EUA',
      fda_approved: true,
      anvisa_approved: true
    }
  },
  // Sólotica Products
  {
    id: 'solotica-hidrocor',
    name: 'Sólotica Hidrocor',
    brand: 'Sólotica',
    type: 'colored',
    material: 'hydrogel',
    replacementSchedule: 'yearly',
    purposes: ['cosmetic', 'vision-correction'],
    waterContent: 55,
    oxygenPermeability: 18,
    uvProtection: false,
    description: 'Lentes de contato coloridas brasileiras de alta qualidade para transformação natural da cor dos olhos.',
    features: [
      'Cores vibrantes e naturais',
      'Fabricação nacional premium',
      'Longa durabilidade (1 ano)',
      'Disponível com ou sem grau'
    ],
    benefits: [
      'Mudança natural da cor dos olhos',
      'Qualidade brasileira reconhecida',
      'Conforto durante o uso',
      'Ampla variedade de cores'
    ],
    idealFor: [
      'Quem busca mudança estética',
      'Eventos especiais',
      'Uso social',
      'Transformação natural'
    ],
    images: {
      main: '/img/solotica-hidrocor.jpeg',
      thumbnail: '/img/solotica-hidrocor.jpeg'
    },
    available: true,
    prescriptionRequired: true,
    metadata: {
      manufacturer: 'Sólotica',
      country: 'Brasil',
      anvisa_approved: true
    }
  },
  {
    id: 'solotica-natural-colors',
    name: 'Sólotica Natural Colors',
    brand: 'Sólotica',
    type: 'colored',
    material: 'hydrogel',
    replacementSchedule: 'yearly',
    purposes: ['cosmetic', 'vision-correction'],
    waterContent: 55,
    oxygenPermeability: 18,
    uvProtection: false,
    description: 'Lentes coloridas com efeito de realce natural, mantendo o aspecto autêntico dos olhos.',
    features: [
      'Efeito realce natural',
      'Tonalidades suaves',
      'Durabilidade de 1 ano',
      'Com ou sem correção visual'
    ],
    benefits: [
      'Realce sutil da cor natural',
      'Aparência autêntica',
      'Conforto prolongado',
      'Fabricação brasileira'
    ],
    idealFor: [
      'Quem busca realce discreto',
      'Uso diário',
      'Look natural',
      'Profissionais'
    ],
    images: {
      main: '/img/solotica-hidrocor.jpeg',
      thumbnail: '/img/solotica-hidrocor.jpeg'
    },
    available: true,
    prescriptionRequired: true,
    metadata: {
      manufacturer: 'Sólotica',
      country: 'Brasil',
      anvisa_approved: true
    }
  },
  // Bioview Products
  {
    id: 'bioview-aspheric',
    name: 'Bioview Asférica',
    brand: 'Bioview',
    type: 'monthly',
    material: 'hydrogel',
    replacementSchedule: 'monthly',
    purposes: ['vision-correction'],
    waterContent: 55,
    oxygenPermeability: 24,
    uvProtection: false,
    description: 'Lentes gelatinosas mensais com design asférico para visão de alta qualidade.',
    features: [
      'Design asférico avançado',
      'Alta hidratação',
      'Troca mensal',
      'Custo acessível'
    ],
    benefits: [
      'Visão nítida em todas as distâncias',
      'Conforto durante todo o mês',
      'Ótimo custo-benefício',
      'Fácil manuseio'
    ],
    idealFor: [
      'Uso regular diário',
      'Quem busca economia',
      'Primeira experiência com lentes',
      'Graus baixos a médios'
    ],
    images: {
      main: '/img/bivoview.png',
      thumbnail: '/img/bivoview.png'
    },
    available: true,
    prescriptionRequired: true,
    metadata: {
      manufacturer: 'Bioview',
      country: 'Brasil',
      anvisa_approved: true
    }
  },
  {
    id: 'bioview-torica',
    name: 'Bioview Tórica',
    brand: 'Bioview',
    type: 'toric',
    material: 'hydrogel',
    replacementSchedule: 'monthly',
    purposes: ['astigmatism'],
    waterContent: 55,
    oxygenPermeability: 24,
    uvProtection: false,
    description: 'Lentes tóricas mensais para correção de astigmatismo com estabilização avançada.',
    features: [
      'Correção de astigmatismo',
      'Estabilização otimizada',
      'Alta hidratação',
      'Troca mensal'
    ],
    benefits: [
      'Visão estável e nítida',
      'Conforto para astigmatismo',
      'Preço acessível',
      'Fácil adaptação'
    ],
    idealFor: [
      'Portadores de astigmatismo',
      'Uso regular',
      'Quem busca economia',
      'Graus tóricos diversos'
    ],
    images: {
      main: '/img/bivoview.png',
      thumbnail: '/img/bivoview.png'
    },
    available: true,
    prescriptionRequired: true,
    metadata: {
      manufacturer: 'Bioview',
      country: 'Brasil',
      anvisa_approved: true
    }
  }
];

/**
 * Lens Categories with Icons and Features
 */
export const lensCategories: LensCategory[] = [
  {
    type: 'soft',
    title: 'Lentes Gelatinosas',
    subtitle: 'Conforto e praticidade no dia a dia',
    description: 'Lentes macias e flexíveis ideais para uso diário, oferecendo conforto imediato e adaptação rápida.',
    icon: Heart,
    color: 'bg-green-50/80 border-green-400/60 shadow-green-100/50',
    features: [
      'Conforto imediato desde o primeiro uso',
      'Adaptação rápida e fácil',
      'Ideal para uso diário e esportes',
      'Ampla variedade de graus disponíveis',
      'Manutenção simples e prática'
    ],
    products: contactLensProducts.filter(p => p.material === 'hydrogel' || p.material === 'silicone-hydrogel'),
    popular: true
  },
  {
    type: 'rigid',
    title: 'Lentes RGP',
    subtitle: 'Qualidade visual superior',
    description: 'Lentes rígidas gás permeáveis com excelente transmissão de oxigênio e visão de alta definição.',
    icon: Shield,
    color: 'bg-blue-50/80 border-blue-400/60 shadow-blue-100/50',
    features: [
      'Visão mais nítida e precisa',
      'Maior durabilidade (1-2 anos)',
      'Melhor saúde ocular a longo prazo',
      'Ideal para alto astigmatismo',
      'Custo-benefício no longo prazo'
    ],
    products: contactLensProducts.filter(p => p.material === 'rgp'),
    popular: false
  },
  {
    type: 'multifocal',
    title: 'Lentes Multifocais',
    subtitle: 'Liberdade para todas as distâncias',
    description: 'Correção simultânea para perto e longe, ideal para presbiopia (vista cansada).',
    icon: Zap,
    color: 'bg-cyan-50/80 border-cyan-400/60 shadow-cyan-100/50',
    features: [
      'Visão nítida em todas as distâncias',
      'Elimina necessidade de óculos de leitura',
      'Tecnologia avançada de transição',
      'Ideal para presbiopia (45+ anos)',
      'Liberdade no dia a dia'
    ],
    products: contactLensProducts.filter(p => p.purposes.includes('presbyopia')),
    popular: false
  }
];

/**
 * Brand Information
 */
export const lensBrands: LensBrand[] = [
  {
    name: 'Acuvue',
    description: 'Líder mundial em lentes de contato com tecnologia avançada para conforto e saúde ocular.',
    image: '/img/acuvue2.jpeg',
    features: [
      'Proteção UV integrada',
      'Tecnologia de hidratação avançada',
      'Aprovação FDA e ANVISA',
      'Pesquisa e inovação contínua'
    ],
    specialty: 'Lentes diárias e quinzenais de alta performance',
    country: 'Estados Unidos',
    website: 'https://www.acuvue.com.br',
    certifications: ['FDA', 'ANVISA', 'CE']
  },
  {
    name: 'Sólotica',
    description: 'Marca brasileira premium especializada em lentes de contato coloridas de alta qualidade e design natural.',
    image: '/img/solotica-hidrocor.jpeg',
    features: [
      'Cores naturais e vibrantes',
      'Fabricação 100% nacional',
      'Ampla variedade de tonalidades',
      'Longa durabilidade'
    ],
    specialty: 'Lentes coloridas premium com efeito natural',
    country: 'Brasil',
    website: 'https://www.solotica.com.br',
    certifications: ['ANVISA', 'ISO']
  },
  {
    name: 'Bioview',
    description: 'Marca brasileira focada em lentes de qualidade com excelente custo-benefício para o mercado nacional.',
    image: '/img/bivoview.png',
    features: [
      'Preço acessível',
      'Qualidade nacional',
      'Ampla linha de produtos',
      'Fácil adaptação'
    ],
    specialty: 'Lentes gelatinosas para uso mensal',
    country: 'Brasil',
    website: 'https://www.bioview.com.br',
    certifications: ['ANVISA']
  }
];

/**
 * Fitting Process Steps
 */
export const fittingProcess: FittingProcessStep[] = [
  {
    step: 1,
    title: 'Avaliação Inicial',
    description: 'Exame completo dos olhos e avaliação do estilo de vida para determinar o melhor tipo de lente para você.',
    duration: '30-45 min',
    icon: Eye
  },
  {
    step: 2,
    title: 'Medição Personalizada',
    description: 'Medição precisa da curvatura da córnea, diâmetro ocular e prescrição específica.',
    duration: '15-20 min',
    icon: CheckCircle2
  },
  {
    step: 3,
    title: 'Teste de Adaptação',
    description: 'Experimentação de lentes teste para verificar conforto, visão e ajuste adequado.',
    duration: '20-30 min',
    icon: Sparkles
  },
  {
    step: 4,
    title: 'Treinamento e Acompanhamento',
    description: 'Instrução sobre inserção, remoção, limpeza e cuidados. Retornos programados para ajustes.',
    duration: '30 min',
    icon: Users
  }
];

/**
 * Safety Protocols
 */
export const safetyProtocols: SafetyProtocol[] = [
  {
    id: 'sterilization',
    title: 'Esterilização Rigorosa',
    description: 'Todos os equipamentos são esterilizados conforme normas ANVISA',
    icon: Shield,
    required: true
  },
  {
    id: 'eye-health',
    title: 'Avaliação de Saúde Ocular',
    description: 'Exame completo antes da adaptação para garantir segurança',
    icon: Eye,
    required: true
  },
  {
    id: 'quality-control',
    title: 'Controle de Qualidade',
    description: 'Lentes apenas de marcas certificadas pela ANVISA e FDA',
    icon: Award,
    required: true
  },
  {
    id: 'follow-up',
    title: 'Acompanhamento Contínuo',
    description: 'Retornos programados para monitoramento da saúde ocular',
    icon: Clock,
    required: true
  }
];

/**
 * Frequently Asked Questions
 */
export const lensFAQs: LensFAQ[] = [
  {
    id: 'safe-usage',
    question: 'Lentes de contato são seguras?',
    answer: 'Sim, quando usadas corretamente e com acompanhamento profissional. É fundamental seguir as orientações de higiene, tempo de uso e realizar consultas de rotina.',
    category: 'safety'
  },
  {
    id: 'adaptation-time',
    question: 'Quanto tempo leva para me adaptar?',
    answer: 'A maioria dos usuários se adapta em 1-2 semanas. Lentes gelatinosas geralmente têm adaptação mais rápida (dias), enquanto RGP podem levar algumas semanas.',
    category: 'fitting'
  },
  {
    id: 'sleep-with-lenses',
    question: 'Posso dormir com lentes de contato?',
    answer: 'Não é recomendado, exceto para lentes especificamente aprovadas para uso prolongado. Dormir com lentes comuns aumenta significativamente o risco de infecções.',
    category: 'usage'
  },
  {
    id: 'daily-vs-monthly',
    question: 'Devo escolher lentes diárias ou mensais?',
    answer: 'Depende do seu estilo de vida. Lentes diárias são mais práticas e higiênicas, ideais para uso ocasional. Mensais são mais econômicas para uso regular diário.',
    category: 'general'
  },
  {
    id: 'sports-activities',
    question: 'Posso praticar esportes com lentes?',
    answer: 'Sim! Lentes de contato são excelentes para esportes, oferecendo campo visual amplo e sem risco de quebra. Para natação, use óculos de proteção.',
    category: 'usage'
  },
  {
    id: 'dry-eyes',
    question: 'Tenho olhos secos, posso usar lentes?',
    answer: 'Sim, existem lentes específicas para olhos secos com alta hidratação. Recomendamos lentes de silicone-hidrogel ou diárias com tecnologia de retenção de umidade.',
    category: 'fitting'
  }
];

/**
 * Trust Badges
 */
export const trustBadges: TrustBadge[] = [
  {
    key: 'experience',
    value: '15+ anos de experiência',
    icon: Clock,
    description: 'Expertise em adaptação de lentes'
  },
  {
    key: 'patients',
    value: '1000+ clientes satisfeitos',
    icon: Users,
    description: 'Clientes atendidos com sucesso'
  },
  {
    key: 'safety',
    value: '100% Seguro',
    icon: Shield,
    description: 'Protocolos rigorosos de higiene'
  },
  {
    key: 'brands',
    value: 'Marcas Premium',
    icon: Award,
    description: 'Apenas marcas certificadas'
  }
];

/**
 * Lens Comparison Data
 */
export const lensComparisons: LensComparison[] = [
  {
    productId: 'acuvue-oasys-daily',
    name: 'Acuvue Oasys 1-Day',
    brand: 'Acuvue',
    type: 'daily',
    replacementSchedule: 'daily',
    waterContent: 38,
    oxygenPermeability: 121,
    uvProtection: true,
    features: ['HydraLuxe', 'UV Classe 1', 'Descarte diário'],
    bestFor: ['Olhos sensíveis', 'Praticidade', 'Uso ocasional']
  },
  {
    productId: 'acuvue-oasys-monthly',
    name: 'Acuvue Oasys',
    brand: 'Acuvue',
    type: 'monthly',
    replacementSchedule: 'biweekly',
    waterContent: 38,
    oxygenPermeability: 147,
    uvProtection: true,
    features: ['Hydraclear Plus', 'UV', 'Quinzenal'],
    bestFor: ['Uso regular', 'Custo-benefício', 'Longa durabilidade']
  },
  {
    productId: 'bioview-aspheric',
    name: 'Bioview Asférica',
    brand: 'Bioview',
    type: 'monthly',
    replacementSchedule: 'monthly',
    waterContent: 55,
    oxygenPermeability: 24,
    uvProtection: false,
    features: ['Design asférico', 'Alta hidratação', 'Mensal'],
    bestFor: ['Economia', 'Uso diário', 'Primeira experiência']
  }
];

/**
 * Default export with all data
 */
export default {
  products: contactLensProducts,
  categories: lensCategories,
  brands: lensBrands,
  fittingProcess,
  safetyProtocols,
  faqs: lensFAQs,
  trustBadges,
  comparisons: lensComparisons
};
