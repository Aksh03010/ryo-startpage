import { Grip, Settings2 } from 'lucide-react';
import styles from './TopBar.module.css';

export default function TopBar({
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
          <Grip size={16} />
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
          <Settings2 size={16} />
        </button>
      </nav>
    </header>
  );
}
