'use client';

import { useState, useCallback } from 'react';

export const usePhoneMask = (initialValue = '') => {
  const [value, setValue] = useState(initialValue);

  const applyMask = useCallback((rawValue: string) => {
    const numbers = rawValue.replace(/\D/g, '');
    
    if (numbers.length <= 10) {
      return numbers
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4})(\d)/, '$1-$2');
    } else {
      return numbers
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2')
        .replace(/(-\d{4})\d+?$/, '$1');
    }
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const maskedValue = applyMask(e.target.value);
    setValue(maskedValue);
  }, [applyMask]);

  const getRawValue = useCallback(() => {
    return value.replace(/\D/g, '');
  }, [value]);

  return {
    value,
    onChange: handleChange,
    getRawValue,
    setValue: (newValue: string) => setValue(applyMask(newValue)),
  };
};
