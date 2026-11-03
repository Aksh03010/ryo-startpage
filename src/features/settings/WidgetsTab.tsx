import { RotateCcw } from 'lucide-react';
import {
  DEFAULT_SETTINGS,
  WIDGET_TITLES,
  CLOCK_FONTS,
  CLOCK_ANIMATIONS,
  SEARCH_ENGINES,
} from '../../constants';
import type { BoxMode, ClockFont, ClockAnimation, WidgetId } from '../../types';
import styles from './CustomizePanel.module.css';
import { SectionTitle } from '../../components/ui/SectionTitle';
import { Segmented } from '../../components/ui/Segmented';
import { Slider } from '../../components/ui/Slider';
import { Toggle } from '../../components/ui/Toggle';
import type { WidgetsTabProps } from './types';
import { createSettingsActions } from './settingsActions';

export function WidgetsTab({
  settings,
  onSettings,
  widgetDetail,
  setWidgetDetail,
  focusSettings,
  onFocusSettings,
}: WidgetsTabProps) {
  const appearance = settings.appearance;
  const detailWidget = appearance.widgets[widgetDetail];
  const globalBoxMode =
    appearance.boxMode ?? (appearance.glassEnabled === false ? 'solid' : 'glass');
  const detailBoxSelection =
    detailWidget?.style.boxMode ??
    (detailWidget?.style.glass === 'on'
      ? 'glass'
      : detailWidget?.style.glass === 'off'
        ? 'solid'
        : 'inherit');
  const detailBoxMode = detailBoxSelection === 'inherit' ? globalBoxMode : detailBoxSelection;
  const { patchClock, patchWidgetStyle } = createSettingsActions(onSettings);
  return (
    <div className={styles.tabContent}>
      <SectionTitle>Choose a widget</SectionTitle>
      <p className={styles.help}>Select a widget to show or hide it and adjust its settings.</p>
      <div className={styles.widgetList}>
        {Object.entries(appearance.widgets).map(([id, widget]) => (
          <button
            key={id}
            type="button"
            className={`${styles.widgetRow} ${widgetDetail === id ? styles.widgetRowActive : ''}`}
            aria-pressed={widgetDetail === id}
            onClick={() => setWidgetDetail(id as WidgetId)}
          >
            <span className={styles.widgetDot} data-active={widget.visible || undefined} />
            <span>{WIDGET_TITLES[id as WidgetId]}</span>
          </button>
        ))}
      </div>
      {detailWidget && (
        <>
          <Toggle
            label="Show on page"
            checked={detailWidget.visible}
            onChange={(value) =>
              onSettings((draft) => ({
                ...draft,
                appearance: {
                  ...draft.appearance,
                  widgets: {
                    ...draft.appearance.widgets,
                    [widgetDetail]: { ...draft.appearance.widgets[widgetDetail], visible: value },
                  },
                },
              }))
            }
          />

          <Slider
            label="Widget size"
            min={60}
            max={140}
            step={5}
            value={detailWidget.size ?? 100}
            display={(value) => `${value}%`}
            onChange={(value) =>
              onSettings((draft) => ({
                ...draft,
                appearance: {
                  ...draft.appearance,
                  widgets: {
                    ...draft.appearance.widgets,
                    [widgetDetail]: { ...draft.appearance.widgets[widgetDetail], size: value },
                  },
                },
              }))
            }
          />

          {widgetDetail === 'clock' && (
            <>
              <SectionTitle>Clock</SectionTitle>
              <Toggle
                label="24-hour time"
                checked={settings.clock.use24Hour}
                onChange={(value) => patchClock({ use24Hour: value })}
              />
              <Toggle
                label="Show seconds"
                checked={settings.clock.showSeconds}
                onChange={(value) => patchClock({ showSeconds: value })}
              />
              <Toggle
                label="Show date"
                checked={settings.clock.showDate}
                onChange={(value) => patchClock({ showDate: value })}
              />
              <Toggle
                label="Show greeting"
                checked={settings.clock.showGreeting}
                onChange={(value) => patchClock({ showGreeting: value })}
              />
              <Segmented<ClockFont>
                label="Clock font"
                value={settings.clock.font}
                options={CLOCK_FONTS.map((font) => ({ id: font.id, label: font.label }))}
                onChange={(value) => patchClock({ font: value })}
              />
              <Segmented<ClockAnimation>
                label="Clock animation"
                value={settings.clock.animation}
                options={CLOCK_ANIMATIONS.map((animation) => ({
                  id: animation.id,
                  label: animation.label,
                }))}
                onChange={(value) => patchClock({ animation: value })}
              />
              <Slider
                label="Clock size"
                min={60}
                max={210}
                value={settings.clock.size}
                display={(value) => `${value}px`}
                onChange={(value) => patchClock({ size: value })}
              />
            </>
          )}

          {widgetDetail === 'tasks' && (
            <>
              <SectionTitle>Tasks</SectionTitle>
              <Toggle
                label="Show completed tasks"
                checked={settings.tasks.showCompleted}
                onChange={(value) =>
                  onSettings((draft) => ({ ...draft, tasks: { showCompleted: value } }))
                }
              />
            </>
          )}

          {widgetDetail === 'search' && (
            <>
              <SectionTitle>Search engine</SectionTitle>
              <Segmented
                label="Search engine"
                value={settings.searchEngine}
                options={Object.entries(SEARCH_ENGINES).map(([id, info]) => ({
                  id: id as keyof typeof SEARCH_ENGINES,
                  label: info.label,
                }))}
                onChange={(value) => onSettings((draft) => ({ ...draft, searchEngine: value }))}
              />
            </>
          )}

          {widgetDetail === 'links' && (
            <>
              <SectionTitle>Quick links</SectionTitle>
              <p className={styles.help}>
                Add, edit, and remove links directly in the Quick links widget.
              </p>
            </>
          )}

          {widgetDetail === 'focus' && (
            <>
              <SectionTitle>Focus timer</SectionTitle>
              <p className={styles.help}>
                Set how long a focus session lasts. Start, pause, or reset it in the Focus widget.
              </p>
              <Slider
                label="Focus length"
                min={5}
                max={90}
                step={5}
                value={focusSettings.focusMinutes}
                display={(value) => `${value} min`}
                onChange={(value) =>
                  onFocusSettings((previous) => ({ ...previous, focusMinutes: value }))
                }
              />
            </>
          )}

          {widgetDetail === 'system' && (
            <>
              <SectionTitle>System monitor</SectionTitle>
              <p className={styles.help}>
                Choose which readings appear in the monitor. RAM usage is read from Windows; GPU
                readings depend on sensors exposed by MSI Afterburner.
              </p>
              <Toggle
                label="Show CPU"
                checked={settings.monitorMetrics?.cpu ?? true}
                onChange={(value) =>
                  onSettings((draft) => ({
                    ...draft,
                    monitorMetrics: {
                      ...(draft.monitorMetrics ?? DEFAULT_SETTINGS.monitorMetrics),
                      cpu: value,
                    },
                  }))
                }
              />
              <Toggle
                label="Show GPU 1"
                checked={settings.monitorMetrics?.gpu1 ?? true}
                onChange={(value) =>
                  onSettings((draft) => ({
                    ...draft,
                    monitorMetrics: {
                      ...(draft.monitorMetrics ?? DEFAULT_SETTINGS.monitorMetrics),
                      gpu1: value,
                    },
                  }))
                }
              />
              <Toggle
                label="Show GPU 2"
                checked={settings.monitorMetrics?.gpu2 ?? true}
                onChange={(value) =>
                  onSettings((draft) => ({
                    ...draft,
                    monitorMetrics: {
                      ...(draft.monitorMetrics ?? DEFAULT_SETTINGS.monitorMetrics),
                      gpu2: value,
                    },
                  }))
                }
              />
              <Toggle
                label="Show RAM"
                checked={settings.monitorMetrics?.ram ?? true}
                onChange={(value) =>
                  onSettings((draft) => ({
                    ...draft,
                    monitorMetrics: {
                      ...(draft.monitorMetrics ?? DEFAULT_SETTINGS.monitorMetrics),
                      ram: value,
                    },
                  }))
                }
              />
              <p className={styles.help}>
                MSI Afterburner supplies GPU sensor readings. Install and start the helper using the
                setup guide in the project README.
              </p>
            </>
          )}

          <SectionTitle>Box style for {WIDGET_TITLES[widgetDetail]}</SectionTitle>
          <p className={styles.help}>
            Use the default style, or choose a different style for this widget.
          </p>
          <Segmented<'inherit' | BoxMode>
            label="Widget box style"
            value={detailBoxSelection}
            options={[
              { id: 'inherit', label: 'Default' },
              { id: 'glass', label: 'Glass' },
              { id: 'solid', label: 'Solid' },
              { id: 'none', label: 'None' },
            ]}
            onChange={(value) =>
              patchWidgetStyle(widgetDetail, { boxMode: value === 'inherit' ? undefined : value })
            }
          />
          {detailBoxMode !== 'none' && (
            <>
              <Slider
                label="Box darkness"
                min={0}
                max={100}
                value={detailWidget.style.opacity ?? appearance.glassOpacity}
                display={(value) => `${value}%`}
                onChange={(value) => patchWidgetStyle(widgetDetail, { opacity: value })}
              />
              <p className={styles.help}>
                {detailBoxMode === 'glass'
                  ? 'At 0, this glass box has blur but no tint. Higher values add a darker tint.'
                  : 'At 0, this box fill is clear. Higher values make it darker.'}
              </p>
              {detailBoxMode === 'glass' && (
                <Slider
                  label="Glass blur"
                  min={0}
                  max={34}
                  value={detailWidget.style.blur ?? appearance.glassBlur}
                  display={(value) => `${value}px`}
                  onChange={(value) => patchWidgetStyle(widgetDetail, { blur: value })}
                />
              )}
              <Slider
                label="Corner roundness"
                min={0}
                max={36}
                value={detailWidget.style.radius ?? appearance.radius}
                display={(value) => `${value}px`}
                onChange={(value) => patchWidgetStyle(widgetDetail, { radius: value })}
              />
              <Toggle
                label="Show box border"
                checked={detailWidget.style.border ?? appearance.border}
                onChange={(value) => patchWidgetStyle(widgetDetail, { border: value })}
              />
              <Toggle
                label="Show box shadow"
                checked={detailWidget.style.shadow ?? appearance.shadow}
                onChange={(value) => patchWidgetStyle(widgetDetail, { shadow: value })}
              />
            </>
          )}
          <button
            type="button"
            className={styles.linkButton}
            onClick={() =>
              patchWidgetStyle(widgetDetail, {
                glass: undefined,
                boxMode: undefined,
                blur: undefined,
                opacity: undefined,
                radius: undefined,
                border: undefined,
                shadow: undefined,
              })
            }
          >
            <RotateCcw size={12} /> Reset widget styling
          </button>
        </>
      )}
    </div>
  );
}
