import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { DragEndEvent } from '@dnd-kit/core';
import type { CSSProperties } from 'react';
import BackgroundManager from './components/BackgroundManager';
import ClockWidget from './components/ClockWidget';
import SearchWidget from './components/SearchWidget';
import TopBar from './components/TopBar';
import WidgetShell from './components/WidgetShell';
import { ACCENTS, CLOCK_FONTS, DEFAULT_CUSTOM_ACCENT, DEFAULT_FOCUS, DEFAULT_LINKS, DEFAULT_POSITIONS, DEFAULT_SETTINGS, GRID_STEP, WIDGET_IDS, WIDGET_TITLES, hexToRgbTriplet } from './constants';
import { useWallpaperEngine } from './hooks/useWallpaperEngine';
import { useLocalStorage } from './hooks/useLocalStorage';
import styles from './App.module.css';
import type { BoxMode, FocusSettings, LayoutState, QuickLink, Reminder, Settings, Task, WidgetId } from './types';

const FocusWidget = lazy(() => import('./components/FocusWidget'));
const QuickLinks = lazy(() => import('./components/QuickLinks'));
const RemindersWidget = lazy(() => import('./components/RemindersWidget'));
const TaskManager = lazy(() => import('./components/TaskManager'));
const CustomizePanel = lazy(() => import('./components/CustomizePanel'));
const ArrangeCanvas = lazy(() => import('./components/ArrangeCanvas'));
const SystemMonitorWidget = lazy(() => import('./components/SystemMonitorWidget'));

const TASK_KEY = 'ryo.tasks.v2';
const LAYOUT_KEY = 'ryo.layout.v2';
const LINKS_KEY = 'ryo.links.v2';
const SETTINGS_KEY = 'ryo.settings.v2';
const FOCUS_KEY = 'ryo.focus.v2';
const FOCUS_SETTINGS_KEY = 'ryo.focus.settings';
const REMINDER_KEY = 'ryo.reminders.v2';

