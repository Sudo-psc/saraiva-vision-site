import { env } from '@/utils/env';
// API client for services data
const API_BASE_URL = env.VITE_API_URL || 'https://31.97.129.78:3001/api';

export async function getServicesData() {
  try {
    const response = await fetch(`${API_BASE_URL}/servicos`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.services || data.data || data; // Handle different response structures
  } catch (error) {
    console.warn('API unavailable, using mock data:', error.message);
    // Fallback to mock data when API is unavailable
    return mockServicesData;
  }
}

// Fallback mock data for development/testing
export const mockServicesData = [
  {
    id: 'consultas-oftalmologicas',
    title: 'Consultas Oftalmológicas',
    description: 'Avaliação completa da saúde ocular com equipamentos modernos.',
    imageUrl: '/images/src/drphilipe_perfil.png',
    slug: 'consultas-oftalmologicas',
    category: 'Consultas'
  },
  {
    id: 'exames-diagnosticos',
    title: 'Exames Diagnósticos',
    description: 'Exames precisos para diagnóstico precoce de doenças oculares.',
    imageUrl: '/images/src/retina.jpeg',
    slug: 'exames-diagnosticos',
    category: 'Exames'
  },
  {
    id: 'cirurgias-especializadas',
    title: 'Cirurgias Especializadas',
    description: 'Procedimentos cirúrgicos com tecnologia de última geração.',
    imageUrl: '/images/src/catarata_cover.png',
    slug: 'cirurgias-especializadas',
    category: 'Cirurgias'
  },
  {
    id: 'oftalmologia-pediatrica',
    title: 'Oftalmologia Pediátrica',
    description: 'Cuidados especializados para a saúde ocular infantil.',
    imageUrl: '/images/src/avatar-female-blonde.png',
    slug: 'oftalmologia-pediatrica',
    category: 'Pediatria'
  }
];