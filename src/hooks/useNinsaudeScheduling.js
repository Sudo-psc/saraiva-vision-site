import { useState, useCallback } from 'react';

const NINSAUDE_API_BASE_URL = process.env.REACT_APP_NINSAUDE_API_URL || 'https://api.ninsaude.com/v1';
const NINSAUDE_API_KEY = process.env.REACT_APP_NINSAUDE_API_KEY;

export const useNinsaudeScheduling = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAvailableSlots = useCallback(async (date, professionalId = null) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        date: date.toISOString().split('T')[0],
        ...(professionalId && { professional_id: professionalId })
      });

      const response = await fetch(`${NINSAUDE_API_BASE_URL}/schedule/available?${params}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${NINSAUDE_API_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar horários disponíveis');
      }

      const data = await response.json();
      return data.slots || [];
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
      const response = await fetch(`${NINSAUDE_API_BASE_URL}/schedule/appointments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${NINSAUDE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
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
            timestamp: new Date().toISOString(),
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao criar agendamento');
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
      const response = await fetch(`${NINSAUDE_API_BASE_URL}/schedule/appointments/${appointmentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${NINSAUDE_API_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao cancelar agendamento');
      }

      return true;
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
  };
};
