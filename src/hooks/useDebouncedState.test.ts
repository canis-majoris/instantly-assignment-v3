/**
 * Tests for useDebouncedState hook
 */

import { renderHook, act } from '@testing-library/react';
import { useDebouncedState } from './useDebouncedState';

describe('useDebouncedState', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should return the initial external value', () => {
    const onChange = jest.fn();
    const { result } = renderHook(() => useDebouncedState('initial', onChange, 300));

    const [localValue] = result.current;
    expect(localValue).toBe('initial');
  });

  it('should update local value immediately', () => {
    const onChange = jest.fn();
    const { result } = renderHook(() => useDebouncedState<string>('initial', onChange, 300));

    act(() => {
      const [, setValue] = result.current;
      setValue('updated');
    });

    const [localValue] = result.current;
    expect(localValue).toBe('updated');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('should call onChange after delay', () => {
    const onChange = jest.fn();
    const { result } = renderHook(() => useDebouncedState<string>('initial', onChange, 300));

    act(() => {
      const [, setValue] = result.current;
      setValue('updated');
    });

    expect(onChange).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(onChange).toHaveBeenCalledWith('updated');
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('should debounce rapid changes', () => {
    const onChange = jest.fn();
    const { result } = renderHook(() => useDebouncedState<string>('', onChange, 300));

    // Simulate rapid typing
    act(() => {
      const [, setValue] = result.current;
      setValue('a');
    });
    act(() => {
      jest.advanceTimersByTime(100);
    });

    act(() => {
      const [, setValue] = result.current;
      setValue('ab');
    });
    act(() => {
      jest.advanceTimersByTime(100);
    });

    act(() => {
      const [, setValue] = result.current;
      setValue('abc');
    });

    // No calls yet
    expect(onChange).not.toHaveBeenCalled();

    // Wait for debounce
    act(() => {
      jest.advanceTimersByTime(300);
    });

    // Only called once with final value
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('abc');
  });

  it('should sync local value when external value changes', () => {
    const onChange = jest.fn();
    const { result, rerender } = renderHook(
      ({ externalValue }) => useDebouncedState(externalValue, onChange, 300),
      { initialProps: { externalValue: 'initial' } },
    );

    rerender({ externalValue: 'external update' });

    const [localValue] = result.current;
    expect(localValue).toBe('external update');
  });

  it('should flush pending timeout', () => {
    const onChange = jest.fn();
    const { result } = renderHook(() => useDebouncedState<string>('initial', onChange, 300));

    act(() => {
      const [, setValue] = result.current;
      setValue('updated');
    });

    // Flush before timeout completes
    act(() => {
      const [, , flush] = result.current;
      flush();
    });

    // Advance past the delay
    act(() => {
      jest.advanceTimersByTime(500);
    });

    // onChange should not have been called because we flushed
    expect(onChange).not.toHaveBeenCalled();
  });

  it('should cleanup timeout on unmount', () => {
    const onChange = jest.fn();
    const { result, unmount } = renderHook(() => useDebouncedState<string>('initial', onChange, 300));

    act(() => {
      const [, setValue] = result.current;
      setValue('updated');
    });

    unmount();

    act(() => {
      jest.advanceTimersByTime(500);
    });

    // Should not call onChange after unmount
    expect(onChange).not.toHaveBeenCalled();
  });

  it('should use default delay of 300ms', () => {
    const onChange = jest.fn();
    const { result } = renderHook(() => useDebouncedState<string>('initial', onChange));

    act(() => {
      const [, setValue] = result.current;
      setValue('updated');
    });

    act(() => {
      jest.advanceTimersByTime(299);
    });
    expect(onChange).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(onChange).toHaveBeenCalledWith('updated');
  });
});
