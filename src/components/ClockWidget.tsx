import type { CSSProperties } from 'react';
import { formatClockParts, formatDateLine, greetingFor } from '../lib/time';
import type { ClockSettings } from '../types';
import { CLOCK_FONTS } from '../constants';
import { useNow } from '../hooks/useNow';
import styles from './ClockWidget.module.css';

export function ClockWidget({ clock, accent }: { clock: ClockSettings; accent: string }) {
  const now = useNow(
    clock.blorp ? (clock.showSeconds ? 864 : 86_400) : clock.showSeconds ? 1000 : 60_000,
    Boolean(clock.blorp),
  );
  const parts = formatClockParts(
    now,
    clock.use24Hour,
    clock.showSeconds,
    clock.base24,
    clock.blorp,
  );
  const blurb = clock.base24 && !clock.blorp;
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
    fontSize: `clamp(48px, min(11vw, var(--clock-viewport-cap, 18dvh)), ${baseSize}px)`,
    color: accent,
  } as CSSProperties;

  return (
    <div className={styles.wrap}>
      {clock.showGreeting && <p className={styles.greeting}>{greeting}</p>}
      <time
        aria-label={
          clock.blorp
            ? `Decimal time: ${parts.hour} hours, ${Number(parts.minute)} minutes${clock.showSeconds ? `, ${Number(parts.second)} seconds` : ''}`
            : now.toLocaleTimeString(undefined, {
                hour: 'numeric',
                minute: '2-digit',
                ...(clock.showSeconds ? { second: '2-digit' } : {}),
                hour12: !clock.use24Hour && !blurb,
              })
        }
        className={`${styles.time} ${clock.blorp ? styles.blorp : blurb ? styles.blurb : ''} ${animationClass}`}
        data-animation={clock.animation === 'none' ? undefined : clock.animation}
        style={timeStyle}
      >
        <span key={`hour-${parts.hour}`} className={`${styles.updated} ${styles.hour}`}>
          {parts.hour}
        </span>
        <span className={styles.colon}>·</span>
        <span key={`minute-${parts.minute}`} className={`${styles.updated} ${styles.minute}`}>
          {parts.minute}
        </span>
        {clock.showSeconds && <span className={styles.seconds}>{parts.second}</span>}
      </time>
      {clock.showDate && (
        <p className={styles.date}>
          <span className={styles.weekday}>{weekday}</span>
          <span className={styles.dateRest}>{dateRest}</span>
        </p>
      )}
    </div>
  );
}
