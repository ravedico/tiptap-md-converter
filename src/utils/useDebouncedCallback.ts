import { useRef, useEffect, useCallback } from 'react';

export function useDebouncedCallback<T extends (...args: unknown[]) => void>(
  callback: T,
  delay = 250
) {
  const timer = useRef<number | null>(null);

  // clear timer on unmount
  useEffect(() => () => { if (timer.current) window.clearTimeout(timer.current); }, []);

  return useCallback((...args: Parameters<T>) => {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      callback(...args);
      timer.current = null;
    }, delay);
  }, [callback, delay]);
}