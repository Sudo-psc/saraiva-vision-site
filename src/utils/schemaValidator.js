// Validador de Schema.org para garantir dados estruturados corretos

export const isValidSchema = (schema) => {
  if (!schema || typeof schema !== 'object') {
    return false;
  }
  
  try {
    // Verificações básicas de estrutura Schema.org
    if (!schema['@context'] || !schema['@type']) {
      console.warn('❌ Schema inválido: @context ou @type ausente');
      return false;
    }
    
    // Verificar se é um @graph válido
    if (schema['@graph']) {
      if (!Array.isArray(schema['@graph'])) {
        console.warn('❌ Schema inválido: @graph deve ser array');
        return false;
      }
      
      // Validar cada item do graph
      for (const item of schema['@graph']) {
        if (!item['@type']) {
          console.warn('❌ Schema inválido: item do @graph sem @type');
          return false;
        }
      }
    }
    
    // Verificar se o JSON é serializável (sem referências circulares)
    JSON.stringify(schema);
    
    return true;
  } catch (error) {
    console.error('❌ Erro na validação do schema:', error);
    return false;
  }
};

// Validador específico para schemas médicos
export const validateMedicalSchema = (schema) => {
  if (!isValidSchema(schema)) {
    return false;
  }
  
  try {
    const items = schema['@graph'] || [schema];
    
    for (const item of items) {
      // Validar MedicalClinic
      if (item['@type'] === 'MedicalClinic') {
        const required = ['name', 'address', 'telephone'];
        const missing = required.filter(field => !item[field]);
        
        if (missing.length > 0) {
          console.warn(`❌ MedicalClinic schema incompleto: ${missing.join(', ')} ausente(s)`);
          return false;
        }
      }
      
      // Validar Physician
      if (item['@type'] === 'Physician') {
        if (!item.name || !item.medicalSpecialty) {
          console.warn('❌ Physician schema incompleto: name ou medicalSpecialty ausente');
          return false;
        }
      }
      
      // Validar FAQPage
      if (item['@type'] === 'FAQPage') {
        if (!item.mainEntity || !Array.isArray(item.mainEntity)) {
          console.warn('❌ FAQPage schema inválido: mainEntity deve ser array');
          return false;
        }
      }
    }
    
    return true;
  } catch (error) {
    console.error('❌ Erro na validação médica do schema:', error);
    return false;
  }
};

// Logger para desenvolvimento
export const logSchemaValidation = (schema, context = '') => {
  if (process.env.NODE_ENV === 'development') {
    const isValid = validateMedicalSchema(schema);
    const status = isValid ? '✅' : '❌';
    console.log(`${status} Schema validation ${context}:`, {
      valid: isValid,
      types: extractSchemaTypes(schema),
      size: JSON.stringify(schema).length
    });
  }
};

// Extrator de tipos de schema para debug
const extractSchemaTypes = (schema) => {
  if (schema['@graph']) {
    return schema['@graph'].map(item => item['@type']).filter(Boolean);
  }
  return schema['@type'] ? [schema['@type']] : [];
};