// API client for services data
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://31.97.129.78:3001/api';

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
  },
  {
    id: 'blefaroplastia-jato-plasma',
    title: 'Blefaroplastia com Jato de Plasma',
    description: 'Procedimento não cirúrgico para rejuvenescer a área dos olhos, tratando flacidez e bolsas sem uso de bisturi.',
    imageUrl: '/icone_blefaroplastia_plasma.JPG',
    slug: 'blefaroplastia-jato-plasma',
    category: 'Cirurgias'
  },
  {
    id: 'remocao-xantelasma',
    title: 'Remoção de Xantelasma',
    description: 'Técnica segura para remover depósitos de colesterol ao redor dos olhos, melhorando a estética e o conforto.',
    imageUrl: '/icone_tx_xantelasma.png',
    slug: 'remocao-xantelasma',
    category: 'Tratamentos'
  },
  {
    id: 'tratamento-dpn',
    title: 'Tratamento de DPN',
    description: 'Método eficaz para eliminar Dermatose Papulosa Nigra (DPN), pequenas lesões benignas comuns no rosto e pescoço.',
    imageUrl: '/Icone_DPN.jpg',
    slug: 'tratamento-dpn',
    category: 'Tratamentos'
  }
];