/**
 * Tests for defensive wrapper that prevents external script errors
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createDefensiveWrapper, createGlobalDefensiveWrappers } from '../utils/errorTracking';

// Mock DOM
Object.defineProperty(window, 'document', {
  value: {
    querySelector: vi.fn(),
    getElementById: vi.fn()
  },
  writable: true
});

describe('Defensive Wrappers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createDefensiveWrapper', () => {
    it('should wrap querySelector to handle null elements safely', () => {
      const mockElement = { classList: null };
      document.querySelector.mockReturnValue(mockElement);
      
      createDefensiveWrapper();
      
      const result = document.querySelector('.test-selector');
      expect(result.classList).toBeDefined();
      expect(typeof result.classList.add).toBe('function');
    });

    it('should wrap getElementById to handle null elements safely', () => {
      const mockElement = {}; // No classList
      document.getElementById.mockReturnValue(mockElement);
      
      createDefensiveWrapper();
      
      const result = document.getElementById('test-id');
      expect(result.classList).toBeDefined();
      expect(typeof result.classList.add).toBe('function');
    });

    it('should return null safely when element not found', () => {
      document.querySelector.mockReturnValue(null);
      
      createDefensiveWrapper();
      
      const result = document.querySelector('.non-existent');
      expect(result).toBeNull();
    });
  });

  describe('createGlobalDefensiveWrappers', () => {
    it('should create setupEnhancedProtectionMessage function', () => {
      createGlobalDefensiveWrappers();
      
      expect(typeof window.setupEnhancedProtectionMessage).toBe('function');
    });

    it('should handle setupEnhancedProtectionMessage call safely', () => {
      createGlobalDefensiveWrappers();
      
      const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      // This should not throw an error
      expect(() => {
        window.setupEnhancedProtectionMessage(null);
      }).not.toThrow();
      
      expect(consoleWarn).toHaveBeenCalled();
      consoleWarn.mockRestore();
    });

    it('should create all defensive functions', () => {
      createGlobalDefensiveWrappers();
      
      const expectedFunctions = [
        'setupEnhancedProtectionMessage',
        'setupEvents',
        'initializeProtection',
        'enhancedProtection'
      ];
      
      expectedFunctions.forEach(funcName => {
        expect(typeof window[funcName]).toBe('function');
      });
    });
  });
});
