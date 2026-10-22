export type WidgetId = 'clock' | 'tasks' | 'search' | 'links' | 'focus' | 'reminders';

export type ClockFont = 'space' | 'instrument' | 'jetbrains' | 'manrope';

export type ClockAnimation = 'none' | 'pulse' | 'glow' | 'shine';

export type AccentId = 'aurora' | 'ember' | 'rose' | 'glacier' | 'custom';

export type SearchEngineId = 'google' | 'duckduckgo' | 'brave' | 'youtube';

export type BackgroundPresetId = 'aurora' | 'midnight' | 'ember' | 'glacier';

export type WallpaperKind = 'preset' | 'upload' | 'url';

export interface WallpaperState {
  kind: WallpaperKind;
  preset: BackgroundPresetId;
  url?: string;
  mediaId?: string;
  mediaType?: 'image' | 'video';
  name?: string;
}

export interface WidgetPosition {
  x: number;
  y: number;
}

export type LayoutState = Record<WidgetId, WidgetPosition>;

/** `undefined` values follow the global appearance settings. */
export interface WidgetStyleOverride {
  glass?: 'on' | 'off';
  opacity?: number;
  radius?: number;
}

export interface WidgetAppearance {
  visible: boolean;
  style: WidgetStyleOverride;
}

export interface AppearanceSettings {
  accent: AccentId;
  /** Hex color used when `accent` is 'custom'. */
  customAccent: string;
  glassEnabled: boolean;
  glassOpacity: number;
  glassBlur: number;
  radius: number;
  border: boolean;
  shadow: boolean;
  textScale: number;
  reduceMotion: boolean;
  widgets: Record<WidgetId, WidgetAppearance>;
}

export interface ClockSettings {
  font: ClockFont;
  size: number;
  use24Hour: boolean;
  showSeconds: boolean;
  showDate: boolean;
  showGreeting: boolean;
  animation: ClockAnimation;
}

export interface TaskSettings {
  showCompleted: boolean;
}

export interface LayoutSettings {
  snapToGrid: boolean;
  showGrid: boolean;
}

export interface BackgroundSettings {
  wallpaper: WallpaperState;
  dim: number;
  blur: number;
  brightness: number;
  saturation: number;
  grain: boolean;
  videoPlaybackRate: number;
  videoLoop: boolean;
  videoPaused: boolean;
}

export interface Settings {
  appearance: AppearanceSettings;
  background: BackgroundSettings;
  clock: ClockSettings;
  tasks: TaskSettings;
  layout: LayoutSettings;
  searchEngine: SearchEngineId;
}

export type TaskRepeatDay = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface Task {
  id: string;
  text: string;
  createdAt: number;
  /** Days of the week this task repeats on (0 = Sunday). Empty means one-time. */
  repeatDays: TaskRepeatDay[];
  /** Completion dates for repeating tasks. */
  completions: string[];
  /** Completion state for one-time tasks. */
  done: boolean;
}

export interface QuickLink {
  id: string;
  label: string;
  url: string;
}

export interface Reminder {
  id: string;
  text: string;
  /** Epoch ms it fires at, or `null` for an undated reminder. */
  dueAt: number | null;
  /** Days of the week it repeats on (0 = Sunday). Empty means one-time. */
  repeatDays: TaskRepeatDay[];
  createdAt: number;
}

export interface FocusSettings {
  focusMinutes: number;
  breakMinutes: number;
  sessions: number;
}

export interface FocusState {
  duration: number;
  paused: boolean;
  endsAt: number | null;
  remaining: number | null;
  startedAt: number | null;
  endTs: number | null;
  remainingAtPause: number | null;
  pausedAt: number | null;
  lastFocusDate?: string;
}
