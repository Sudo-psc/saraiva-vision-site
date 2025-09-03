import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import About from '../About';

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => {
      const mockTranslations = {
        'about.tag': 'Sobre Nós',
        'about.title': 'Dedicados à Excelência em Cada Detalhe da Sua Visão',
        'about.p1': 'A Saraiva Vision nasceu do sonho de oferecer um atendimento oftalmológico de alta qualidade em Caratinga e região, unindo tecnologia de ponta a uma abordagem humana e personalizada.',
        'about.p2': 'Nossa missão transcende o simples tratamento de doenças oculares. Acreditamos na prevenção como o melhor caminho para preservar a visão.',
        'about.p3': 'Como parceiros oficiais da rede Amor e Saúde, mantemos os mais altos padrões de qualidade e segurança.',
        'about.features': [
          'Infraestrutura Moderna e Equipada',
          'Profissionais Altamente Qualificados',
          'Atendimento Humanizado e Personalizado',
          'Compromisso com Resultados Duradouros',
          'Tecnologia de Ponta em Diagnósticos',
          'Parceria com Rede Amor e Saúde'
        ],
        'about.alt1': 'Consultório oftalmológico moderno da Saraiva Vision',
        'about.alt2': 'Dr. Philipe Saraiva realizando exame oftalmológico detalhado',
        'about.alt3': 'Paciente satisfeito após consulta na Saraiva Vision',
        'about.alt4': 'Equipamento oftalmológico de última geração',
        'about.doctor.heading': 'Conheça o Dr. Philipe',
        'about.doctor.name': 'Dr. Philipe Saraiva',
        'about.doctor.title': 'Oftalmologista CRM/MG 69.870',
        'about.doctor.alt': 'Dr. Philipe Saraiva, oftalmologista especialista',
        'about.doctor.description': 'Com anos de experiência em oftalmologia, o Dr. Philipe Saraiva é especialista em diagnóstico e tratamento de diversas condições oculares.'
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
    const aboutSection = screen.getByText(/Dedicados à Excelência em Cada Detalhe da Sua Visão/i).closest('section');
    expect(aboutSection).toBeInTheDocument();
    expect(aboutSection).toHaveAttribute('id', 'about');
  });

  it('displays main heading and subtitle', () => {
    renderWithRouter(<About />);
    
    const title = screen.getByRole('heading', { level: 2, name: /Dedicados à Excelência em Cada Detalhe da Sua Visão/i });
    expect(title).toBeInTheDocument();
    
    const subtitle = screen.getByText(/A Saraiva Vision nasceu do sonho de oferecer/i);
    expect(subtitle).toBeInTheDocument();
  });

  it('displays first paragraph', () => {
    renderWithRouter(<About />);
    
    const firstParagraph = screen.getByText(/A Saraiva Vision nasceu do sonho de oferecer/i);
    expect(firstParagraph).toBeInTheDocument();
  });

  it('displays second paragraph', () => {
    renderWithRouter(<About />);
    
    const secondParagraph = screen.getByText(/Nossa missão transcende o simples tratamento/i);
    expect(secondParagraph).toBeInTheDocument();
  });

  it('displays features section with all features', () => {
    renderWithRouter(<About />);
    
    // Check individual features
    expect(screen.getByText(/Infraestrutura Moderna e Equipada/i)).toBeInTheDocument();
    expect(screen.getByText(/Profissionais Altamente Qualificados/i)).toBeInTheDocument();
    expect(screen.getByText(/Atendimento Humanizado e Personalizado/i)).toBeInTheDocument();
    expect(screen.getByText(/Compromisso com Resultados Duradouros/i)).toBeInTheDocument();
    expect(screen.getByText(/Tecnologia de Ponta em Diagnósticos/i)).toBeInTheDocument();
    expect(screen.getByText(/Parceria com Rede Amor e Saúde/i)).toBeInTheDocument();
  });

  it('displays doctor section heading', () => {
    renderWithRouter(<About />);
    
    const doctorHeading = screen.getByText(/Conheça o Dr. Philipe/i);
    expect(doctorHeading).toBeInTheDocument();
  });

  it('displays doctor information', () => {
    renderWithRouter(<About />);
    
    const doctorName = screen.getByText(/Dr. Philipe Saraiva/i);
    expect(doctorName).toBeInTheDocument();
    
    const doctorTitle = screen.getByText(/Oftalmologista CRM\/MG 69\.870/i);
    expect(doctorTitle).toBeInTheDocument();
    
    const doctorDescription = screen.getByText(/Com anos de experiência em oftalmologia/i);
    expect(doctorDescription).toBeInTheDocument();
  });

  it('has proper semantic structure', () => {
    renderWithRouter(<About />);
    
    // Check for proper heading hierarchy
    const h2Elements = screen.getAllByRole('heading', { level: 2 });
    expect(h2Elements.length).toBeGreaterThan(0);
    
    // Check for section structure
    const section = screen.getByText(/Dedicados à Excelência em Cada Detalhe da Sua Visão/i).closest('section');
    expect(section).toBeInTheDocument();
  });

  it('has proper styling classes', () => {
    renderWithRouter(<About />);
    
    const section = screen.getByText(/Dedicados à Excelência em Cada Detalhe da Sua Visão/i).closest('section');
    expect(section).toHaveClass('py-20');
    
    const container = section?.querySelector('.container');
    expect(container).toBeInTheDocument();
  });

  it('displays content in proper grid layout', () => {
    renderWithRouter(<About />);
    
    // Check for grid container
    const gridContainer = screen.getByText(/Infraestrutura Moderna e Equipada/i).closest('.grid');
    expect(gridContainer).toBeInTheDocument();
  });

  it('includes proper responsive design classes', () => {
    renderWithRouter(<About />);
    
    const section = screen.getByText(/Dedicados à Excelência em Cada Detalhe da Sua Visão/i).closest('section');
    const gridElements = section?.querySelectorAll('.grid');
    
    // Should have grid elements for responsive layout
    expect(gridElements.length).toBeGreaterThan(0);
  });
});