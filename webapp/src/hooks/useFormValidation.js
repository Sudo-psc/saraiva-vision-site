import { useState, useCallback } from 'react';

/**
 * Custom hook for form validation
 * Provides real-time validation, error handling, and improved UX
 * @param {Object} initialValues - Initial form values
 * @param {Object} validators - Validation rules for each field
 * @returns {Object} - Form state and handlers
 */
export const useFormValidation = (initialValues, validators) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validate a single field
  const validateField = useCallback((name, value) => {
    const validator = validators[name];
    if (!validator) return true;
    
    const result = validator(value);
    return result === true ? null : result;
  }, [validators]);

  // Validate all fields
  const validateAll = useCallback(() => {
    const newErrors = {};
    let isValid = true;

    Object.keys(values).forEach((key) => {
      const error = validateField(key, values[key]);
      if (error) {
        newErrors[key] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [values, validateField]);

  // Handle input changes
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    setValues(prev => ({
      ...prev,
      [name]: newValue
    }));

    // Validate field if it's been touched
    if (touched[name]) {
      const error = validateField(name, newValue);
      setErrors(prev => {
        const next = { ...prev };
        if (error) next[name] = error; else delete next[name];
        return next;
      });
    }
  }, [touched, validateField]);

  // Handle field blur
  const handleBlur = useCallback((e) => {
    const { name, value } = e.target;
    
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    // Validate field on blur
    const fieldValue = value !== undefined ? (e.target.type === 'checkbox' ? e.target.checked : value) : values[name];
    const error = validateField(name, fieldValue);
    setErrors(prev => {
      const next = { ...prev };
      if (error) next[name] = error; else delete next[name];
      return next;
    });
  }, [validateField, values]);

  // Reset form
  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  // Get field props for easy spreading
  const getFieldProps = useCallback((name) => ({
    name,
    value: values[name] || '',
    onChange: handleChange,
    onBlur: handleBlur
  }), [values, handleChange, handleBlur]);

  // Get field state
  const getFieldState = useCallback((name) => ({
    error: errors[name],
    touched: touched[name],
    hasError: Boolean(errors[name]),
    isValid: Boolean(touched[name]) && !errors[name]
  }), [errors, touched]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    setIsSubmitting,
    handleChange,
    handleBlur,
    validateField,
    validateAll,
    reset,
    getFieldProps,
    getFieldState,
    isValid:
      Object.keys(values).every((k) => Boolean(touched[k])) &&
      Object.keys(values).every((k) => {
        const validator = validators[k];
        return validator ? validator(values[k]) === true : true;
      })
  };
};

export default useFormValidation;
