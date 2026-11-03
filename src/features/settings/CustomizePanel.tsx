import { useEffect, useRef, useState } from 'react';
import { AppWindow, Image, Palette, Scan, Sparkles, X } from 'lucide-react';
import { SPACE_PRESETS, applySpacePreset } from '../../lib/spacePresets';
import { SectionTitle } from '../../components/ui/SectionTitle';
import type { WidgetId } from '../../types';
import type { CustomizePanelProps } from './types';
import { BackgroundTab } from './BackgroundTab';
import { AppearanceTab } from './AppearanceTab';
import { WidgetsTab } from './WidgetsTab';
import { LayoutTab } from './LayoutTab';
import { ResetDialog } from './ResetDialog';
import styles from './CustomizePanel.module.css';

type TabId = 'background' | 'appearance' | 'widgets' | 'layout';

const TABS: Array<{ id: TabId; label: string; icon: typeof Image }> = [
  { id: 'background', label: 'Background', icon: Image },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'widgets', label: 'Widgets', icon: AppWindow },
  { id: 'layout', label: 'Layout', icon: Scan },
];

const TAB_HELP: Record<TabId, string> = {
  background: 'Choose a wallpaper and adjust how it looks.',
  appearance: 'Set the colors, boxes, and text used across your widgets.',
  widgets: 'Choose which widgets appear and customize each one.',
  layout: 'Move widgets, change snapping, or restore the layout.',
};

export function CustomizePanel({
  open,
  onClose,
  settings,
  onSettings,
  arrange,
  onArrange,
  onResetLayout,
  onResetPreferences,
  onUpload,
  uploading,
  uploadError,
  focusSettings,
  onFocusSettings,
}: CustomizePanelProps) {
  const [tab, setTab] = useState<TabId>('background');
  const [urlDraft, setUrlDraft] = useState('');
  const [urlError, setUrlError] = useState<string | null>(null);
  const [widgetDetail, setWidgetDetail] = useState<WidgetId>('clock');
  const [confirmReset, setConfirmReset] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    panel?.querySelector<HTMLButtonElement>('button[aria-label="Close customize panel"]')?.focus();
    const trapFocus = (event: KeyboardEvent) => {
      if (event.key !== 'Tab' || !panel) return;
      const items = [
        ...panel.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], input:not([type="file"]):not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex="0"]',
        ),
      ];
      const first = items[0];
      const last = items.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener('keydown', trapFocus);
    return () => {
      document.removeEventListener('keydown', trapFocus);
      previous?.focus();
    };
  }, [open]);

  return (
    <div
      className={`${styles.backdrop} ${open ? styles.open : ''}`}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        className={`${styles.panel} ${open ? styles.panelOpen : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Customize home"
      >
        <header className={styles.header}>
          <div>
            <p className={styles.brand}>
              <Sparkles size={15} /> Customize
            </p>
            <p className={styles.tagline}>{TAB_HELP[tab]}</p>
          </div>
          <button
            type="button"
            className={styles.close}
            onClick={onClose}
            aria-label="Close customize panel"
          >
            <X size={17} />
          </button>
        </header>

        <div className={styles.tabs}>
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`${styles.tabButton} ${tab === item.id ? styles.tabActive : ''}`}
              aria-pressed={tab === item.id}
              onClick={() => setTab(item.id)}
            >
              <item.icon size={14} /> {item.label}
            </button>
          ))}
        </div>

        <div className={styles.body}>
          <section className={styles.spacePresets} aria-label="Space presets">
            <SectionTitle>Make it yours</SectionTitle>
            <div className={styles.spacePresetButtons}>
              {SPACE_PRESETS.map((preset) => (
                <button
                  type="button"
                  key={preset.id}
                  title={preset.description}
                  onClick={() => {
                    onSettings((draft) => applySpacePreset(draft, preset.id));
                    onResetLayout();
                  }}
                >
                  {preset.label}
                </button>
              ))}
            </div>
            <p className={styles.help}>Only the widgets you enable are loaded.</p>
          </section>
          {tab === 'background' && (
            <BackgroundTab
              settings={settings}
              onSettings={onSettings}
              onUpload={onUpload}
              uploading={uploading}
              uploadError={uploadError}
              urlDraft={urlDraft}
              setUrlDraft={setUrlDraft}
              urlError={urlError}
              setUrlError={setUrlError}
            />
          )}
          {tab === 'appearance' && <AppearanceTab settings={settings} onSettings={onSettings} />}
          {tab === 'widgets' && (
            <WidgetsTab
              settings={settings}
              onSettings={onSettings}
              widgetDetail={widgetDetail}
              setWidgetDetail={setWidgetDetail}
              focusSettings={focusSettings}
              onFocusSettings={onFocusSettings}
            />
          )}
          {tab === 'layout' && (
            <LayoutTab
              settings={settings}
              onSettings={onSettings}
              arrange={arrange}
              onArrange={onArrange}
              onResetLayout={onResetLayout}
              onRequestReset={() => setConfirmReset(true)}
            />
          )}
        </div>

        <footer className={styles.footer}>
          <p className={styles.footerNote}>
            Settings and lists are saved in this browser. Uploaded wallpapers stay on this device.
          </p>
        </footer>

        {confirmReset && (
          <ResetDialog onCancel={() => setConfirmReset(false)} onConfirm={onResetPreferences} />
        )}
      </div>
    </div>
  );
}
