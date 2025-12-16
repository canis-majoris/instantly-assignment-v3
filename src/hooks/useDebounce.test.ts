/**
 * Tests for useDebounce hook
 */

import { renderHook, act } from '@testing-library/react';
import { useDebounce } from './useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should return the initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 300));
    expect(result.current).toBe('initial');
  });

  it('should debounce value changes', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: 'initial' },
    });

    expect(result.current).toBe('initial');

    // Change the value
    rerender({ value: 'updated' });

    // Value should still be initial before delay
    expect(result.current).toBe('initial');

    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(300);
    });

    // Now the value should be updated
    expect(result.current).toBe('updated');
  });

  it('should reset timer on rapid changes', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: 'a' },
    });

    // Rapid changes
    rerender({ value: 'b' });
    act(() => {
      jest.advanceTimersByTime(100);
    });

    rerender({ value: 'c' });
    act(() => {
      jest.advanceTimersByTime(100);
    });

    rerender({ value: 'd' });

    // Still showing initial value
    expect(result.current).toBe('a');

    // Advance full delay from last change
    act(() => {
      jest.advanceTimersByTime(300);
    });

    // Should show the last value
    expect(result.current).toBe('d');
  });

  it('should work with different types', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 100), {
      initialProps: { value: 42 },
    });

    expect(result.current).toBe(42);

    rerender({ value: 100 });
    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(result.current).toBe(100);
  });

  it('should handle delay changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'test', delay: 200 } },
    );

    rerender({ value: 'new', delay: 500 });

    act(() => {
      jest.advanceTimersByTime(200);
    });

    // Should still be old value (new delay is 500ms)
    expect(result.current).toBe('test');

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(result.current).toBe('new');
  });
});
