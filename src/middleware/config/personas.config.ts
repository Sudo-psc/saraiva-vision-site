export enum PersonaType {
  JOVEM_ADULTO = 'jovem_adulto',
  PROFISSIONAL_SENIOR = 'profissional_senior',
  IDOSO = 'idoso',
  ATLETA = 'atleta',
  DEFAULT = 'default',
}

export interface ScoringRule {
  trigger: 'visit_page' | 'device_type' | 'time_on_page' | 'scroll_depth' | 'font_size_preference' | 'scroll_speed';
  pattern?: RegExp | string;
  threshold?: { min?: number; max?: number };
  weight: number;
}

export interface ContentVariantMap {
  cta_primary?: string;
  hero_title?: string;
  nav_style?: 'minimal' | 'expanded';
  font_scale?: number;
  [key: string]: string | number | undefined;
}

export interface RoutingPreference {
  from: string;
  to: string;
  priority: number;
}

export interface PersonaConfig {
  id: PersonaType;
  name: string;
  description: string;
  scoringRules: ScoringRule[];
  contentVariants: ContentVariantMap;
  routingPreferences: RoutingPreference[];
}

export const PERSONAS: Record<PersonaType, PersonaConfig> = {
  [PersonaType.JOVEM_ADULTO]: {
    id: PersonaType.JOVEM_ADULTO,
    name: 'Jovem Adulto',
    description: 'Usuários 18-35 anos, tech-savvy',
    scoringRules: [
      {
        trigger: 'visit_page',
        pattern: /\/(lentes-de-contato|miopia|astigmatismo)/,
        weight: 3,
      },
      {
        trigger: 'device_type',
        pattern: 'mobile',
        weight: 2,
      },
      {
        trigger: 'time_on_page',
        threshold: { min: 10, max: 60 },
        weight: 1.5,
      },
    ],
    contentVariants: {
      cta_primary: 'Agende Online Agora',
      hero_title: 'Cuide da Sua Visão com Tecnologia',
      nav_style: 'minimal',
    },
    routingPreferences: [
      {
        from: '/servicos',
        to: '/servicos/jovem',
        priority: 10,
      },
    ],
  },
  
  [PersonaType.PROFISSIONAL_SENIOR]: {
    id: PersonaType.PROFISSIONAL_SENIOR,
    name: 'Profissional Sênior',
    description: 'Executivos e profissionais 35-55 anos',
    scoringRules: [
      {
        trigger: 'visit_page',
        pattern: /\/(cirurgia-refrativa|presbiopia|check-up)/,
        weight: 3,
      },
      {
        trigger: 'device_type',
        pattern: 'desktop',
        weight: 2,
      },
      {
        trigger: 'time_on_page',
        threshold: { min: 30, max: 120 },
        weight: 2,
      },
    ],
    contentVariants: {
      cta_primary: 'Agendar Consulta Executiva',
      hero_title: 'Excelência em Saúde Ocular',
      nav_style: 'minimal',
    },
    routingPreferences: [
      {
        from: '/servicos',
        to: '/servicos/profissional',
        priority: 10,
      },
    ],
  },
  
  [PersonaType.IDOSO]: {
    id: PersonaType.IDOSO,
    name: 'Público Sênior',
    description: 'Usuários 60+ anos, preferência por simplicidade',
    scoringRules: [
      {
        trigger: 'visit_page',
        pattern: /\/(catarata|glaucoma|dmri|retina)/,
        weight: 4,
      },
      {
        trigger: 'font_size_preference',
        pattern: 'large',
        weight: 3,
      },
      {
        trigger: 'scroll_speed',
        threshold: { max: 200 },
        weight: 2,
      },
    ],
    contentVariants: {
      cta_primary: 'Ligar para Agendar Consulta',
      hero_title: 'Especialistas em Cuidados com a Visão',
      nav_style: 'expanded',
      font_scale: 1.2,
    },
    routingPreferences: [
      {
        from: '/servicos',
        to: '/servicos/senior',
        priority: 10,
      },
    ],
  },
  
  [PersonaType.ATLETA]: {
    id: PersonaType.ATLETA,
    name: 'Atleta',
    description: 'Praticantes de esportes, foco em performance visual',
    scoringRules: [
      {
        trigger: 'visit_page',
        pattern: /\/(lentes-esportivas|visao-esportiva|cirurgia-atletas)/,
        weight: 4,
      },
      {
        trigger: 'device_type',
        pattern: 'mobile',
        weight: 2,
      },
      {
        trigger: 'time_on_page',
        threshold: { min: 15, max: 90 },
        weight: 1.5,
      },
    ],
    contentVariants: {
      cta_primary: 'Reserve Avaliação Esportiva',
      hero_title: 'Performance Visual para Atletas',
      nav_style: 'minimal',
    },
    routingPreferences: [
      {
        from: '/servicos',
        to: '/servicos/atleta',
        priority: 10,
      },
    ],
  },
  
  [PersonaType.DEFAULT]: {
    id: PersonaType.DEFAULT,
    name: 'Padrão',
    description: 'Usuário não classificado',
    scoringRules: [],
    contentVariants: {
      cta_primary: 'Agende sua Consulta',
      hero_title: 'Clínica Oftalmológica de Excelência',
      nav_style: 'minimal',
    },
    routingPreferences: [],
  },
};
