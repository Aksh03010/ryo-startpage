import type {
  AccentId,
  BackgroundPresetId,
  ClockAnimation,
  ClockFont,
  FocusSettings,
  QuickLink,
  SearchEngineId,
  Settings,
  WidgetId,
} from './types';

export const WIDGET_IDS: WidgetId[] = ['clock', 'tasks', 'search', 'links', 'focus', 'reminders'];
export const STORAGE_PREFIX = 'ryo:';
const publicAsset = (path: string) => `${import.meta.env.BASE_URL}${path}`;

export const WIDGET_TITLES: Record<WidgetId, string> = {
  clock: 'Clock',
  tasks: 'Tasks',
  search: 'Search',
  links: 'Quick links',
  focus: 'Focus timer',
  reminders: 'Reminders',
};

export const PRESETS: Array<{
  id: BackgroundPresetId;
  name: string;
  blurb: string;
  src?: string;
  gradient: string;
}> = [
  {
    id: 'aurora',
    name: 'Aurora Drift',
    blurb: 'Living gradient',
    gradient:
      'radial-gradient(120% 100% at 20% 10%, #0d5b6b 0%, transparent 55%), radial-gradient(90% 90% at 90% 15%, #6b5bff 0%, transparent 60%), linear-gradient(160deg, #03050b 0%, #041020 55%, #050610 100%)',
  },
  { id: 'midnight', name: 'Midnight Peaks', blurb: 'Static art', src: publicAsset('wallpapers/midnight.svg'), gradient: '' },
  { id: 'ember', name: 'Ember Haze', blurb: 'Static art', src: publicAsset('wallpapers/ember.svg'), gradient: '' },
  { id: 'glacier', name: 'Glacier Bloom', blurb: 'Static art', src: publicAsset('wallpapers/glacier.svg'), gradient: '' },
];

export interface PresetById {
  [key: string]: (typeof PRESETS)[number];
}
export const PRESET_NONE = PRESETS.find((preset) => preset.id === 'aurora') as (typeof PRESETS)[number];

export const ACCENTS: Record<Exclude<AccentId, 'custom'>, { name: string; tint: string; rgb: string }> = {
  aurora: { name: 'Aurora', tint: '#5eead4', rgb: '94,234,212' },
  ember: { name: 'Ember', tint: '#ffb56b', rgb: '255,181,107' },
  rose: { name: 'Rose', tint: '#f7a8c4', rgb: '247,168,196' },
  glacier: { name: 'Glacier', tint: '#a8c7ff', rgb: '168,199,255' },
};

export const DEFAULT_CUSTOM_ACCENT = '#a78bfa';

/** Parses `#rgb` / `#rrggbb` into an `r,g,b` triplet (defaults to violet for bad input). */
export function hexToRgbTriplet(hex: string): string {
  const raw = hex.trim().replace(/^#/, '');
  const full =
    raw.length === 3
      ? raw
          .split('')
          .map((char) => char + char)
          .join('')
      : raw;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return '167,139,250';
  return `${parseInt(full.slice(0, 2), 16)},${parseInt(full.slice(2, 4), 16)},${parseInt(full.slice(4, 6), 16)}`;
}

export const CLOCK_FONTS: Array<{ id: ClockFont; label: string; css: string }> = [
  {
    id: 'space',
    label: 'Space Grotesk',
    css: "'Space Grotesk', 'Segoe UI', system-ui, sans-serif",
  },
  {
    id: 'instrument',
    label: 'Instrument Serif',
    css: "'Instrument Serif', 'Times New Roman', serif",
  },
  {
    id: 'jetbrains',
    label: 'JetBrains Mono',
    css: "'JetBrains Mono', Consolas, 'Courier New', monospace",
  },
  { id: 'manrope', label: 'Manrope', css: "'Manrope', 'Segoe UI', system-ui, sans-serif" },
];

export const CLOCK_ANIMATIONS: Array<{ id: ClockAnimation; label: string }> = [
  { id: 'none', label: 'None' },
  { id: 'pulse', label: 'Pulse' },
  { id: 'glow', label: 'Glow' },
  { id: 'shine', label: 'Shine' },
];

export const SEARCH_ENGINES: Record<SearchEngineId, { label: string; host: string; query: string }> = {
  google: { label: 'Google', host: 'google.com', query: 'https://www.google.com/search?q=%s' },
  duckduckgo: {
    label: 'DuckDuckGo',
    host: 'duckduckgo.com',
    query: 'https://duckduckgo.com/?q=%s',
  },
  brave: { label: 'Brave', host: 'brave.com', query: 'https://search.brave.com/search?q=%s' },
  youtube: {
    label: 'YouTube',
    host: 'youtube.com',
    query: 'https://www.youtube.com/results?search_query=%s',
  },
};

export const REPEAT_DAY_LABELS: Record<number, string> = {
  0: 'Sun',
  1: 'Mon',
  2: 'Tue',
  3: 'Wed',
  4: 'Thu',
  5: 'Fri',
  6: 'Sat',
};

export const DEFAULT_POSITIONS = {
  clock: { x: 7, y: 10 },
  search: { x: 7, y: 38 },
  tasks: { x: 7, y: 54 },
  links: { x: 71, y: 12 },
  focus: { x: 71, y: 49 },
  reminders: { x: 7, y: 72 },
};

export const DEFAULT_LINKS: QuickLink[] = [
  { id: 'l1', label: 'GitHub', url: 'https://github.com' },
  { id: 'l2', label: 'YouTube', url: 'https://youtube.com' },
  { id: 'l3', label: 'Reddit', url: 'https://reddit.com' },
  { id: 'l4', label: 'Figma', url: 'https://figma.com' },
  { id: 'l5', label: 'Notion', url: 'https://notion.so' },
  { id: 'l6', label: 'Gmail', url: 'https://mail.google.com' },
];

export const DEFAULT_SETTINGS: Settings = {
  appearance: {
    accent: 'aurora',
    customAccent: DEFAULT_CUSTOM_ACCENT,
    boxMode: 'solid',
    glassOpacity: 42,
    glassBlur: 14,
    radius: 20,
    border: true,
    shadow: true,
    textScale: 100,
    reduceMotion: false,
    widgets: {
      clock: { visible: true, style: {} },
      tasks: { visible: true, style: {} },
      search: { visible: true, style: {} },
      links: { visible: true, style: {} },
      focus: { visible: true, style: {} },
      reminders: { visible: true, style: {} },
    },
  },
  background: {
    wallpaper: { kind: 'preset', preset: 'aurora' },
    dim: 18,
    blur: 0,
    brightness: 100,
    saturation: 105,
    grain: true,
    videoPlaybackRate: 1,
    videoLoop: true,
    videoPaused: false,
  },
  clock: { font: 'space', size: 150, use24Hour: false, showSeconds: false, showDate: true, showGreeting: true, animation: 'none' },
  tasks: { showCompleted: true },
  layout: { snapToGrid: true, showGrid: false },
  searchEngine: 'duckduckgo',
};

export const DEFAULT_FOCUS: FocusSettings = { focusMinutes: 25, breakMinutes: 5, sessions: 0 };

export const GRID_STEP = 40;
