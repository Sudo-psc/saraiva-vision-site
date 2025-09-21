// Complete /api/servicos endpoint implementation for VPS
// This should be placed in /var/www/saraiva-vision-backend/api/src/routes/servicos.js

const express = require('express');
const router = express.Router();

// Mock services data - you can replace this with database queries
const servicesData = {
  services: [
    {
      id: 'consultas-oftalmologicas',
      title: 'Consultas Oftalmológicas',
      description: 'Avaliação completa da saúde ocular com equipamentos modernos e tecnologia de ponta para diagnóstico preciso.',
      fullDescription: 'Nossas consultas oftalmológicas oferecem avaliação completa da saúde ocular, combinando experiência clínica com tecnologia de última geração. Cada consulta inclui histórico médico detalhado, exame ocular completo, medição de pressão intraocular e avaliação de fundo de olho para garantir diagnóstico preciso e tratamento personalizado.',
      imageUrl: '/images/eye-consultation.jpg',
      slug: 'consultas-oftalmologicas',
      category: 'Consultas',
      duration: '30-45 minutos',
      price: 'A partir de R$ 150',
      included: [
        'Avaliação completa da visão',
        'Medição de pressão ocular',
        'Exame de fundo de olho',
        'Prescrição médica',
        'Orientações personalizadas'
      ],
      preparation: 'Leve óculos e lentes de contato atuais, lista de medicamentos em uso.',
      doctor: 'Dr. Philipe Saraiva (CRM-MG 69.870)'
    },
    {
      id: 'exames-diagnosticos',
      title: 'Exames Diagnósticos',
      description: 'Exames precisos para diagnóstico precoce de doenças oculares com tecnologia avançada.',
      fullDescription: 'Realizamos exames diagnósticos de alta precisão utilizando equipamentos modernos para detecção precoce de doenças oculares. Nossa tecnologia inclui tomografia de córnea, topografia, paquimetria ultrassônica e campos visuais computadorizados.',
      imageUrl: '/images/diagnostic-exams.jpg',
      slug: 'exames-diagnosticos',
      category: 'Exames',
      duration: '45-60 minutos',
      price: 'A partir de R$ 200',
      included: [
        'Tomografia de córnea',
        'Topografia ocular',
        'Paquimetria ultrassônica',
        'Campo visual computadorizado',
        'Laudo técnico detalhado'
      ],
      preparation: 'Não dirigir após o exame, trazer acompanhante se necessário.',
      doctor: 'Dr. Philipe Saraiva (CRM-MG 69.870)'
    },
    {
      id: 'cirurgias-especializadas',
      title: 'Cirurgias Especializadas',
      description: 'Procedimentos cirúrgicos com tecnologia de última geração e segurança máxima.',
      fullDescription: 'Nossas cirurgias oftalmológicas utilizam técnicas microinvasivas com tecnologia de última geração para garantir segurança máxima e excelentes resultados. Realizamos cirurgias de catarata, refrativas, glaucoma e retina com equipamentos modernos.',
      imageUrl: '/images/surgeries.jpg',
      slug: 'cirurgias-especializadas',
      category: 'Cirurgias',
      duration: 'Varia conforme procedimento',
      price: 'Consulta individualizada',
      included: [
        'Avaliação pré-operatória completa',
        'Cirurgia com tecnologia moderna',
        'Acompanhamento pós-operatório',
        'Medicamentos pós-cirúrgicos',
        'Suporte 24h emergências'
      ],
      preparation: 'Exames pré-operatórios, jejum conforme orientação médica, acompanhante obrigatório.',
      doctor: 'Dr. Philipe Saraiva (CRM-MG 69.870)'
    },
    {
      id: 'oftalmologia-pediatrica',
      title: 'Oftalmologia Pediátrica',
      description: 'Cuidados especializados para a saúde ocular infantil com abordagem diferenciada.',
      fullDescription: 'Atendimento oftalmológico pediátrico especializado com abordagem lúdica e acolhedora. Nossa equipe é treinada para atender crianças de todas as idades, desde recém-nascidos até adolescentes, com exames adaptados para cada faixa etária.',
      imageUrl: '/images/pediatric-ophthalmology.jpg',
      slug: 'oftalmologia-pediatrica',
      category: 'Pediatria',
      duration: '30-45 minutos',
      price: 'A partir de R$ 180',
      included: [
        'Teste do reflexo vermelho',
        'Avaliação do desenvolvimento visual',
        'Medição de refração infantil',
        'Orientação aos pais',
        'Acompanhamento do crescimento'
      ],
      preparation: 'Trazir brinquedos preferidos, horário adequado para criança (manhã geralmente melhor).',
      doctor: 'Dr. Philipe Saraiva (CRM-MG 69.870)'
    },
    {
      id: 'adaptacao-lentes-contato',
      title: 'Adaptação de Lentes de Contato',
      description: 'Especialistas em adaptação de lentes de contato com tecnologia avançada e acompanhamento personalizado.',
      fullDescription: 'Serviço completo de adaptação de lentes de contato com tecnologia de ponta e acompanhamento personalizado. Trabalhamos com diversas marcas e tipos de lentes, incluindo gelatinosas, rígidas gás permeáveis, tóricas e multifocais.',
      imageUrl: '/images/contact-lenses.jpg',
      slug: 'adaptacao-lentes-contato',
      category: 'Lentes',
      duration: '60-90 minutos',
      price: 'A partir de R$ 250',
      included: [
        'Avaliação corneana completa',
        'Topografia ocular',
        'Teste de lentes de teste',
        'Treinamento de inserção/remoção',
        'Acompanhamento pós-adaptação'
      ],
      preparation: 'Vir sem maquiagem, evitar uso de lentes 24h antes, trazer óculos atuais.',
      doctor: 'Dr. Philipe Saraiva (CRM-MG 69.870)'
    },
    {
      id: 'tratamento-glaucoma',
      title: 'Tratamento de Glaucoma',
      description: 'Diagnóstico e tratamento avançado de glaucoma com monitoramento contínuo e tecnologia moderna.',
      fullDescription: 'Tratamento completo de glaucoma com diagnóstico precoce e acompanhamento contínuo. Utilizamos tecnologia moderna para tonometria, campimetria e imagem de nervo óptico, além de tratamento clínico e cirúrgico quando necessário.',
      imageUrl: '/images/glaucoma-treatment.jpg',
      slug: 'tratamento-glaucoma',
      category: 'Tratamentos',
      duration: '45-60 minutos',
      price: 'A partir de R$ 220',
      included: [
        'Tonometria computadorizada',
        'Campo visual computadorizado',
        'OCT de nervo óptico',
        'Gonioscopia',
        'Plano terapêutico personalizado'
      ],
      preparation: 'Jejum não necessário, trazer exames anteriores se disponíveis.',
      doctor: 'Dr. Philipe Saraiva (CRM-MG 69.870)'
    }
  ]
};

