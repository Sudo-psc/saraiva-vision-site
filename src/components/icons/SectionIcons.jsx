import React from 'react';
import {
  Home,
  Stethoscope,
  Eye,
  FileText,
  Headphones,
  User,
  Star,
  HelpCircle,
  Phone,
  MapPin,
  Mail,
  Clock,
  Shield,
  Award,
  Users,
  CheckCircle,
  Calendar,
  MessageCircle,
  Bot,
  Globe,
  Instagram,
  Facebook,
  Linkedin,
  Twitter,
  Building,
  Heart,
  Target,
  Lightbulb
} from 'lucide-react';

// Mapeamento de ícones para diferentes seções do site
export const sectionIcons = {
  // Navegação principal
  home: Home,
  services: Stethoscope,
  lenses: Eye,
  blog: FileText,
  podcast: Headphones,
  about: User,
  testimonials: Star,
  faq: HelpCircle,
  contact: Phone,

  // Informações de contato
  location: MapPin,
  email: Mail,
  schedule: Clock,
  phone: Phone,
  whatsapp: MessageCircle,
  chatbot: Bot,
  website: Globe,

  // Redes sociais
  instagram: Instagram,
  facebook: Facebook,
  linkedin: Linkedin,
  twitter: Twitter,

  // Sinais de confiança
  security: Shield,
  quality: Award,
  patients: Users,
  certification: CheckCircle,

  // CTAs e botões
  appointment: Calendar,
  message: MessageCircle,

  // Sobre a clínica
  mission: Target,
  vision: Eye,
  values: Heart,
  innovation: Lightbulb,
  facility: Building
};

// Componente para renderizar ícone por nome
export const SectionIcon = ({
  name,
  size = 20,
  className = "",
  ...props
}) => {
  const IconComponent = sectionIcons[name];

  if (!IconComponent) {
    console.warn(`Ícone '${name}' não encontrado em sectionIcons`);
    return null;
  }

  return (
    <IconComponent
      size={size}
      className={className}
      {...props}
    />
  );
};

// Hook para obter ícone por nome
export const useSectionIcon = (name) => {
  return sectionIcons[name] || null;
};

export default SectionIcon;