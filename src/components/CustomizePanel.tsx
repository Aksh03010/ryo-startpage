import { useRef, useState } from 'react';
import {
  AppWindow,
  Braces,
  CircleAlert,
  Image,
  Loader2,
  Palette,
  RotateCcw,
  Scan,
  Sparkles,
  X,
} from 'lucide-react';
import { RangeControls } from './ui/Range';
import { SectionTitle, Segmented, Slider, Toggle } from './ui/Controls';
import { DEFAULT_CUSTOM_ACCENT, GRID_STEP, WIDGET_IDS, ACCENTS, CLOCK_FONTS, CLOCK_ANIMATIONS, DEFAULT_LINKS, DEFAULT_POSITIONS, PRESETS, SEARCH_ENGINES } from '../constants';
import { safeHttpUrl, guessMediaType } from '../lib/link';
import styles from './CustomizePanel.module.css';
import type {
  AccentId,
  ClockAnimation,
  ClockFont,
  Settings,
  WidgetId,
  WidgetStyleOverride,
} from '../types';
import type { WallpaperState } from '../types';

type TabId = 'background' | 'appearance' | 'widgets' | 'layout';

const TABS: Array<{ id: TabId; label: string; icon: typeof Image }> = [
  { id: 'background', label: 'Background', icon: Image },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'widgets', label: 'Widgets', icon: AppWindow },
  { id: 'layout', label: 'Layout', icon: Scan },
];

