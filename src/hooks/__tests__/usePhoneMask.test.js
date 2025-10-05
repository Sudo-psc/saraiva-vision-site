import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePhoneMask } from '../usePhoneMask';

describe('usePhoneMask', () => {
  it('should initialize with empty value', () => {
    const { result } = renderHook(() => usePhoneMask());
    expect(result.current.value).toBe('');
  });

  it('should initialize with provided value', () => {
    const { result } = renderHook(() => usePhoneMask('33988776655'));
    expect(result.current.value).toBe('33988776655');
  });

  it('should format phone with 10 digits (landline)', () => {
    const { result } = renderHook(() => usePhoneMask());
    
    act(() => {
      result.current.onChange({ target: { value: '3335551234' } });
    });

    expect(result.current.value).toBe('(33) 3555-1234');
  });

  it('should format phone with 11 digits (mobile)', () => {
    const { result } = renderHook(() => usePhoneMask());
    
    act(() => {
      result.current.onChange({ target: { value: '33988776655' } });
    });

    expect(result.current.value).toBe('(33) 98877-6655');
  });

  it('should remove non-numeric characters', () => {
    const { result } = renderHook(() => usePhoneMask());
    
    act(() => {
      result.current.onChange({ target: { value: '(33) 98877-6655' } });
    });

    expect(result.current.value).toBe('(33) 98877-6655');
  });

  it('should limit to 11 digits', () => {
    const { result } = renderHook(() => usePhoneMask());
    
    act(() => {
      result.current.onChange({ target: { value: '339887766559999' } });
    });

    expect(result.current.value).toBe('(33) 98877-6655');
  });

  it('should return raw value without formatting', () => {
    const { result } = renderHook(() => usePhoneMask());
    
    act(() => {
      result.current.onChange({ target: { value: '33988776655' } });
    });

    expect(result.current.getRawValue()).toBe('33988776655');
  });

  it('should handle partial input gracefully', () => {
    const { result } = renderHook(() => usePhoneMask());
    
    act(() => {
      result.current.onChange({ target: { value: '33' } });
    });

    expect(result.current.value).toBe('33');
    
    act(() => {
      result.current.onChange({ target: { value: '339' } });
    });

    expect(result.current.value).toBe('(33) 9');
  });

  it('should setValue programmatically with mask', () => {
    const { result } = renderHook(() => usePhoneMask());
    
    act(() => {
      result.current.setValue('33988776655');
    });

    expect(result.current.value).toBe('(33) 98877-6655');
  });

  it('should handle empty input', () => {
    const { result } = renderHook(() => usePhoneMask('33988776655'));
    
    act(() => {
      result.current.onChange({ target: { value: '' } });
    });

    expect(result.current.value).toBe('');
    expect(result.current.getRawValue()).toBe('');
  });

  it('should handle letters and special characters', () => {
    const { result } = renderHook(() => usePhoneMask());
    
    act(() => {
      result.current.onChange({ target: { value: 'abc33def98877xyz6655' } });
    });

    expect(result.current.value).toBe('(33) 98877-6655');
    expect(result.current.getRawValue()).toBe('33988776655');
  });
});
