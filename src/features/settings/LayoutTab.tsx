import { RotateCcw, Braces } from 'lucide-react';
import { WIDGET_IDS } from '../../constants';
import styles from './CustomizePanel.module.css';
import { SectionTitle } from '../../components/ui/SectionTitle';
import { Toggle } from '../../components/ui/Toggle';
import type { LayoutTabProps } from './types';

export function LayoutTab({
  settings,
  onSettings,
  arrange,
  onArrange,
  onResetLayout,
  onRequestReset,
}: LayoutTabProps) {
  const activeWidgetIds = Object.entries(settings.appearance.widgets)
    .filter(([, value]) => value.visible)
    .map(([id]) => id);
  return (
    <div className={styles.tabContent}>
      <SectionTitle>Move widgets</SectionTitle>
      <Toggle label="Turn on arrange mode" checked={arrange} onChange={() => onArrange()} />
      <p className={styles.help}>
        Turn this on, then drag a widget by its handle. Press <kbd>Ctrl</kbd> + <kbd>,</kbd> to
        reopen this panel.
      </p>
      <Toggle
        label="Snap widgets to a grid"
        checked={settings.layout.snapToGrid}
        onChange={(value) =>
          onSettings((draft) => ({ ...draft, layout: { ...draft.layout, snapToGrid: value } }))
        }
      />
      <Toggle
        label="Show grid while arranging"
        checked={settings.layout.showGrid}
        onChange={(value) =>
          onSettings((draft) => ({ ...draft, layout: { ...draft.layout, showGrid: value } }))
        }
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
      <button type="button" className={styles.actionButton} onClick={onRequestReset}>
        <Braces size={14} /> Restore default setup
      </button>
      <p className={styles.help}>
        Restores the wallpaper, appearance, widget positions, quick links, search engine, and focus
        length. Tasks and reminders stay as they are.
      </p>
    </div>
  );
}
