/**
 * Testes para ConfigService
 *
 * @version 1.0.0
 * @author Dr. Philipe Saraiva Cruz
 * @date 2025-10-18
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ConfigService } from '../ConfigService.js';
import { config } from '../../config.base.js';

describe('ConfigService', () => {
  let service;

  beforeEach(() => {
    service = new ConfigService(config);
  });

  afterEach(() => {
    service.clearCache();
  });

  describe('Inicialização', () => {
    it('deve inicializar o serviço sem erros', async () => {
      await expect(service.initialize()).resolves.not.toThrow();
    });

    it('deve marcar como inicializado após initialize()', async () => {
      await service.initialize();
      expect(service._initialized).toBe(true);
    });

    it('deve validar configurações obrigatórias na inicialização', async () => {
      const emptyService = new ConfigService({});
      await expect(emptyService.initialize()).rejects.toThrow();
    });

    it('não deve reinicializar se já estiver inicializado', async () => {
      await service.initialize();
      const consoleSpy = vi.spyOn(console, 'log');
      await service.initialize();
      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('get() - Navegação por dot notation', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('deve obter valor simples', () => {
      const siteName = service.get('site.name');
      expect(siteName).toBe('Saraiva Vision');
    });

    it('deve obter valor aninhado', () => {
      const city = service.get('business.address.city');
      expect(city).toBe('Caratinga');
    });

    it('deve obter valor profundamente aninhado', () => {
      const e164 = service.get('business.phone.primary.e164');
      expect(e164).toBe('+5533998601427');
    });

    it('deve retornar default value se caminho não existir', () => {
      const value = service.get('nonexistent.path', 'default');
      expect(value).toBe('default');
    });

    it('deve retornar null se default value não fornecido', () => {
      const value = service.get('nonexistent.path');
      expect(value).toBe(null);
    });

    it('deve usar cache após primeira chamada', () => {
      service.get('site.name');
      expect(service._cache.has('site.name')).toBe(true);
      const cached = service._cache.get('site.name');
      expect(cached).toBe('Saraiva Vision');
    });
  });

  describe('set() - Definir valores em runtime', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('deve definir valor simples', () => {
      service.set('test.value', 'test123');
      expect(service.get('test.value')).toBe('test123');
    });

    it('deve definir valor aninhado', () => {
      service.set('test.nested.value', 'nested123');
      expect(service.get('test.nested.value')).toBe('nested123');
    });

    it('deve limpar cache ao definir valor', () => {
      service.get('site.name'); // Cachear valor
      expect(service._cache.has('site.name')).toBe(true);
      service.set('site.name', 'New Name');
      expect(service._cache.has('site.name')).toBe(false);
    });

    it('deve sobrescrever valor existente', () => {
      const original = service.get('site.name');
      service.set('site.name', 'Modified Name');
      const modified = service.get('site.name');
      expect(modified).not.toBe(original);
      expect(modified).toBe('Modified Name');
    });
  });

  describe('getSection() - Obter seção completa', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('deve obter seção site completa', () => {
      const site = service.getSection('site');
      expect(site).toHaveProperty('name');
      expect(site).toHaveProperty('domain');
      expect(site).toHaveProperty('baseUrl');
    });

    it('deve obter seção business completa', () => {
      const business = service.getSection('business');
      expect(business).toHaveProperty('name');
      expect(business).toHaveProperty('address');
      expect(business).toHaveProperty('phone');
    });

    it('deve retornar objeto vazio se seção não existir', () => {
      const section = service.getSection('nonexistent');
      expect(section).toEqual({});
    });
  });

  describe('Métodos de ambiente', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('isProduction() deve retornar boolean', () => {
      const result = service.isProduction();
      expect(typeof result).toBe('boolean');
    });

    it('isDevelopment() deve retornar boolean', () => {
      const result = service.isDevelopment();
      expect(typeof result).toBe('boolean');
    });

    it('isProduction e isDevelopment devem ser mutuamente exclusivos', () => {
      const prod = service.isProduction();
      const dev = service.isDevelopment();
      expect(prod && dev).toBe(false);
    });
  });

  describe('Métodos de negócio', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('getBusinessInfo() deve retornar dados completos', () => {
      const info = service.getBusinessInfo();
      expect(info).toHaveProperty('name');
      expect(info).toHaveProperty('address');
      expect(info).toHaveProperty('phone');
      expect(info).toHaveProperty('email');
    });

    it('getFormattedAddress() deve retornar endereço formatado', () => {
      const short = service.getFormattedAddress('short');
      const medium = service.getFormattedAddress('medium');
      const long = service.getFormattedAddress('long');

      expect(short).toBeTruthy();
      expect(medium).toBeTruthy();
      expect(long).toBeTruthy();
      expect(long.length).toBeGreaterThan(short.length);
    });

    it('getFormattedPhone() deve retornar telefone formatado', () => {
      const display = service.getFormattedPhone('display');
      const e164 = service.getFormattedPhone('e164');

      expect(display).toBeTruthy();
      expect(e164).toBeTruthy();
      expect(e164).toMatch(/^\+55/);
    });

    it('getWhatsAppUrl() deve retornar URL válida', () => {
      const url = service.getWhatsAppUrl();
      expect(url).toContain('wa.me');
      expect(url).toContain('text=');
    });

    it('getWhatsAppUrl() deve aceitar mensagem customizada', () => {
      const customMessage = 'Teste de mensagem';
      const url = service.getWhatsAppUrl(customMessage);
      expect(url).toContain(encodeURIComponent(customMessage));
    });
  });

  describe('Feature Flags', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('isFeatureEnabled() deve verificar flags existentes', () => {
      const enabled = service.isFeatureEnabled('accessibilityWidget');
      expect(typeof enabled).toBe('boolean');
    });

    it('isFeatureEnabled() deve retornar false para flags inexistentes', () => {
      const enabled = service.isFeatureEnabled('nonexistentFeature');
      expect(enabled).toBe(false);
    });

    it('deve verificar múltiplas feature flags', () => {
      const flags = ['lazyWidgets', 'blogSearch', 'podcastPlayer'];
      flags.forEach(flag => {
        const result = service.isFeatureEnabled(flag);
        expect(typeof result).toBe('boolean');
      });
    });
  });

  describe('APIs externas', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('getApiConfig() deve retornar config de API', () => {
      const googleMaps = service.getApiConfig('googleMaps');
      expect(googleMaps).toHaveProperty('apiKey');
      expect(googleMaps).toHaveProperty('placeId');
    });

    it('getApiConfig() deve retornar objeto vazio para API inexistente', () => {
      const config = service.getApiConfig('nonexistentApi');
      expect(config).toEqual({});
    });
  });

  describe('SEO', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('getSeoConfig() deve retornar config base', () => {
      const seo = service.getSeoConfig();
      expect(seo).toHaveProperty('defaultTitle');
      expect(seo).toHaveProperty('defaultDescription');
    });

    it('getSeoConfig() deve aceitar página específica', () => {
      const seo = service.getSeoConfig('home');
      expect(seo).toBeTruthy();
    });
  });

  describe('Internacionalização', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('getI18nConfig() deve retornar configuração completa', () => {
      const i18n = service.getI18nConfig();
      expect(i18n).toHaveProperty('defaultLocale');
      expect(i18n).toHaveProperty('supportedLocales');
    });

    it('getDefaultLocale() deve retornar locale padrão', () => {
      const locale = service.getDefaultLocale();
      expect(locale).toBe('pt-br');
    });
  });

  describe('Compliance', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('getComplianceConfig() deve retornar config LGPD e CFM', () => {
      const compliance = service.getComplianceConfig();
      expect(compliance).toHaveProperty('lgpd');
      expect(compliance).toHaveProperty('cfm');
    });

    it('LGPD deve ter DPO email configurado', () => {
      const compliance = service.getComplianceConfig();
      expect(compliance.lgpd.dpoEmail).toBe('dpo@saraivavision.com.br');
    });

    it('CFM deve ter médico responsável', () => {
      const compliance = service.getComplianceConfig();
      expect(compliance.cfm.responsiblePhysician).toBeTruthy();
      expect(compliance.cfm.crm).toContain('CRM-MG');
    });
  });

  describe('Validações', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('validateSchedulingUrl() deve validar URL correta', () => {
      const url = 'https://www.saraivavision.com.br/agendamento';
      expect(service.validateSchedulingUrl(url)).toBe(true);
    });

    it('validateSchedulingUrl() deve rejeitar HTTP', () => {
      const url = 'http://www.saraivavision.com.br/agendamento';
      expect(service.validateSchedulingUrl(url)).toBe(false);
    });

    it('validateSchedulingUrl() deve rejeitar domínio incorreto', () => {
      const url = 'https://www.example.com/agendamento';
      expect(service.validateSchedulingUrl(url)).toBe(false);
    });

    it('validateSchedulingUrl() deve rejeitar URL inválida', () => {
      const url = 'not-a-url';
      expect(service.validateSchedulingUrl(url)).toBe(false);
    });

    it('validateSecurity() deve verificar configurações de segurança', () => {
      const validation = service.validateSecurity();
      expect(validation).toHaveProperty('isValid');
      expect(validation).toHaveProperty('warnings');
      expect(validation).toHaveProperty('errors');
      expect(Array.isArray(validation.warnings)).toBe(true);
      expect(Array.isArray(validation.errors)).toBe(true);
    });
  });

  describe('Cache', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('deve armazenar valores em cache', () => {
      service.get('site.name');
      expect(service._cache.size).toBeGreaterThan(0);
    });

    it('clearCache() deve limpar cache', () => {
      service.get('site.name');
      service.get('business.name');
      expect(service._cache.size).toBeGreaterThan(0);
      service.clearCache();
      expect(service._cache.size).toBe(0);
    });

    it('deve usar cache em segunda chamada', () => {
      const first = service.get('site.name');
      service._config.site.name = 'Modified';
      const second = service.get('site.name');
      expect(second).toBe(first); // Deve retornar valor cacheado
    });
  });

  describe('Debug', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('debug() deve retornar informações do serviço', () => {
      const debug = service.debug();
      expect(debug).toHaveProperty('environment');
      expect(debug).toHaveProperty('initialized');
      expect(debug).toHaveProperty('cacheSize');
      expect(debug).toHaveProperty('config');
    });

    it('getFullConfig() deve retornar configuração completa', () => {
      const fullConfig = service.getFullConfig();
      expect(fullConfig).toHaveProperty('site');
      expect(fullConfig).toHaveProperty('business');
      expect(fullConfig).toHaveProperty('featureFlags');
    });
  });

  describe('Tracking', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('getTrackingConfig() deve retornar config de analytics', () => {
      const tracking = service.getTrackingConfig();
      expect(tracking).toHaveProperty('googleAnalytics');
      expect(tracking).toHaveProperty('googleTagManager');
      expect(tracking).toHaveProperty('postHog');
    });

    it('Google Analytics deve ter measurementId', () => {
      const tracking = service.getTrackingConfig();
      expect(tracking.googleAnalytics).toHaveProperty('measurementId');
      expect(tracking.googleAnalytics.measurementId).toBeTruthy();
    });

    it('Google Tag Manager deve ter containerId', () => {
      const tracking = service.getTrackingConfig();
      expect(tracking.googleTagManager).toHaveProperty('containerId');
      expect(tracking.googleTagManager.containerId).toBeTruthy();
    });
  });

  describe('Tema', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('getTheme() deve retornar configuração de tema', () => {
      const theme = service.getTheme();
      expect(theme).toHaveProperty('colors');
      expect(theme).toHaveProperty('fonts');
      expect(theme).toHaveProperty('breakpoints');
    });

    it('cores devem estar definidas', () => {
      const theme = service.getTheme();
      expect(theme.colors).toHaveProperty('primary');
      expect(theme.colors).toHaveProperty('secondary');
    });

    it('breakpoints devem estar definidos', () => {
      const theme = service.getTheme();
      expect(theme.breakpoints).toHaveProperty('mobile');
      expect(theme.breakpoints).toHaveProperty('tablet');
      expect(theme.breakpoints).toHaveProperty('desktop');
    });
  });
});
