import { useState } from 'react';
import type { ReactNode } from 'react';
import styles from './Controls.module.css';

export function SectionTitle({ children }: { children: ReactNode }) {
  return <h3 className={styles.title}>{children}</h3>;
}

export function Row({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`${styles.row} ${className}`}>{children}</div>;
}

export function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className={styles.toggleRow}>
      <span className={styles.toggleLabel}>{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        className={`${styles.switch} ${checked ? styles.switchOn : styles.switchOff}`}
        onClick={() => onChange(!checked)}
      >
        <span className={styles.switchKnob} />
      </button>
    </label>
  );
}

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
  const clamp = (raw: number) => Math.min(max, Math.max(min, raw));
  const [draft, setDraft] = useState<string | null>(null);

  const commit = () => {
    if (draft !== null && draft.trim() !== '') {
      const parsed = Number(draft);
      if (Number.isFinite(parsed)) onChange(clamp(parsed));
    }
    setDraft(null);
  };

  return (
    <label className={styles.sliderRow}>
      <div className={styles.sliderMeta}>
        <span className={styles.sliderLabel}>{label}</span>
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
              if (event.target.value.trim() !== '' && Number.isFinite(parsed) && parsed >= min && parsed <= max) {
                onChange(parsed);
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
          <span className={styles.sliderValueSuffix}>{display ? display(value) : ''}</span>
        </span>
      </div>
      <input
        type="range"
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
    </label>
  );
}

export function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: Array<{ id: T; label: string }>;
  onChange: (value: T) => void;
}) {
  return (
    <div className={styles.segmentedWrap} role="group" aria-label={label}>
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          className={`${styles.segment} ${option.id === value ? styles.segmentActive : ''}`}
          aria-checked={option.id === value}
          role="radio"
          onClick={() => onChange(option.id)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
