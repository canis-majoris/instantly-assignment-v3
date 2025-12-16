/**
 * Ensures a boolean state stays true for a minimum duration.
 * Useful for preventing loading state flashing.
 */

import { useState, useEffect, useRef } from 'react';

/**
 * @param isActive - The boolean state to track (e.g., isLoading)
 * @param minDuration - Minimum time to stay active in milliseconds
 * @returns Whether the state should appear active
 */
export function useMinDuration(isActive: boolean, minDuration: number): boolean {
  const [showActive, setShowActive] = useState(isActive);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (isActive) {
      startTimeRef.current = Date.now();
      setShowActive(true);
    } else if (startTimeRef.current !== null) {
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = minDuration - elapsed;

      if (remaining > 0) {
        const timer = setTimeout(() => {
          setShowActive(false);
          startTimeRef.current = null;
        }, remaining);
        return () => clearTimeout(timer);
      } else {
        setShowActive(false);
        startTimeRef.current = null;
      }
    }
  }, [isActive, minDuration]);

  return showActive;
}

export default useMinDuration;
