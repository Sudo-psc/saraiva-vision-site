import { useState, useCallback } from 'react';

// Use Next.js API routes instead of calling Ninsaude API directly
// This provides better security, error handling, and LGPD compliance
const API_BASE_URL = '/api/ninsaude';

export const useNinsaudeScheduling = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAvailableSlots = useCallback(async (date, professionalId = null, unitId = null) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        date: date.toISOString().split('T')[0],
        ...(professionalId && { professional_id: professionalId }),
        ...(unitId && { unit_id: unitId })
      });

      const response = await fetch(`${API_BASE_URL}/available-slots?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || 'Erro ao buscar horários disponíveis');
      }

      const data = await response.json();
      return data.slots || data.data || [];
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createAppointment = useCallback(async (appointmentData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patient: {
            name: appointmentData.patientName,
            email: appointmentData.patientEmail,
            phone: appointmentData.patientPhone,
            cpf: appointmentData.patientCpf,
          },
          appointment: {
            date: appointmentData.date,
            time: appointmentData.time,
            professional_id: appointmentData.professionalId,
            unit_id: appointmentData.unitId,
            reason: appointmentData.reason,
            notes: appointmentData.notes,
          },
          consent: {
            lgpd: appointmentData.lgpdConsent,
            timestamp: new Date().toISOString(),
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || 'Erro ao criar agendamento');
      }

      const data = await response.json();
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelAppointment = useCallback(async (appointmentId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/appointments/${appointmentId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || 'Erro ao cancelar agendamento');
      }

      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProfessionals = useCallback(async (unitId = null) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (unitId) params.append('unit_id', unitId);

      const response = await fetch(`${API_BASE_URL}/professionals?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || 'Erro ao buscar profissionais');
      }

      const data = await response.json();
      return data.professionals || data.data || [];
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUnits = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/units`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || 'Erro ao buscar unidades');
      }

      const data = await response.json();
      return data.units || data.data || [];
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const searchPatient = useCallback(async (cpf) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/patients?cpf=${cpf}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        // Patient not found is not an error, return null
        if (response.status === 404) {
          return null;
        }
        throw new Error(errorData.message || errorData.error || 'Erro ao buscar paciente');
      }

      const data = await response.json();
      return data.patient || data.data || null;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    fetchAvailableSlots,
    createAppointment,
    cancelAppointment,
    fetchProfessionals,
    fetchUnits,
    searchPatient,
  };
};
