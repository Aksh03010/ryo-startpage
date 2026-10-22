import { useEffect, useState } from 'react';
import { Cpu, ExternalLink, Monitor, Radio } from 'lucide-react';
import styles from './SystemMonitorWidget.module.css';

type Mode = 'computer' | 'browser';
type Metric = { name: string; usage: number | null; temperature: number | null; index?: number; usedBytes?: number; totalBytes?: number };
type Snapshot = { cpu: Metric; gpus: Metric[]; ram?: Metric | null; browser: Metric; updatedAt: number };
type MetricsVisibility = { cpu: boolean; gpu1: boolean; gpu2: boolean; ram: boolean };

const ENDPOINT = 'http://127.0.0.1:8765/api/metrics';
const HISTORY_LIMIT = 36;

function loadMode(): Mode {
  try {
    return window.localStorage.getItem('ryo.monitor.mode') === 'browser' ? 'browser' : 'computer';
  } catch {
    return 'computer';
  }
}

function formatBytes(bytes: number): string {
  return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
}

function Sparkline({ values, tone }: { values: number[]; tone: 'usage' | 'temperature' }) {
  const points = values.map((value, index) => {
    const x = values.length < 2 ? 100 : (index / (values.length - 1)) * 100;
    const y = 36 - Math.min(100, Math.max(0, value)) * 0.32;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg className={`${styles.sparkline} ${styles[tone]}`} viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true">
      <polyline points={points} />
    </svg>
  );
}

function MetricCard({ metric, history, showTemperature = true }: { metric: Metric; history?: { usage: number[]; temperature: number[] }; showTemperature?: boolean }) {
  const usage = metric.usage === null ? '—' : `${Math.round(metric.usage)}%`;
  const temp = metric.temperature === null ? '—' : `${Math.round(metric.temperature)}°`;
  return (
    <section className={styles.metricCard}>
      <div className={styles.metricHeading}>
        <span>{metric.name}</span>
        <span className={styles.live}><i /> Live</span>
      </div>
      <div className={styles.metricValues}>
        <div><strong>{usage}</strong><small>Usage</small></div>
        {showTemperature && <div><strong>{temp}</strong><small>Temp</small></div>}
        {metric.usedBytes !== undefined && metric.totalBytes !== undefined && (
          <small className={styles.memoryDetail}>{formatBytes(metric.usedBytes)} / {formatBytes(metric.totalBytes)}</small>
        )}
      </div>
      <div className={styles.chart}>
        {history && <Sparkline values={history.usage} tone="usage" />}
        {history && showTemperature && metric.temperature !== null && <Sparkline values={history.temperature} tone="temperature" />}
        {showTemperature && metric.temperature === null && <span className={styles.noChart}>Temperature unavailable</span>}
      </div>
    </section>
  );
}

export default function SystemMonitorWidget({ metrics: visibleMetrics }: { metrics: MetricsVisibility }) {
  const [mode, setMode] = useState<Mode>(loadMode);
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [error, setError] = useState(false);
  const [history, setHistory] = useState<Record<string, { usage: number[]; temperature: number[] }>>({});

  useEffect(() => {
    try { window.localStorage.setItem('ryo.monitor.mode', mode); } catch { /* Storage can be disabled. */ }
  }, [mode]);

  useEffect(() => {
    let active = true;
    let timer = 0;
    const poll = async () => {
      try {
        const response = await fetch(`${ENDPOINT}?mode=${mode}`, { cache: 'no-store' });
        if (!response.ok) throw new Error('Monitor helper is unavailable');
        const next = await response.json() as Snapshot;
        if (!active) return;
        setSnapshot(next);
        setError(false);
        const metrics = mode === 'computer' ? [next.cpu, ...next.gpus, ...(next.ram ? [next.ram] : [])] : [next.browser];
        setHistory((previous) => {
          const updated = { ...previous };
          const activeKeys = new Set(metrics.map((metric) => metric.name));
          for (const key of Object.keys(updated)) if (!activeKeys.has(key)) delete updated[key];
          for (const metric of metrics) {
            const entry = updated[metric.name] ?? { usage: [], temperature: [] };
            if (metric.usage !== null) entry.usage = [...entry.usage, metric.usage].slice(-HISTORY_LIMIT);
            if (metric.temperature !== null) entry.temperature = [...entry.temperature, metric.temperature].slice(-HISTORY_LIMIT);
            updated[metric.name] = entry;
          }
          return updated;
        });
      } catch {
        if (active) setError(true);
      } finally {
        if (active) timer = window.setTimeout(poll, 1500);
      }
    };
    void poll();
    return () => { active = false; window.clearTimeout(timer); };
  }, [mode]);

  const metrics = mode === 'computer' && snapshot
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
  const noComputerMetricsSelected = !visibleMetrics.cpu && !visibleMetrics.gpu1 && !visibleMetrics.gpu2 && !visibleMetrics.ram;

  return (
    <div className={styles.widget}>
      <header className={styles.header}>
        <div className={styles.title}><Radio size={15} /><span>System monitor</span></div>
        <div className={styles.switcher} role="group" aria-label="Monitor view">
          <button type="button" aria-pressed={mode === 'computer'} onClick={() => setMode('computer')}><Cpu size={13} /> Computer</button>
          <button type="button" aria-pressed={mode === 'browser'} onClick={() => setMode('browser')}><Monitor size={13} /> Browser</button>
        </div>
      </header>
      {error ? (
        <div className={styles.offline}>
          <span>Local monitor is not connected.</span>
          <small>Start the Ryo Monitor helper on this computer to see live stats.</small>
          <a href="https://github.com/Aksh03010/ryo-startpage#local-system-monitor" target="_blank" rel="noreferrer">Setup guide <ExternalLink size={12} /></a>
        </div>
      ) : (
        <div className={styles.cards}>
          {metrics.map((metric) => <MetricCard key={metric.name} metric={metric} history={history[metric.name]} showTemperature={mode === 'computer' && metric.usedBytes === undefined} />)}
          {mode === 'computer' && snapshot && snapshot.gpus.length === 0 && <p className={styles.note}>No GPU sensors found in Afterburner.</p>}
          {mode === 'computer' && metrics.length === 0 && (
            <p className={styles.note}>
              {noComputerMetricsSelected ? 'All computer readings are hidden. Enable metrics in Customize.' : 'The selected readings are not available yet.'}
            </p>
          )}
          {mode === 'browser' && metrics.length > 0 && <p className={styles.note}>Browser CPU use is measured across its running processes.</p>}
          {mode === 'computer' && snapshot && snapshot.cpu.temperature === null && <p className={styles.note}>CPU temperature is not exposed by your sensors.</p>}
        </div>
      )}
    </div>
  );
}
