export interface TeamMember {
  id: string;
  name: string;
  role: string;
  specialty?: string;
  crm?: string;
  crmUf?: string;
  photo: string;
  photoAlt: string;
  bio: string;
  bioExcerpt?: string;
  email?: string;
  phone?: string;
  socialLinks?: {
    linkedin?: string;
    instagram?: string;
    facebook?: string;
    twitter?: string;
  };
  education?: string[];
  certifications?: string[];
  languages?: string[];
  availableHours?: string;
  featured?: boolean;
}

export interface TeamGridProps {
  members: TeamMember[];
  showFilters?: boolean;
  showSearch?: boolean;
  columns?: 2 | 3 | 4;
  className?: string;
}

export interface TeamMemberCardProps {
  member: TeamMember;
  variant?: 'default' | 'compact' | 'featured';
  showBio?: boolean;
  showContact?: boolean;
  className?: string;
  onContactClick?: (member: TeamMember) => void;
}

export type TeamSpecialty = 
  | 'Oftalmologia Geral'
  | 'Catarata'
  | 'Glaucoma'
  | 'Retina'
  | 'Córnea'
  | 'Estrabismo'
  | 'Oftalmopediatria'
  | 'Plástica Ocular'
  | 'Refração';

export type TeamRole = 
  | 'Médico Oftalmologista'
  | 'Optometrista'
  | 'Técnico em Óptica'
  | 'Enfermeiro'
  | 'Recepcionista'
  | 'Administração';
