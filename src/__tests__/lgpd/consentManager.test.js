/**
 * Tests for LGPD Consent Manager
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { consentManager } from '../../lib/lgpd/consentManager.js';

// Mock localStorage
const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn()
};

Object.defineProperty(window, 'localStorage', {
    value: localStorageMock
});

describe('ConsentManager', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe('hasValidConsent', () => {
        it('should return false when no consent is stored', () => {
            localStorageMock.getItem.mockReturnValue(null);

            expect(consentManager.hasValidConsent()).toBe(false);
        });

        it('should return false when consent is expired', () => {
            const expiredConsent = {
                version: '1.0',
                timestamp: new Date(Date.now() - 366 * 24 * 60 * 60 * 1000).toISOString(), // 366 days ago
                accepted: true
            };

            localStorageMock.getItem.mockReturnValue(JSON.stringify(expiredConsent));

            expect(consentManager.hasValidConsent()).toBe(false);
        });

        it('should return true when consent is valid and not expired', () => {
            const validConsent = {
                version: '1.0',
                timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
                accepted: true
            };

            localStorageMock.getItem.mockReturnValue(JSON.stringify(validConsent));

            expect(consentManager.hasValidConsent()).toBe(true);
        });

        it('should return false when consent version is outdated', () => {
            const outdatedConsent = {
                version: '0.9',
                timestamp: new Date().toISOString(),
                accepted: true
            };

            localStorageMock.getItem.mockReturnValue(JSON.stringify(outdatedConsent));

            expect(consentManager.hasValidConsent()).toBe(false);
        });

        it('should handle malformed consent data gracefully', () => {
            localStorageMock.getItem.mockReturnValue('invalid-json');

            expect(consentManager.hasValidConsent()).toBe(false);
        });
    });

    describe('recordConsent', () => {
        it('should record consent with all required fields', () => {
            const consentDetails = {
                purposes: ['appointment_scheduling', 'communication'],
                ipHash: 'hashed-ip-address'
            };

            const result = consentManager.recordConsent(consentDetails);

            expect(result).toBe(true);
            expect(localStorageMock.setItem).toHaveBeenCalledWith(
                'lgpd_consent',
                expect.stringContaining('"accepted":true')
            );
            expect(localStorageMock.setItem).toHaveBeenCalledWith(
                'lgpd_consent',
                expect.stringContaining('"version":"1.0"')
            );
        });

        it('should include user agent in consent record', () => {
            // Mock navigator.userAgent
            Object.defineProperty(navigator, 'userAgent', {
                value: 'Mozilla/5.0 Test Browser',
                configurable: true
            });

            const consentDetails = {
                purposes: ['marketing'],
                ipHash: 'test-hash'
            };

            consentManager.recordConsent(consentDetails);

            const storedData = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
            expect(storedData.userAgent).toBe('Mozilla/5.0 Test Browser');
        });

        it('should handle localStorage errors gracefully', () => {
            localStorageMock.setItem.mockImplementation(() => {
                throw new Error('Storage quota exceeded');
            });

            const result = consentManager.recordConsent({ purposes: [] });

            expect(result).toBe(false);
        });
    });

    describe('withdrawConsent', () => {
        it('should remove consent and clear personal data', () => {
            const result = consentManager.withdrawConsent();

            expect(result).toBe(true);
            expect(localStorageMock.removeItem).toHaveBeenCalledWith('lgpd_consent');
            expect(localStorageMock.removeItem).toHaveBeenCalledWith('contact_form_data');
            expect(localStorageMock.removeItem).toHaveBeenCalledWith('appointment_data');
            expect(localStorageMock.removeItem).toHaveBeenCalledWith('user_preferences');
        });

        it('should handle localStorage errors during withdrawal', () => {
            localStorageMock.removeItem.mockImplementation(() => {
                throw new Error('Storage error');
            });

            const result = consentManager.withdrawConsent();

            expect(result).toBe(false);
        });
    });

    describe('getConsentDetails', () => {
        it('should return parsed consent details', () => {
            const consentData = {
                version: '1.0',
                timestamp: new Date().toISOString(),
                accepted: true,
                purposes: ['communication']
            };

            localStorageMock.getItem.mockReturnValue(JSON.stringify(consentData));

            const result = consentManager.getConsentDetails();

            expect(result).toEqual(consentData);
        });

        it('should return null for invalid data', () => {
            localStorageMock.getItem.mockReturnValue('invalid-json');

            const result = consentManager.getConsentDetails();

            expect(result).toBeNull();
        });
    });

    describe('isConsentStillValid', () => {
        it('should return true for recent consent', () => {
            const recentTimestamp = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

            expect(consentManager.isConsentStillValid(recentTimestamp)).toBe(true);
        });

        it('should return false for expired consent', () => {
            const expiredTimestamp = new Date(Date.now() - 400 * 24 * 60 * 60 * 1000).toISOString();

            expect(consentManager.isConsentStillValid(expiredTimestamp)).toBe(false);
        });

        it('should return true for consent exactly at 365 days', () => {
            const exactTimestamp = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString();

            expect(consentManager.isConsentStillValid(exactTimestamp)).toBe(true);
        });
    });

    describe('getPrivacyNotice', () => {
        it('should return complete privacy notice', () => {
            const notice = consentManager.getPrivacyNotice();

            expect(notice).toHaveProperty('title');
            expect(notice).toHaveProperty('content');
            expect(notice).toHaveProperty('lastUpdated');
            expect(notice.content).toContain('LGPD');
            expect(notice.content).toContain('consentimento');
            expect(notice.content).toContain('privacidade@saraivavision.com.br');
        });

        it('should include all required LGPD sections', () => {
            const notice = consentManager.getPrivacyNotice();

            expect(notice.content).toContain('Coleta e Uso de Dados Pessoais');
            expect(notice.content).toContain('Base Legal (LGPD)');
            expect(notice.content).toContain('Seus Direitos');
            expect(notice.content).toContain('Segurança dos Dados');
            expect(notice.content).toContain('Contato');
        });
    });
});