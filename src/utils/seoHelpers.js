/**
 * SEO Utilities - Normalize SEO data for safe consumption
 */

/**
 * Normaliza keywords para string segura
 * @param {string|string[]|undefined|null} keywords
 * @returns {string}
 */
export function toKeywordString(keywords) {
  if (!keywords) return '';
  
  if (Array.isArray(keywords)) {
    return keywords
      .filter(k => typeof k === 'string' && k.trim())
      .join(', ');
  }
  
  if (typeof keywords === 'string') {
    return keywords.trim();
  }
  
  console.warn('[SEO] Invalid keywords type:', typeof keywords, keywords);
  return '';
}

/**
 * Normaliza objeto SEO completo
 * @param {object|undefined} seo
 * @returns {object}
 */
export function normalizeSEO(seo) {
  if (!seo || typeof seo !== 'object') {
    return {
      metaTitle: '',
      metaDescription: '',
      keywords: '',
    };
  }
  
  return {
    metaTitle: seo.metaTitle || seo.title || '',
    metaDescription: seo.metaDescription || seo.description || '',
    keywords: toKeywordString(seo.keywords),
  };
}

/**
 * Valida estrutura de SEO e retorna erros
 * @param {object} seo
 * @param {string} context - contexto para logging (ex: post slug)
 * @returns {string[]} - array de erros encontrados
 */
export function validateSEO(seo, context = 'unknown') {
  const errors = [];
  
  if (!seo) {
    errors.push(`[${context}] SEO object is missing`);
    return errors;
  }
  
  if (!seo.metaTitle && !seo.title) {
    errors.push(`[${context}] Missing metaTitle`);
  }
  
  if (!seo.metaDescription && !seo.description) {
    errors.push(`[${context}] Missing metaDescription`);
  }
  
  if (seo.keywords !== undefined && 
      !Array.isArray(seo.keywords) && 
      typeof seo.keywords !== 'string') {
    errors.push(`[${context}] Invalid keywords type: ${typeof seo.keywords}`);
  }
  
  return errors;
}
