import { describe, it, expect } from 'vitest';
import {
  validateCPF,
  formatCPF,
  unformatCPF,
  isValidCPFFormat,
  calculateCheckDigits,
} from '@/lib/ninsaude/utils/cpfValidator';

describe('cpfValidator', () => {
  describe('validateCPF', () => {
    it('should validate correct CPF with formatting', () => {
      const validCPFs = [
        '123.456.789-09',
        '111.444.777-35',
        '012.345.678-90',
      ];

      validCPFs.forEach((cpf) => {
        expect(validateCPF(cpf)).toBe(true);
      });
    });

    it('should validate correct CPF without formatting', () => {
      const validCPFs = ['12345678909', '11144477735', '01234567890'];

      validCPFs.forEach((cpf) => {
        expect(validateCPF(cpf)).toBe(true);
      });
    });

    it('should reject CPF with wrong length', () => {
      const invalidCPFs = [
        '123.456.789-0', // too short
        '123.456.789-099', // too long
        '12345678', // too short unformatted
        '123456789012', // too long unformatted
      ];

      invalidCPFs.forEach((cpf) => {
        expect(validateCPF(cpf)).toBe(false);
      });
    });

    it('should reject CPF with invalid characters', () => {
      const invalidCPFs = [
        '12a.456.789-09',
        '123.456.789-0x',
        'abc.def.ghi-jk',
        '123-456-789.09', // wrong format
      ];

      invalidCPFs.forEach((cpf) => {
        expect(validateCPF(cpf)).toBe(false);
      });
    });

    it('should reject known invalid CPFs with all same digits', () => {
      const knownInvalidCPFs = [
        '000.000.000-00',
        '111.111.111-11',
        '222.222.222-22',
        '333.333.333-33',
        '444.444.444-44',
        '555.555.555-55',
        '666.666.666-66',
        '777.777.777-77',
        '888.888.888-88',
        '999.999.999-99',
      ];

      knownInvalidCPFs.forEach((cpf) => {
        expect(validateCPF(cpf)).toBe(false);
      });
    });

    it('should validate check digits correctly', () => {
      // CPF with valid check digits
      expect(validateCPF('123.456.789-09')).toBe(true);

      // CPF with invalid check digits
      expect(validateCPF('123.456.789-00')).toBe(false);
      expect(validateCPF('123.456.789-99')).toBe(false);
    });

    it('should reject empty or null CPF', () => {
      expect(validateCPF('')).toBe(false);
      expect(validateCPF(null)).toBe(false);
      expect(validateCPF(undefined)).toBe(false);
    });
  });

  describe('formatCPF', () => {
    it('should format unformatted CPF correctly', () => {
      expect(formatCPF('12345678909')).toBe('123.456.789-09');
      expect(formatCPF('11144477735')).toBe('111.444.777-35');
      expect(formatCPF('01234567890')).toBe('012.345.678-90');
    });

    it('should handle already formatted CPF', () => {
      expect(formatCPF('123.456.789-09')).toBe('123.456.789-09');
    });

    it('should handle partially formatted CPF', () => {
      expect(formatCPF('123456789-09')).toBe('123.456.789-09');
      expect(formatCPF('123.45678909')).toBe('123.456.789-09');
    });

    it('should return empty string for invalid input', () => {
      expect(formatCPF('')).toBe('');
      expect(formatCPF(null)).toBe('');
      expect(formatCPF(undefined)).toBe('');
      expect(formatCPF('123')).toBe('');
    });
  });

  describe('unformatCPF', () => {
    it('should remove formatting from CPF', () => {
      expect(unformatCPF('123.456.789-09')).toBe('12345678909');
      expect(unformatCPF('111.444.777-35')).toBe('11144477735');
      expect(unformatCPF('012.345.678-90')).toBe('01234567890');
    });

    it('should handle already unformatted CPF', () => {
      expect(unformatCPF('12345678909')).toBe('12345678909');
    });

    it('should remove all non-numeric characters', () => {
      expect(unformatCPF('123-456-789.09')).toBe('12345678909');
      expect(unformatCPF('123 456 789 09')).toBe('12345678909');
      expect(unformatCPF('abc123.456.789-09xyz')).toBe('12345678909');
    });

    it('should return empty string for invalid input', () => {
      expect(unformatCPF('')).toBe('');
      expect(unformatCPF(null)).toBe('');
      expect(unformatCPF(undefined)).toBe('');
    });
  });

  describe('isValidCPFFormat', () => {
    it('should accept valid formatted CPF', () => {
      expect(isValidCPFFormat('123.456.789-09')).toBe(true);
    });

    it('should accept valid unformatted CPF', () => {
      expect(isValidCPFFormat('12345678909')).toBe(true);
    });

    it('should reject invalid formats', () => {
      expect(isValidCPFFormat('123-456-789.09')).toBe(false);
      expect(isValidCPFFormat('123456789')).toBe(false);
      expect(isValidCPFFormat('abc.def.ghi-jk')).toBe(false);
    });
  });

  describe('calculateCheckDigits', () => {
    it('should calculate correct check digits', () => {
      // First 9 digits: 123456789
      const checkDigits = calculateCheckDigits('123456789');
      expect(checkDigits).toBe('09');
    });

    it('should handle different CPF base numbers', () => {
      expect(calculateCheckDigits('111444777')).toBe('35');
      expect(calculateCheckDigits('012345678')).toBe('90');
    });

    it('should return null for invalid input', () => {
      expect(calculateCheckDigits('')).toBe(null);
      expect(calculateCheckDigits('12345')).toBe(null);
      expect(calculateCheckDigits('abc123456')).toBe(null);
    });
  });
});
