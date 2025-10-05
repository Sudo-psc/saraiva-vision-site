/**
 * Custom hook for patient registration workflow
 *
 * Provides React Hook Form integration with:
 * - CPF validation with real-time feedback
 * - CPF auto-detection (debounced 500ms on blur)
 * - Existing patient retrieval
 * - LGPD consent management
 *
 * @example
 * const {
 *   formData,
 *   errors,
 *   isExistingPatient,
 *   handleCPFBlur,
 *   handleSubmit,
 *   resetForm
 * } = usePatientRegistration({
 *   onPatientFound: (patient) => console.log('Bem-vindo de volta!', patient),
 *   onRegistrationComplete: (patient) => console.log('Cadastro criado!', patient)
 * });
 */

import { useState, useCallback } from 'react';
import { useDebounce } from '../useDebounce';
import { useNinsaude } from './useNinsaude';

// Initial form state
const INITIAL_FORM_DATA = {
  // Required fields
  name: '',
  cpf: '',
  birthDate: '',
  phone: '',
  email: '',

  // Address
  address: {
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    zipCode: '',
  },

  // Optional fields
  gender: '',
  emergencyContact: {
    name: '',
    phone: '',
    relationship: '',
  },

  // LGPD consent
  lgpdConsent: false,
};

/**
 * Validate CPF checksum
 */
const validateCPF = (cpf) => {
  const cleaned = cpf.replace(/[^\d]/g, '');

  if (cleaned.length !== 11 || /^(\d)\1{10}$/.test(cleaned)) {
    return false;
  }

  // Calculate first check digit
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned[i]) * (10 - i);
  }
  const digit1 = 11 - (sum % 11);
  const check1 = digit1 >= 10 ? 0 : digit1;

  // Calculate second check digit
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned[i]) * (11 - i);
  }
  const digit2 = 11 - (sum % 11);
  const check2 = digit2 >= 10 ? 0 : digit2;

  return cleaned[9] === String(check1) && cleaned[10] === String(check2);
};

/**
 * Format CPF with mask
 */
const formatCPF = (value) => {
  const cleaned = value.replace(/[^\d]/g, '');
  const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,3})(\d{0,2})$/);

  if (!match) return value;

  return [match[1], match[2], match[3], match[4]]
    .filter(Boolean)
    .join('.')
    .replace(/\.(\d{2})$/, '-$1');
};

/**
 * Format phone with mask
 */
const formatPhone = (value) => {
  const cleaned = value.replace(/[^\d]/g, '');
  const match = cleaned.match(/^(\d{0,2})(\d{0,5})(\d{0,4})$/);

  if (!match) return value;

  const parts = [match[1], match[2], match[3]].filter(Boolean);

  if (parts.length === 1) return `(${parts[0]}`;
  if (parts.length === 2) return `(${parts[0]}) ${parts[1]}`;
  return `(${parts[0]}) ${parts[1]}-${parts[2]}`;
};

/**
 * Format CEP with mask
 */
const formatCEP = (value) => {
  const cleaned = value.replace(/[^\d]/g, '');
  return cleaned.replace(/^(\d{5})(\d)/, '$1-$2');
};

/**
 * Patient registration hook
 */
