import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Hero from '../Hero';
import * as scrollUtils from '@/utils/scrollUtils';

// Mock dependencies
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => {
      const translations = {
        'hero.partner': 'Parceiro Oficial',
        'hero.title': 'Cuidando da sua visão com excelência',
        'hero.subtitle': 'Oftalmologia avançada e humanizada',
        'hero.services_button': 'Nossos Serviços',
        'ui.alt.hero_image': 'Hero Image',
        'hero.advanced_tech_title': 'Tecnologia Avançada',
        'hero.advanced_tech_desc': 'Equipamentos de última geração',
        'hero.patients_served': 'Mais de 5.000 pacientes atendidos com satisfação',
        'ui.alt.satisfied_patient_1': 'Paciente satisfeito 1',
        'ui.alt.satisfied_patient_2': 'Paciente satisfeito 2'
      };
      return translations[key] || key;
    }
  }),
  Trans: ({ children }) => children
}));

vi.mock('@/components/ui/OptimizedPicture', () => ({
  default: ({ src, alt, ...props }) => <img src={src} alt={alt} {...props} />
}));

vi.mock('@/components/ui/ImageWithFallback', () => ({
  default: ({ src, alt, ...props }) => <img src={src} alt={alt} {...props} />
}));

vi.mock('@/components/UnifiedCTA', () => ({
  default: ({ className }) => <button className={className}>Agendar Consulta</button>
}));

describe('Hero Component', () => {
  it('renders correctly', () => {
    render(
      <BrowserRouter>
        <Hero />
      </BrowserRouter>
    );

    // Check main title
    expect(screen.getByText(/Cuidando da sua/i)).toBeInTheDocument();
    
    // Check subtitle
    expect(screen.getByText('Oftalmologia avançada e humanizada')).toBeInTheDocument();
    
    // Check buttons
    expect(screen.getByText('Nossos Serviços')).toBeInTheDocument();
    expect(screen.getByText('Agendar Consulta')).toBeInTheDocument();
    
    // Check stats
    expect(screen.getByText('+5k')).toBeInTheDocument();
  });

  it('scrolls to services when button is clicked', () => {
    const smoothScrollSpy = vi.spyOn(scrollUtils, 'smoothScrollTo');
    
    render(
      <BrowserRouter>
        <Hero />
      </BrowserRouter>
    );

    const servicesButton = screen.getByText('Nossos Serviços');
    fireEvent.click(servicesButton);

    expect(smoothScrollSpy).toHaveBeenCalledWith('#services', expect.any(Object));
  });
});
