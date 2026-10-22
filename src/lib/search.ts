import type { SearchEngineId, Settings } from '../types';
import { DEFAULT_SETTINGS } from '../constants';

export function buildSearchUrl(input: string, engine: SearchEngineId): string {
  const term = input.trim();
  const target = engine === 'duckduckgo' && term.length === 0 ? 'https://duckduckgo.com' : term;
  return target;
}

export function isTaskVisibleToday(settings: Settings): boolean {
  return settings.appearance.widgets.tasks.visible;
}

export function mergeDefaults<T>(partial: Partial<T>, defaults: T): T {
  return { ...defaults, ...(partial as object) } as T;
}

export function coerceSettings(raw: unknown): Settings {
  if (!raw || typeof raw !== 'object') return DEFAULT_SETTINGS;
  const value = raw as Partial<Settings>;
  return {
    ...DEFAULT_SETTINGS,
    ...value,
    appearance: {
      ...DEFAULT_SETTINGS.appearance,
      ...(value.appearance ?? {}),
      widgets: {
        ...DEFAULT_SETTINGS.appearance.widgets,
        ...(value.appearance?.widgets ?? {}),
      },
    },
    background: {
      ...DEFAULT_SETTINGS.background,
      ...(value.background ?? {}),
      wallpaper: {
        ...DEFAULT_SETTINGS.background.wallpaper,
        ...(value.background?.wallpaper ?? {}),
      },
    },
    clock: { ...DEFAULT_SETTINGS.clock, ...(value.clock ?? {}) },
    tasks: { ...DEFAULT_SETTINGS.tasks, ...(value.tasks ?? {}) },
    layout: { ...DEFAULT_SETTINGS.layout, ...(value.layout ?? {}) },
  };
}

export const SETTINGS_KEY = 'ryo.settings.v2';
export const TASKS_KEY = 'ryo.tasks.v2';
export const LINKS_KEY = 'ryo.links.v2';
export const MAIN_LAYOUT_KEY = 'ryo.layout.v2';
export const FOCUS_KEY = 'ryo.focus.v2';
export const SEARCH_KEY = 'ryo.search.v2';
export const FOCUS_SETTINGS_KEY = 'ryo.focusSettings.v2';

export const TUTORS = 'Ryo startpage - wallpaper engine, clock, taskbar and quick links.';