export default function App() {
  const [tasks, setTasks] = useLocalStorage<Task[]>(TASK_KEY, []);
  const [layout, setLayout] = useLocalStorage<LayoutState>(LAYOUT_KEY, DEFAULT_POSITIONS);
  const [links, setLinks] = useLocalStorage<QuickLink[]>(LINKS_KEY, DEFAULT_LINKS);
  const [savedSettings, setSettings] = useLocalStorage<Settings>(SETTINGS_KEY, DEFAULT_SETTINGS);
  const settings = useWallpaperEngine(savedSettings);
  const [reminders, setReminders] = useLocalStorage<Reminder[]>(REMINDER_KEY, []);
  const [focusSettings, setFocusSettings] = useLocalStorage<FocusSettings>(FOCUS_SETTINGS_KEY, DEFAULT_FOCUS);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [arrange, setArrange] = useState(false);
  const [customizeOpen, setCustomizeOpen] = useState(false);

  const appearance = settings.appearance;
  const accent = useMemo(() => {
    if (appearance.accent === 'custom') {
      const tint = appearance.customAccent || DEFAULT_CUSTOM_ACCENT;
      return { name: 'Custom', tint, rgb: hexToRgbTriplet(tint) };
    }
    return ACCENTS[appearance.accent] ?? ACCENTS.aurora;
  }, [appearance.accent, appearance.customAccent]);
  const clockFont = CLOCK_FONTS.find((font) => font.id === settings.clock.font) ?? CLOCK_FONTS[0];
  const containerRef = useRef<HTMLDivElement | null>(null);

  const toggleCustomize = useCallback(() => setCustomizeOpen((value) => !value), []);
  const toggleArrange = useCallback(() => {
    if (!arrange && containerRef.current?.dataset.layout === 'flow' && window.innerWidth > 520) {
      const container = containerRef.current.getBoundingClientRect();
      const positions = { ...layout };
      containerRef.current.querySelectorAll<HTMLElement>('[data-widget-id]').forEach((node) => {
        const id = node.dataset.widgetId as WidgetId;
        const rect = node.getBoundingClientRect();
        positions[id] = { x: rect.left / window.innerWidth * 100, y: (rect.top - container.top) / Math.max(850, window.innerHeight - 100) * 100 };
      });
      setLayout(positions);
    }
    setArrange((value) => !value);
  }, [arrange, layout, setLayout]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === ',') {
        event.preventDefault();
        toggleCustomize();
      } else if (event.key === 'Escape') {
        if (customizeOpen) setCustomizeOpen(false);
        else if (arrange) setArrange(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [customizeOpen, arrange, toggleCustomize]);

  /** Older saves miss newer widget slots — add them once without overwriting user choices. */
  useEffect(() => {
    setSettings((draft) => {
      const widgets = draft.appearance.widgets ?? {};
      const missing = WIDGET_IDS.filter((id) => !(id in widgets));
      if (missing.length === 0) return draft;
      const additions: Record<string, Settings['appearance']['widgets'][WidgetId]> = {};
      for (const id of missing) additions[id] = DEFAULT_SETTINGS.appearance.widgets[id];
      return {
        ...draft,
        appearance: { ...draft.appearance, widgets: { ...additions, ...widgets } },
      };
    });
  }, [setSettings]);

  useEffect(() => {
    setSettings((draft) => {
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
          boxMode:
            legacyAppearance.boxMode ?? (glassEnabled === false ? 'solid' : 'glass'),
          widgets,
        },
      };
    });
  }, [setSettings]);

  useEffect(() => {
    setSettings((draft) => {
      const monitorMetrics = { ...DEFAULT_SETTINGS.monitorMetrics, ...draft.monitorMetrics };
      const current = draft.monitorMetrics;
      if (
        current &&
        current.cpu === monitorMetrics.cpu &&
        current.gpu1 === monitorMetrics.gpu1 &&
        current.gpu2 === monitorMetrics.gpu2 &&
        current.ram === monitorMetrics.ram
      ) return draft;
      return { ...draft, monitorMetrics };
    });
  }, [setSettings]);

  const handleUpload = useCallback(
    async (file: File) => {
      setUploading(true);
      setUploadError(null);
      try {
        if (!['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/avif', 'video/mp4', 'video/webm', 'video/ogg'].includes(file.type)) {
          setUploadError('Use PNG, JPG, WebP, GIF, AVIF, MP4, WebM or OGV files.');
          return;
        }
        if (file.size > 180 * 1024 * 1024) {
          setUploadError('Media that large may still work, but try a smaller file first.');
          return;
        }
        const { deleteWallpaper, saveWallpaper } = await import('./lib/mediaStore');
        const record = await saveWallpaper(file);
        const previous = settings.background.wallpaper;
        if (previous.kind === 'upload' && previous.mediaId && previous.mediaId !== record.id) {
          void deleteWallpaper(previous.mediaId).catch((error) => console.error('Unable to remove the previous wallpaper', error));
        }
        setSettings((draft) => ({
          ...draft,
          background: {
            ...draft.background,
            videoPaused: false,
            wallpaper: {
              kind: 'upload',
              preset: draft.background.wallpaper.preset,
              mediaId: record.id,
              mediaType: file.type.startsWith('video/') ? 'video' : 'image',
              name: file.name,
            },
          },
        }));
      } catch (error) {
        setUploadError('Unable to store this wallpaper locally. Try a smaller file.');
        console.error(error);
      } finally {
        setUploading(false);
      }
    },
    [setSettings, settings.background.wallpaper],
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const widgetId = (event.active.data.current as { widgetId?: string }).widgetId;
    if (!widgetId) return;
    const translated = event.active.rect.current.translated;
    const container = containerRef.current?.getBoundingClientRect();
    if (!translated || !container) return;

    const widgetWidth = translated.width;
    const widgetHeight = translated.height;
    let left = Math.min(translated.left - container.left, container.width - widgetWidth);
    let top = Math.min(translated.top - container.top, container.height - widgetHeight);
    left = Math.max(left, 12);
    top = Math.max(top, 76);

    if (settings.layout.snapToGrid) {
      left = Math.round(left / GRID_STEP) * GRID_STEP;
      top = Math.round(top / GRID_STEP) * GRID_STEP;
    } else {
      left = Math.round(left);
      top = Math.round(top);
    }

    setLayout((prev) => ({
      ...prev,
      [widgetId]: {
        x: Number(((left / container.width) * 100).toFixed(2)),
        y: Number(((top / container.height) * 100).toFixed(2)),
      },
    }));
  };

  const widgetIds = useMemo(
    () =>
      Object.entries(settings.appearance.widgets)
        .filter(([, widget]) => widget.visible)
        .map(([id]) => id as WidgetId),
    [settings.appearance.widgets],
  );

  const renderWidget = useCallback(
    (id: WidgetId) => {
      const widget = settings.appearance.widgets[id];
      const position = layout[id] ?? DEFAULT_POSITIONS[id];
      const widgetStyle = widget.style ?? {};
      const globalBoxMode = settings.appearance.boxMode ?? (settings.appearance.glassEnabled === false ? 'solid' : 'glass');
      const boxMode = widgetStyle.boxMode ?? globalBoxMode;
      const widgetSize = widget.size ?? 100;
      const opacity = widgetStyle.opacity ?? settings.appearance.glassOpacity;
      const radius = widgetStyle.radius ?? settings.appearance.radius;
      const border = widgetStyle.border ?? settings.appearance.border;
      const shadow = widgetStyle.shadow ?? settings.appearance.shadow;
      const glassBlur = widgetStyle.blur ?? settings.appearance.glassBlur;

      const renderContent = () => {
        switch (id) {
          case 'clock':
            return <ClockWidget clock={settings.clock} accent={`rgba(var(--accent-rgb), 0.94)`} />;
          case 'tasks':
            return <TaskManager tasks={tasks} settings={settings.tasks} onTasksChange={setTasks} />;
          case 'reminders':
            return <RemindersWidget reminders={reminders} onRemindersChange={setReminders} />;
          case 'links':
            return <QuickLinks links={links} onLinksChange={setLinks} />;
          case 'search':
            return (
              <SearchWidget
                engine={settings.searchEngine}
                onEngineChange={(engine) => setSettings((draft) => ({ ...draft, searchEngine: engine }))}
              />
            );
          case 'system':
            return <Suspense fallback={<p>Connecting monitor…</p>}><SystemMonitorWidget metrics={settings.monitorMetrics ?? DEFAULT_SETTINGS.monitorMetrics} /></Suspense>;
          default:
            return (
              <FocusWidget
                settingsKey={FOCUS_KEY}
                focusMinutes={focusSettings.focusMinutes}
                breakMinutes={focusSettings.breakMinutes}
              />
            );
        }
      };

      const content = renderContent();

      return (
        <WidgetShell
          key={id}
          id={id}
          label={WIDGET_TITLES[id]}
          position={position}
          editMode={arrange}
          boxMode={boxMode}
          opacity={widget.visible ? opacity : 0}
          radius={radius}
          shadow={shadow}
          border={border}
          glassBlur={glassBlur}
          size={widgetSize}
        >
          <Suspense fallback={<div className={styles.widgetLoading} aria-label={`Loading ${WIDGET_TITLES[id]}`} />}>{content}</Suspense>
        </WidgetShell>
      );
    },
    [
      settings.appearance,
      settings.clock,
      settings.tasks,
      settings.searchEngine,
      settings.monitorMetrics,
      layout,
      arrange,
      tasks,
      links,
      reminders,
      focusSettings.focusMinutes,
      focusSettings.breakMinutes,
      setTasks,
      setLinks,
      setSettings,
      setReminders,
    ],
  );

  const gridVisible = settings.layout.showGrid && arrange;
  const isDefaultLayout = WIDGET_IDS.every((id) => !layout[id] || (layout[id].x === DEFAULT_POSITIONS[id].x && layout[id].y === DEFAULT_POSITIONS[id].y));
  const dashboard = <main ref={containerRef} className={styles.dashboard} data-layout={isDefaultLayout && !arrange ? 'flow' : 'free'} data-grid={gridVisible ? 'on' : undefined}>{widgetIds.map((id) => renderWidget(id))}</main>;

  return (
    <div
      className={`${styles.app} ${settings.appearance.reduceMotion ? styles.reduceMotion : ''}`}
      style={
        {
          '--accent': accent.tint,
          '--accent-rgb': accent.rgb,
          '--font-clock': clockFont.css,
          '--text-scale': String(settings.appearance.textScale / 100),
        } as CSSProperties
      }
    >
      <BackgroundManager background={settings.background} reduceMotion={settings.appearance.reduceMotion} />
      <TopBar
        arrange={arrange}
        customizeOpen={customizeOpen}
        onArrange={toggleArrange}
        onCustomize={toggleCustomize}
      />

      {arrange ? <Suspense fallback={dashboard}><ArrangeCanvas onDragEnd={handleDragEnd}>{dashboard}</ArrangeCanvas></Suspense> : dashboard}
      <footer className={styles.footer}><span>A little space. A clearer mind.</span><span>Made for your orbit <span aria-hidden="true">✧</span></span></footer>

      {arrange && (
        <p className={styles.arrangeHint}>
          Drag widgets by the grip. Snap {settings.layout.snapToGrid ? 'on' : 'off'}. <kbd>Esc</kbd> exits.
        </p>
      )}
      {customizeOpen && <Suspense fallback={<div className={styles.shortcutToast} role="status">Opening your space…</div>}><CustomizePanel
        open={customizeOpen}
        onClose={() => setCustomizeOpen(false)}
        settings={settings}
        onSettings={setSettings}
        arrange={arrange}
        onArrange={toggleArrange}
        onResetLayout={() => setLayout(DEFAULT_POSITIONS)}
        onResetPreferences={() => {
          setSettings(DEFAULT_SETTINGS);
          setLayout(DEFAULT_POSITIONS);
          setLinks(DEFAULT_LINKS);
          setFocusSettings(DEFAULT_FOCUS);
        }}
        onUpload={(file) => void handleUpload(file)}
        uploading={uploading}
        uploadError={uploadError}
        focusSettings={focusSettings}
        onFocusSettings={setFocusSettings}
      /></Suspense>}
    </div>
  );
}
