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
import { DEFAULT_CUSTOM_ACCENT, WIDGET_IDS, WIDGET_TITLES, ACCENTS, CLOCK_FONTS, CLOCK_ANIMATIONS, PRESETS, SEARCH_ENGINES } from '../constants';
import { safeHttpUrl, guessMediaType } from '../lib/link';
import styles from './CustomizePanel.module.css';
import type {
  AccentId,
  ClockAnimation,
  ClockFont,
  Settings,
  WidgetId,
  WidgetStyleOverride,
  FocusSettings,
  BoxMode,
} from '../types';
import type { WallpaperState } from '../types';

type TabId = 'background' | 'appearance' | 'widgets' | 'layout';

const TABS: Array<{ id: TabId; label: string; icon: typeof Image }> = [
  { id: 'background', label: 'Background', icon: Image },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'widgets', label: 'Widgets', icon: AppWindow },
  { id: 'layout', label: 'Layout', icon: Scan },
];

const TAB_HELP: Record<TabId, string> = {
  background: 'Choose a wallpaper and adjust how it looks.',
  appearance: 'Set the colors, boxes, and text used across your widgets.',
  widgets: 'Choose which widgets appear and customize each one.',
  layout: 'Move widgets, change snapping, or restore the layout.',
};

export default function CustomizePanel({
  open,
  onClose,
  settings,
  onSettings,
  arrange,
  onArrange,
  onResetLayout,
  onResetPreferences,
  onUpload,
  uploading,
  uploadError,
  focusSettings,
  onFocusSettings,
}: {
  open: boolean;
  onClose: () => void;
  settings: Settings;
  onSettings: (mutator: (draft: Settings) => Settings) => void;
  arrange: boolean;
  onArrange: () => void;
  onResetLayout: () => void;
  onResetPreferences: () => void;
  onUpload: (file: File) => void;
  uploading: boolean;
  uploadError: string | null;
  focusSettings: FocusSettings;
  onFocusSettings: (next: FocusSettings | ((prev: FocusSettings) => FocusSettings)) => void;
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
  const globalBoxMode = appearance.boxMode ?? (appearance.glassEnabled === false ? 'solid' : 'glass');
  const detailBoxSelection =
    detailWidget?.style.boxMode ??
    (detailWidget?.style.glass === 'on' ? 'glass' : detailWidget?.style.glass === 'off' ? 'solid' : 'inherit');
  const detailBoxMode = detailBoxSelection === 'inherit' ? globalBoxMode : detailBoxSelection;
  const anyGlassBoxes =
    globalBoxMode === 'glass' ||
    Object.values(appearance.widgets).some((widget) => widget.style.boxMode === 'glass' || widget.style.glass === 'on');

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
            <p className={styles.tagline}>{TAB_HELP[tab]}</p>
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
              aria-pressed={tab === item.id}
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
                    aria-pressed={wallpaper.kind === 'preset' && wallpaper.preset === preset.id}
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

              <SectionTitle>Wallpaper adjustments</SectionTitle>
              <Slider
                label="Darken wallpaper"
                min={0}
                max={80}
                value={background.dim}
                display={(value) => `${value}%`}
                onChange={(value) => patchBackground({ dim: value })}
              />
              <Slider
                label="Wallpaper blur"
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
                label="Show film grain"
                checked={background.grain}
                onChange={(value) => patchBackground({ grain: value })}
              />
              {wallpaper.mediaType === 'video' && (
                <>
                  <SectionTitle>Video playback</SectionTitle>
                  <Slider
                    label="Video speed"
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
                    label="Pause video"
                    checked={background.videoPaused}
                    onChange={(value) => patchBackground({ videoPaused: value })}
                  />
                </>
              )}
            </div>
          )}

          {tab === 'appearance' && (
            <div>
              <SectionTitle>Accent color</SectionTitle>
              <p className={styles.help}>Choose a color used for highlights and active controls.</p>
              <div className={styles.accentRow}>
                {(Object.keys(ACCENTS) as Array<Exclude<AccentId, 'custom'>>).map((id) => (
                  <button
                    key={id}
                    type="button"
                    className={`${styles.swatch} ${appearance.accent === id ? styles.swatchActive : ''}`}
                    style={{ ['--swatch' as string]: ACCENTS[id].tint }}
                    aria-label={ACCENTS[id].name}
                    title={`${ACCENTS[id].name} accent`}
                    aria-pressed={appearance.accent === id}
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
                  title="Custom accent"
                  aria-pressed={appearance.accent === 'custom'}
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

              <SectionTitle>Widget boxes</SectionTitle>
              <p className={styles.help}>Choose how the background behind each widget looks.</p>
              <Segmented<BoxMode>
                label="Default box style"
                value={globalBoxMode}
                options={[
                  { id: 'glass', label: 'Glass' },
                  { id: 'solid', label: 'Solid' },
                  { id: 'none', label: 'None' },
                ]}
                onChange={(value) => patchAppearance({ boxMode: value })}
              />
              <p className={styles.help}>Glass is blurred and translucent. Solid is dark with no blur. None removes the box.</p>
              {globalBoxMode !== 'none' && (
                <>
                  <Slider
                    label="Box darkness"
                    min={0}
                    max={100}
                    value={appearance.glassOpacity}
                    display={(value) => `${value}%`}
                    onChange={(value) => patchAppearance({ glassOpacity: value })}
                  />
                  <p className={styles.help}>
                    {globalBoxMode === 'glass'
                      ? 'At 0, glass is clear with blur and no tint. Increase this to add a darker tint.'
                      : 'At 0, the box fill is clear. Increase this to make the solid box darker.'}
                  </p>
                </>
              )}
              {anyGlassBoxes && (
                <Slider
                  label="Glass blur"
                  min={0}
                  max={34}
                  value={appearance.glassBlur}
                  display={(value) => `${value}px`}
                  onChange={(value) => patchAppearance({ glassBlur: value })}
                />
              )}
              <Slider
                label="Corner roundness"
                min={0}
                max={36}
                value={appearance.radius}
                display={(value) => `${value}px`}
                onChange={(value) => patchAppearance({ radius: value })}
              />
              <Toggle
                label="Show box border"
                checked={appearance.border}
                onChange={(value) => patchAppearance({ border: value })}
              />
              <Toggle
                label="Show box shadow"
                checked={appearance.shadow}
                onChange={(value) => patchAppearance({ shadow: value })}
              />

              <SectionTitle>Text</SectionTitle>
              <Slider
                label="Text size"
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
              <SectionTitle>Choose a widget</SectionTitle>
              <p className={styles.help}>Select a widget to show or hide it and adjust its settings.</p>
              <div className={styles.widgetList}>
                {Object.entries(appearance.widgets).map(([id, widget]) => (
                  <button
                    key={id}
                    type="button"
                    className={`${styles.widgetRow} ${widgetDetail === id ? styles.widgetRowActive : ''}`}
                    aria-pressed={widgetDetail === id}
                    onClick={() => setWidgetDetail(id as WidgetId)}
                  >
                    <span className={styles.widgetDot} data-active={widget.visible || undefined} />
                    <span>{WIDGET_TITLES[id as WidgetId]}</span>
                  </button>
                ))}
              </div>
              {detailWidget && (
                <>
                  <Toggle
                    label="Show on page"
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
                      <p className={styles.help}>Add, edit, and remove links directly in the Quick links widget.</p>
                    </>
                  )}

                  {widgetDetail === 'focus' && (
                    <>
                      <SectionTitle>Focus timer</SectionTitle>
                      <p className={styles.help}>
                        Set how long a focus session lasts. Start, pause, or reset it in the Focus widget.
                      </p>
                      <RangeControls settings={focusSettings} onChange={onFocusSettings} />
                    </>
                  )}

                  <SectionTitle>Box style for {WIDGET_TITLES[widgetDetail]}</SectionTitle>
                  <p className={styles.help}>Use the default style, or choose a different style for this widget.</p>
                  <Segmented<'inherit' | BoxMode>
                    label="Widget box style"
                    value={detailBoxSelection}
                    options={[
                      { id: 'inherit', label: 'Default' },
                      { id: 'glass', label: 'Glass' },
                      { id: 'solid', label: 'Solid' },
                      { id: 'none', label: 'None' },
                    ]}
                    onChange={(value) => patchWidgetStyle(widgetDetail, { boxMode: value === 'inherit' ? undefined : value })}
                  />
                  {detailBoxMode !== 'none' && (
                    <>
                      <Slider
                        label="Box darkness"
                        min={0}
                        max={100}
                        value={detailWidget.style.opacity ?? appearance.glassOpacity}
                        display={(value) => `${value}%`}
                        onChange={(value) => patchWidgetStyle(widgetDetail, { opacity: value })}
                      />
                      <p className={styles.help}>
                        {detailBoxMode === 'glass'
                          ? 'At 0, this glass box has blur but no tint. Higher values add a darker tint.'
                          : 'At 0, this box fill is clear. Higher values make it darker.'}
                      </p>
                      {detailBoxMode === 'glass' && (
                        <Slider
                          label="Glass blur"
                          min={0}
                          max={34}
                          value={detailWidget.style.blur ?? appearance.glassBlur}
                          display={(value) => `${value}px`}
                          onChange={(value) => patchWidgetStyle(widgetDetail, { blur: value })}
                        />
                      )}
                      <Slider
                        label="Corner roundness"
                        min={0}
                        max={36}
                        value={detailWidget.style.radius ?? appearance.radius}
                        display={(value) => `${value}px`}
                        onChange={(value) => patchWidgetStyle(widgetDetail, { radius: value })}
                      />
                      <Toggle
                        label="Show box border"
                        checked={detailWidget.style.border ?? appearance.border}
                        onChange={(value) => patchWidgetStyle(widgetDetail, { border: value })}
                      />
                      <Toggle
                        label="Show box shadow"
                        checked={detailWidget.style.shadow ?? appearance.shadow}
                        onChange={(value) => patchWidgetStyle(widgetDetail, { shadow: value })}
                      />
                    </>
                  )}
                  <button
                    type="button"
                    className={styles.linkButton}
                    onClick={() => patchWidgetStyle(widgetDetail, { glass: undefined, boxMode: undefined, blur: undefined, opacity: undefined, radius: undefined, border: undefined, shadow: undefined })}
                  >
                    <RotateCcw size={12} /> Reset widget styling
                  </button>
                </>
              )}
            </div>
          )}

          {tab === 'layout' && (
            <div>
              <SectionTitle>Move widgets</SectionTitle>
              <Toggle label="Turn on arrange mode" checked={arrange} onChange={() => onArrange()} />
              <p className={styles.help}>
                Turn this on, then drag a widget by its handle. Press <kbd>Ctrl</kbd> + <kbd>,</kbd> to reopen this panel.
              </p>
              <Toggle
                label="Snap widgets to a grid"
                checked={settings.layout.snapToGrid}
                onChange={(value) => onSettings((draft) => ({ ...draft, layout: { ...draft.layout, snapToGrid: value } }))}
              />
              <Toggle
                label="Show grid while arranging"
                checked={settings.layout.showGrid}
                onChange={(value) => onSettings((draft) => ({ ...draft, layout: { ...draft.layout, showGrid: value } }))}
              />
              <SectionTitle>Restore layout</SectionTitle>
              <div className={styles.mediaRow}>
                <button type="button" className={styles.actionButton} onClick={onResetLayout}>
                  <RotateCcw size={15} /> Restore default positions
                </button>
                <span className={styles.activeIds}>
                  {activeWidgetIds.length} of {WIDGET_IDS.length} widgets are shown.
                </span>
              </div>

              <SectionTitle>Restore defaults</SectionTitle>
              <button
                type="button"
                className={styles.actionButton}
                onClick={onResetPreferences}
              >
                <Braces size={14} /> Restore default setup
              </button>
              <p className={styles.help}>
                Restores the wallpaper, appearance, widget positions, quick links, search engine, and focus length. Tasks and reminders stay as they are.
              </p>
            </div>
          )}
        </div>

        <footer className={styles.footer}>
          <p className={styles.footerNote}>
            Settings and lists are saved in this browser. Uploaded wallpapers stay on this device.
          </p>
        </footer>
      </div>
    </div>
  );
}
