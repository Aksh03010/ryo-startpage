import { Slider } from './Controls';
import type { FocusSettings } from '../../types';

export function RangeControls({
  settings,
  onChange,
}: {
  settings: FocusSettings;
  onChange: (next: FocusSettings | ((prev: FocusSettings) => FocusSettings)) => void;
}) {
  return (
    <Slider
      label="Focus length"
      min={5}
      max={90}
      step={5}
      value={settings.focusMinutes}
      display={(value) => `${value} min`}
      onChange={(value) => onChange((prev) => ({ ...prev, focusMinutes: value }))}
    />
  );
}

export default RangeControls;
