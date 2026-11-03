import styles from './SystemMonitorWidget.module.css';

export function Sparkline({ values, tone }: { values: number[]; tone: 'usage' | 'temperature' }) {
  const points = values
    .map((value, index) => {
      const x = values.length < 2 ? 100 : (index / (values.length - 1)) * 100;
      const y = 36 - Math.min(100, Math.max(0, value)) * 0.32;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg
      className={`${styles.sparkline} ${styles[tone]}`}
      viewBox="0 0 100 40"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <polyline points={points} />
    </svg>
  );
}
