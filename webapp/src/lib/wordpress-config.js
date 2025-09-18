/**
 * Configuração WordPress para Clínica Saraiva Vision
 * Gerencia diferentes ambientes e URLs da API
 */

// Configurações por ambiente
const environments = {
  development: {
    name: 'Desenvolvimento Local',
    wordpressUrl: 'http://localhost:8081/wp-json/wp/v2', // Servidor mock
    timeout: 5000,
    retries: 2,
    useFallback: true
  },
  
  staging: {
    name: 'Ambiente de Teste',
    wordpressUrl: 'https://staging.clinicasaraivavision.com.br/wp-json/wp/v2',
    timeout: 10000,
    retries: 3,
    useFallback: true
  },
  
  production: {
    name: 'Produção',
    wordpressUrl: 'https://clinicasaraivavision.com.br/wp-json/wp/v2',
    timeout: 15000,
    retries: 5,
    useFallback: true
  }
};

// Obter configuração atual baseada no ambiente
function getCurrentEnvironmentConfig() {
  const env = import.meta.env.MODE || process.env.NODE_ENV || 'development';
  const config = environments[env] || environments.development;
  
  // Override com variáveis de ambiente se disponíveis
  if (import.meta.env.VITE_WORDPRESS_API_URL) {
    config.wordpressUrl = import.meta.env.VITE_WORDPRESS_API_URL;
  }
  
  return {
    ...config,
    environment: env,
    customUrl: !!import.meta.env.VITE_WORDPRESS_API_URL
  };
}

// Configurações da Clínica Saraiva Vision
const clinicConfig = {
  name: 'Clínica Saraiva Vision',
  location: 'Caratinga, MG',
  doctor: {
    name: 'Dr. Philipe Saraiva Cruz',
    crm: 'CRM-MG 69.870',
    specialty: 'Oftalmologia'
  },
  nurse: {
    name: 'Ana Lúcia',
    specialty: 'Enfermagem Oftalmológica'
  },
  partnership: 'Clínica Amor e Saúde',
  
  // Serviços oferecidos (para categorização de posts)
  services: [
    'consultas-oftalmologicas',
    'refracao',
    'paquimetria', 
    'mapeamento-retina',
    'biometria',
    'retinografia',
    'topografia-corneana',
    'meiobografia',
    'teste-jones',
    'teste-schirmer',
    'lentes-contato'
  ],
  
  // Configurações de SEO médico
  seo: {
    businessType: 'MedicalBusiness',
    medicalSpecialty: 'Ophthalmology',
    priceRange: '$$',
    languages: ['pt-BR'],
    serviceArea: {
      city: 'Caratinga',
      state: 'Minas Gerais',
      country: 'Brazil'
    }
  }
};

// Headers específicos para requisições médicas
const getApiHeaders = () => ({
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'X-Requested-With': 'XMLHttpRequest',
  'User-Agent': `${clinicConfig.name} Website/2.0`,
  // Headers para compliance médico
  'X-Medical-Compliance': 'CFM-LGPD',
  'X-Healthcare-Provider': clinicConfig.doctor.crm
});

// Função para detectar problemas comuns de configuração
function validateWordPressSetup(url) {
  const issues = [];
  const recommendations = [];
  
  if (!url || url === '') {
    issues.push('URL do WordPress não configurada');
    recommendations.push('Definir VITE_WORDPRESS_API_URL no arquivo .env');
    return { valid: false, issues, recommendations };
  }
  
  try {
    const urlObj = new URL(url);
    
    // Verificações específicas para ambiente médico
    if (urlObj.protocol !== 'https:' && !urlObj.hostname.includes('localhost')) {
      issues.push('WordPress não está usando HTTPS');
      recommendations.push('Configurar SSL/TLS para proteção de dados médicos (LGPD)');
    }
    
    if (!url.includes('/wp-json/wp/v2')) {
      issues.push('URL não aponta para API REST v2');
      recommendations.push('Verificar se WordPress REST API está ativo');
    }
    
    if (urlObj.hostname.includes('staging') || urlObj.hostname.includes('test')) {
      recommendations.push('Lembrar de usar URL de produção antes do deploy');
    }
    
  } catch (error) {
    issues.push(`URL malformada: ${error.message}`);
    recommendations.push('Verificar formato da URL (deve incluir protocolo)');
  }
  
  return {
    valid: issues.length === 0,
    issues,
    recommendations
  };
}

// Export das configurações
export {
  environments,
  getCurrentEnvironmentConfig,
  clinicConfig,
  getApiHeaders,
  validateWordPressSetup
};

// Default export da configuração atual
export default getCurrentEnvironmentConfig();