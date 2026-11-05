import { DEFAULT_SETTINGS, WIDGET_IDS } from '../../constants';
import type { BoxMode, Settings, WidgetId } from '../../types';

function addMissingWidgets(draft: Settings): Settings {
  const widgets = draft.appearance.widgets ?? {};
  const missing = WIDGET_IDS.filter((id) => !(id in widgets));
  if (missing.length === 0) return draft;
  const additions: Record<string, Settings['appearance']['widgets'][WidgetId]> = {};
  for (const id of missing) additions[id] = DEFAULT_SETTINGS.appearance.widgets[id];
  return {
    ...draft,
    appearance: { ...draft.appearance, widgets: { ...additions, ...widgets } },
  };
}

function migrateBoxStyles(draft: Settings): Settings {
  const legacyAppearance = draft.appearance;
  const savedWidgets = legacyAppearance.widgets ?? DEFAULT_SETTINGS.appearance.widgets;
  const needsMigration =
    legacyAppearance.boxMode === undefined ||
    legacyAppearance.glassEnabled !== undefined ||
    Object.values(savedWidgets).some((widget) => widget.style?.glass !== undefined);
  if (!needsMigration) return draft;

  const widgets = Object.fromEntries(
    Object.entries(savedWidgets).map(([id, widget]) => {
      const { glass, ...style } = widget.style ?? {};
      const boxMode: BoxMode | undefined =
        style.boxMode ?? (glass === 'on' ? 'glass' : glass === 'off' ? 'solid' : undefined);
      return [id, { ...widget, style: { ...style, boxMode } }];
    }),
  ) as Settings['appearance']['widgets'];
  const { glassEnabled, ...appearanceSettings } = legacyAppearance;
  return {
    ...draft,
    appearance: {
      ...appearanceSettings,
      boxMode: legacyAppearance.boxMode ?? (glassEnabled === false ? 'solid' : 'glass'),
      widgets,
    },
  };
}

/** Upgrade existing valid saves without replacing user-selected widget or appearance values. */
export function migrateSettings(settings: Settings): Settings {
  return migrateBoxStyles(addMissingWidgets(settings));
}
