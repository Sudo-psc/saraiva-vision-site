import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import useFormValidation from '../useFormValidation';

describe('useFormValidation Hook', () => {
  const initialValues = {
    name: '',
    email: '',
    phone: '',
    message: '',
    consent: false
  };

  const validators = {
    name: (value) => {
      if (!value) return 'Nome é obrigatório';
      if (value.length < 3) return 'Nome deve ter pelo menos 3 caracteres';
      if (value.length > 50) return 'Nome muito longo';
      if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(value)) return 'Nome deve conter apenas letras';
      return true;
    },
    email: (value) => {
      if (!value) return 'Email é obrigatório';
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(value)) return 'Email inválido';
      return true;
    },
    phone: (value) => {
      if (!value) return 'Telefone é obrigatório';
      const cleaned = value.replace(/\D/g, '');
      if (cleaned.length < 10 || cleaned.length > 13) return 'Telefone inválido';
      return true;
    },
    message: (value) => {
      if (!value) return 'Mensagem é obrigatória';
      if (value.length < 10) return 'Mensagem deve ter pelo menos 10 caracteres';
      if (value.length > 1000) return 'Mensagem muito longa';
      return true;
    },
    consent: (value) => value === true || 'É necessário aceitar os termos'
  };

  it('initializes with correct default values', () => {
    const { result } = renderHook(() => useFormValidation(initialValues, validators));

    expect(result.current.values).toEqual(initialValues);
    expect(result.current.errors).toEqual({});
    expect(result.current.touched).toEqual({});
    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.isValid).toBe(false);
  });

  it('handles input changes correctly', () => {
    const { result } = renderHook(() => useFormValidation(initialValues, validators));

    act(() => {
      result.current.handleChange({
        target: { name: 'name', value: 'João Silva', type: 'text' }
      });
    });

    expect(result.current.values.name).toBe('João Silva');
  });

  it('handles checkbox changes correctly', () => {
    const { result } = renderHook(() => useFormValidation(initialValues, validators));

    act(() => {
      result.current.handleChange({
        target: { name: 'consent', checked: true, type: 'checkbox' }
      });
    });

    expect(result.current.values.consent).toBe(true);
  });

  it('validates field on blur', () => {
    const { result } = renderHook(() => useFormValidation(initialValues, validators));

    act(() => {
      result.current.handleBlur({
        target: { name: 'name' }
      });
    });

    expect(result.current.touched.name).toBe(true);
    expect(result.current.errors.name).toBe('Nome é obrigatório');
  });

  it('validates field after change when touched', () => {
    const { result } = renderHook(() => useFormValidation(initialValues, validators));

    // First touch the field
    act(() => {
      result.current.handleBlur({
        target: { name: 'name' }
      });
    });

    // Then change it
    act(() => {
      result.current.handleChange({
        target: { name: 'name', value: 'J', type: 'text' }
      });
    });

    expect(result.current.errors.name).toBe('Nome deve ter pelo menos 3 caracteres');

    // Change to valid value
    act(() => {
      result.current.handleChange({
        target: { name: 'name', value: 'João Silva', type: 'text' }
      });
    });

    expect(result.current.errors.name).toBeNull();
  });

  it('validates all fields correctly', () => {
    const { result } = renderHook(() => useFormValidation(initialValues, validators));

    act(() => {
      const isValid = result.current.validateAll();
      expect(isValid).toBe(false);
    });

    expect(result.current.errors).toEqual({
      name: 'Nome é obrigatório',
      email: 'Email é obrigatório',
      phone: 'Telefone é obrigatório',
      message: 'Mensagem é obrigatória',
      consent: 'É necessário aceitar os termos'
    });
  });

  it('validates email format', () => {
    const { result } = renderHook(() => useFormValidation(initialValues, validators));

    // First blur to mark field as touched
    act(() => {
      result.current.handleBlur({
        target: { name: 'email' }
      });
    });

    expect(result.current.errors.email).toBe('Email é obrigatório');

    act(() => {
      result.current.handleChange({
        target: { name: 'email', value: 'invalid-email', type: 'email' }
      });
    });

    expect(result.current.errors.email).toBe('Email inválido');

    act(() => {
      result.current.handleChange({
        target: { name: 'email', value: 'valid@email.com', type: 'email' }
      });
    });

    expect(result.current.errors.email).toBeNull();
  });

  it('validates phone number format', () => {
    const { result } = renderHook(() => useFormValidation(initialValues, validators));

    // First blur to mark field as touched
    act(() => {
      result.current.handleBlur({
        target: { name: 'phone' }
      });
    });

    expect(result.current.errors.phone).toBe('Telefone é obrigatório');

    act(() => {
      result.current.handleChange({
        target: { name: 'phone', value: '123', type: 'tel' }
      });
    });

    expect(result.current.errors.phone).toBe('Telefone inválido');

    act(() => {
      result.current.handleChange({
        target: { name: 'phone', value: '(33) 99999-9999', type: 'tel' }
      });
    });

    expect(result.current.errors.phone).toBeNull();
  });

  it('validates message length', () => {
    const { result } = renderHook(() => useFormValidation(initialValues, validators));

    // First blur to mark field as touched
    act(() => {
      result.current.handleBlur({
        target: { name: 'message' }
      });
    });

    expect(result.current.errors.message).toBe('Mensagem é obrigatória');

    act(() => {
      result.current.handleChange({
        target: { name: 'message', value: 'Short', type: 'textarea' }
      });
    });

    expect(result.current.errors.message).toBe('Mensagem deve ter pelo menos 10 caracteres');

    act(() => {
      result.current.handleChange({
        target: { name: 'message', value: 'This is a valid message with enough characters', type: 'textarea' }
      });
    });

    expect(result.current.errors.message).toBeNull();
  });

  it('resets form correctly', () => {
    const { result } = renderHook(() => useFormValidation(initialValues, validators));

    // Make some changes
    act(() => {
      result.current.handleChange({
        target: { name: 'name', value: 'João Silva', type: 'text' }
      });
      result.current.handleBlur({
        target: { name: 'name' }
      });
      result.current.setIsSubmitting(true);
    });

    expect(result.current.values.name).toBe('João Silva');
    expect(result.current.touched.name).toBe(true);
    expect(result.current.isSubmitting).toBe(true);

    // Reset
    act(() => {
      result.current.reset();
    });

    expect(result.current.values).toEqual(initialValues);
    expect(result.current.errors).toEqual({});
    expect(result.current.touched).toEqual({});
    expect(result.current.isSubmitting).toBe(false);
  });

  it('provides correct field props', () => {
    const { result } = renderHook(() => useFormValidation(initialValues, validators));

    const fieldProps = result.current.getFieldProps('name');

    expect(fieldProps).toEqual({
      name: 'name',
      value: '',
      onChange: result.current.handleChange,
      onBlur: result.current.handleBlur
    });
  });

  it('provides correct field state', () => {
    const { result } = renderHook(() => useFormValidation(initialValues, validators));

    // Initial state
    let fieldState = result.current.getFieldState('name');
    expect(fieldState.error).toBeUndefined();
    expect(fieldState.touched).toBeUndefined();
    expect(fieldState.hasError).toBe(false);
    expect(fieldState.isValid).toBe(false);

    // After touching and setting an error
    act(() => {
      result.current.handleBlur({
        target: { name: 'name' }
      });
    });

    fieldState = result.current.getFieldState('name');
    expect(fieldState.error).toBe('Nome é obrigatório');
    expect(fieldState.touched).toBe(true);
    expect(fieldState.hasError).toBe(true);
    expect(fieldState.isValid).toBe(false);

    // After fixing the error
    act(() => {
      result.current.handleChange({
        target: { name: 'name', value: 'João Silva', type: 'text' }
      });
    });

    fieldState = result.current.getFieldState('name');
    expect(fieldState.error).toBeNull();
    expect(fieldState.touched).toBe(true);
    expect(fieldState.hasError).toBe(false);
    expect(fieldState.isValid).toBe(true);
  });

  it('validates name with special characters', () => {
    const { result } = renderHook(() => useFormValidation(initialValues, validators));

    // First blur to mark field as touched
    act(() => {
      result.current.handleBlur({
        target: { name: 'name' }
      });
    });

    expect(result.current.errors.name).toBe('Nome é obrigatório');

    act(() => {
      result.current.handleChange({
        target: { name: 'name', value: 'João Ação', type: 'text' }
      });
    });

    expect(result.current.errors.name).toBeNull();

    act(() => {
      result.current.handleChange({
        target: { name: 'name', value: 'João123', type: 'text' }
      });
    });

    expect(result.current.errors.name).toBe('Nome deve conter apenas letras');
  });

  it('handles validator that returns true correctly', () => {
    const { result } = renderHook(() => useFormValidation(initialValues, validators));

    // First blur to mark field as touched
    act(() => {
      result.current.handleBlur({
        target: { name: 'name' }
      });
    });

    expect(result.current.errors.name).toBe('Nome é obrigatório');

    act(() => {
      result.current.handleChange({
        target: { name: 'name', value: 'João Silva', type: 'text' }
      });
    });

    expect(result.current.errors.name).toBeNull();
  });

  it('indicates form is valid when all fields are valid and touched', () => {
    const { result } = renderHook(() => useFormValidation(initialValues, validators));

    // Fill all fields with valid values
    act(() => {
      result.current.handleChange({
        target: { name: 'name', value: 'João Silva', type: 'text' }
      });
      result.current.handleChange({
        target: { name: 'email', value: 'joao@email.com', type: 'email' }
      });
      result.current.handleChange({
        target: { name: 'phone', value: '(33) 99999-9999', type: 'tel' }
      });
      result.current.handleChange({
        target: { name: 'message', value: 'This is a valid message with enough characters', type: 'textarea' }
      });
      result.current.handleChange({
        target: { name: 'consent', checked: true, type: 'checkbox' }
      });
      
      // Touch all fields
      result.current.handleBlur({ target: { name: 'name' } });
      result.current.handleBlur({ target: { name: 'email' } });
      result.current.handleBlur({ target: { name: 'phone' } });
      result.current.handleBlur({ target: { name: 'message' } });
      result.current.handleBlur({ target: { name: 'consent' } });
    });

    expect(result.current.isValid).toBe(true);
  });
});