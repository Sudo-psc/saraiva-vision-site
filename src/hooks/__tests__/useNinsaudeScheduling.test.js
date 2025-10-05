import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useNinsaudeScheduling } from '../useNinsaudeScheduling';

global.fetch = vi.fn();

describe('useNinsaudeScheduling', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  describe('fetchAvailableSlots', () => {
    it('should fetch available slots successfully', async () => {
      const mockSlots = [
        { time: '08:00', available: true },
        { time: '08:30', available: true },
      ];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ slots: mockSlots }),
      });

      const { result } = renderHook(() => useNinsaudeScheduling());

      const slots = await result.current.fetchAvailableSlots(new Date('2025-10-15'));

      expect(slots).toEqual(mockSlots);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/schedule/available'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('should set loading state during fetch', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ slots: [] }),
      });

      const { result } = renderHook(() => useNinsaudeScheduling());

      expect(result.current.loading).toBe(false);

      const promise = result.current.fetchAvailableSlots(new Date('2025-10-15'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await promise;
    });

    it('should handle fetch errors', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
      });

      const { result } = renderHook(() => useNinsaudeScheduling());

      await expect(
        result.current.fetchAvailableSlots(new Date('2025-10-15'))
      ).rejects.toThrow('Erro ao buscar horários disponíveis');
    });

    it('should include professional_id when provided', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ slots: [] }),
      });

      const { result } = renderHook(() => useNinsaudeScheduling());

      await result.current.fetchAvailableSlots(new Date('2025-10-15'), 'prof123');

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('professional_id=prof123'),
        expect.any(Object)
      );
    });
  });

  describe('createAppointment', () => {
    it('should create appointment successfully', async () => {
      const mockResponse = {
        id: 'AGD-001',
        date: '2025-10-15',
        time: '08:00',
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const { result } = renderHook(() => useNinsaudeScheduling());

      const appointmentData = {
        patientName: 'João Silva',
        patientEmail: 'joao@email.com',
        patientPhone: '33988776655',
        date: '2025-10-15',
        time: '08:00',
        reason: 'consulta-rotina',
        lgpdConsent: true,
      };

      const response = await result.current.createAppointment(appointmentData);

      expect(response).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/schedule/appointments'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          body: expect.stringContaining('João Silva'),
        })
      );
    });

    it('should handle appointment creation errors', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Horário indisponível' }),
      });

      const { result } = renderHook(() => useNinsaudeScheduling());

      const appointmentData = {
        patientName: 'João Silva',
        patientEmail: 'joao@email.com',
        patientPhone: '33988776655',
        date: '2025-10-15',
        time: '08:00',
        reason: 'consulta-rotina',
        lgpdConsent: true,
      };

      await expect(
        result.current.createAppointment(appointmentData)
      ).rejects.toThrow('Horário indisponível');
    });

    it('should include LGPD consent in request', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'AGD-001' }),
      });

      const { result } = renderHook(() => useNinsaudeScheduling());

      const appointmentData = {
        patientName: 'João Silva',
        patientEmail: 'joao@email.com',
        patientPhone: '33988776655',
        date: '2025-10-15',
        time: '08:00',
        reason: 'consulta-rotina',
        lgpdConsent: true,
      };

      await result.current.createAppointment(appointmentData);

      const callBody = JSON.parse(fetch.mock.calls[0][1].body);
      expect(callBody.consent).toBeDefined();
      expect(callBody.consent.lgpd).toBe(true);
      expect(callBody.consent.timestamp).toBeDefined();
    });
  });

  describe('cancelAppointment', () => {
    it('should cancel appointment successfully', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
      });

      const { result } = renderHook(() => useNinsaudeScheduling());

      const success = await result.current.cancelAppointment('AGD-001');

      expect(success).toBe(true);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/schedule/appointments/AGD-001'),
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });

    it('should handle cancellation errors', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
      });

      const { result } = renderHook(() => useNinsaudeScheduling());

      await expect(
        result.current.cancelAppointment('AGD-001')
      ).rejects.toThrow('Erro ao cancelar agendamento');
    });
  });
});
