import { useState, useRef, useCallback } from 'react';

/**
 * Custom hook for form submission with double-submit prevention
 *
 * @param {Function} onSubmit - Async function to handle form submission
 * @param {Object} options - Configuration options
 * @param {number} options.debounceMs - Debounce time in milliseconds (default: 500)
 * @param {Function} options.onSuccess - Success callback
 * @param {Function} options.onError - Error callback
 *
 * @returns {Object} - { handleSubmit, isSubmitting, submitCount }
 *
 * @author Dr. Philipe Saraiva Cruz
 *
 * @example
 * const { handleSubmit, isSubmitting } = useFormSubmit(async (formData) => {
 *   await fetch('/api/contact', {
 *     method: 'POST',
 *     body: JSON.stringify(formData)
 *   });
 * });
 */
export function useFormSubmit(onSubmit, options = {}) {
  const {
    debounceMs = 500,
    onSuccess,
    onError
  } = options;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitCount, setSubmitCount] = useState(0);
  const lastSubmitTime = useRef(0);
  const submitInProgress = useRef(false);

  const handleSubmit = useCallback(async (e) => {
    // Prevent default form submission
    if (e && e.preventDefault) {
      e.preventDefault();
    }

    // Double-submit prevention: check if already submitting
    if (submitInProgress.current || isSubmitting) {
      return;
    }

    // Debounce prevention: check if submitted too recently
    const now = Date.now();
    const timeSinceLastSubmit = now - lastSubmitTime.current;
    if (timeSinceLastSubmit < debounceMs) {
        timeSinceLastSubmit,
        debounceMs
      });
      return;
    }

    // Mark submission as in progress
    submitInProgress.current = true;
    setIsSubmitting(true);
    lastSubmitTime.current = now;
    setSubmitCount(prev => prev + 1);

    try {
      // Execute the submission function
      const result = await onSubmit(e);

      // Success callback
      if (onSuccess) {
        onSuccess(result);
      }

      return result;
    } catch (error) {

      // Error callback
      if (onError) {
        onError(error);
      }

      throw error;
    } finally {
      // Always reset submission state
      setIsSubmitting(false);
      submitInProgress.current = false;
    }
  }, [onSubmit, debounceMs, onSuccess, onError, isSubmitting]);

  return {
    handleSubmit,
    isSubmitting,
    submitCount
  };
}

export default useFormSubmit;
