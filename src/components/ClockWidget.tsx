import type { CSSProperties } from 'react';
import { formatClockParts, formatDateLine, greetingFor } from '../lib/time';
import type { ClockSettings } from '../types';
import { CLOCK_FONTS } from '../constants';
import { useNow } from '../hooks/useNow';
import styles from './ClockWidget.module.css';

export default function ClockWidget({
  clock,
  accent,
}: {
  clock: ClockSettings;
  accent: string;
}) {
  const now = useNow(clock.showSeconds ? 1000 : 60_000);
  const parts = formatClockParts(now, clock.use24Hour, clock.showSeconds);
  const font = CLOCK_FONTS.find((f) => f.id === clock.font) ?? CLOCK_FONTS[0];
  const baseSize = Math.max(52, Math.min(clock.size, 210));
  const greeting = greetingFor(now);
  const weekday = now.toLocaleDateString(undefined, { weekday: 'long' });
  const dateRest = formatDateLine(now).replace(`${weekday}, `, '');
  const animationClass =
    clock.animation === 'pulse'
      ? styles.pulse
      : clock.animation === 'glow'
        ? styles.glow
        : clock.animation === 'shine'
          ? styles.shine
          : '';

  const timeStyle = {
    fontFamily: font.css,
    fontSize: `clamp(48px, 11vw, ${baseSize}px)`,
    color: accent,
  } as CSSProperties;

  return (
    <div className={styles.wrap}>
      {clock.showGreeting && <p className={styles.greeting}>{greeting}</p>}
      <div className={styles.timeWrap} style={timeStyle}>
        {/* Hidden "88:88:88" reference: keeps the widget box a constant size. */}
        <span className={styles.timeRef} aria-hidden="true">
          <span>88</span>
          <span className={styles.colon}>·</span>
          <span>88</span>
          {clock.showSeconds && <span className={styles.seconds}>88</span>}
        </span>
        <time
          className={`${styles.time} ${animationClass}`}
          data-animation={clock.animation === 'none' ? undefined : clock.animation}
          style={timeStyle}
        >
          <span key={`${parts.hour}-${parts.minute}`} className={styles.updated}>
            {parts.hour}
          </span>
          <span className={styles.colon}>·</span>
          <span key={parts.minute} className={styles.updated}>
            {parts.minute}
          </span>
          {clock.showSeconds && <span className={styles.seconds}>{parts.second}</span>}
        </time>
      </div>
      {clock.showDate && (
        <p className={styles.date}>
          <span className={styles.weekday}>{weekday}</span>
          <span className={styles.dateRest}>{dateRest}</span>
        </p>
      )}
    </div>
  );
}
