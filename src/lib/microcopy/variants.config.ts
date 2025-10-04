import { PersonaType } from '@/middleware/config/personas.config';

export interface MicrocopyVariant {
  id: string;
  category: 'cta' | 'heading' | 'description' | 'error' | 'success';
  context: string;
  variants: Record<PersonaType, string>;
  metadata: {
    tone: 'formal' | 'casual' | 'urgent' | 'reassuring';
    priority: number;
    testGroup?: string;
  };
}

export const MICROCOPY_LIBRARY: MicrocopyVariant[] = [
  {
    id: 'hero_cta_primary',
    category: 'cta',
    context: 'homepage_hero',
    variants: {
      [PersonaType.JOVEM_ADULTO]: 'Agende Online em 2 Minutos',
      [PersonaType.PROFISSIONAL_SENIOR]: 'Agende sua Consulta Executiva',
      [PersonaType.IDOSO]: 'Ligue para Agendar sua Consulta',
      [PersonaType.ATLETA]: 'Reserve Avaliação Esportiva',
      [PersonaType.DEFAULT]: 'Agende sua Consulta',
    },
    metadata: {
      tone: 'urgent',
      priority: 100,
    },
  },
  
  {
    id: 'services_heading',
    category: 'heading',
    context: 'services_page',
    variants: {
      [PersonaType.JOVEM_ADULTO]: 'Soluções Modernas para sua Visão',
      [PersonaType.PROFISSIONAL_SENIOR]: 'Excelência em Saúde Ocular',
      [PersonaType.IDOSO]: 'Cuidado Especializado para sua Saúde Ocular',
      [PersonaType.ATLETA]: 'Performance Visual para Atletas',
      [PersonaType.DEFAULT]: 'Nossos Serviços',
    },
    metadata: {
      tone: 'reassuring',
      priority: 90,
    },
  },
  
  {
    id: 'services_description',
    category: 'description',
    context: 'services_page',
    variants: {
      [PersonaType.JOVEM_ADULTO]: 'Tecnologia de ponta e atendimento ágil para sua rotina agitada',
      [PersonaType.PROFISSIONAL_SENIOR]: 'Tratamentos personalizados com foco em resultados e eficiência',
      [PersonaType.IDOSO]: 'Atendimento humanizado e cuidadoso com sua visão',
      [PersonaType.ATLETA]: 'Soluções especializadas para otimizar seu desempenho esportivo',
      [PersonaType.DEFAULT]: 'Cuidados completos para sua saúde ocular',
    },
    metadata: {
      tone: 'reassuring',
      priority: 80,
    },
  },
  
  {
    id: 'form_error_phone',
    category: 'error',
    context: 'contact_form',
    variants: {
      [PersonaType.JOVEM_ADULTO]: 'Ops! Confere o número do WhatsApp?',
      [PersonaType.PROFISSIONAL_SENIOR]: 'Por favor, verifique o telefone informado',
      [PersonaType.IDOSO]: 'Por favor, verifique se o telefone está correto',
      [PersonaType.ATLETA]: 'Ops! Confere o número do celular?',
      [PersonaType.DEFAULT]: 'Número de telefone inválido',
    },
    metadata: {
      tone: 'casual',
      priority: 50,
    },
  },
  
  {
    id: 'form_success_message',
    category: 'success',
    context: 'contact_form',
    variants: {
      [PersonaType.JOVEM_ADULTO]: 'Confirmado! Em breve você receberá um WhatsApp 📱',
      [PersonaType.PROFISSIONAL_SENIOR]: 'Agendamento confirmado. Entraremos em contato em breve.',
      [PersonaType.IDOSO]: 'Sua solicitação foi recebida. Ligaremos para você em breve.',
      [PersonaType.ATLETA]: 'Confirmado! Logo você receberá os detalhes da avaliação 💪',
      [PersonaType.DEFAULT]: 'Mensagem enviada com sucesso!',
    },
    metadata: {
      tone: 'reassuring',
      priority: 60,
    },
  },
  
  {
    id: 'navigation_services',
    category: 'cta',
    context: 'main_navigation',
    variants: {
      [PersonaType.JOVEM_ADULTO]: 'Serviços',
      [PersonaType.PROFISSIONAL_SENIOR]: 'Tratamentos',
      [PersonaType.IDOSO]: 'Nossos Serviços',
      [PersonaType.ATLETA]: 'Soluções',
      [PersonaType.DEFAULT]: 'Serviços',
    },
    metadata: {
      tone: 'formal',
      priority: 70,
    },
  },
  
  {
    id: 'cta_contact',
    category: 'cta',
    context: 'footer',
    variants: {
      [PersonaType.JOVEM_ADULTO]: 'Fale Conosco no WhatsApp',
      [PersonaType.PROFISSIONAL_SENIOR]: 'Entre em Contato',
      [PersonaType.IDOSO]: 'Ligue para Nós',
      [PersonaType.ATLETA]: 'Fale com a Gente',
      [PersonaType.DEFAULT]: 'Contato',
    },
    metadata: {
      tone: 'casual',
      priority: 75,
    },
  },
];
