import { describe, it, expect } from 'vitest';
import { createEmailTemplate } from '../email-template.js';

describe('Email Template', () => {
  const mockData = {
    name: 'João Silva',
    email: 'joao@email.com',
    phone: '(33) 99999-9999',
    message: 'Gostaria de agendar uma consulta para exame de vista.',
    submittedAt: new Date('2025-10-03T10:00:00-03:00').toISOString()
  };

  it('deve gerar template HTML válido', () => {
    const html = createEmailTemplate(mockData);
    
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('</html>');
    expect(html).toContain('Nova Solicitação de Contato');
  });

  it('deve incluir todos os dados do paciente', () => {
    const html = createEmailTemplate(mockData);
    
    expect(html).toContain('João Silva');
    expect(html).toContain('joao@email.com');
    expect(html).toContain('(33) 99999-9999');
    expect(html).toContain('Gostaria de agendar uma consulta');
  });

  it('deve escapar HTML no conteúdo do usuário', () => {
    const xssData = {
      ...mockData,
      name: '<script>alert("xss")</script>João',
      message: '<img src=x onerror=alert(1)>Mensagem'
    };
    
    const html = createEmailTemplate(xssData);
    
    expect(html).not.toContain('<script>');
    expect(html).not.toContain('onerror=');
    expect(html).toContain('&lt;script&gt;');
  });

  it('deve incluir botões de ação (email e WhatsApp)', () => {
    const html = createEmailTemplate(mockData);
    
    expect(html).toContain('mailto:joao@email.com');
    expect(html).toContain('wa.me');
    expect(html).toContain('Responder por E-mail');
    expect(html).toContain('Responder no WhatsApp');
  });

  it('deve formatar data em pt-BR', () => {
    const html = createEmailTemplate(mockData);
    
    expect(html).toMatch(/sexta|quinta|quarta|terça|segunda|sábado|domingo/i);
  });

  it('deve incluir metadata de origem', () => {
    const html = createEmailTemplate(mockData);
    
    expect(html).toContain('saraivavision.com.br');
    expect(html).toContain('Formulário de Contato');
  });

  it('deve ter design responsivo', () => {
    const html = createEmailTemplate(mockData);
    
    expect(html).toContain('max-width');
    expect(html).toContain('table');
    expect(html).toContain('width="600"');
  });
});
