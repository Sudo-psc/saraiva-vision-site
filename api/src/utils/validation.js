// Email validation utility
export const validateEmail = (email) => {
  if (!email) return false;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// URL validation utility
export const validateUrl = (url) => {
  if (!url) return false;

  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Text sanitization utility
export const sanitizeText = (text) => {
  if (!text || typeof text !== 'string') return '';

  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
};

// Length validation
export const validateLength = (text, min = 0, max = Infinity) => {
  if (!text || typeof text !== 'string') return false;

  return text.length >= min && text.length <= max;
};

// Required field validation
export const validateRequired = (fields) => {
  const errors = {};

  fields.forEach(field => {
    if (!field.value || field.value.toString().trim() === '') {
      errors[field.name] = `${field.label || field.name} é obrigatório`;
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Problem type validation
export const validateProblemType = (type) => {
  const validTypes = [
    'link-quebrado',
    'pagina-nao-encontrada',
    'erro-carregamento',
    'problema-navegacao',
    'outro'
  ];

  return validTypes.includes(type);
};