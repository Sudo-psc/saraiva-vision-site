/**
 * Profile Detector Tests
 *
 * Tests for user profile detection logic
 */

import { describe, it, expect } from 'vitest';
import {
  detectProfileFromUserAgent,
  isValidProfile,
  getProfileDisplayName,
  getProfileDescription,
  getProfileConfig,
  benchmarkDetection,
  type UserProfile,
} from '../profile-detector';

describe('Profile Detector', () => {
  describe('isValidProfile', () => {
    it('should validate correct profiles', () => {
      expect(isValidProfile('familiar')).toBe(true);
      expect(isValidProfile('jovem')).toBe(true);
      expect(isValidProfile('senior')).toBe(true);
    });

    it('should reject invalid profiles', () => {
      expect(isValidProfile('invalid')).toBe(false);
      expect(isValidProfile('')).toBe(false);
      expect(isValidProfile(null)).toBe(false);
      expect(isValidProfile(undefined)).toBe(false);
      expect(isValidProfile(123)).toBe(false);
    });
  });

  describe('detectProfileFromUserAgent', () => {
    it('should detect senior profile for KaiOS', () => {
      const ua = 'Mozilla/5.0 (Mobile; rv:48.0) Gecko/48.0 Firefox/48.0 KAIOS/2.5';
      expect(detectProfileFromUserAgent(ua)).toBe('senior');
    });

    it('should detect senior profile for old Android', () => {
      const ua = 'Mozilla/5.0 (Linux; Android 4.4.2; Nexus 4 Build/KOT49H)';
      expect(detectProfileFromUserAgent(ua)).toBe('senior');
    });

    it('should detect senior profile for IE', () => {
      const ua = 'Mozilla/5.0 (Windows NT 6.1; Trident/7.0; rv:11.0) like Gecko';
      expect(detectProfileFromUserAgent(ua)).toBe('senior');
    });

    it('should detect jovem profile for iPhone', () => {
      const ua = 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15';
      expect(detectProfileFromUserAgent(ua)).toBe('jovem');
    });

    it('should detect jovem profile for modern Android', () => {
      const ua = 'Mozilla/5.0 (Linux; Android 11; SM-G998B) Mobile Safari/537.36';
      expect(detectProfileFromUserAgent(ua)).toBe('jovem');
    });

    it('should detect jovem profile for Instagram', () => {
      const ua = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) Instagram 200.0.0.11.103';
      expect(detectProfileFromUserAgent(ua)).toBe('jovem');
    });

    it('should detect familiar profile for desktop Chrome', () => {
      const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0';
      expect(detectProfileFromUserAgent(ua)).toBe('familiar');
    });

    it('should default to familiar for empty user agent', () => {
      expect(detectProfileFromUserAgent('')).toBe('familiar');
    });

    it('should default to familiar for unknown user agent', () => {
      const ua = 'CustomBot/1.0';
      expect(detectProfileFromUserAgent(ua)).toBe('familiar');
    });
  });

  describe('getProfileDisplayName', () => {
    it('should return correct display names', () => {
      expect(getProfileDisplayName('familiar')).toBe('Navegação Familiar');
      expect(getProfileDisplayName('jovem')).toBe('Navegação Jovem');
      expect(getProfileDisplayName('senior')).toBe('Navegação Senior');
    });
  });

  describe('getProfileDescription', () => {
    it('should return correct descriptions', () => {
      expect(getProfileDescription('familiar')).toContain('padrão');
      expect(getProfileDescription('jovem')).toContain('moderna');
      expect(getProfileDescription('senior')).toContain('simplificada');
    });
  });

  describe('getProfileConfig', () => {
    it('should return familiar config', () => {
      const config = getProfileConfig('familiar');
      expect(config.fontSize).toBe('base');
      expect(config.contrast).toBe('normal');
      expect(config.animations).toBe('normal');
      expect(config.layout).toBe('standard');
    });

    it('should return jovem config', () => {
      const config = getProfileConfig('jovem');
      expect(config.fontSize).toBe('base');
      expect(config.animations).toBe('enhanced');
      expect(config.layout).toBe('modern');
    });

    it('should return senior config', () => {
      const config = getProfileConfig('senior');
      expect(config.fontSize).toBe('large');
      expect(config.contrast).toBe('high');
      expect(config.animations).toBe('reduced');
      expect(config.layout).toBe('simplified');
    });
  });

  describe('Performance', () => {
    it('should complete detection in <50ms average', () => {
      const results = benchmarkDetection(1000);

      expect(results.averageTime).toBeLessThan(50);
      console.log('Performance benchmark:', results);
    });

    it('should handle various user agents quickly', () => {
      const userAgents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)',
        'KAIOS/2.5.0',
        'Mozilla/5.0 (Linux; Android 4.4.2)',
        'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X)',
      ];

      const startTime = performance.now();
      userAgents.forEach(ua => {
        detectProfileFromUserAgent(ua);
      });
      const endTime = performance.now();

      const totalTime = endTime - startTime;
      expect(totalTime).toBeLessThan(10); // All 5 detections in <10ms
    });
  });

  describe('Edge Cases', () => {
    it('should handle malformed user agents', () => {
      expect(() => detectProfileFromUserAgent(';;;')).not.toThrow();
      expect(() => detectProfileFromUserAgent('   ')).not.toThrow();
      expect(() => detectProfileFromUserAgent('\n\n')).not.toThrow();
    });

    it('should be case insensitive', () => {
      expect(detectProfileFromUserAgent('kaios/2.5')).toBe('senior');
      expect(detectProfileFromUserAgent('KAIOS/2.5')).toBe('senior');
      expect(detectProfileFromUserAgent('instagram')).toBe('jovem');
      expect(detectProfileFromUserAgent('INSTAGRAM')).toBe('jovem');
    });
  });
});
