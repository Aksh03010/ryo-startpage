import styles from './CustomizePanel.module.css';

export function ResetDialog({
  onCancel,
  onConfirm,
}: {
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      className={styles.confirmOverlay}
      onClick={(event) => {
        if (event.target === event.currentTarget) onCancel();
      }}
    >
      <section
        className={styles.confirmDialog}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="reset-confirm-title"
        aria-describedby="reset-confirm-description"
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            event.preventDefault();
            event.stopPropagation();
            onCancel();
            return;
          }

          if (event.key === 'Tab') {
            const buttons = event.currentTarget.querySelectorAll<HTMLButtonElement>('button');
            const first = buttons[0];
            const last = buttons[buttons.length - 1];
            if (event.shiftKey && document.activeElement === first) {
              event.preventDefault();
              last?.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
              event.preventDefault();
              first?.focus();
            }
          }
        }}
      >
        <h2 id="reset-confirm-title" className={styles.confirmTitle}>
          Restore default setup?
        </h2>
        <p id="reset-confirm-description" className={styles.confirmDescription}>
          This resets your wallpaper, appearance, widget positions, quick links, search engine, and
          focus length. Tasks and reminders will stay as they are.
        </p>
        <div className={styles.confirmActions}>
          <button
            type="button"
            className={styles.actionButton}
            autoFocus
            onClick={() => onCancel()}
          >
            Cancel
          </button>
          <button
            type="button"
            className={styles.dangerButton}
            onClick={() => {
              onCancel();
              onConfirm();
            }}
          >
            Restore defaults
          </button>
        </div>
      </section>
    </div>
  );
}
