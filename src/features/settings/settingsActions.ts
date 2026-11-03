import type { Settings, WidgetId, WidgetStyleOverride } from '../../types';
import type { UpdateSettings } from './types';

/** Apply immutable section updates through the same persisted settings owner. */
export function createSettingsActions(onSettings: UpdateSettings) {
  return {
    patchBackground(value: Partial<Settings['background']>) {
      onSettings((previous) => ({ ...previous, background: { ...previous.background, ...value } }));
    },
    patchAppearance(value: Partial<Settings['appearance']>) {
      onSettings((previous) => ({ ...previous, appearance: { ...previous.appearance, ...value } }));
    },
    patchClock(value: Partial<Settings['clock']>) {
      onSettings((previous) => ({ ...previous, clock: { ...previous.clock, ...value } }));
    },
    patchWidgetStyle(id: WidgetId, value: Partial<WidgetStyleOverride>) {
      onSettings((previous) => ({
        ...previous,
        appearance: {
          ...previous.appearance,
          widgets: {
            ...previous.appearance.widgets,
            [id]: {
              ...previous.appearance.widgets[id],
              style: { ...previous.appearance.widgets[id].style, ...value },
            },
          },
        },
      }));
    },
  };
}
