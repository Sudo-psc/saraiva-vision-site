import { describe, expect, it } from 'vitest';
import {
  AUTHOR_SITE_URL,
  CLINIC_CREDENTIALS,
  CLINIC_IS_OPEN,
  getPhysicianCredentials,
  isSchedulingEnabled,
} from '@/lib/clinicStatus';

describe('clinicStatus', () => {
  it('keeps scheduling disabled while the clinic is closed', () => {
    expect(CLINIC_IS_OPEN).toBe(false);
    expect(isSchedulingEnabled()).toBe(false);
  });

  it('exposes canonical credentials and the author site', () => {
    expect(CLINIC_CREDENTIALS.crm).toBe('CRM-MG 69.870');
    expect(CLINIC_CREDENTIALS.rqe).toBe('RQE 71.903');
    expect(CLINIC_CREDENTIALS.rqe).not.toContain('307527');
    expect(AUTHOR_SITE_URL).toBe('https://drphilipesaraiva.com.br');
    expect(getPhysicianCredentials()).toContain('RQE 71.903');
  });
});
