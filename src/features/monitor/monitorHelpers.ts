import { STORAGE_KEYS } from '../../lib/storageKeys';
import type { Mode } from './types';

export function loadMode(): Mode {
  try {
    return window.localStorage.getItem(STORAGE_KEYS.monitorMode) === 'browser'
      ? 'browser'
      : 'computer';
  } catch {
    return 'computer';
  }
}

export function formatBytes(bytes: number): string {
  return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
}
