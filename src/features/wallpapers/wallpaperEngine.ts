import type { Settings, WidgetId } from '../../types';
import { setHostPaused } from '../../lib/activity';

type Property = { value: unknown };
type UserProperties = Record<string, Property | undefined>;
export type WallpaperOverrides = {
  accent?: string;
  media?: { url: string; mediaType: 'image' | 'video' } | null;
  minimal?: boolean;
  reduceMotion?: boolean;
  widgets?: Partial<Record<WidgetId, boolean>>;
};
type WallpaperListener = {
  applyUserProperties: (properties: UserProperties) => void;
  setPaused: (paused: boolean) => void;
};

declare global {
  interface Window {
    wallpaperPropertyListener?: WallpaperListener;
  }
}

let overrides: WallpaperOverrides = {};
let hostProperties: UserProperties = {};
const listeners = new Set<() => void>();
const widgetNames: WidgetId[] = [
  'clock',
  'search',
  'tasks',
  'links',
  'focus',
  'reminders',
  'system',
];

export function parseEngineProperties(properties: UserProperties): WallpaperOverrides {
  const next: WallpaperOverrides = {};
  const color = properties.accent?.value;
  if (typeof color === 'string') {
    const channels = color.trim().split(/\s+/).map(Number);
    if (
      channels.length === 3 &&
      channels.every((value) => Number.isFinite(value) && value >= 0 && value <= 1)
    ) {
      next.accent = `#${channels
        .map((value) =>
          Math.round(value * 255)
            .toString(16)
            .padStart(2, '0'),
        )
        .join('')}`;
    }
  }
  const image = properties.backgroundfile?.value;
  const video = properties.backgroundvideo?.value;
  const file = typeof video === 'string' && video ? video : (image ?? video);
  if (typeof file === 'string') {
    const path = file.replace(/\\/g, '/');
    next.media = path
      ? {
          url: new URL(
            'file:///' +
              encodeURI(path.replace(/^\/+/, '')).replace(/#/g, '%23').replace(/\?/g, '%3F'),
          ).href,
          mediaType: /\.(webm|mp4|ogv|ogg)$/i.test(path) ? 'video' : 'image',
        }
      : null;
  }
  if (typeof properties.minimal?.value === 'boolean') next.minimal = properties.minimal.value;
  if (typeof properties.reducemotion?.value === 'boolean')
    next.reduceMotion = properties.reducemotion.value;
  for (const id of widgetNames) {
    const visible = properties[`show${id}`]?.value;
    if (typeof visible === 'boolean') next.widgets = { ...next.widgets, [id]: visible };
  }
  return next;
}

export function applyWallpaperOverrides(settings: Settings, values: WallpaperOverrides): Settings {
  if (Object.keys(values).length === 0) return settings;
  const widgets = { ...settings.appearance.widgets };
  for (const id of widgetNames) {
    const visible =
      values.minimal && id !== 'clock' && id !== 'search' ? false : values.widgets?.[id];
    if (visible !== undefined) widgets[id] = { ...widgets[id], visible };
  }
  return {
    ...settings,
    appearance: {
      ...settings.appearance,
      widgets,
      ...(values.accent ? { accent: 'custom', customAccent: values.accent } : {}),
      ...(values.reduceMotion !== undefined ? { reduceMotion: values.reduceMotion } : {}),
    },
    background: values.media
      ? { ...settings.background, wallpaper: { kind: 'native', preset: 'aurora', ...values.media } }
      : settings.background,
  };
}

export function getWallpaperOverrides() {
  return overrides;
}
export function subscribeWallpaperEngine(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

// Register at module scope before the app mounts, as required by Wallpaper Engine.
if (typeof window !== 'undefined') {
  window.wallpaperPropertyListener = {
    applyUserProperties(properties) {
      hostProperties = { ...hostProperties, ...properties };
      const update = parseEngineProperties(hostProperties);
      overrides = { ...overrides, ...update, widgets: { ...overrides.widgets, ...update.widgets } };
      for (const listener of listeners) listener();
    },
    setPaused: setHostPaused,
  };
}
