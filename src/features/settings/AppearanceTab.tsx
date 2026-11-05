import { getGlobalBoxMode } from './appearance';
import { ACCENTS, DEFAULT_CUSTOM_ACCENT } from '../../constants';
import type { AccentId, BoxMode } from '../../types';
import styles from './CustomizePanel.module.css';
import { SectionTitle } from '../../components/ui/SectionTitle';
import { Segmented } from '../../components/ui/Segmented';
import { Slider } from '../../components/ui/Slider';
import { Toggle } from '../../components/ui/Toggle';
import type { SettingsTabProps } from './types';
import { createSettingsActions } from './settingsActions';

export function AppearanceTab({ settings, onSettings }: SettingsTabProps) {
  const appearance = settings.appearance;
  const globalBoxMode = getGlobalBoxMode(appearance);
  const anyGlassBoxes =
    globalBoxMode === 'glass' ||
    Object.values(appearance.widgets).some(
      (widget) => widget.style.boxMode === 'glass' || widget.style.glass === 'on',
    );
  const { patchAppearance } = createSettingsActions(onSettings);
  return (
    <div className={styles.tabContent}>
      <SectionTitle>Accent color</SectionTitle>
      <p className={styles.help}>
        Tint surfaces, borders, buttons, and highlights across your space.
      </p>
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
      <p className={styles.help}>
        Glass is blurred and translucent. Solid is dark with no blur. None removes the box.
      </p>
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
  );
}
