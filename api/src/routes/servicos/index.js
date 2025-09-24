// API endpoint for services data
// This should be deployed to your VPS at /api/servicos

const services = [
  {
    id: 'consultas-oftalmologicas',
    title: 'Consultas Oftalmológicas',
    description: 'Avaliação completa da saúde ocular com equipamentos modernos.',
    imageUrl: '/images/eye-consultation.jpg',
    slug: 'consultas-oftalmologicas',
    category: 'Consultas'
  },
  {
    id: 'exames-diagnosticos',
    title: 'Exames Diagnósticos',
    description: 'Exames precisos para diagnóstico precoce de doenças oculares.',
    imageUrl: '/images/diagnostic-exams.jpg',
    slug: 'exames-diagnosticos',
    category: 'Exames'
  },
  {
    id: 'cirurgias-especializadas',
    title: 'Cirurgias Especializadas',
    description: 'Procedimentos cirúrgicos com tecnologia de última geração.',
    imageUrl: '/images/surgeries.jpg',
    slug: 'cirurgias-especializadas',
    category: 'Cirurgias'
  },
  {
    id: 'oftalmologia-pediatrica',
    title: 'Oftalmologia Pediátrica',
    description: 'Cuidados especializados para a saúde ocular infantil.',
    imageUrl: '/images/pediatric-ophthalmology.jpg',
    slug: 'oftalmologia-pediatrica',
    category: 'Pediatria'
  }
];

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET, OPTIONS');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Simulate database delay
    await new Promise(resolve => setTimeout(resolve, 100));

    return res.status(200).json({
      services,
      total: services.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching services:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch services data'
    });
  }
}