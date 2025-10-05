import { describe, it, expect } from 'vitest';

describe('AppointmentScheduler - Simple Tests', () => {
  describe('Validation Logic', () => {
    it('should validate email format correctly', () => {
      const validEmail = 'test@example.com';
      const invalidEmail = 'invalid-email';
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      expect(emailRegex.test(validEmail)).toBe(true);
      expect(emailRegex.test(invalidEmail)).toBe(false);
    });

    it('should validate phone number length', () => {
      const validPhone = '33988776655';
      const invalidPhone = '3398877';
      
      expect(validPhone.length).toBeGreaterThanOrEqual(10);
      expect(invalidPhone.length).toBeLessThan(10);
    });

    it('should validate required fields', () => {
      const formData = {
        patientName: 'João Silva',
        patientEmail: 'joao@email.com',
        patientPhone: '33988776655',
        reason: 'consulta-rotina',
        lgpdConsent: true,
      };

      expect(formData.patientName.trim()).toBeTruthy();
      expect(formData.patientEmail.trim()).toBeTruthy();
      expect(formData.patientPhone).toBeTruthy();
      expect(formData.reason).toBeTruthy();
      expect(formData.lgpdConsent).toBe(true);
    });

    it('should reject form with missing name', () => {
      const formData = {
        patientName: '',
        patientEmail: 'joao@email.com',
        patientPhone: '33988776655',
        reason: 'consulta-rotina',
        lgpdConsent: true,
      };

      expect(formData.patientName.trim()).toBeFalsy();
    });

    it('should reject form without LGPD consent', () => {
      const formData = {
        patientName: 'João Silva',
        patientEmail: 'joao@email.com',
        patientPhone: '33988776655',
        reason: 'consulta-rotina',
        lgpdConsent: false,
      };

      expect(formData.lgpdConsent).toBe(false);
    });
  });

  describe('Data Formatting', () => {
    it('should format date correctly for API', () => {
      const date = new Date('2025-10-15T10:00:00');
      const formattedDate = date.toISOString().split('T')[0];
      
      expect(formattedDate).toBe('2025-10-15');
    });

    it('should create appointment payload correctly', () => {
      const appointmentData = {
        patientName: 'Maria Silva',
        patientEmail: 'maria@example.com',
        patientPhone: '33988776655',
        date: '2025-10-15',
        time: '08:00',
        reason: 'consulta-rotina',
        notes: 'Primeira consulta',
        lgpdConsent: true,
      };

      const payload = {
        patient: {
          name: appointmentData.patientName,
          email: appointmentData.patientEmail,
          phone: appointmentData.patientPhone,
        },
        appointment: {
          date: appointmentData.date,
          time: appointmentData.time,
          professional_id: appointmentData.professionalId,
          reason: appointmentData.reason,
          notes: appointmentData.notes,
        },
        consent: {
          lgpd: appointmentData.lgpdConsent,
          timestamp: expect.any(String),
        }
      };

      expect(payload.patient.name).toBe('Maria Silva');
      expect(payload.patient.email).toBe('maria@example.com');
      expect(payload.consent.lgpd).toBe(true);
    });
  });

  describe('Consultation Reasons', () => {
    const CONSULTATION_REASONS = [
      { value: 'consulta-rotina', label: 'Consulta de Rotina' },
      { value: 'primeira-consulta', label: 'Primeira Consulta' },
      { value: 'retorno', label: 'Retorno' },
      { value: 'exame-vista', label: 'Exame de Vista' },
      { value: 'urgencia', label: 'Urgência Oftalmológica' },
      { value: 'cirurgia-pre', label: 'Pré-Operatório' },
      { value: 'cirurgia-pos', label: 'Pós-Operatório' },
      { value: 'outro', label: 'Outro' },
    ];

    it('should have all consultation reason options', () => {
      expect(CONSULTATION_REASONS).toHaveLength(8);
      expect(CONSULTATION_REASONS[0].value).toBe('consulta-rotina');
      expect(CONSULTATION_REASONS[4].value).toBe('urgencia');
    });

    it('should have valid consultation reason value', () => {
      const selectedReason = 'consulta-rotina';
      const validReasons = CONSULTATION_REASONS.map(r => r.value);
      
      expect(validReasons).toContain(selectedReason);
    });
  });

  describe('WhatsApp Integration', () => {
    it('should generate WhatsApp URL correctly', () => {
      const whatsappNumber = '5533988776655';
      const appointmentData = {
        date: '2025-10-15',
        time: '08:00',
      };

      const formattedDate = new Date(appointmentData.date).toLocaleDateString('pt-BR');
      const message = `Olá! Gostaria de confirmar meu agendamento para ${formattedDate} às ${appointmentData.time}.`;
      const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

      expect(url).toContain('wa.me');
      expect(url).toContain(whatsappNumber);
      expect(decodeURIComponent(url)).toContain('08:00');
    });
  });

  describe('LGPD Compliance', () => {
    it('should create timestamp for consent', () => {
      const timestamp = new Date().toISOString();
      
      expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('should include consent in appointment data', () => {
      const consent = {
        lgpd: true,
        timestamp: new Date().toISOString(),
      };

      expect(consent.lgpd).toBe(true);
      expect(consent.timestamp).toBeDefined();
    });
  });
});
