/**
 * useDelayedAction Hook
 * Executes an action after a delay when a condition is met
 * Cleans up the timer on unmount or when dependencies change
 */

import { useEffect, useRef } from 'react';

/**
 * Executes an action after a specified delay when the condition is true
 * @param condition - Whether the action should be scheduled
 * @param action - The action to execute after the delay
 * @param delay - Delay in milliseconds (default: 1000ms)
 */
export function useDelayedAction(
  condition: boolean,
  action: () => void,
  delay: number = 1000,
): void {
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (condition) {
      timerRef.current = setTimeout(action, delay);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [condition, action, delay]);
}

export default useDelayedAction;
