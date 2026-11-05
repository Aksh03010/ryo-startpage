import styles from './Controls.module.css';

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
    <div className={styles.segmentedWrap} role="radiogroup" aria-label={label}>
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          className={`${styles.segment} ${option.id === value ? styles.segmentActive : ''}`}
          aria-checked={option.id === value}
          role="radio"
          tabIndex={option.id === value ? 0 : -1}
          onKeyDown={(event) => {
            const index = options.findIndex((item) => item.id === option.id);
            const next =
              event.key === 'Home'
                ? 0
                : event.key === 'End'
                  ? options.length - 1
                  : ['ArrowRight', 'ArrowDown'].includes(event.key)
                    ? (index + 1) % options.length
                    : ['ArrowLeft', 'ArrowUp'].includes(event.key)
                      ? (index - 1 + options.length) % options.length
                      : -1;
            if (next < 0) return;
            event.preventDefault();
            onChange(options[next].id);
            (event.currentTarget.parentElement?.children[next] as HTMLElement | undefined)?.focus();
          }}
          onClick={() => onChange(option.id)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
