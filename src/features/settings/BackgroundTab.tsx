import { useRef } from 'react';
import { Image, Loader2, CircleAlert } from 'lucide-react';
import { PRESETS } from '../../constants';
import { safeHttpUrl, guessMediaType } from '../../lib/link';
import type { WallpaperState } from '../../types';
import styles from './CustomizePanel.module.css';
import { SectionTitle } from '../../components/ui/SectionTitle';
import { Slider } from '../../components/ui/Slider';
import { Toggle } from '../../components/ui/Toggle';
import type { BackgroundTabProps } from './types';
import { createSettingsActions } from './settingsActions';

export function BackgroundTab({
  settings,
  onSettings,
  onUpload,
  uploading,
  uploadError,
  urlDraft,
  setUrlDraft,
  urlError,
  setUrlError,
}: BackgroundTabProps) {
  const background = settings.background;
  const wallpaper = background.wallpaper;
  const fileRef = useRef<HTMLInputElement>(null);
  const { patchBackground } = createSettingsActions(onSettings);
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

  return (
    <div className={styles.tabContent}>
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
                  wallpaper: {
                    kind: 'preset',
                    preset: preset.id,
                    url: undefined,
                    mediaId: undefined,
                    mediaType: undefined,
                    name: undefined,
                  },
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
          accept="image/png,image/jpeg,image/webp,image/gif,image/avif,video/mp4,video/webm,video/ogg"
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
          Use direct image, GIF, MP4, or WebM links. Videos pause while this page is hidden.
        </p>
      </div>

      <details className={styles.engineHelp}>
        <summary>Wallpaper Engine & live backgrounds</summary>
        <p>
          For a video wallpaper, right-click it in Wallpaper Engine, choose Open in Explorer, then
          upload its MP4 or WebM file here. Scene (.pkg) wallpapers need a video recording.
        </p>
        <p>
          Ryo also includes a native web-wallpaper build with Wallpaper Engine controls. See the
          project README for setup. In Wallpaper Engine, use WebM videos.
        </p>
        <a
          href="https://help.wallpaperengine.io/en/functionality/editingwallpapers.html"
          target="_blank"
          rel="noreferrer"
        >
          Wallpaper Engine's file guide ↗
        </a>
      </details>
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
  );
}
