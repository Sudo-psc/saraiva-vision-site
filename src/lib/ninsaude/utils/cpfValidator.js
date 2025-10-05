/**
 * CPF Validator Utilities
 *
 * Client-side CPF validation for Ninsaúde integration
 * Mirrors backend validation logic for immediate user feedback
 *
 * CPF format: ###.###.###-## (11 digits with formatting)
 * Check digit validation: modulo 11 algorithm
 *
 * @module lib/ninsaude/utils/cpfValidator
 */

/**
 * Known invalid CPFs (all same digits)
 * These are technically valid according to check digit algorithm
 * but are rejected by Brazilian tax authority
 */
const KNOWN_INVALID_CPFS = [
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
 * Remove all non-numeric characters from CPF
 *
 * @param {string} cpf - CPF with or without formatting
 * @returns {string} CPF with only digits
 *
 * @example
 * unformatCPF('123.456.789-09') // '12345678909'
 * unformatCPF('123 456 789 09') // '12345678909'
 * unformatCPF('abc123.456.789-09xyz') // '12345678909'
 */
export function unformatCPF(cpf) {
  if (!cpf || typeof cpf !== 'string') {
    return '';
  }

  return cpf.replace(/\D/g, '');
}

/**
 * Format CPF with standard Brazilian formatting
 *
 * @param {string} cpf - Unformatted or partially formatted CPF
 * @returns {string} Formatted CPF (###.###.###-##) or empty string if invalid
 *
 * @example
 * formatCPF('12345678909') // '123.456.789-09'
 * formatCPF('123.456.789-09') // '123.456.789-09'
 * formatCPF('123456789-09') // '123.456.789-09'
 */
export function formatCPF(cpf) {
  if (!cpf || typeof cpf !== 'string') {
    return '';
  }

  // Remove all non-numeric characters
  const digits = unformatCPF(cpf);

  // Must have exactly 11 digits
  if (digits.length !== 11) {
    return '';
  }

  // Apply formatting: ###.###.###-##
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

/**
 * Check if CPF string matches valid format patterns
 * Accepts both formatted (###.###.###-##) and unformatted (11 digits)
 *
 * @param {string} cpf - CPF to validate format
 * @returns {boolean} True if format is valid
 *
 * @example
 * isValidCPFFormat('123.456.789-09') // true
 * isValidCPFFormat('12345678909') // true
 * isValidCPFFormat('123-456-789.09') // false
 * isValidCPFFormat('123456789') // false
 */
export function isValidCPFFormat(cpf) {
  if (!cpf || typeof cpf !== 'string') {
    return false;
  }

  // Pattern 1: Formatted CPF (###.###.###-##)
  const formattedPattern = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;

  // Pattern 2: Unformatted CPF (11 digits)
  const unformattedPattern = /^\d{11}$/;

  return formattedPattern.test(cpf) || unformattedPattern.test(cpf);
}

/**
 * Calculate CPF check digits using modulo 11 algorithm
 *
 * Algorithm:
 * 1. First digit: sum of (first 9 digits * decreasing weights 10-2) mod 11
 * 2. Second digit: sum of (first 9 digits + first check digit * decreasing weights 11-2) mod 11
 * 3. If remainder < 2, digit = 0; otherwise digit = 11 - remainder
 *
 * @param {string} baseDigits - First 9 digits of CPF
 * @returns {string|null} Two check digits or null if invalid input
 *
 * @example
 * calculateCheckDigits('123456789') // '09'
 * calculateCheckDigits('111444777') // '35'
 * calculateCheckDigits('012345678') // '90'
 */
export function calculateCheckDigits(baseDigits) {
  if (!baseDigits || typeof baseDigits !== 'string') {
    return null;
  }

  // Must have exactly 9 digits
  const digits = unformatCPF(baseDigits);
  if (digits.length !== 9 || !/^\d{9}$/.test(digits)) {
    return null;
  }

  // Calculate first check digit
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(digits[i]) * (10 - i);
  }
  let remainder = sum % 11;
  const firstDigit = remainder < 2 ? 0 : 11 - remainder;

  // Calculate second check digit
  sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(digits[i]) * (11 - i);
  }
  sum += firstDigit * 2;
  remainder = sum % 11;
  const secondDigit = remainder < 2 ? 0 : 11 - remainder;

  return `${firstDigit}${secondDigit}`;
}

/**
 * Validate CPF using check digit algorithm
 *
 * Validation steps:
 * 1. Check format is valid (###.###.###-## or 11 digits)
 * 2. Remove formatting and check length (must be 11 digits)
 * 3. Check for known invalid patterns (all same digits)
 * 4. Validate check digits using modulo 11 algorithm
 *
 * @param {string} cpf - CPF with or without formatting
 * @returns {boolean} True if CPF is valid
 *
 * @example
 * validateCPF('123.456.789-09') // true
 * validateCPF('12345678909') // true
 * validateCPF('000.000.000-00') // false (known invalid)
 * validateCPF('123.456.789-00') // false (wrong check digits)
 * validateCPF('123456789') // false (wrong length)
 * validateCPF('123-456-789.09') // false (wrong format)
 */
export function validateCPF(cpf) {
  if (!cpf || typeof cpf !== 'string') {
    return false;
  }

  // First check if format is valid
  if (!isValidCPFFormat(cpf)) {
    return false;
  }

  // Remove formatting
  const digits = unformatCPF(cpf);

  // Must have exactly 11 digits
  if (digits.length !== 11 || !/^\d{11}$/.test(digits)) {
    return false;
  }

  // Check for known invalid CPFs (all same digits)
  if (KNOWN_INVALID_CPFS.includes(digits)) {
    return false;
  }

  // Calculate expected check digits
  const baseDigits = digits.substring(0, 9);
  const providedCheckDigits = digits.substring(9, 11);
  const calculatedCheckDigits = calculateCheckDigits(baseDigits);

  // Validate check digits
  return calculatedCheckDigits === providedCheckDigits;
}