// GET /api/servicos - Get all services
router.get('/', async (req, res) => {
  try {
    // Add cache headers for better performance
    res.set('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    res.set('ETag', `"${Date.now()}"`);

    // Simulate database delay
    await new Promise(resolve => setTimeout(resolve, 100));

    res.json({
      success: true,
      message: 'Services retrieved successfully',
      data: servicesData.services,
      count: servicesData.services.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// GET /api/servicos/:id - Get specific service
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const service = servicesData.services.find(s => s.id === id || s.slug === id);

    if (!service) {
      return res.status(404).json({
        success: false,
        error: 'Service not found',
        message: `Service with ID '${id}' not found`
      });
    }

    res.set('Cache-Control', 'public, max-age=3600');
    res.json({
      success: true,
      message: 'Service retrieved successfully',
      data: service,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching service:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// GET /api/servicos/category/:category - Get services by category
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const filteredServices = servicesData.services.filter(s =>
      s.category.toLowerCase() === category.toLowerCase()
    );

    res.set('Cache-Control', 'public, max-age=3600');
    res.json({
      success: true,
      message: `Services in category '${category}' retrieved successfully`,
      data: filteredServices,
      count: filteredServices.length,
      category: category,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching services by category:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// POST /api/servicos/search - Search services
router.post('/search', async (req, res) => {
  try {
    const { query, category, maxPrice } = req.body;

    let filteredServices = servicesData.services;

    if (query) {
      const searchTerm = query.toLowerCase();
      filteredServices = filteredServices.filter(service =>
        service.title.toLowerCase().includes(searchTerm) ||
        service.description.toLowerCase().includes(searchTerm) ||
        service.category.toLowerCase().includes(searchTerm)
      );
    }

    if (category) {
      filteredServices = filteredServices.filter(service =>
        service.category.toLowerCase() === category.toLowerCase()
      );
    }

    res.json({
      success: true,
      message: 'Services search completed',
      data: filteredServices,
      count: filteredServices.length,
      search: { query, category, maxPrice },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error searching services:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

module.exports = router;