export function usePatientRegistration(options = {}) {
  const {
    onPatientFound = () => {},
    onRegistrationComplete = () => {},
    onError = () => {},
  } = options;

  const { fetchPatient, createPatient, loading: ninsaudeLoading } = useNinsaude();

  // Form state
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isValidating, setIsValidating] = useState(false);

  // Patient state
  const [existingPatient, setExistingPatient] = useState(null);
  const [isExistingPatient, setIsExistingPatient] = useState(false);
  const [cpfCheckInProgress, setCpfCheckInProgress] = useState(false);

  // Debounced CPF for auto-detection
  const debouncedCPF = useDebounce(formData.cpf, 500);

  /**
   * Validate single field
   */
  const validateField = useCallback((name, value) => {
    let error = '';

    switch (name) {
      case 'name':
        if (!value || value.trim().length < 3) {
          error = 'Nome completo obrigatório (mínimo 3 caracteres)';
        } else if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(value)) {
          error = 'Nome deve conter apenas letras';
        }
        break;

      case 'cpf':
        const cleaned = value.replace(/[^\d]/g, '');
        if (!cleaned) {
          error = 'CPF obrigatório';
        } else if (cleaned.length !== 11) {
          error = 'CPF deve ter 11 dígitos';
        } else if (!validateCPF(value)) {
          error = 'CPF inválido';
        }
        break;

      case 'birthDate':
        if (!value) {
          error = 'Data de nascimento obrigatória';
        } else {
          const birth = new Date(value);
          const today = new Date();
          const age = today.getFullYear() - birth.getFullYear();
          if (age < 0 || age > 120) {
            error = 'Data de nascimento inválida';
          }
        }
        break;

      case 'phone':
        const cleanedPhone = value.replace(/[^\d]/g, '');
        if (!cleanedPhone) {
          error = 'Telefone obrigatório';
        } else if (cleanedPhone.length < 10 || cleanedPhone.length > 11) {
          error = 'Telefone inválido';
        }
        break;

      case 'email':
        if (!value) {
          error = 'E-mail obrigatório';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = 'E-mail inválido';
        }
        break;

      case 'lgpdConsent':
        if (!value) {
          error = 'É necessário consentir com os termos da LGPD';
        }
        break;

      default:
        break;
    }

    return error;
  }, []);

  /**
   * Handle field change
   */
  const handleChange = useCallback((e) => {
    const { name, type, value, checked } = e.target;
    let newValue = type === 'checkbox' ? checked : value;

    // Apply formatting
    if (name === 'cpf') {
      newValue = formatCPF(newValue);
    } else if (name === 'phone' || name === 'emergencyContact.phone') {
      newValue = formatPhone(newValue);
    } else if (name === 'address.zipCode') {
      newValue = formatCEP(newValue);
    }

    // Update nested fields
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: newValue,
        },
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: newValue }));
    }

    // Real-time validation for touched fields
    if (touched[name]) {
      const error = validateField(name, newValue);
      setErrors(prev => ({
        ...prev,
        [name]: error,
      }));
    }
  }, [touched, validateField]);

  /**
   * Handle field blur
   */
  const handleBlur = useCallback((e) => {
    const { name, value } = e.target;

    // Mark field as touched
    setTouched(prev => ({ ...prev, [name]: true }));

    // Validate on blur
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error,
    }));
  }, [validateField]);

  /**
   * Handle CPF blur - trigger auto-detection
   */
  const handleCPFBlur = useCallback(async (e) => {
    handleBlur(e);

    const cpf = e.target.value;
    const cleaned = cpf.replace(/[^\d]/g, '');

    // Only check if CPF is valid
    if (cleaned.length === 11 && validateCPF(cpf)) {
      setCpfCheckInProgress(true);

      try {
        const patient = await fetchPatient(cpf);

        if (patient) {
          setExistingPatient(patient);
          setIsExistingPatient(true);

          // Pre-fill form with existing data
          setFormData(prev => ({
            ...prev,
            name: patient.name || prev.name,
            birthDate: patient.birthDate || prev.birthDate,
            phone: patient.phone || prev.phone,
            email: patient.email || prev.email,
            address: patient.address || prev.address,
            gender: patient.gender || prev.gender,
          }));

          onPatientFound(patient);
        } else {
          setExistingPatient(null);
          setIsExistingPatient(false);
        }
      } catch (err) {
        // Patient not found - allow new registration
        console.log('Patient not found, will create new');
        setExistingPatient(null);
        setIsExistingPatient(false);
      } finally {
        setCpfCheckInProgress(false);
      }
    }
  }, [handleBlur, fetchPatient, onPatientFound]);

  /**
   * Validate all fields
   */
  const validateAllFields = useCallback(() => {
    const newErrors = {};

    // Required fields
    ['name', 'cpf', 'birthDate', 'phone', 'email', 'lgpdConsent'].forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });

    // Address fields (required for full registration)
    if (!isExistingPatient) {
      ['street', 'number', 'neighborhood', 'city', 'state', 'zipCode'].forEach(field => {
        const value = formData.address[field];
        if (!value || value.trim() === '') {
          newErrors[`address.${field}`] = `Campo obrigatório`;
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, isExistingPatient, validateField]);

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(async (e) => {
    if (e) e.preventDefault();

    setIsValidating(true);

    // Validate all fields
    const isValid = validateAllFields();

    if (!isValid) {
      setIsValidating(false);
      onError(new Error('Por favor, corrija os erros no formulário'));
      return;
    }

    try {
      let patient;

      // If existing patient, just return their data
      if (isExistingPatient && existingPatient) {
        patient = existingPatient;
      } else {
        // Create new patient
        patient = await createPatient(formData);
      }

      onRegistrationComplete(patient);
      return patient;

    } catch (err) {
      const error = new Error(err.message || 'Erro ao processar cadastro');
      setErrors(prev => ({
        ...prev,
        submit: error.message,
      }));
      onError(error);
      throw error;
    } finally {
      setIsValidating(false);
    }
  }, [formData, isExistingPatient, existingPatient, validateAllFields, createPatient, onRegistrationComplete, onError]);

  /**
   * Reset form
   */
  const resetForm = useCallback(() => {
    setFormData(INITIAL_FORM_DATA);
    setErrors({});
    setTouched({});
    setExistingPatient(null);
    setIsExistingPatient(false);
    setIsValidating(false);
  }, []);

  /**
   * Check if form is valid
   */
  const isFormValid = useCallback(() => {
    return Object.keys(errors).length === 0 && formData.lgpdConsent;
  }, [errors, formData.lgpdConsent]);

  return {
    // Form state
    formData,
    errors,
    touched,
    isValidating: isValidating || ninsaudeLoading,

    // Patient state
    existingPatient,
    isExistingPatient,
    cpfCheckInProgress,

    // Handlers
    handleChange,
    handleBlur,
    handleCPFBlur,
    handleSubmit,

    // Utilities
    resetForm,
    isFormValid,
    validateField,
  };
}

export default usePatientRegistration;
