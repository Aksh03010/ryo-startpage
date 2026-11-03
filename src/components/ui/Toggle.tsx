import styles from './Controls.module.css';

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
