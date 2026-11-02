import type { Settings, WidgetId } from '../types';

export const SPACE_PRESETS: Array<{ id: string; label: string; description: string; widgets: WidgetId[] }> = [
  { id: 'minimal', label: 'Minimal', description: 'Just time and a place to go.', widgets: ['clock', 'search'] },
  { id: 'everyday', label: 'Everyday', description: 'Time, search, and your favorite places.', widgets: ['clock', 'search', 'links'] },
  { id: 'workspace', label: 'Workspace', description: 'A little space for everything.', widgets: ['clock', 'search', 'links', 'tasks', 'focus', 'reminders'] },
];

export function applySpacePreset(settings: Settings, id: string): Settings {
  const preset = SPACE_PRESETS.find((item) => item.id === id);
  if (!preset) return settings;
  const widgets = Object.fromEntries(Object.entries(settings.appearance.widgets).map(([widgetId, widget]) => [widgetId, { ...widget, visible: preset.widgets.includes(widgetId as WidgetId) }]));
  return { ...settings, appearance: { ...settings.appearance, widgets: widgets as Settings['appearance']['widgets'] } };
}
