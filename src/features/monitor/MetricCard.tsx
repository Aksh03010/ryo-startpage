import { Sparkline } from './Sparkline';
import { formatBytes } from './monitorHelpers';
import type { Metric } from './types';
import styles from './SystemMonitorWidget.module.css';

export function MetricCard({
  metric,
  history,
  showTemperature = true,
}: {
  metric: Metric;
  history?: { usage: number[]; temperature: number[] };
  showTemperature?: boolean;
}) {
  const usage = metric.usage === null ? '—' : `${Math.round(metric.usage)}%`;
  const temp = metric.temperature === null ? '—' : `${Math.round(metric.temperature)}°`;
  return (
    <section className={styles.metricCard}>
      <div className={styles.metricHeading}>
        <span>{metric.name}</span>
        <span className={styles.live}>
          <i /> Live
        </span>
      </div>
      <div className={styles.metricValues}>
        <div>
          <strong>{usage}</strong>
          <small>Usage</small>
        </div>
        {showTemperature && (
          <div>
            <strong>{temp}</strong>
            <small>Temp</small>
          </div>
        )}
        {metric.usedBytes !== undefined && metric.totalBytes !== undefined && (
          <small className={styles.memoryDetail}>
            {formatBytes(metric.usedBytes)} / {formatBytes(metric.totalBytes)}
          </small>
        )}
      </div>
      <div className={styles.chart}>
        {history && <Sparkline values={history.usage} tone="usage" />}
        {history && showTemperature && metric.temperature !== null && (
          <Sparkline values={history.temperature} tone="temperature" />
        )}
        {showTemperature && metric.temperature === null && (
          <span className={styles.noChart}>Temperature unavailable</span>
        )}
      </div>
    </section>
  );
}
