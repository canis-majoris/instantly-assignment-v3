/**
 * Provides local state with debounced sync to parent.
 * Useful for input fields that need responsive typing while
 * debouncing updates to parent/URL state.
 */

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * @param externalValue - The external/parent value
 * @param onExternalChange - Callback to update external value
 * @param delay - Debounce delay in milliseconds (default: 300)
 * @returns [localValue, setValue, flush] - Local value, setter, and flush function
 */
export function useDebouncedState<T>(
  externalValue: T,
  onExternalChange: (value: T) => void,
  delay: number = 300,
): [T, (value: T) => void, () => void] {
  const [localValue, setLocalValue] = useState(externalValue);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync local value when external value changes
  useEffect(() => {
    setLocalValue(externalValue);
  }, [externalValue]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const setValue = useCallback(
    (newValue: T) => {
      setLocalValue(newValue);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        onExternalChange(newValue);
      }, delay);
    },
    [onExternalChange, delay],
  );

  // Flush: clear pending timeout (useful for immediate actions like clear buttons)
  const flush = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  return [localValue, setValue, flush];
}

export default useDebouncedState;
