/**
 * Configuração WordPress para Clínica Saraiva Vision
 * Gerencia diferentes ambientes e URLs da API
 */

// Configurações por ambiente
// WordPress é sempre externo via API (cms.saraivavision.com.br)
const environments = {
  development: {
    name: 'Desenvolvimento Local',
    wordpressUrl: 'https://cms.saraivavision.com.br/wp-json/wp/v2', // External API
    timeout: 5000,
    retries: 2,
    useFallback: true
  },

  staging: {
    name: 'Ambiente de Teste',
    wordpressUrl: 'https://cms.saraivavision.com.br/wp-json/wp/v2', // External API
    timeout: 10000,
    retries: 3,
    useFallback: true
  },

  production: {
    name: 'Produção',
    wordpressUrl: 'https://cms.saraivavision.com.br/wp-json/wp/v2', // External API
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
const getApiHeaders = (includeAuth = false) => {
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    'User-Agent': `${clinicConfig.name} Website/2.0`,
    // Headers para compliance médico
    'X-Medical-Compliance': 'CFM-LGPD',
    'X-Healthcare-Provider': clinicConfig.doctor.crm
  };

  // Adicionar JWT authentication se solicitado e token disponível
  if (includeAuth) {
    try {
      // Tentar obter token do localStorage (client-side)
      const authToken = localStorage.getItem('wp_jwt_token');
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }
    } catch (error) {
      // localStorage pode não estar disponível em alguns contextos (server-side)
      console.warn('Unable to access localStorage for JWT token:', error.message);
    }
  }

  return headers;
};

// Função para obter token JWT (client-side)
const getJWTToken = () => {
  try {
    return localStorage.getItem('wp_jwt_token');
  } catch (error) {
    console.warn('Unable to access localStorage for JWT token:', error.message);
    return null;
  }
};

// Função para definir token JWT (client-side)
const setJWTToken = (token) => {
  try {
    if (token) {
      localStorage.setItem('wp_jwt_token', token);
    } else {
      localStorage.removeItem('wp_jwt_token');
    }
    return true;
  } catch (error) {
    console.error('Failed to store JWT token:', error.message);
    return false;
  }
};

// Função para autenticar e obter token JWT
const authenticateWithWordPress = async (username, password) => {
  const config = getCurrentEnvironmentConfig();
  const authUrl = config.wordpressUrl.replace('/wp/v2', '/jwt-auth/v1/token');

  try {
    const response = await fetch(authUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        password
      })
    });

    if (!response.ok) {
      throw new Error(`Authentication failed: ${response.status}`);
    }

    const data = await response.json();

    if (data.token) {
      setJWTToken(data.token);
      return {
        success: true,
        token: data.token,
        user: data.user_display_name || username
      };
    } else {
      throw new Error('No token received from authentication server');
    }
  } catch (error) {
    console.error('WordPress authentication error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Função para verificar se token é válido
const validateJWTToken = async (token) => {
  const config = getCurrentEnvironmentConfig();
  const validateUrl = config.wordpressUrl.replace('/wp/v2', '/jwt-auth/v1/token/validate');

  try {
    const response = await fetch(validateUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      return { valid: false, error: 'Token validation failed' };
    }

    const data = await response.json();
    return { valid: data.code === 'jwt_auth_valid_token', data };
  } catch (error) {
    console.error('JWT token validation error:', error);
    return { valid: false, error: error.message };
  }
};

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