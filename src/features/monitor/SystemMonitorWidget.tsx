import { Cpu, ExternalLink, Monitor, Radio } from 'lucide-react';
import { MetricCard } from './MetricCard';
import { useSystemMetrics } from './useSystemMetrics';
import type { MetricsVisibility } from './types';
import styles from './SystemMonitorWidget.module.css';

export function SystemMonitorWidget({ metrics: visibleMetrics }: { metrics: MetricsVisibility }) {
  const { mode, setMode, snapshot, error, history } = useSystemMetrics();

  const metrics =
    mode === 'computer' && snapshot
      ? [
          ...(visibleMetrics.cpu ? [snapshot.cpu] : []),
          ...snapshot.gpus.filter((metric, index) => {
            const gpuIndex = metric.index ?? index + 1;
            return gpuIndex === 1 ? visibleMetrics.gpu1 : gpuIndex === 2 && visibleMetrics.gpu2;
          }),
          ...(visibleMetrics.ram && snapshot.ram ? [snapshot.ram] : []),
        ]
      : mode === 'browser' && snapshot
        ? [snapshot.browser]
        : [];
  const noComputerMetricsSelected =
    !visibleMetrics.cpu && !visibleMetrics.gpu1 && !visibleMetrics.gpu2 && !visibleMetrics.ram;

  return (
    <div className={styles.widget}>
      <header className={styles.header}>
        <div className={styles.title}>
          <Radio size={15} />
          <span>System monitor</span>
        </div>
        <div className={styles.switcher} role="group" aria-label="Monitor view">
          <button
            type="button"
            aria-pressed={mode === 'computer'}
            onClick={() => setMode('computer')}
          >
            <Cpu size={13} /> Computer
          </button>
          <button
            type="button"
            aria-pressed={mode === 'browser'}
            onClick={() => setMode('browser')}
          >
            <Monitor size={13} /> Browser
          </button>
        </div>
      </header>
      {error ? (
        <div className={styles.offline}>
          <span>Local monitor is not connected.</span>
          <small>Start the Ryo Monitor helper on this computer to see live stats.</small>
          <a
            href="https://github.com/Aksh03010/ryo-startpage#local-system-monitor"
            target="_blank"
            rel="noreferrer"
          >
            Setup guide <ExternalLink size={12} />
          </a>
        </div>
      ) : (
        <div className={styles.cards}>
          {metrics.map((metric) => (
            <MetricCard
              key={metric.name}
              metric={metric}
              history={history[metric.name]}
              showTemperature={mode === 'computer' && metric.usedBytes === undefined}
            />
          ))}
          {mode === 'computer' && snapshot && snapshot.gpus.length === 0 && (
            <p className={styles.note}>No GPU sensors found in Afterburner.</p>
          )}
          {mode === 'computer' && metrics.length === 0 && (
            <p className={styles.note}>
              {noComputerMetricsSelected
                ? 'All computer readings are hidden. Enable metrics in Customize.'
                : 'The selected readings are not available yet.'}
            </p>
          )}
          {mode === 'browser' && metrics.length > 0 && (
            <p className={styles.note}>Browser CPU use is measured across its running processes.</p>
          )}
          {mode === 'computer' && snapshot && snapshot.cpu.temperature === null && (
            <p className={styles.note}>CPU temperature is not exposed by your sensors.</p>
          )}
        </div>
      )}
    </div>
  );
}
