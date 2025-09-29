/**
 * Contact Form Hook - Form State Management and Validation
 *
 * Extracted from Contact.jsx monolithic component (1229 lines)
 * Handles form data, validation, and field interactions
 *
 * @example
 * const form = useContactForm({
 *   onValidationChange: (isValid) => console.log(isValid),
 *   announceToScreenReader: (message) => liveRegion.announce(message)
 * });
 *
 * <input
 *   value={form.formData.email}
 *   onChange={form.handleChange}
 *   onBlur={form.handleBlur}
 * />
 */

import { useState, useCallback } from 'react';
import { validateField } from '@/lib/validation';

const INITIAL_FORM_DATA = {
  name: '',
  email: '',
  phone: '',
  message: '',
  consent: false,
  honeypot: '' // Spam protection
};

const FIELD_LABELS = {
  name: 'Nome',
  email: 'E-mail',
  phone: 'Telefone',
  message: 'Mensagem',
  consent: 'Consentimento'
};

export function useContactForm(options = {}) {
  const {
    onValidationChange,
    announceToScreenReader = () => {},
    onSuccessReset = false
  } = options;

  // Form state
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [fieldValidation, setFieldValidation] = useState({});
  const [isValidating, setIsValidating] = useState(false);

  /**
   * Get human-readable label for field name
   */
  const getFieldLabel = useCallback((fieldName) => {
    return FIELD_LABELS[fieldName] || fieldName;
  }, []);

  /**
   * Validate single field in real-time
   */
  const validateFieldRealTime = useCallback(async (fieldName, value) => {
    setIsValidating(true);

    try {
      const result = validateField(fieldName, value, formData);

      setFieldValidation(prev => ({
        ...prev,
        [fieldName]: result
      }));

      if (!result.success) {
        setErrors(prev => ({
          ...prev,
          [fieldName]: result.error
        }));
        announceToScreenReader(
          `Erro no campo ${getFieldLabel(fieldName)}: ${result.error}`,
          'assertive'
        );
      } else {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[fieldName];
          return newErrors;
        });
        announceToScreenReader(`Campo ${getFieldLabel(fieldName)} válido`);
      }

      // Notify parent of validation state change
      if (onValidationChange) {
        const hasErrors = Object.keys(errors).length > 0 || !result.success;
        onValidationChange(!hasErrors);
      }
    } catch (error) {
      const errorMessage = 'Erro de validação';
      setErrors(prev => ({
        ...prev,
        [fieldName]: errorMessage
      }));
      announceToScreenReader(
        `Erro no campo ${getFieldLabel(fieldName)}: ${errorMessage}`,
        'assertive'
      );
    } finally {
      setIsValidating(false);
    }
  }, [formData, errors, getFieldLabel, announceToScreenReader, onValidationChange]);

  /**
   * Handle form field changes
   */
  const handleChange = useCallback((e) => {
    const { name, type, value, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    setFormData(prev => ({ ...prev, [name]: newValue }));

    // Real-time validation for touched fields (except honeypot)
    if (name !== 'honeypot' && touched[name]) {
      validateFieldRealTime(name, newValue);
    }
  }, [touched, validateFieldRealTime]);

  /**
   * Handle field blur events
   */
  const handleBlur = useCallback((e) => {
    const { name, value } = e.target;

    // Mark field as touched
    if (!touched[name]) {
      setTouched(prev => ({ ...prev, [name]: true }));
    }

    // Validate on blur (except honeypot)
    if (name !== 'honeypot') {
      validateFieldRealTime(name, value);
    }
  }, [touched, validateFieldRealTime]);

  /**
   * Reset form to initial state
   */
  const resetForm = useCallback(() => {
    setFormData(INITIAL_FORM_DATA);
    setErrors({});
    setTouched({});
    setFieldValidation({});
    setIsValidating(false);
  }, []);

  /**
   * Check if form is valid (all required fields validated)
   */
  const isFormValid = useCallback(() => {
    const hasRequiredFields = formData.name && formData.email && formData.message && formData.consent;
    const hasNoErrors = Object.keys(errors).length === 0;
    const isHoneypotEmpty = !formData.honeypot || formData.honeypot.trim() === '';

    return hasRequiredFields && hasNoErrors && isHoneypotEmpty;
  }, [formData, errors]);

  return {
    // State
    formData,
    errors,
    touched,
    fieldValidation,
    isValidating,

    // Handlers
    handleChange,
    handleBlur,
    validateField: validateFieldRealTime,

    // Utilities
    resetForm,
    isFormValid,
    getFieldLabel
  };
}

export default useContactForm;