export default function CustomizePanel({
  open,
  onClose,
  settings,
  onSettings,
  arrange,
  onArrange,
  onResetLayout,
  onResetAppearance,
  onUpload,
  uploading,
  uploadError,
}: {
  open: boolean;
  onClose: () => void;
  settings: Settings;
  onSettings: (mutator: (draft: Settings) => Settings) => void;
  arrange: boolean;
  onArrange: () => void;
  onResetLayout: () => void;
  onResetAppearance: () => void;
  onUpload: (file: File) => void;
  uploading: boolean;
  uploadError: string | null;
}) {
  const [tab, setTab] = useState<TabId>('background');
  const [urlDraft, setUrlDraft] = useState('');
  const [urlError, setUrlError] = useState<string | null>(null);
  const [widgetDetail, setWidgetDetail] = useState<WidgetId>('clock');
  const fileRef = useRef<HTMLInputElement | null>(null);

  const appearance = settings.appearance;
  const background = settings.background;
  const wallpaper = background.wallpaper;
  const detailWidget = appearance.widgets[widgetDetail];

  const patchBackground = (value: Partial<Settings['background']>) =>
    onSettings((draft) => ({ ...draft, background: { ...draft.background, ...value } }));

  const patchAppearance = (value: Partial<Settings['appearance']>) =>
    onSettings((draft) => ({ ...draft, appearance: { ...draft.appearance, ...value } }));

  const patchClock = (value: Partial<Settings['clock']>) =>
    onSettings((draft) => ({ ...draft, clock: { ...draft.clock, ...value } }));

  const patchWidgetStyle = (id: WidgetId, value: Partial<WidgetStyleOverride>) =>
    onSettings((draft) => ({
      ...draft,
      appearance: {
        ...draft.appearance,
        widgets: {
          ...draft.appearance.widgets,
          [id]: {
            ...draft.appearance.widgets[id],
            style: { ...draft.appearance.widgets[id].style, ...value },
          },
        },
      },
    }));

  const applyUrl = () => {
    const raw = urlDraft.trim();
    if (!raw) {
      setUrlError('Paste a wallpaper URL first.');
      return;
    }
    try {
      const parsed = safeHttpUrl(raw);
      const mediaType = guessMediaType(parsed.href);
      const nextWallpaper: WallpaperState = {
        kind: 'url',
        preset: 'aurora',
        url: parsed.href,
        mediaType,
        name: parsed.hostname,
      };
      patchBackground({ wallpaper: nextWallpaper });
      setUrlError(null);
      setUrlDraft('');
    } catch {
      setUrlError('Only http(s) wallpaper links are supported.');
    }
  };

  const activeWidgetIds = Object.entries(appearance.widgets)
    .filter(([, value]) => value.visible)
    .map(([id]) => id as WidgetId);

  return (
    <div className={`${styles.backdrop} ${open ? styles.open : ''}`}>
      <div
        className={`${styles.panel} ${open ? styles.panelOpen : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Customize home"
      >
        <header className={styles.header}>
          <div>
            <p className={styles.brand}>
              <Sparkles size={15} /> Customize
            </p>
            <p className={styles.tagline}>Tune wallpaper, widgets and layout</p>
          </div>
          <button type="button" className={styles.close} onClick={onClose} aria-label="Close customize panel">
            <X size={17} />
          </button>
        </header>

        <div className={styles.tabs}>
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`${styles.tabButton} ${tab === item.id ? styles.tabActive : ''}`}
              onClick={() => setTab(item.id)}
            >
              <item.icon size={14} /> {item.label}
            </button>
          ))}
        </div>

        <div className={styles.body}>
          {tab === 'background' && (
            <div>
              <SectionTitle>Wallpaper</SectionTitle>
              <div className={styles.presetGrid}>
                {PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    className={`${styles.presetCard} ${wallpaper.preset === preset.id ? styles.presetActive : ''}`}
                    onClick={() => {
                      setUrlDraft('');
                      setUrlError(null);
                      onSettings((draft) => ({
                        ...draft,
                        background: {
                          ...draft.background,
                          wallpaper: { kind: 'preset', preset: preset.id, url: undefined, mediaId: undefined, mediaType: undefined, name: undefined },
                        },
                      }));
                    }}
                  >
                    <span
                      className={styles.presetThumb}
                      style={
                        preset.src
                          ? { backgroundImage: `url(${preset.src})` }
                          : { background: preset.gradient }
                      }
                    />
                    <span className={styles.presetMeta}>
                      <span>{preset.name}</span>
                      <small>{preset.blurb}</small>
                    </span>
                  </button>
                ))}
              </div>

              <div className={styles.mediaRow}>
                <button
                  type="button"
                  className={styles.actionButton}
                  onClick={() => fileRef.current?.click()}
                >
                  {uploading ? <Loader2 size={15} className={styles.spin} /> : <Image size={15} />}
                  {uploading ? 'Storing…' : 'Upload image / video'}
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif,image/avif,video/mp4,video/webm"
                  className={styles.hiddenInput}
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) onUpload(file);
                    event.target.value = '';
                  }}
                />
                {wallpaper.kind === 'url' && wallpaper.url && (
                  <span className={styles.chip}>URL active</span>
                )}
                {wallpaper.kind === 'upload' && wallpaper.name && (
                  <span className={styles.chip}>{wallpaper.name.slice(0, 28)}</span>
                )}
              </div>
              {uploadError && (
                <p className={styles.error}>
                  <CircleAlert size={13} /> {uploadError}
                </p>
              )}

              <div className={styles.field}>
                <label className={styles.fieldLabel}>Wallpaper URL</label>
                <div className={styles.urlRow}>
                  <input
                    className={styles.urlInput}
                    value={urlDraft}
                    onChange={(event) => setUrlDraft(event.target.value)}
                    placeholder="https://example.com/sunset.jpg"
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') applyUrl();
                    }}
                  />
                  <button type="button" className={styles.actionButton} onClick={applyUrl}>
                    Apply
                  </button>
                </div>
                {urlError && (
                  <p className={styles.error}>
                    <CircleAlert size={13} /> {urlError}
                  </p>
                )}
                <p className={styles.help}>
                  MP4 / WebM / GIF URLs become video or animated wallpapers automatically.
                </p>
              </div>

              <SectionTitle>Atmosphere</SectionTitle>
              <Slider
                label="Dim overlay"
                min={0}
                max={80}
                value={background.dim}
                display={(value) => `${value}%`}
                onChange={(value) => patchBackground({ dim: value })}
              />
              <Slider
                label="Backdrop blur"
                min={0}
                max={30}
                value={background.blur}
                display={(value) => `${value}px`}
                onChange={(value) => patchBackground({ blur: value })}
              />
              <Slider
                label="Brightness"
                min={40}
                max={160}
                value={background.brightness}
                display={(value) => `${value}%`}
                onChange={(value) => patchBackground({ brightness: value })}
              />
              <Slider
                label="Saturation"
                min={0}
                max={150}
                value={background.saturation}
                display={(value) => `${value}%`}
                onChange={(value) => patchBackground({ saturation: value })}
              />
              <Toggle
                label="Film grain"
                checked={background.grain}
                onChange={(value) => patchBackground({ grain: value })}
              />
              {wallpaper.mediaType === 'video' && (
                <>
                  <SectionTitle>Video playback</SectionTitle>
                  <Slider
                    label="Speed"
                    min={0.25}
                    max={2}
                    step={0.25}
                    value={background.videoPlaybackRate}
                    display={(value) => `${value.toFixed(2)}×`}
                    onChange={(value) => patchBackground({ videoPlaybackRate: value })}
                  />
                  <Toggle
                    label="Loop"
                    checked={background.videoLoop}
                    onChange={(value) => patchBackground({ videoLoop: value })}
                  />
                  <Toggle
                    label="Paused"
                    checked={background.videoPaused}
                    onChange={(value) => patchBackground({ videoPaused: value })}
                  />
                </>
              )}
            </div>
          )}

          {tab === 'appearance' && (
            <div>
              <SectionTitle>Accent</SectionTitle>
              <div className={styles.accentRow}>
                {(Object.keys(ACCENTS) as Array<Exclude<AccentId, 'custom'>>).map((id) => (
                  <button
                    key={id}
                    type="button"
                    className={`${styles.swatch} ${appearance.accent === id ? styles.swatchActive : ''}`}
                    style={{ ['--swatch' as string]: ACCENTS[id].tint }}
                    aria-label={ACCENTS[id].name}
                    onClick={() => patchAppearance({ accent: id })}
                  >
                    <span className={styles.swatchDot} />
                  </button>
                ))}
                <button
                  type="button"
                  className={`${styles.swatch} ${appearance.accent === 'custom' ? styles.swatchActive : ''}`}
                  style={{
                    ['--swatch' as string]:
                      appearance.accent === 'custom' ? appearance.customAccent : DEFAULT_CUSTOM_ACCENT,
                  }}
                  aria-label="Custom accent"
                  onClick={() => patchAppearance({ accent: 'custom' })}
                >
                  <span className={styles.swatchDot} />
                </button>
                <input
                  type="color"
                  className={styles.colorPicker}
                  aria-label="Pick a custom accent color"
                  value={appearance.customAccent || DEFAULT_CUSTOM_ACCENT}
                  onChange={(event) =>
                    patchAppearance({ accent: 'custom', customAccent: event.target.value })
                  }
                />
              </div>

              <SectionTitle>Glass boxes</SectionTitle>
              <Toggle
                label="Use glass background box"
                checked={appearance.glassEnabled}
                onChange={(value) => patchAppearance({ glassEnabled: value })}
              />
              <Slider
                label="Box opacity"
                min={0}
                max={100}
                value={appearance.glassOpacity}
                display={(value) => `${value}%`}
                onChange={(value) => patchAppearance({ glassOpacity: value })}
              />
              <Slider
                label="Box blur"
                min={0}
                max={34}
                value={appearance.glassBlur}
                display={(value) => `${value}px`}
                onChange={(value) => patchAppearance({ glassBlur: value })}
              />
              <Slider
                label="Corner rounding"
                min={0}
                max={36}
                value={appearance.radius}
                display={(value) => `${value}px`}
                onChange={(value) => patchAppearance({ radius: value })}
              />
              <Toggle
                label="Thin border"
                checked={appearance.border}
                onChange={(value) => patchAppearance({ border: value })}
              />
              <Toggle
                label="Drop shadow"
                checked={appearance.shadow}
                onChange={(value) => patchAppearance({ shadow: value })}
              />

              <SectionTitle>Text</SectionTitle>
              <Slider
                label="Widget text scale"
                min={90}
                max={125}
                value={appearance.textScale}
                display={(value) => `${value}%`}
                onChange={(value) => patchAppearance({ textScale: value })}
              />
              <Toggle
                label="Reduce motion"
                checked={appearance.reduceMotion}
                onChange={(value) => patchAppearance({ reduceMotion: value })}
              />
            </div>
          )}

          {tab === 'widgets' && (
            <div>
              <SectionTitle>Widget visibility</SectionTitle>
              <div className={styles.widgetList}>
                {Object.entries(appearance.widgets).map(([id, widget]) => (
                  <button
                    key={id}
                    type="button"
                    className={`${styles.widgetRow} ${widgetDetail === id ? styles.widgetRowActive : ''}`}
                    onClick={() => setWidgetDetail(id as WidgetId)}
                  >
                    <span className={styles.widgetDot} data-active={widget.visible || undefined} />
                    <span>{id.charAt(0).toUpperCase() + id.slice(1)}</span>
                  </button>
                ))}
              </div>
              {detailWidget && (
                <>
                  <Toggle
                    label="Show widget"
                    checked={detailWidget.visible}
                    onChange={(value) =>
                      onSettings((draft) => ({
                        ...draft,
                        appearance: {
                          ...draft.appearance,
                          widgets: {
                            ...draft.appearance.widgets,
                            [widgetDetail]: { ...draft.appearance.widgets[widgetDetail], visible: value },
                          },
                        },
                      }))
                    }
                  />

                  {widgetDetail === 'clock' && (
                    <>
                      <SectionTitle>Clock</SectionTitle>
                      <Toggle
                        label="24-hour time"
                        checked={settings.clock.use24Hour}
                        onChange={(value) => patchClock({ use24Hour: value })}
                      />
                      <Toggle
                        label="Show seconds"
                        checked={settings.clock.showSeconds}
                        onChange={(value) => patchClock({ showSeconds: value })}
                      />
                      <Toggle
                        label="Show date"
                        checked={settings.clock.showDate}
                        onChange={(value) => patchClock({ showDate: value })}
                      />
                      <Toggle
                        label="Show greeting"
                        checked={settings.clock.showGreeting}
                        onChange={(value) => patchClock({ showGreeting: value })}
                      />
                      <Segmented<ClockFont>
                        label="Clock font"
                        value={settings.clock.font}
                        options={CLOCK_FONTS.map((font) => ({ id: font.id, label: font.label }))}
                        onChange={(value) => patchClock({ font: value })}
                      />
                      <Segmented<ClockAnimation>
                        label="Clock animation"
                        value={settings.clock.animation}
                        options={CLOCK_ANIMATIONS.map((animation) => ({ id: animation.id, label: animation.label }))}
                        onChange={(value) => patchClock({ animation: value })}
                      />
                      <Slider
                        label="Clock size"
                        min={60}
                        max={210}
                        value={settings.clock.size}
                        display={(value) => `${value}px`}
                        onChange={(value) => patchClock({ size: value })}
                      />
                    </>
                  )}

                  {widgetDetail === 'tasks' && (
                    <>
                      <SectionTitle>Tasks</SectionTitle>
                      <Toggle
                        label="Show completed tasks"
                        checked={settings.tasks.showCompleted}
                        onChange={(value) => onSettings((draft) => ({ ...draft, tasks: { showCompleted: value } }))}
                      />
                    </>
                  )}

                  {widgetDetail === 'search' && (
                    <>
                      <SectionTitle>Search engine</SectionTitle>
                      <Segmented
                        label="Search engine"
                        value={settings.searchEngine}
                        options={Object.entries(SEARCH_ENGINES).map(([id, info]) => ({
                          id: id as keyof typeof SEARCH_ENGINES,
                          label: info.label,
                        }))}
                        onChange={(value) => onSettings((draft) => ({ ...draft, searchEngine: value }))}
                      />
                    </>
                  )}

                  {widgetDetail === 'links' && (
                    <>
                      <SectionTitle>Quick links</SectionTitle>
                      <p className={styles.help}>
                        Add or remove links directly on the widget — the layout, label tiles and add-tile stay inline.
                      </p>
                      <button
                        type="button"
                        className={styles.actionButton}
                        onClick={() => onSettings((draft) => draft)}
                      >
                        <Sparkles size={14} /> Workspace links
                      </button>
                    </>
                  )}

                  {widgetDetail === 'focus' && (
                    <>
                      <SectionTitle>Focus timer</SectionTitle>
                      <p className={styles.help}>
                        Adjust focus length and view your running sessions from the widget controls.
                      </p>
                      <RangeControls focusKey="ryo.focus.settings" />
                    </>
                  )}

                  <SectionTitle>Per-widget glass box</SectionTitle>
                  <Segmented<'inherit' | 'on' | 'off'>
                    label="Glass override"
                    value={detailWidget.style.glass ?? 'inherit'}
                    options={[
                      { id: 'inherit', label: 'Inherit' },
                      { id: 'on', label: 'On' },
                      { id: 'off', label: 'Off' },
                    ]}
                    onChange={(value) => patchWidgetStyle(widgetDetail, { glass: value === 'inherit' ? undefined : value })}
                  />
                  <Slider
                    label="Box opacity override"
                    min={0}
                    max={100}
                    value={detailWidget.style.opacity ?? appearance.glassOpacity}
                    display={(value) => `${value}%`}
                    onChange={(value) => patchWidgetStyle(widgetDetail, { opacity: value })}
                  />
                  <Slider
                    label="Corner radius override"
                    min={0}
                    max={36}
                    value={detailWidget.style.radius ?? appearance.radius}
                    display={(value) => `${value}px`}
                    onChange={(value) => patchWidgetStyle(widgetDetail, { radius: value })}
                  />
                  <button
                    type="button"
                    className={styles.linkButton}
                    onClick={() => patchWidgetStyle(widgetDetail, { glass: undefined, opacity: undefined, radius: undefined })}
                  >
                    <RotateCcw size={12} /> Reset widget styling
                  </button>
                </>
              )}
            </div>
          )}

          {tab === 'layout' && (
            <div>
              <SectionTitle>Arrangement</SectionTitle>
              <Toggle label="Arrange mode" checked={arrange} onChange={() => onArrange()} />
              <p className={styles.help}>
                Toggle, then drag the grip handle on a widget. Press <kbd>Ctrl</kbd> + <kbd>,</kbd> to open this panel any time.
              </p>
              <Toggle
                label="Snap to grid"
                checked={settings.layout.snapToGrid}
                onChange={(value) => onSettings((draft) => ({ ...draft, layout: { ...draft.layout, snapToGrid: value } }))}
              />
              <Toggle
                label="Show grid in arrange mode"
                checked={settings.layout.showGrid}
                onChange={(value) => onSettings((draft) => ({ ...draft, layout: { ...draft.layout, showGrid: value } }))}
              />
              <SectionTitle>Presets</SectionTitle>
              <div className={styles.mediaRow}>
                <button type="button" className={styles.actionButton} onClick={onResetLayout}>
                  <RotateCcw size={15} /> Reset layout
                </button>
                <span className={styles.activeIds}>
                  {activeWidgetIds.length} of {WIDGET_IDS.length} widgets visible · grid step {GRID_STEP}px
                </span>
              </div>

              <SectionTitle>Reset everything</SectionTitle>
              <button
                type="button"
                className={styles.dangerButton}
                onClick={() => {
                  onResetAppearance();
                  setDefaultLayout();
                }}
              >
                <Braces size={14} /> Factory reset settings
              </button>
              <p className={styles.help}>
                Clears local preferences, tasks, quick links and wallpaper selection. Stored wallpapers stay on disk until removed.
              </p>
            </div>
          )}
        </div>

        <footer className={styles.footer}>
          <p className={styles.footerNote}>
            Everything lives in your browser's localStorage and IndexedDB.
          </p>
        </footer>
      </div>
    </div>
  );
}

function setDefaultLayout() {
  try {
    localStorage.setItem('ryo.layout.v2', JSON.stringify(DEFAULT_POSITIONS));
    localStorage.setItem('ryo.links.v2', JSON.stringify(DEFAULT_LINKS));
  } catch {
    /* ignore */
  }
}
