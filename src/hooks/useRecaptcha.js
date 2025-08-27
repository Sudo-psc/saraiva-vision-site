import { useState, useCallback, useRef } from 'react';

/**
 * Custom hook for Google reCAPTCHA integration
 * Provides methods to execute and reset reCAPTCHA
 */
export const useRecaptcha = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const recaptchaRef = useRef(null);

  const executeRecaptcha = useCallback(async () => {
    if (!recaptchaRef.current) {
      setError('reCAPTCHA não foi inicializado');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const token = await recaptchaRef.current.executeAsync();
      
      if (!token) {
        setError('Falha ao obter token do reCAPTCHA');
        return null;
      }

      return token;
    } catch (err) {
      setError('Erro ao executar reCAPTCHA: ' + err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetRecaptcha = useCallback(() => {
    if (recaptchaRef.current) {
      recaptchaRef.current.reset();
    }
    setError(null);
  }, []);

  const setRecaptchaRef = useCallback((ref) => {
    recaptchaRef.current = ref;
  }, []);

  return {
    executeRecaptcha,
    resetRecaptcha,
    setRecaptchaRef,
    recaptchaRef,
    isLoading,
    error
  };
};