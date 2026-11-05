import { Grip, Settings2 } from 'lucide-react';
import styles from './TopBar.module.css';

export function TopBar({
  arrange,
  customizeOpen,
  onArrange,
  onCustomize,
}: {
  arrange: boolean;
  customizeOpen: boolean;
  onArrange: () => void;
  onCustomize: () => void;
}) {
  return (
    <header className={styles.topbar}>
      <a className={styles.brand} href={import.meta.env?.BASE_URL ?? '/'} aria-label="Ryo home">
        <svg width="31" height="31" viewBox="0 0 32 32" fill="none" aria-hidden="true">
          <path
            d="M16 2.5c5.2 0 12.7 8.3 12.7 13.5S21.2 29.5 16 29.5 3.3 21.2 3.3 16 10.8 2.5 16 2.5Z"
            stroke="currentColor"
            strokeWidth="2.3"
          />
          <path
            d="m16 9 1.6 5.4L23 16l-5.4 1.6L16 23l-1.6-5.4L9 16l5.4-1.6L16 9Z"
            fill="currentColor"
          />
        </svg>
        <span>
          ryo<span className={styles.brandDot}>.</span>
        </span>
      </a>
      <nav className={styles.actions} aria-label="Home controls">
        <button
          type="button"
          className={styles.icon}
          data-active={arrange || undefined}
          onClick={onArrange}
          aria-pressed={arrange}
          aria-label="Arrange widgets"
          title="Arrange widgets"
        >
          <Grip size={15} />
        </button>
        <button
          type="button"
          className={styles.icon}
          data-active={customizeOpen || undefined}
          onClick={onCustomize}
          aria-label="Open customize panel"
          aria-expanded={customizeOpen}
          title="Customize (Ctrl + ,)"
        >
          <Settings2 size={15} />
        </button>
      </nav>
    </header>
  );
}
