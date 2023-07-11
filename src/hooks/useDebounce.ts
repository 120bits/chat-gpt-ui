import { useCallback, useEffect, useRef } from "react";

function useDebounce<T extends (...args: any[]) => any>(fn: T, delay: number): T {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const callbackRef = useRef<T>(fn);

  // Update the callback if fn changes
  useEffect(() => {
    callbackRef.current = fn;
  }, [fn]);

  return useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      if (callbackRef.current) {
        callbackRef.current(...args);
      }
    }, delay);
  }, [delay]) as T;
}

export default useDebounce;