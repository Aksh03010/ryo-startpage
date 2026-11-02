import { useCallback, useEffect, useState } from 'react';

export function useLocalStorage<T>(key: string, initial: T | (() => T)) {
  const [value, setValue] = useState<T>(() => {
    const fallback = typeof initial === 'function' ? (initial as () => T)() : initial;
    try {
      const current = window.localStorage.getItem(key);
      const raw = current ?? window.localStorage.getItem(key.replace(/^ryo\./, 'aura.'));
      if (raw === null) return fallback;
      const parsed = JSON.parse(raw) as T;
      if (current === null) {
        try {
          window.localStorage.setItem(key, raw);
        } catch {
          // Keep the old saved value usable when storage is read-only or full.
        }
      }
      return parsed;
    } catch {
      return fallback;
    }
  });

  // Persist committed changes only. Updaters can run more than once in StrictMode.
  useEffect(() => {
    try {
      const serialized = JSON.stringify(value);
      if (window.localStorage.getItem(key) !== serialized) window.localStorage.setItem(key, serialized);
    } catch (error) {
      console.error(`Unable to persist ${key}`, error);
    }
  }, [key, value]);

  const set = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const value = typeof next === 'function' ? (next as (prev: T) => T)(prev) : next;
        return value;
      });
    },
    [key],
  );

  const remove = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setValue(initial);
    } catch (error) {
      console.error(`Unable to clear ${key}`, error);
    }
  }, [key, initial]);

  return [value, set, remove] as const;
}

export default useLocalStorage;
