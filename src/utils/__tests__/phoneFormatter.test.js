import { describe, it, expect } from 'vitest';
import { safePhoneFormat, formatWhatsappPhone } from '@/utils/phoneFormatter';

describe('phoneFormatter', () => {
  it('strips non-digits from string', () => {
    expect(safePhoneFormat('+55 33 99860-1427')).toBe('5533998601427');
  });

  it('returns empty for invalid inputs', () => {
    expect(safePhoneFormat(null)).toBe('');
    expect(safePhoneFormat(undefined)).toBe('');
    expect(safePhoneFormat(123)).toBe('');
  });

  it('formats phone_whatsapp from data object', () => {
    expect(formatWhatsappPhone({ phone_whatsapp: '(33) 99860-1427' })).toBe('33998601427');
  });

  it('returns empty and warns for invalid data object', () => {
    expect(formatWhatsappPhone({})).toBe('');
  });
});

