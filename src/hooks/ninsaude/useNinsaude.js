/**
 * Custom hook for Ninsaúde API integration
 *
 * Provides a centralized interface for all Ninsaúde API operations with:
 * - Axios client wrapper with error handling
 * - Automatic retry with exponential backoff (1s, 2s, 4s)
 * - Request queueing on API failure
 * - Loading states and error states
 *
 * @example
 * const { loading, error, fetchPatient, bookAppointment } = useNinsaude();
 *
 * // Fetch patient by CPF
 * const patient = await fetchPatient('123.456.789-00');
 *
 * // Book appointment
 * await bookAppointment({
 *   patientId: patient.id,
 *   professionalId: 'prof-123',
 *   dateTime: '2025-10-15T10:00:00'
 * });
 */

import { useState, useCallback, useRef } from 'react';

// API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001';
const MAX_RETRIES = 3;
const RETRY_DELAYS = [1000, 2000, 4000]; // Exponential backoff: 1s, 2s, 4s

/**
 * Calculate delay for retry attempt
 */
const getRetryDelay = (attemptNumber) => {
  return RETRY_DELAYS[attemptNumber] || RETRY_DELAYS[RETRY_DELAYS.length - 1];
};

/**
 * Check if error is retryable
 */
const isRetryableError = (error) => {
  // Network errors
  if (error.message.includes('network') ||
      error.message.includes('timeout') ||
      error.message.includes('ECONNREFUSED')) {
    return true;
  }

  // Server errors (5xx)
  if (error.response && error.response.status >= 500) {
    return true;
  }

  // Rate limit errors (429)
  if (error.response && error.response.status === 429) {
    return true;
  }

  return false;
};

/**
 * Main Ninsaúde API hook
 */
export function useNinsaude() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Request queue for failed operations
  const requestQueue = useRef([]);
  const abortControllerRef = useRef(null);

  /**
   * Generic API request with retry logic
   */
  const apiRequest = useCallback(async (endpoint, options = {}, retryCount = 0) => {
    // Cancel previous request if exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        signal: abortControllerRef.current.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'API request failed');
      }

      return result.data;

    } catch (err) {
      if (err.name === 'AbortError') {
        return null; // Request was cancelled
      }

      console.error(`API request error (attempt ${retryCount + 1}/${MAX_RETRIES + 1}):`, err);

      // Retry logic
      if (retryCount < MAX_RETRIES && isRetryableError(err)) {
        const delay = getRetryDelay(retryCount);
        console.log(`Retrying in ${delay}ms...`);

        await new Promise(resolve => setTimeout(resolve, delay));
        return apiRequest(endpoint, options, retryCount + 1);
      }

      // Queue request if all retries failed
      if (retryCount >= MAX_RETRIES) {
        requestQueue.current.push({
          endpoint,
          options,
          timestamp: Date.now(),
        });
        console.warn('Request queued for later retry');
      }

      throw err;
    }
  }, []);

  /**
   * Fetch patient by CPF
   */
  const fetchPatient = useCallback(async (cpf) => {
    setLoading(true);
    setError(null);

    try {
      const cleanCpf = cpf.replace(/[^\d]/g, '');
      const data = await apiRequest(`/api/ninsaude/patients?cpf=${cleanCpf}`, {
        method: 'GET',
      });

      return data;
    } catch (err) {
      const error = new Error(err.message || 'Erro ao buscar paciente');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [apiRequest]);

  /**
   * Create new patient
   */
  const createPatient = useCallback(async (patientData) => {
    setLoading(true);
    setError(null);

    try {
      const data = await apiRequest('/api/ninsaude/patients', {
        method: 'POST',
        body: JSON.stringify(patientData),
      });

      return data;
    } catch (err) {
      const error = new Error(err.message || 'Erro ao cadastrar paciente');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [apiRequest]);

  /**
   * Get appointment availability
   */
  const getAvailability = useCallback(async (params) => {
    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams({
        date: params.date,
        ...(params.professionalId && { professionalId: params.professionalId }),
        ...(params.careUnitId && { careUnitId: params.careUnitId }),
        ...(params.specialty && { specialty: params.specialty }),
      });

      const data = await apiRequest(`/api/ninsaude/availability?${queryParams}`, {
        method: 'GET',
      });

      return data;
    } catch (err) {
      const error = new Error(err.message || 'Erro ao buscar disponibilidade');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [apiRequest]);

  /**
   * Book appointment
   */
  const bookAppointment = useCallback(async (appointmentData) => {
    setLoading(true);
    setError(null);

    try {
      const data = await apiRequest('/api/ninsaude/appointments', {
        method: 'POST',
        body: JSON.stringify(appointmentData),
      });

      return data;
    } catch (err) {
      const error = new Error(err.message || 'Erro ao agendar consulta');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [apiRequest]);

  /**
   * Cancel appointment
   */
  const cancelAppointment = useCallback(async (appointmentId, reason = '') => {
    setLoading(true);
    setError(null);

    try {
      const data = await apiRequest(`/api/ninsaude/appointments/${appointmentId}`, {
        method: 'DELETE',
        body: JSON.stringify({ reason }),
      });

      return data;
    } catch (err) {
      const error = new Error(err.message || 'Erro ao cancelar consulta');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [apiRequest]);

  /**
   * Reschedule appointment
   */
  const rescheduleAppointment = useCallback(async (appointmentId, newDateTime) => {
    setLoading(true);
    setError(null);

    try {
      const data = await apiRequest(`/api/ninsaude/appointments/${appointmentId}/reschedule`, {
        method: 'PUT',
        body: JSON.stringify({ dateTime: newDateTime }),
      });

      return data;
    } catch (err) {
      const error = new Error(err.message || 'Erro ao reagendar consulta');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [apiRequest]);

  /**
   * Process queued requests
   */
  const processQueue = useCallback(async () => {
    if (requestQueue.current.length === 0) {
      return;
    }

    const queue = [...requestQueue.current];
    requestQueue.current = [];

    for (const queuedRequest of queue) {
      try {
        await apiRequest(queuedRequest.endpoint, queuedRequest.options);
        console.log('Queued request processed successfully');
      } catch (err) {
        console.error('Failed to process queued request:', err);
        // Re-queue if still failing
        requestQueue.current.push(queuedRequest);
      }
    }
  }, [apiRequest]);

  return {
    // State
    loading,
    error,

    // Patient operations
    fetchPatient,
    createPatient,

    // Availability
    getAvailability,

    // Appointment operations
    bookAppointment,
    cancelAppointment,
    rescheduleAppointment,

    // Queue management
    processQueue,
    queueLength: requestQueue.current.length,
  };
}

export default useNinsaude;
