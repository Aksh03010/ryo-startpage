import { getGlobalBoxMode } from './features/settings/appearance';
import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import { BackgroundManager } from './features/wallpapers/BackgroundManager';
import { ClockWidget } from './components/ClockWidget';
import { SearchWidget } from './components/SearchWidget';
import { TopBar } from './components/TopBar';
import { WidgetShell } from './components/WidgetShell';
import {
  ACCENTS,
  CLOCK_FONTS,
  DEFAULT_CUSTOM_ACCENT,
  DEFAULT_FOCUS,
  DEFAULT_LINKS,
  DEFAULT_POSITIONS,
  DEFAULT_SETTINGS,
  WIDGET_TITLES,
  hexToRgbTriplet,
} from './constants';
import { useDashboardLayout } from './features/layout/useDashboardLayout';
import { useStartpageState } from './features/settings/useStartpageState';
import { useWallpaperUpload } from './features/wallpapers/useWallpaperUpload';
import { STORAGE_KEYS } from './lib/storageKeys';
import styles from './App.module.css';
import type { WidgetId } from './types';

const FocusWidget = lazy(() =>
  import('./components/FocusWidget').then((module) => ({ default: module.FocusWidget })),
);
const QuickLinks = lazy(() =>
  import('./components/QuickLinks').then((module) => ({ default: module.QuickLinks })),
);
const RemindersWidget = lazy(() =>
  import('./components/RemindersWidget').then((module) => ({ default: module.RemindersWidget })),
);
const TaskManager = lazy(() =>
  import('./components/TaskManager').then((module) => ({ default: module.TaskManager })),
);
const CustomizePanel = lazy(() =>
  import('./features/settings/CustomizePanel').then((module) => ({
    default: module.CustomizePanel,
  })),
);
const ArrangeCanvas = lazy(() =>
  import('./components/ArrangeCanvas').then((module) => ({ default: module.ArrangeCanvas })),
);
const SystemMonitorWidget = lazy(() =>
  import('./features/monitor/SystemMonitorWidget').then((module) => ({
    default: module.SystemMonitorWidget,
  })),
);

export function App() {
  const {
    tasks,
    setTasks,
    layout,
    setLayout,
    links,
    setLinks,
    settings,
    setSettings,
    reminders,
    setReminders,
    focusSettings,
    setFocusSettings,
  } = useStartpageState();
  const {
    upload: handleUpload,
    uploading,
    uploadError,
  } = useWallpaperUpload(settings.background.wallpaper, setSettings);
  const { arrange, setArrange, containerRef, toggleArrange, handleDragEnd, isDefaultLayout } =
    useDashboardLayout(layout, setLayout, settings.layout.snapToGrid);
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

  const toggleCustomize = useCallback(() => setCustomizeOpen((value) => !value), []);

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
  }, [customizeOpen, arrange, toggleCustomize, setArrange]);

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
      const globalBoxMode = getGlobalBoxMode(settings.appearance);
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
            return (
              <ClockWidget
                clock={settings.clock}
                accent={`rgba(var(--accent-rgb), 0.94)`}
                onBase24Change={(base24) =>
                  setSettings((draft) => ({ ...draft, clock: { ...draft.clock, base24 } }))
                }
              />
            );
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
                onEngineChange={(engine) =>
                  setSettings((draft) => ({ ...draft, searchEngine: engine }))
                }
              />
            );
          case 'system':
            return (
              <Suspense fallback={<p>Connecting monitor…</p>}>
                <SystemMonitorWidget
                  metrics={settings.monitorMetrics ?? DEFAULT_SETTINGS.monitorMetrics}
                />
              </Suspense>
            );
          default:
            return (
              <FocusWidget
                settingsKey={STORAGE_KEYS.focus}
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
          <Suspense
            fallback={
              <div className={styles.widgetLoading} aria-label={`Loading ${WIDGET_TITLES[id]}`} />
            }
          >
            {content}
          </Suspense>
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

  const dashboard = (
    <main
      ref={containerRef}
      className={styles.dashboard}
      data-layout={isDefaultLayout && !arrange ? 'flow' : 'free'}
      data-grid={gridVisible ? 'on' : undefined}
    >
      {widgetIds.map((id) => renderWidget(id))}
    </main>
  );

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
      <BackgroundManager
        background={settings.background}
        reduceMotion={settings.appearance.reduceMotion}
      />
      <TopBar
        arrange={arrange}
        customizeOpen={customizeOpen}
        onArrange={toggleArrange}
        onCustomize={toggleCustomize}
      />

      {arrange ? (
        <Suspense fallback={dashboard}>
          <ArrangeCanvas onDragEnd={handleDragEnd}>{dashboard}</ArrangeCanvas>
        </Suspense>
      ) : (
        dashboard
      )}
      <footer className={styles.footer}>
        <span>A little space. A clearer mind.</span>
        <span>
          Made for your orbit <span aria-hidden="true">✧</span>
        </span>
      </footer>

      {arrange && (
        <p className={styles.arrangeHint}>
          Drag widgets by the grip. Snap {settings.layout.snapToGrid ? 'on' : 'off'}. <kbd>Esc</kbd>{' '}
          exits.
        </p>
      )}
      {customizeOpen && (
        <Suspense
          fallback={
            <div className={styles.shortcutToast} role="status">
              Opening your space…
            </div>
          }
        >
          <CustomizePanel
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
          />
        </Suspense>
      )}
    </div>
  );
}
