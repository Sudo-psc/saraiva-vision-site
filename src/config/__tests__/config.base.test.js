/**
 * Testes para config.base.js
 *
 * @version 1.0.0
 * @author Dr. Philipe Saraiva Cruz
 * @date 2025-10-18
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  config,
  business,
  site,
  theme,
  seo,
  tracking,
  featureFlags,
  compliance,
  performance,
  i18n,
  isProduction,
  isDevelopment,
  getEnv
} from '../config.base.js';

describe('config.base.js', () => {
  describe('Estrutura da configuração', () => {
    it('deve ter todas as seções principais', () => {
      expect(config).toHaveProperty('site');
      expect(config).toHaveProperty('business');
      expect(config).toHaveProperty('i18n');
      expect(config).toHaveProperty('theme');
      expect(config).toHaveProperty('seo');
      expect(config).toHaveProperty('tracking');
      expect(config).toHaveProperty('featureFlags');
      expect(config).toHaveProperty('compliance');
      expect(config).toHaveProperty('performance');
    });

    it('deve ter metadados de ambiente', () => {
      expect(config).toHaveProperty('environment');
      expect(config).toHaveProperty('version');
      expect(config).toHaveProperty('buildDate');
    });

    it('deve ter utilitários', () => {
      expect(config).toHaveProperty('utils');
      expect(config.utils).toHaveProperty('isProduction');
      expect(config.utils).toHaveProperty('isDevelopment');
      expect(config.utils).toHaveProperty('getEnv');
    });
  });

  describe('Site metadata', () => {
    it('deve ter informações básicas do site', () => {
      expect(site.name).toBe('Saraiva Vision');
      expect(site.domain).toBe('saraivavision.com.br');
      expect(site.baseUrl).toContain('saraivavision.com.br');
    });

    it('deve ter redes sociais configuradas', () => {
      expect(site.social).toHaveProperty('instagram');
      expect(site.social).toHaveProperty('facebook');
      expect(site.social).toHaveProperty('linkedin');
      expect(site.social).toHaveProperty('twitter');
      expect(site.social).toHaveProperty('spotify');
    });

    it('deve ter URLs de redes sociais válidas', () => {
      expect(site.social.instagram.url).toContain('instagram.com');
      expect(site.social.facebook.url).toContain('facebook.com');
      expect(site.social.linkedin.url).toContain('linkedin.com');
      expect(site.social.spotify.url).toContain('spotify.com');
    });

    it('deve ter configuração de APIs', () => {
      expect(site.apis).toHaveProperty('googleMaps');
      expect(site.apis).toHaveProperty('supabase');
      expect(site.apis).toHaveProperty('gemini');
    });
  });

  describe('Business data (NAP)', () => {
    it('deve ter nome completo da clínica', () => {
      expect(business.name).toBe('Clínica Saraiva Vision');
      expect(business.legalName).toBe('Clínica Saraiva Vision');
      expect(business.displayName).toBe('Saraiva Vision');
    });

    it('deve ter endereço completo', () => {
      expect(business.address).toHaveProperty('street');
      expect(business.address).toHaveProperty('number');
      expect(business.address).toHaveProperty('neighborhood');
      expect(business.address).toHaveProperty('city');
      expect(business.address).toHaveProperty('state');
      expect(business.address).toHaveProperty('postalCode');
      expect(business.address.city).toBe('Caratinga');
      expect(business.address.state).toBe('MG');
    });

    it('deve ter coordenadas geográficas', () => {
      expect(business.address.geo).toHaveProperty('latitude');
      expect(business.address.geo).toHaveProperty('longitude');
      expect(business.address.geo.latitude).toBeTypeOf('number');
      expect(business.address.geo.longitude).toBeTypeOf('number');
    });

    it('deve ter formatações pré-computadas de endereço', () => {
      expect(business.address.formatted).toHaveProperty('short');
      expect(business.address.formatted).toHaveProperty('medium');
      expect(business.address.formatted).toHaveProperty('long');
      expect(business.address.formatted).toHaveProperty('full');
    });

    it('deve ter telefone formatado corretamente', () => {
      expect(business.phone.primary).toHaveProperty('e164');
      expect(business.phone.primary).toHaveProperty('display');
      expect(business.phone.primary).toHaveProperty('href');
      expect(business.phone.primary.e164).toMatch(/^\+55/);
      expect(business.phone.primary.href).toMatch(/^tel:/);
    });

    it('deve ter WhatsApp configurado', () => {
      expect(business.phone.whatsapp).toHaveProperty('e164');
      expect(business.phone.whatsapp).toHaveProperty('href');
      expect(business.phone.whatsapp).toHaveProperty('defaultMessage');
      expect(business.phone.whatsapp.href).toContain('wa.me');
    });

    it('deve ter emails configurados', () => {
      expect(business.email.primary).toContain('@saraivavision.com.br');
      expect(business.email.contact).toBe(business.email.primary);
      expect(business.email.href).toMatch(/^mailto:/);
    });

    it('deve ter horário de funcionamento', () => {
      expect(business.hours).toHaveProperty('weekdays');
      expect(business.hours).toHaveProperty('saturday');
      expect(business.hours).toHaveProperty('sunday');
      expect(business.hours).toHaveProperty('formatted');
      expect(business.hours.weekdays.opens).toBe('08:00');
      expect(business.hours.weekdays.closes).toBe('18:00');
    });

    it('deve ter informações do médico responsável (CFM)', () => {
      expect(business.doctor).toHaveProperty('name');
      expect(business.doctor).toHaveProperty('crm');
      expect(business.doctor).toHaveProperty('specialty');
      expect(business.doctor.crm).toContain('CRM-MG');
      expect(business.doctor.specialty).toBe('Oftalmologia');
    });

    it('deve ter informações da equipe (LGPD)', () => {
      expect(business.team).toHaveProperty('nurse');
      expect(business.team.nurse).toHaveProperty('name');
      expect(business.team.nurse).toHaveProperty('coren');
    });

    it('deve ter URLs importantes', () => {
      expect(business.urls).toHaveProperty('onlineScheduling');
      expect(business.urls).toHaveProperty('chatbot');
      expect(business.urls).toHaveProperty('googleMapsProfile');
      expect(business.urls).toHaveProperty('googleReview');
    });

    it('deve ter palavras-chave de serviços', () => {
      expect(business.servicesKeywords).toBeInstanceOf(Array);
      expect(business.servicesKeywords.length).toBeGreaterThan(0);
    });

    it('deve ter configurações de SEO', () => {
      expect(business.seo).toHaveProperty('keywords');
      expect(business.seo).toHaveProperty('shortDescription');
      expect(business.seo).toHaveProperty('mediumDescription');
      expect(business.seo).toHaveProperty('longDescription');
      expect(business.seo.keywords).toBeInstanceOf(Array);
    });
  });

  describe('Internacionalização (i18n)', () => {
    it('deve ter locale padrão', () => {
      expect(i18n.defaultLocale).toBe('pt-br');
    });

    it('deve ter locales suportados', () => {
      expect(i18n.supportedLocales).toBeInstanceOf(Array);
      expect(i18n.supportedLocales).toContain('pt-br');
    });

    it('deve ter namespaces configurados', () => {
      expect(i18n.namespaces).toBeInstanceOf(Array);
      expect(i18n.namespaces).toContain('translation');
    });

    it('deve ter formatos de data/hora', () => {
      expect(i18n.formats).toHaveProperty('date');
      expect(i18n.formats).toHaveProperty('time');
      expect(i18n.formats).toHaveProperty('currency');
    });
  });

  describe('Tema', () => {
    it('deve ter cores definidas', () => {
      expect(theme.colors).toHaveProperty('primary');
      expect(theme.colors).toHaveProperty('secondary');
      expect(theme.colors).toHaveProperty('accent');
    });

    it('deve ter fontes definidas', () => {
      expect(theme.fonts).toHaveProperty('primary');
      expect(theme.fonts).toHaveProperty('secondary');
    });

    it('deve ter breakpoints definidos', () => {
      expect(theme.breakpoints).toHaveProperty('mobile');
      expect(theme.breakpoints).toHaveProperty('tablet');
      expect(theme.breakpoints).toHaveProperty('desktop');
    });
  });

  describe('SEO defaults', () => {
    it('deve ter título padrão', () => {
      expect(seo.defaultTitle).toContain('Saraiva Vision');
    });

    it('deve ter template de título', () => {
      expect(seo.titleTemplate).toContain('%s');
    });

    it('deve ter descrição padrão', () => {
      expect(seo.defaultDescription).toBeTruthy();
      expect(seo.defaultDescription.length).toBeGreaterThan(0);
    });

    it('deve ter configuração Open Graph', () => {
      expect(seo.openGraph).toHaveProperty('type');
      expect(seo.openGraph).toHaveProperty('locale');
      expect(seo.openGraph).toHaveProperty('siteName');
      expect(seo.openGraph).toHaveProperty('images');
    });

    it('deve ter configuração Twitter', () => {
      expect(seo.twitter).toHaveProperty('handle');
      expect(seo.twitter).toHaveProperty('cardType');
    });
  });

  describe('Tracking e Analytics', () => {
    it('deve ter configuração Google Analytics', () => {
      expect(tracking.googleAnalytics).toHaveProperty('enabled');
      expect(tracking.googleAnalytics).toHaveProperty('measurementId');
    });

    it('deve ter configuração Google Tag Manager', () => {
      expect(tracking.googleTagManager).toHaveProperty('enabled');
      expect(tracking.googleTagManager).toHaveProperty('containerId');
    });

    it('deve ter configuração PostHog', () => {
      expect(tracking.postHog).toHaveProperty('enabled');
      expect(tracking.postHog).toHaveProperty('apiKey');
      expect(tracking.postHog).toHaveProperty('apiHost');
    });
  });

  describe('Feature Flags', () => {
    it('deve ter flags de widgets', () => {
      expect(featureFlags).toHaveProperty('accessibilityWidget');
      expect(featureFlags).toHaveProperty('stickyCta');
      expect(featureFlags).toHaveProperty('ctaModal');
      expect(featureFlags).toHaveProperty('toaster');
    });

    it('deve ter flags de features', () => {
      expect(featureFlags).toHaveProperty('lazyWidgets');
      expect(featureFlags).toHaveProperty('blogSearch');
      expect(featureFlags).toHaveProperty('podcastPlayer');
    });

    it('flags de widgets devem estar ativas por padrão', () => {
      expect(featureFlags.accessibilityWidget).toBe(true);
      expect(featureFlags.stickyCta).toBe(true);
    });
  });

  describe('Compliance (LGPD + CFM)', () => {
    it('deve ter configuração LGPD', () => {
      expect(compliance.lgpd).toHaveProperty('enabled');
      expect(compliance.lgpd).toHaveProperty('dpoEmail');
      expect(compliance.lgpd.enabled).toBe(true);
      expect(compliance.lgpd.dpoEmail).toBe('dpo@saraivavision.com.br');
    });

    it('deve ter URLs de políticas', () => {
      expect(compliance.lgpd).toHaveProperty('privacyPolicyUrl');
      expect(compliance.lgpd).toHaveProperty('termsOfServiceUrl');
      expect(compliance.lgpd).toHaveProperty('cookiePolicyUrl');
    });

    it('deve ter configuração de criptografia', () => {
      expect(compliance.lgpd.encryption).toHaveProperty('algorithm');
      expect(compliance.lgpd.encryption.algorithm).toBe('AES-256-GCM');
    });

    it('deve ter configuração CFM', () => {
      expect(compliance.cfm).toHaveProperty('enabled');
      expect(compliance.cfm).toHaveProperty('responsiblePhysician');
      expect(compliance.cfm).toHaveProperty('crm');
      expect(compliance.cfm.enabled).toBe(true);
    });

    it('deve ter validações CFM', () => {
      expect(compliance.cfm.validations).toHaveProperty('requireMedicalDisclaimer');
      expect(compliance.cfm.validations).toHaveProperty('validateMedicalContent');
      expect(compliance.cfm.validations.requireMedicalDisclaimer).toBe(true);
    });
  });

  describe('Performance', () => {
    it('deve ter configuração de code splitting', () => {
      expect(performance.codeSplitting).toHaveProperty('enabled');
      expect(performance.codeSplitting).toHaveProperty('chunkSizeLimit');
      expect(performance.codeSplitting.enabled).toBe(true);
    });

    it('deve ter configuração de lazy loading', () => {
      expect(performance.lazyLoading).toHaveProperty('images');
      expect(performance.lazyLoading).toHaveProperty('routes');
      expect(performance.lazyLoading).toHaveProperty('components');
    });

    it('deve ter configuração de cache', () => {
      expect(performance.cache).toHaveProperty('staticAssets');
      expect(performance.cache).toHaveProperty('apiResponses');
      expect(performance.cache).toHaveProperty('images');
    });

    it('deve ter configuração de prerendering', () => {
      expect(performance.prerendering).toHaveProperty('enabled');
      expect(performance.prerendering).toHaveProperty('routes');
      expect(performance.prerendering.routes).toBeInstanceOf(Array);
    });
  });

  describe('Funções utilitárias', () => {
    it('getEnv deve retornar valor da env var', () => {
      expect(getEnv).toBeTypeOf('function');
    });

    it('isProduction deve retornar boolean', () => {
      expect(isProduction).toBeTypeOf('function');
      expect(isProduction()).toBeTypeOf('boolean');
    });

    it('isDevelopment deve retornar boolean', () => {
      expect(isDevelopment).toBeTypeOf('function');
      expect(isDevelopment()).toBeTypeOf('boolean');
    });

    it('isProduction e isDevelopment devem ser mutuamente exclusivos', () => {
      const prod = isProduction();
      const dev = isDevelopment();
      expect(prod && dev).toBe(false);
    });
  });

  describe('Validação de dados', () => {
    it('telefone e WhatsApp devem ser o mesmo número', () => {
      expect(business.phone.primary.e164).toBe(business.phone.whatsapp.e164);
    });

    it('endereço deve ter todos os campos obrigatórios', () => {
      const requiredFields = ['street', 'number', 'city', 'state', 'postalCode', 'country'];
      requiredFields.forEach(field => {
        expect(business.address[field]).toBeTruthy();
        expect(business.address[field]).not.toBe('');
      });
    });

    it('coordenadas geográficas devem estar na região de Caratinga/MG', () => {
      const { latitude, longitude } = business.address.geo;
      // Caratinga está aproximadamente em -19.789, -42.137
      expect(latitude).toBeGreaterThan(-20);
      expect(latitude).toBeLessThan(-19);
      expect(longitude).toBeGreaterThan(-43);
      expect(longitude).toBeLessThan(-42);
    });

    it('URLs devem usar HTTPS', () => {
      expect(site.baseUrl).toMatch(/^https:\/\//);
      expect(business.urls.onlineScheduling).toMatch(/^https:\/\//);
    });

    it('emails devem ser do domínio saraivavision.com.br', () => {
      expect(business.email.primary).toContain('@saraivavision.com.br');
      expect(compliance.lgpd.dpoEmail).toContain('@saraivavision.com.br');
    });
  });
});
