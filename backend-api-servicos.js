// ===========================================
// API ENDPOINT PARA SERVIÇOS - SARAIVA VISION
// ===========================================
// Este arquivo deve ser integrado ao seu backend Node.js/Express
// Localização sugerida: routes/api/servicos.js ou api/servicos/index.js

const express = require('express');
const router = express.Router();

// Dados dos serviços oftalmológicos
const servicesData = [
  {
    id: 'consultas-oftalmologicas',
    title: 'Consultas Oftalmológicas',
    description: 'Avaliação completa da saúde ocular com equipamentos modernos e tecnologia de ponta.',
    imageUrl: '/images/src/drphilipe_perfil.png',
    slug: 'consultas-oftalmologicas',
    category: 'Consultas',
    duration: '45-60 minutos',
    price: 'A partir de R$ 150'
  },
  {
    id: 'exames-diagnosticos',
    title: 'Exames Diagnósticos',
    description: 'Exames precisos para diagnóstico precoce de doenças oculares com equipamentos de última geração.',
    imageUrl: '/images/src/retina.jpeg',
    slug: 'exames-diagnosticos',
    category: 'Exames',
    duration: '20-45 minutos',
    price: 'A partir de R$ 80'
  },
  {
    id: 'cirurgias-especializadas',
    title: 'Cirurgias Especializadas',
    description: 'Procedimentos cirúrgicos com tecnologia de última geração e equipe especializada.',
    imageUrl: '/images/src/catarata_cover.png',
    slug: 'cirurgias-especializadas',
    category: 'Cirurgias',
    duration: '45-120 minutos',
    price: 'Consulte valores'
  },
  {
    id: 'oftalmologia-pediatrica',
    title: 'Oftalmologia Pediátrica',
    description: 'Cuidados especializados para a saúde ocular infantil com abordagem lúdica e cuidadosa.',
    imageUrl: '/images/avatar-female-blonde.webp',
    slug: 'oftalmologia-pediatrica',
    category: 'Pediatria',
    duration: '30-45 minutos',
    price: 'A partir de R$ 120'
  },
  {
    id: 'tratamentos-laser',
    title: 'Tratamentos a Laser',
    description: 'Tratamentos modernos com laser para correção de visão e tratamento de doenças.',
    imageUrl: '/images/ceratocone_cover.webp',
    slug: 'tratamentos-laser',
    category: 'Tratamentos',
    duration: '15-30 minutos',
    price: 'A partir de R$ 200'
  },
  {
    id: 'lentes-de-contato',
    title: 'Adaptação de Lentes de Contato',
    description: 'Avaliação e adaptação personalizada de lentes de contato para melhor conforto visual.',
    imageUrl: '/images/lentes_contato_cover.webp',
    slug: 'lentes-de-contato',
    category: 'Lentes',
    duration: '60-90 minutos',
    price: 'A partir de R$ 180'
  }
];

// GET /api/servicos - Lista todos os serviços
router.get('/servicos', (req, res) => {
  try {
    // Headers CORS para Vercel
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours

    // Simular delay de banco de dados
    setTimeout(() => {
      res.status(200).json({
        success: true,
        services: servicesData,
        total: servicesData.length,
        timestamp: new Date().toISOString(),
        message: 'Serviços carregados com sucesso'
      });
    }, 100); // 100ms delay

  } catch (error) {
    console.error('Erro ao buscar serviços:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: 'Não foi possível carregar os serviços',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/servicos/:id - Busca serviço específico por ID
router.get('/servicos/:id', (req, res) => {
  try {
    const { id } = req.params;
    const service = servicesData.find(s => s.id === id);

    // Headers CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (!service) {
      return res.status(404).json({
        success: false,
        error: 'Serviço não encontrado',
        message: `Nenhum serviço encontrado com ID: ${id}`,
        timestamp: new Date().toISOString()
      });
    }

    res.status(200).json({
      success: true,
      service,
      timestamp: new Date().toISOString(),
      message: 'Serviço encontrado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao buscar serviço específico:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: 'Não foi possível carregar o serviço',
      timestamp: new Date().toISOString()
    });
  }
});

// OPTIONS /api/servicos - Para preflight CORS
router.options('/servicos', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Max-Age', '86400');
  res.status(204).end();
});

// OPTIONS /api/servicos/:id - Para preflight CORS
router.options('/servicos/:id', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400');
  res.status(204).end();
});

module.exports = router;