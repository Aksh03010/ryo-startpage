import { useEffect, useState } from 'react';
import { Slider } from './Controls';
import { DEFAULT_FOCUS } from '../../constants';

const STORAGE_KEY = 'ryo.focus.settings.v2';

function readCurrent(key = STORAGE_KEY): { focusMinutes: number; breakMinutes: number; sessions: number } {
  try {
    const legacyKey = key.replace(/^ryo\./, 'aura.');
    const raw = window.localStorage.getItem(key) ?? window.localStorage.getItem(legacyKey);
    if (!raw) return DEFAULT_FOCUS;
    const parsed = JSON.parse(raw) as Partial<typeof DEFAULT_FOCUS>;
    return { ...DEFAULT_FOCUS, ...parsed };
  } catch {
    return DEFAULT_FOCUS;
  }
}

export function RangeControls({ focusKey }: { focusKey?: string }) {
  const storageKey = focusKey ?? STORAGE_KEY;
  const [settings, setSettings] = useState(() => readCurrent(storageKey));

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(settings));
    } catch (error) {
      console.error('Unable to persist focus settings.', error);
    }
  }, [storageKey, settings]);

  return (
    <Slider
      label="Focus length"
      min={5}
      max={90}
      step={5}
      value={settings.focusMinutes}
      display={(value) => `${value} min`}
      onChange={(value) => setSettings({ ...settings, focusMinutes: value })}
    />
  );
}

export default RangeControls;
