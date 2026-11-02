import { useId } from 'react';
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
  const artId = useId();
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
    fontSize: `clamp(48px, 23vw, ${baseSize}px)`,
    color: '#f0f4ed',
    '--clock-accent': accent,
  } as CSSProperties;

  return (
    <div className={styles.wrap}>
      <svg className={styles.celestial} viewBox="0 0 600 360" fill="none" aria-hidden="true">
        <defs>
          <radialGradient id={`${artId}-halo`}><stop stopColor="#c8f5d8" stopOpacity=".13"/><stop offset="1" stopColor="#a9dfd0" stopOpacity="0"/></radialGradient>
          <linearGradient id={`${artId}-rim`} x1="200" y1="40" x2="390" y2="245" gradientUnits="userSpaceOnUse"><stop stopColor="#daedba"/><stop offset=".32" stopColor="#8db4a0"/><stop offset=".64" stopColor="#4b6c70"/><stop offset="1" stopColor="#1d2d31" stopOpacity="0"/></linearGradient>
          <radialGradient id={`${artId}-moon`} cx=".22" cy=".12" r=".85"><stop stopColor="#263d35"/><stop offset=".52" stopColor="#0d1816"/><stop offset="1" stopColor="#060b0a"/></radialGradient>
        </defs>
        <ellipse cx="300" cy="164" rx="240" ry="160" fill={`url(#${artId}-halo)`}/>
        <circle cx="300" cy="148" r="112" fill={`url(#${artId}-moon)`} stroke={`url(#${artId}-rim)`} strokeWidth="1.5"/>
        <ellipse cx="300" cy="148" rx="195" ry="59" transform="rotate(-24 300 148)" stroke={`url(#${artId}-rim)`} strokeOpacity=".55" strokeWidth=".7"/>
        <circle cx="140" cy="220" r="3" fill="#c0dbc7"/><circle cx="456" cy="77" r="2" fill="#c0dbc7"/>
        <path d="m466 214 2 6 6 2-6 2-2 6-2-6-6-2 6-2 2-6ZM151 72l1.5 4.5L157 78l-4.5 1.5L151 84l-1.5-4.5L145 78l4.5-1.5L151 72Z" fill="#c9ddce"/>
        <circle cx="300" cy="148" r="140" stroke="#a2c9b5" strokeOpacity=".1" strokeDasharray="1 10"/>
      </svg>
      <p className={styles.eyebrow}>A MOMENT IN YOUR ORBIT</p>
      <div className={styles.timeWrap} style={timeStyle}>
        {/* Hidden "88:88:88" reference: keeps the widget box a constant size. */}
        <span className={styles.timeRef} aria-hidden="true">
          <span>88</span>
          <span className={styles.colon}>:</span>
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
          <span className={styles.colon}>:</span>
          <span key={parts.minute} className={styles.updated}>
            {parts.minute}
          </span>
          {clock.showSeconds && <span className={styles.seconds}>{parts.second}</span>}
        </time>
      </div>
      {clock.showGreeting && <p className={styles.greeting}>{greeting}<span>Make room for what matters.</span></p>}
      {clock.showDate && (
        <p className={styles.date}>
          <span className={styles.weekday}>{weekday}</span>
          <span className={styles.dateRest}>{dateRest}</span>
        </p>
      )}
    </div>
  );
}
