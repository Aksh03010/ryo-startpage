import { useId, useState } from 'react';
import styles from './Controls.module.css';

export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  display,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  display?: (value: number) => string;
}) {
  const percent = ((value - min) / (max - min)) * 100;
  const inputId = useId();
  const clamp = (raw: number) =>
    Number(Math.min(max, Math.max(min, min + Math.round((raw - min) / step) * step)).toFixed(6));
  const formatted = display?.(value) ?? '';
  const suffix = formatted.startsWith(String(value))
    ? formatted.slice(String(value).length).trim()
    : '';
  const [draft, setDraft] = useState<string | null>(null);

  const commit = () => {
    if (draft !== null && draft.trim() !== '') {
      const parsed = Number(draft);
      if (Number.isFinite(parsed)) onChange(clamp(parsed));
    }
    setDraft(null);
  };

  return (
    <div className={styles.sliderRow}>
      <div className={styles.sliderMeta}>
        <label className={styles.sliderLabel} htmlFor={inputId}>
          {label}
        </label>
        <span className={styles.sliderValueWrap}>
          <input
            className={styles.sliderValueInput}
            type="number"
            inputMode="decimal"
            min={min}
            max={max}
            step={step}
            value={draft ?? value}
            onChange={(event) => {
              setDraft(event.target.value);
              const parsed = Number(event.target.value);
              if (
                event.target.value.trim() !== '' &&
                Number.isFinite(parsed) &&
                parsed >= min &&
                parsed <= max
              ) {
                onChange(clamp(parsed));
              }
            }}
            onBlur={commit}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                commit();
                event.currentTarget.blur();
              }
            }}
            aria-label={label}
          />
          <span className={styles.sliderValueSuffix} aria-hidden="true">
            {suffix}
          </span>
        </span>
      </div>
      <input
        type="range"
        id={inputId}
        min={min}
        max={max}
        step={step}
        value={value}
        className={styles.slider}
        style={{ ['--fill' as string]: percent }}
        onChange={(event) => {
          setDraft(null);
          onChange(Number(event.target.value));
        }}
        aria-label={label}
      />
    </div>
  );
}
