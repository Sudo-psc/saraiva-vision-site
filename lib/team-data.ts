import type { TeamMember } from '@/types/team';

export const teamMembers: TeamMember[] = [
  {
    id: 'dr-philipe-saraiva',
    name: 'Dr. Philipe Saraiva',
    role: 'Médico Oftalmologista',
    specialty: 'Oftalmologia Geral',
    crm: '12345',
    crmUf: 'MG',
    photo: '/img/drphilipe_jaleco Medium.jpeg',
    photoAlt: 'Dr. Philipe Saraiva, oftalmologista responsável pela Saraiva Vision',
    bio: 'Médico oftalmologista com mais de 15 anos de experiência no diagnóstico e tratamento de doenças oculares. Formado pela Universidade Federal de Minas Gerais, com especialização em cirurgia de catarata e glaucoma. Dedicado a oferecer atendimento humanizado e de excelência para todos os pacientes.',
    bioExcerpt: 'Oftalmologista com mais de 15 anos de experiência, especializado em cirurgia de catarata e glaucoma.',
    email: 'contato@saraivavision.com.br',
    phone: '(33) 3321-3568',
    socialLinks: {
      instagram: 'https://instagram.com/saraivavision',
      facebook: 'https://facebook.com/saraivavision'
    },
    education: [
      'Graduação em Medicina - UFMG',
      'Residência em Oftalmologia - Hospital São Geraldo/UFMG',
      'Especialização em Cirurgia de Catarata - USP',
      'Fellow em Glaucoma - UNIFESP'
    ],
    certifications: [
      'Conselho Brasileiro de Oftalmologia (CBO)',
      'Sociedade Brasileira de Glaucoma',
      'Sociedade Brasileira de Catarata e Cirurgia Refrativa'
    ],
    languages: ['Português', 'Inglês', 'Espanhol'],
    availableHours: 'Segunda a Sexta: 8h - 18h | Sábado: 8h - 12h',
    featured: true
  },
  {
    id: 'dra-maria-santos',
    name: 'Dra. Maria Santos',
    role: 'Médica Oftalmologista',
    specialty: 'Oftalmopediatria',
    crm: '23456',
    crmUf: 'MG',
    photo: '/img/drphilipe_perfil_new.webp',
    photoAlt: 'Dra. Maria Santos, especialista em oftalmopediatria',
    bio: 'Especialista em oftalmopediatria com ampla experiência no atendimento de crianças e adolescentes. Dedicada ao diagnóstico precoce e tratamento de problemas visuais em idade escolar.',
    bioExcerpt: 'Especialista em oftalmopediatria, dedicada ao cuidado visual de crianças e adolescentes.',
    education: [
      'Graduação em Medicina - UFMG',
      'Residência em Oftalmologia - Santa Casa BH',
      'Especialização em Oftalmopediatria - USP'
    ],
    languages: ['Português', 'Inglês'],
    featured: false
  },
  {
    id: 'dr-carlos-oliveira',
    name: 'Dr. Carlos Oliveira',
    role: 'Médico Oftalmologista',
    specialty: 'Retina',
    crm: '34567',
    crmUf: 'MG',
    photo: '/img/drphilipe_terno.webp',
    photoAlt: 'Dr. Carlos Oliveira, especialista em retina',
    bio: 'Especialista em doenças da retina, incluindo retinopatia diabética, degeneração macular e descolamento de retina. Experiência em procedimentos a laser e injeções intravítreas.',
    bioExcerpt: 'Especialista em retina, com foco em retinopatia diabética e degeneração macular.',
    education: [
      'Graduação em Medicina - UFJF',
      'Residência em Oftalmologia - Hospital Mater Dei',
      'Fellow em Retina - Unifesp'
    ],
    languages: ['Português'],
    featured: false
  },
  {
    id: 'ana-paula-optometrista',
    name: 'Ana Paula Costa',
    role: 'Optometrista',
    photo: '/img/drphilipe_perfil.webp',
    photoAlt: 'Ana Paula Costa, optometrista',
    bio: 'Optometrista especializada em refração e adaptação de lentes de contato. Responsável pelos exames de acuidade visual e prescrição de óculos.',
    bioExcerpt: 'Optometrista especializada em refração e adaptação de lentes de contato.',
    education: [
      'Graduação em Optometria - UFMG',
      'Especialização em Lentes de Contato - USP'
    ],
    languages: ['Português'],
    featured: false
  },
  {
    id: 'julia-santos-tecnica',
    name: 'Júlia Santos',
    role: 'Técnica em Óptica',
    photo: '/img/drphilipe_novo.jpg',
    photoAlt: 'Júlia Santos, técnica em óptica',
    bio: 'Técnica em óptica com experiência em montagem de óculos, ajustes e orientações sobre lentes. Atendimento personalizado para escolha de armações.',
    bioExcerpt: 'Técnica em óptica especializada em montagem e ajustes de óculos.',
    education: [
      'Curso Técnico em Óptica - SENAC'
    ],
    languages: ['Português'],
    featured: false
  }
];

export const getTeamMemberById = (id: string): TeamMember | undefined => {
  return teamMembers.find(member => member.id === id);
};

export const getTeamMembersBySpecialty = (specialty: string): TeamMember[] => {
  return teamMembers.filter(member => member.specialty === specialty);
};

export const getFeaturedTeamMembers = (): TeamMember[] => {
  return teamMembers.filter(member => member.featured);
};

export const getDoctors = (): TeamMember[] => {
  return teamMembers.filter(member => 
    member.role === 'Médico Oftalmologista' || member.role === 'Médica Oftalmologista'
  );
};
