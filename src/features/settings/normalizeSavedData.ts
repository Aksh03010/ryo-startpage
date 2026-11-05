import {
  DEFAULT_FOCUS,
  DEFAULT_LINKS,
  DEFAULT_POSITIONS,
  DEFAULT_SETTINGS,
  WIDGET_IDS,
} from '../../constants';
import type {
  FocusSettings,
  LayoutState,
  QuickLink,
  Reminder,
  Settings,
  Task,
  TaskRepeatDay,
  WidgetStyleOverride,
} from '../../types';

function object(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}
function number(value: unknown, fallback: number, min: number, max: number): number {
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.min(max, Math.max(min, value))
    : fallback;
}
function bool(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback;
}
function choice<T extends string>(value: unknown, choices: readonly T[], fallback: T): T {
  return typeof value === 'string' && choices.includes(value as T) ? (value as T) : fallback;
}
function text(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}
function httpUrl(value: unknown): string | undefined {
  try {
    const url = new URL(text(value));
    return ['http:', 'https:'].includes(url.protocol) ? url.href : undefined;
  } catch {
    return undefined;
  }
}
function days(value: unknown): TaskRepeatDay[] {
  return Array.isArray(value)
    ? [
        ...new Set(
          value.filter(
            (day): day is TaskRepeatDay => Number.isInteger(day) && day >= 0 && day <= 6,
          ),
        ),
      ]
    : [];
}
function style(value: unknown): WidgetStyleOverride {
  const saved = object(value);
  const result: WidgetStyleOverride = {};
  if (['glass', 'solid', 'none'].includes(text(saved.boxMode)))
    result.boxMode = saved.boxMode as WidgetStyleOverride['boxMode'];
  else if (saved.glass === 'on' || saved.glass === 'off')
    result.boxMode = saved.glass === 'on' ? 'glass' : 'solid';
  for (const [key, max] of [
    ['blur', 34],
    ['opacity', 100],
    ['radius', 36],
  ] as const) {
    if (typeof saved[key] === 'number' && Number.isFinite(saved[key]))
      result[key] = number(saved[key], 0, 0, max);
  }
  for (const key of ['border', 'shadow'] as const)
    if (typeof saved[key] === 'boolean') result[key] = saved[key];
  return result;
}

/** Repair each field before rendering, retaining usable values from partial and legacy saves. */
export function normalizeSettings(value: unknown): Settings {
  const saved = object(value);
  const a = object(saved.appearance),
    b = object(saved.background),
    c = object(saved.clock);
  const d = DEFAULT_SETTINGS;
  const widgets = Object.fromEntries(
    WIDGET_IDS.map((id) => {
      const widget = object(object(a.widgets)[id]);
      const fallback = d.appearance.widgets[id];
      return [
        id,
        {
          visible: bool(widget.visible, fallback.visible),
          size: number(widget.size, fallback.size ?? 100, 60, 140),
          style: widget.style === undefined ? { ...fallback.style } : style(widget.style),
        },
      ];
    }),
  ) as Settings['appearance']['widgets'];
  const wall = object(b.wallpaper);
  const preset = choice(wall.preset, ['aurora', 'midnight', 'ember', 'glacier'], 'aurora');
  const wallpaper: Settings['background']['wallpaper'] = { kind: 'preset', preset };
  if (wall.kind === 'url' && httpUrl(wall.url)) {
    wallpaper.kind = 'url';
    wallpaper.url = httpUrl(wall.url);
  } else if (wall.kind === 'upload' && text(wall.mediaId)) {
    wallpaper.kind = 'upload';
    wallpaper.mediaId = text(wall.mediaId);
  }
  if (wallpaper.kind !== 'preset') {
    wallpaper.mediaType = choice<'image' | 'video'>(wall.mediaType, ['image', 'video'], 'image');
    wallpaper.name = text(wall.name);
  }
  const customAccent = /^#[\da-f]{6}$/i.test(text(a.customAccent))
    ? text(a.customAccent)
    : d.appearance.customAccent;
  return {
    appearance: {
      accent: choice(
        a.accent,
        ['aurora', 'ember', 'rose', 'glacier', 'custom'],
        d.appearance.accent,
      ),
      customAccent,
      boxMode: choice(
        a.boxMode,
        ['glass', 'solid', 'none'],
        typeof a.glassEnabled === 'boolean'
          ? a.glassEnabled
            ? 'glass'
            : 'solid'
          : d.appearance.boxMode,
      ),
      glassOpacity: number(a.glassOpacity, d.appearance.glassOpacity, 0, 100),
      glassBlur: number(a.glassBlur, d.appearance.glassBlur, 0, 34),
      radius: number(a.radius, d.appearance.radius, 0, 36),
      border: bool(a.border, d.appearance.border),
      shadow: bool(a.shadow, d.appearance.shadow),
      textScale: number(a.textScale, d.appearance.textScale, 90, 125),
      reduceMotion: bool(a.reduceMotion, d.appearance.reduceMotion),
      widgets,
    },
    background: {
      wallpaper,
      dim: number(b.dim, d.background.dim, 0, 80),
      blur: number(b.blur, d.background.blur, 0, 30),
      brightness: number(b.brightness, d.background.brightness, 40, 160),
      saturation: number(b.saturation, d.background.saturation, 0, 150),
      grain: bool(b.grain, d.background.grain),
      videoPlaybackRate: number(b.videoPlaybackRate, 1, 0.25, 2),
      videoLoop: bool(b.videoLoop, true),
      videoPaused: bool(b.videoPaused, false),
    },
    clock: {
      font: choice(c.font, ['space', 'instrument', 'jetbrains', 'manrope'], d.clock.font),
      size: number(c.size, d.clock.size, 60, 210),
      use24Hour: bool(c.use24Hour, false),
      base24: bool(c.base24, false) && c.blorp !== true,
      blorp: bool(c.blorp, false),
      showSeconds: bool(c.showSeconds, false),
      showDate: bool(c.showDate, true),
      showGreeting: bool(c.showGreeting, true),
      animation: choice(c.animation, ['none', 'pulse', 'glow', 'shine'], 'none'),
    },
    tasks: { showCompleted: bool(object(saved.tasks).showCompleted, true) },
    layout: {
      snapToGrid: bool(object(saved.layout).snapToGrid, true),
      showGrid: bool(object(saved.layout).showGrid, false),
    },
    searchEngine: choice(
      saved.searchEngine,
      ['google', 'duckduckgo', 'brave', 'youtube'],
      d.searchEngine,
    ),
  };
}

