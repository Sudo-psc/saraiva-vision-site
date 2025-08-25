import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import About from '../About';

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => {
      const mockTranslations = {
        'about.title': 'Sobre a Saraiva Vision',
        'about.subtitle': 'Nossa missão é cuidar da sua visão com excelência e humanização',
        'about.mission.title': 'Nossa Missão',
        'about.mission.description': 'Oferecer cuidados oftalmológicos de excelência...',
        'about.vision.title': 'Nossa Visão',
        'about.vision.description': 'Ser referência em saúde ocular...',
        'about.values.title': 'Nossos Valores',
        'about.values.excellence': 'Excelência',
        'about.values.excellence_desc': 'Compromisso com a qualidade...',
        'about.values.humanization': 'Humanização',
        'about.values.humanization_desc': 'Atendimento humanizado...',
        'about.values.innovation': 'Inovação',
        'about.values.innovation_desc': 'Tecnologia de ponta...',
        'about.team.title': 'Nossa Equipe',
        'about.team.description': 'Profissionais qualificados e experientes',
        'about.doctor.name': 'Dr. Philipe Cruz',
        'about.doctor.title': 'Oftalmologista',
        'about.doctor.description': 'Especialista em saúde ocular com anos de experiência...'
      };
      return mockTranslations[key] || key;
    },
    i18n: { language: 'pt' }
  })
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    section: ({ children, ...props }) => <section {...props}>{children}</section>,
    h1: ({ children, ...props }) => <h1 {...props}>{children}</h1>,
    h2: ({ children, ...props }) => <h2 {...props}>{children}</h2>,
    h3: ({ children, ...props }) => <h3 {...props}>{children}</h3>,
    p: ({ children, ...props }) => <p {...props}>{children}</p>,
    img: ({ children, ...props }) => <img {...props}>{children}</img>
  }
}));

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      {component}
    </BrowserRouter>
  );
};

describe('About Component', () => {
  it('renders about section with correct structure', () => {
    renderWithRouter(<About />);
    
    // Check main section exists
    const aboutSection = screen.getByText(/Sobre a Saraiva Vision/i).closest('section');
    expect(aboutSection).toBeInTheDocument();
    expect(aboutSection).toHaveAttribute('id', 'about');
  });

  it('displays main heading and subtitle', () => {
    renderWithRouter(<About />);
    
    const title = screen.getByRole('heading', { level: 2, name: /Sobre a Saraiva Vision/i });
    expect(title).toBeInTheDocument();
    
    const subtitle = screen.getByText(/Nossa missão é cuidar da sua visão/i);
    expect(subtitle).toBeInTheDocument();
  });

  it('displays mission section', () => {
    renderWithRouter(<About />);
    
    const missionTitle = screen.getByText(/Nossa Missão/i);
    expect(missionTitle).toBeInTheDocument();
    
    const missionDescription = screen.getByText(/Oferecer cuidados oftalmológicos/i);
    expect(missionDescription).toBeInTheDocument();
  });

  it('displays vision section', () => {
    renderWithRouter(<About />);
    
    const visionTitle = screen.getByText(/Nossa Visão/i);
    expect(visionTitle).toBeInTheDocument();
    
    const visionDescription = screen.getByText(/Ser referência em saúde ocular/i);
    expect(visionDescription).toBeInTheDocument();
  });

  it('displays values section with all values', () => {
    renderWithRouter(<About />);
    
    const valuesTitle = screen.getByText(/Nossos Valores/i);
    expect(valuesTitle).toBeInTheDocument();
    
    // Check individual values
    expect(screen.getByText(/Excelência/i)).toBeInTheDocument();
    expect(screen.getByText(/Compromisso com a qualidade/i)).toBeInTheDocument();
    
    expect(screen.getByText(/Humanização/i)).toBeInTheDocument();
    expect(screen.getByText(/Atendimento humanizado/i)).toBeInTheDocument();
    
    expect(screen.getByText(/Inovação/i)).toBeInTheDocument();
    expect(screen.getByText(/Tecnologia de ponta/i)).toBeInTheDocument();
  });

  it('displays team section', () => {
    renderWithRouter(<About />);
    
    const teamTitle = screen.getByText(/Nossa Equipe/i);
    expect(teamTitle).toBeInTheDocument();
    
    const teamDescription = screen.getByText(/Profissionais qualificados/i);
    expect(teamDescription).toBeInTheDocument();
  });

  it('displays doctor information', () => {
    renderWithRouter(<About />);
    
    const doctorName = screen.getByText(/Dr. Philipe Cruz/i);
    expect(doctorName).toBeInTheDocument();
    
    const doctorTitle = screen.getByText(/Oftalmologista/i);
    expect(doctorTitle).toBeInTheDocument();
    
    const doctorDescription = screen.getByText(/Especialista em saúde ocular/i);
    expect(doctorDescription).toBeInTheDocument();
  });

  it('has proper semantic structure', () => {
    renderWithRouter(<About />);
    
    // Check for proper heading hierarchy
    const h2Elements = screen.getAllByRole('heading', { level: 2 });
    expect(h2Elements.length).toBeGreaterThan(0);
    
    // Check for section structure
    const section = screen.getByText(/Sobre a Saraiva Vision/i).closest('section');
    expect(section).toBeInTheDocument();
  });

  it('has proper styling classes', () => {
    renderWithRouter(<About />);
    
    const section = screen.getByText(/Sobre a Saraiva Vision/i).closest('section');
    expect(section).toHaveClass('py-16');
    
    const container = section?.querySelector('.container');
    expect(container).toBeInTheDocument();
  });

  it('displays content in proper grid layout', () => {
    renderWithRouter(<About />);
    
    // Check for grid container
    const gridContainer = screen.getByText(/Nossa Missão/i).closest('.grid');
    expect(gridContainer).toBeInTheDocument();
  });

  it('includes proper responsive design classes', () => {
    renderWithRouter(<About />);
    
    const section = screen.getByText(/Sobre a Saraiva Vision/i).closest('section');
    const gridElements = section?.querySelectorAll('.grid');
    
    // Should have grid elements for responsive layout
    expect(gridElements.length).toBeGreaterThan(0);
  });
});