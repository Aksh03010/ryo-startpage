import { useMemo, useSyncExternalStore } from 'react';
import {
  applyWallpaperOverrides,
  getWallpaperOverrides,
  subscribeWallpaperEngine,
} from '../lib/wallpaperEngine';
import type { Settings } from '../types';

export function useWallpaperEngine(settings: Settings) {
  const overrides = useSyncExternalStore(subscribeWallpaperEngine, getWallpaperOverrides);
  return useMemo(() => applyWallpaperOverrides(settings, overrides), [settings, overrides]);
}