export function normalizeLayout(value: unknown): LayoutState {
  const saved = object(value);
  return Object.fromEntries(
    WIDGET_IDS.map((id) => {
      const point = object(saved[id]);
      return [
        id,
        {
          x: number(point.x, DEFAULT_POSITIONS[id].x, 0, 100),
          y: number(point.y, DEFAULT_POSITIONS[id].y, 0, 100),
        },
      ];
    }),
  ) as LayoutState;
}
export function normalizeTasks(value: unknown): Task[] {
  if (!Array.isArray(value)) return [];
  return value
    .map(object)
    .filter((item) => text(item.id) && text(item.text))
    .map((item) => ({
      id: text(item.id),
      text: text(item.text),
      createdAt: number(item.createdAt, 0, 0, 8.64e15),
      repeatDays: days(item.repeatDays),
      done: bool(item.done, false),
      completions: Array.isArray(item.completions)
        ? item.completions.filter((v): v is string => typeof v === 'string')
        : [],
    }));
}
export function normalizeReminders(value: unknown): Reminder[] {
  if (!Array.isArray(value)) return [];
  return value
    .map(object)
    .filter((item) => text(item.id) && text(item.text))
    .map((item) => ({
      id: text(item.id),
      text: text(item.text),
      createdAt: number(item.createdAt, 0, 0, 8.64e15),
      repeatDays: days(item.repeatDays),
      dueAt:
        typeof item.dueAt === 'number' &&
        Number.isFinite(item.dueAt) &&
        Math.abs(item.dueAt) <= 8.64e15
          ? item.dueAt
          : null,
    }));
}
export function normalizeLinks(value: unknown): QuickLink[] {
  if (!Array.isArray(value)) return DEFAULT_LINKS;
  return value.map(object).flatMap((item) => {
    const url = httpUrl(item.url);
    return text(item.id) && url
      ? [{ id: text(item.id), label: text(item.label, new URL(url).hostname), url }]
      : [];
  });
}
export function normalizeFocusSettings(value: unknown): FocusSettings {
  const saved = object(value);
  return {
    focusMinutes: number(saved.focusMinutes, DEFAULT_FOCUS.focusMinutes, 5, 90),
    breakMinutes: number(saved.breakMinutes, DEFAULT_FOCUS.breakMinutes, 1, 60),
    sessions: number(saved.sessions, 0, 0, 1e9),
  };
}
