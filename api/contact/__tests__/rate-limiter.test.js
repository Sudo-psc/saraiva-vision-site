import { describe, it, expect, beforeEach } from 'vitest';
import { rateLimiter } from '../rate-limiter.js';

describe('Rate Limiter', () => {
  const testIp = '192.168.1.100';

  beforeEach(() => {
    rateLimiter.reset(testIp);
  });

  it('deve permitir até 3 requisições', () => {
    expect(rateLimiter.check(testIp)).toBe(false);
    expect(rateLimiter.check(testIp)).toBe(false);
    expect(rateLimiter.check(testIp)).toBe(false);
  });

  it('deve bloquear a 4ª requisição', () => {
    rateLimiter.check(testIp);
    rateLimiter.check(testIp);
    rateLimiter.check(testIp);
    
    expect(rateLimiter.check(testIp)).toBe(true);
  });

  it('deve resetar contador para IP específico', () => {
    rateLimiter.check(testIp);
    rateLimiter.check(testIp);
    rateLimiter.check(testIp);
    
    rateLimiter.reset(testIp);
    
    expect(rateLimiter.check(testIp)).toBe(false);
  });

  it('deve isolar contadores entre diferentes IPs', () => {
    const ip1 = '192.168.1.1';
    const ip2 = '192.168.1.2';
    
    rateLimiter.check(ip1);
    rateLimiter.check(ip1);
    rateLimiter.check(ip1);
    
    expect(rateLimiter.check(ip2)).toBe(false);
  });

  it('deve hashear IPs para privacidade', () => {
    const stats = rateLimiter.getStats();
    
    rateLimiter.check(testIp);
    
    const newStats = rateLimiter.getStats();
    expect(newStats.totalEntries).toBeGreaterThan(stats.totalEntries);
  });

  it('deve retornar estatísticas do rate limiter', () => {
    const stats = rateLimiter.getStats();
    
    expect(stats).toHaveProperty('totalEntries');
    expect(stats).toHaveProperty('config');
    expect(stats.config).toHaveProperty('windowMs');
    expect(stats.config).toHaveProperty('maxRequests');
  });
});
