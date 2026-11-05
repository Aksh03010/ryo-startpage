import { useEffect, useState } from 'react';

function preserveRecoveryCopy(key: string, raw: string) {
  try {
    if (window.localStorage.getItem(`${key}.recovery`) === null)
      window.localStorage.setItem(`${key}.recovery`, raw);
  } catch {
    /* Recovery must still work when storage is full. */
  }
}

export function useLocalStorage<T>(
  key: string,
  initial: T | (() => T),
  normalize?: (value: unknown, fallback: T) => T,
) {
  const [value, setValue] = useState<T>(() => {
    const fallback = typeof initial === 'function' ? (initial as () => T)() : initial;
    let original: string | null = null;
    try {
      const current = window.localStorage.getItem(key);
      const raw = current ?? window.localStorage.getItem(key.replace(/^ryo\./, 'aura.'));
      if (raw === null) return fallback;
      original = raw;
      const parsed: unknown = JSON.parse(raw);
      const restored = normalize ? normalize(parsed, fallback) : (parsed as T);
      if (normalize && JSON.stringify(restored) !== raw) {
        preserveRecoveryCopy(key, raw);
      }
      if (current === null) {
        try {
          window.localStorage.setItem(key, raw);
        } catch {
          // Keep the old saved value usable when storage is read-only or full.
        }
      }
      return restored;
    } catch {
      if (original !== null) preserveRecoveryCopy(key, original);
      return fallback;
    }
  });

  // Persist committed changes only. Updaters can run more than once in StrictMode.
  useEffect(() => {
    try {
      const serialized = JSON.stringify(value);
      if (window.localStorage.getItem(key) !== serialized)
        window.localStorage.setItem(key, serialized);
    } catch (error) {
      console.error(`Unable to persist ${key}`, error);
      window.dispatchEvent(new Event('ryo:storage-error'));
    }
  }, [key, value]);

  return [value, setValue] as const;
}
