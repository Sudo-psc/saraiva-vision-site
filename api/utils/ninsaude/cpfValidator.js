/**
 * CPF Validator Utility
 *
 * Implements Brazilian CPF (Cadastro de Pessoas Físicas) validation
 * according to Receita Federal algorithm.
 *
 * Zero external dependencies as per research.md decision.
 */

/**
 * List of known invalid CPFs (all same digits)
 */
const INVALID_CPFS = [
  '00000000000',
  '11111111111',
  '22222222222',
  '33333333333',
  '44444444444',
  '55555555555',
  '66666666666',
  '77777777777',
  '88888888888',
  '99999999999',
];

/**
 * Validates CPF format and check digits
 *
 * @param {string} cpf - CPF to validate (formatted or unformatted)
 * @returns {boolean} True if CPF is valid
 *
 * @example
 * validateCPF('123.456.789-09') // true/false
 * validateCPF('12345678909')     // true/false
 */
export function validateCPF(cpf) {
  if (!cpf || typeof cpf !== 'string') {
    return false;
  }

  // Remove formatting
  const cleaned = unformatCPF(cpf);

  // Check length
  if (cleaned.length !== 11) {
    return false;
  }

  // Check if all digits are the same (invalid CPFs)
  if (INVALID_CPFS.includes(cleaned)) {
    return false;
  }

  // Validate using check digit algorithm (modulo 11)
  return validateCheckDigits(cleaned);
}

/**
 * Validates CPF check digits using modulo 11 algorithm
 *
 * @param {string} cpf - Unformatted CPF (11 digits)
 * @returns {boolean} True if check digits are valid
 */
function validateCheckDigits(cpf) {
  // Calculate first check digit
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf[i], 10) * (10 - i);
  }
  let checkDigit1 = 11 - (sum % 11);
  if (checkDigit1 >= 10) {
    checkDigit1 = 0;
  }

  // Verify first check digit
  if (parseInt(cpf[9], 10) !== checkDigit1) {
    return false;
  }

  // Calculate second check digit
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf[i], 10) * (11 - i);
  }
  let checkDigit2 = 11 - (sum % 11);
  if (checkDigit2 >= 10) {
    checkDigit2 = 0;
  }

  // Verify second check digit
  return parseInt(cpf[10], 10) === checkDigit2;
}

/**
 * Formats CPF to standard Brazilian format (###.###.###-##)
 *
 * @param {string} cpf - Unformatted CPF
 * @returns {string} Formatted CPF
 *
 * @example
 * formatCPF('12345678909') // '123.456.789-09'
 */
export function formatCPF(cpf) {
  if (!cpf || typeof cpf !== 'string') {
    return '';
  }

  const cleaned = unformatCPF(cpf);

  if (cleaned.length !== 11) {
    return cpf; // Return original if invalid length
  }

  return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

/**
 * Removes formatting from CPF (leaves only digits)
 *
 * @param {string} cpf - Formatted or unformatted CPF
 * @returns {string} CPF with only digits
 *
 * @example
 * unformatCPF('123.456.789-09') // '12345678909'
 * unformatCPF('123 456 789 09') // '12345678909'
 */
export function unformatCPF(cpf) {
  if (!cpf || typeof cpf !== 'string') {
    return '';
  }

  return cpf.replace(/[^\d]/g, '');
}

/**
 * Checks if CPF is in valid format (###.###.###-##)
 *
 * @param {string} cpf - CPF to check
 * @returns {boolean} True if formatted correctly
 *
 * @example
 * isValidFormat('123.456.789-09') // true
 * isValidFormat('12345678909')     // false
 */
export function isValidFormat(cpf) {
  if (!cpf || typeof cpf !== 'string') {
    return false;
  }

  const formatRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
  return formatRegex.test(cpf);
}

/**
 * Format CEP (Brazilian postal code) to standard format
 * 
 * @param {string} cep - CEP to format (5 or 8 digits)
 * @returns {string} Formatted CEP (XXXXX-XXX)
 * 
 * @example
 * formatCEP('12345678') // '12345-678'
 * formatCEP('12345')    // '12345'
 */
export function formatCEP(cep) {
  if (!cep || typeof cep !== 'string') {
    return '';
  }
  
  // Remove any non-digits
  const cleaned = cep.replace(/\D/g, '');
  
  // Return as-is if not 8 digits
  if (cleaned.length !== 8) {
    return cleaned;
  }
  
  // Format as XXXXX-XXX
  return `${cleaned.slice(0, 5)}-${cleaned.slice(5)}`;
}
