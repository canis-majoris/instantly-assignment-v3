/**
 * Tests for useMinDuration hook
 */

import { renderHook, act } from '@testing-library/react';
import { useMinDuration } from './useMinDuration';

describe('useMinDuration', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should return initial active state', () => {
    const { result } = renderHook(() => useMinDuration(true, 300));
    expect(result.current).toBe(true);
  });

  it('should return initial inactive state', () => {
    const { result } = renderHook(() => useMinDuration(false, 300));
    expect(result.current).toBe(false);
  });

  it('should stay active for minimum duration when deactivated quickly', () => {
    const { result, rerender } = renderHook(
      ({ isActive }) => useMinDuration(isActive, 300),
      { initialProps: { isActive: true } },
    );

    expect(result.current).toBe(true);

    // Deactivate after only 100ms
    act(() => {
      jest.advanceTimersByTime(100);
    });
    rerender({ isActive: false });

    // Should still show active (200ms remaining)
    expect(result.current).toBe(true);

    // Advance 199ms (still not enough)
    act(() => {
      jest.advanceTimersByTime(199);
    });
    expect(result.current).toBe(true);

    // Advance 1 more ms (now 300ms total)
    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(result.current).toBe(false);
  });

  it('should deactivate immediately if minimum duration has passed', () => {
    const { result, rerender } = renderHook(
      ({ isActive }) => useMinDuration(isActive, 300),
      { initialProps: { isActive: true } },
    );

    // Wait longer than min duration
    act(() => {
      jest.advanceTimersByTime(500);
    });

    rerender({ isActive: false });

    // Should immediately show inactive
    expect(result.current).toBe(false);
  });

  it('should handle reactivation during minimum duration', () => {
    const { result, rerender } = renderHook(
      ({ isActive }) => useMinDuration(isActive, 300),
      { initialProps: { isActive: true } },
    );

    // Deactivate after 100ms
    act(() => {
      jest.advanceTimersByTime(100);
    });
    rerender({ isActive: false });

    // Reactivate before min duration expires
    act(() => {
      jest.advanceTimersByTime(50);
    });
    rerender({ isActive: true });

    expect(result.current).toBe(true);

    // Deactivate again
    act(() => {
      jest.advanceTimersByTime(100);
    });
    rerender({ isActive: false });

    // Should start new min duration countdown
    expect(result.current).toBe(true);
  });

  it('should handle activation from inactive state', () => {
    const { result, rerender } = renderHook(
      ({ isActive }) => useMinDuration(isActive, 300),
      { initialProps: { isActive: false } },
    );

    expect(result.current).toBe(false);

    rerender({ isActive: true });

    expect(result.current).toBe(true);
  });

  it('should cleanup timer on unmount', () => {
    const { result, rerender, unmount } = renderHook(
      ({ isActive }) => useMinDuration(isActive, 300),
      { initialProps: { isActive: true } },
    );

    // Deactivate to start timer
    act(() => {
      jest.advanceTimersByTime(100);
    });
    rerender({ isActive: false });

    expect(result.current).toBe(true);

    // Unmount before timer completes
    unmount();

    // Should not throw or cause issues
    act(() => {
      jest.advanceTimersByTime(500);
    });
  });

  it('should work with different duration values', () => {
    const { result, rerender } = renderHook(
      ({ isActive }) => useMinDuration(isActive, 1000),
      { initialProps: { isActive: true } },
    );

    act(() => {
      jest.advanceTimersByTime(100);
    });
    rerender({ isActive: false });

    expect(result.current).toBe(true);

    act(() => {
      jest.advanceTimersByTime(899);
    });
    expect(result.current).toBe(true);

    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(result.current).toBe(false);
  });
});
