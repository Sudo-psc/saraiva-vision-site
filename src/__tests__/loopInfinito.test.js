/**
 * Teste para verificar se não há mais loops infinitos em useAutoplayCarousel
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useAutoplayCarousel } from '../hooks/useAutoplayCarousel';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  useReducedMotion: () => false
}));

describe('useAutoplayCarousel - Loop Infinito Test', () => {
  let renderCount = 0;
  let maxRenders = 50;

  beforeEach(() => {
    renderCount = 0;
    vi.useFakeTimers();
    
    // Mock console methods to catch warnings
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('should not cause infinite loops with basic configuration', async () => {
    const { result, rerender } = renderHook(() => {
      renderCount++;
      if (renderCount > maxRenders) {
        throw new Error(`Loop infinito detectado! Mais de ${maxRenders} renders.`);
      }
      
      return useAutoplayCarousel({
        totalSlides: 5,
        config: {
          defaultInterval: 1000,
          pauseOnHover: true
        }
      });
    });

    // Verify initial state
    expect(result.current.currentIndex).toBe(0);
    expect(result.current.isPlaying).toBe(false);
    
    // Start autoplay
    result.current.play();
    
    // Advance timers and check for stability
    vi.advanceTimersByTime(100);
    rerender();
    
    vi.advanceTimersByTime(500);
    rerender();
    
    vi.advanceTimersByTime(500);
    rerender();
    
    // Should have reasonable number of renders
    expect(renderCount).toBeLessThan(10);
    
    // Cleanup
    result.current.stop();
  });

  it('should not loop when currentIndex changes', async () => {
    const mockOnSlideChange = vi.fn();
    
    const { result, rerender } = renderHook(() => {
      renderCount++;
      if (renderCount > maxRenders) {
        throw new Error(`Loop infinito detectado! Mais de ${maxRenders} renders.`);
      }
      
      return useAutoplayCarousel({
        totalSlides: 3,
        onSlideChange: mockOnSlideChange,
        config: {
          defaultInterval: 1000
        }
      });
    });

    // Start playing
    result.current.play();
    
    // Manual navigation should not cause loops
    result.current.next();
    rerender();
    
    result.current.goTo(2);
    rerender();
    
    result.current.previous();
    rerender();
    
    // Should have reasonable number of renders
    expect(renderCount).toBeLessThan(15);
    
    // Callback should be called but not excessively
    expect(mockOnSlideChange.mock.calls.length).toBeLessThan(10);
  });

  it('should handle state changes without infinite updates', async () => {
    const { result, rerender } = renderHook(() => {
      renderCount++;
      if (renderCount > maxRenders) {
        throw new Error(`Loop infinito detectado! Mais de ${maxRenders} renders.`);
      }
      
      return useAutoplayCarousel({
        totalSlides: 4,
        config: {
          defaultInterval: 1000,
          pauseOnHover: true,
          pauseOnFocus: true
        }
      });
    });

    // Trigger various state changes
    result.current.play();
    rerender();
    
    result.current.pause();
    rerender();
    
    result.current.toggle();
    rerender();
    
    // Simulate timer progression
    vi.advanceTimersByTime(1100);
    rerender();
    
    // Should be stable
    expect(renderCount).toBeLessThan(12);
  });

  it('should handle edge cases without loops', async () => {
    const { result, rerender } = renderHook(() => {
      renderCount++;
      if (renderCount > maxRenders) {
        throw new Error(`Loop infinito detectado! Mais de ${maxRenders} renders.`);
      }
      
      return useAutoplayCarousel({
        totalSlides: 0, // Edge case: zero slides
        config: {
          defaultInterval: 1000
        }
      });
    });

    expect(result.current.currentIndex).toBe(0);
    
    // Try operations that should be safe with zero slides
    result.current.play();
    result.current.next();
    result.current.goTo(5); // Invalid index
    
    rerender();
    
    // Should handle gracefully without loops
    expect(renderCount).toBeLessThan(8);
  });

  it('should not cause loops with rapid configuration changes', async () => {
    let config = { defaultInterval: 1000 };
    
    const { result, rerender } = renderHook(() => {
      renderCount++;
      if (renderCount > maxRenders) {
        throw new Error(`Loop infinito detectado! Mais de ${maxRenders} renders.`);
      }
      
      return useAutoplayCarousel({
        totalSlides: 3,
        config
      });
    });

    // Rapid config changes
    config = { defaultInterval: 2000 };
    rerender();
    
    config = { defaultInterval: 1500, pauseOnHover: true };
    rerender();
    
    config = { defaultInterval: 1000, pauseOnHover: false };
    rerender();
    
    // Should be stable
    expect(renderCount).toBeLessThan(15);
  });

  it('should handle timer cleanup properly', async () => {
    const { result, unmount } = renderHook(() => {
      renderCount++;
      if (renderCount > maxRenders) {
        throw new Error(`Loop infinito detectado! Mais de ${maxRenders} renders.`);
      }
      
      return useAutoplayCarousel({
        totalSlides: 3,
        config: { defaultInterval: 1000 }
      });
    });

    result.current.play();
    
    // Advance time to trigger timer
    vi.advanceTimersByTime(500);
    
    // Unmount should clean up without issues
    unmount();
    
    // Should not continue to update after unmount
    vi.advanceTimersByTime(1000);
    
    expect(renderCount).toBeLessThan(10);
  });
});