import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Postavite timer da odgodi ažuriranje debouncedValue
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Očistite timeout ako se value promijeni prije nego istekne delay
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}