import { useEffect } from 'react';
import { Pause, Play, RotateCcw, Timer, Zap } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import styles from './FocusWidget.module.css';

export default function FocusWidget({ settingsKey, focusMinutes, breakMinutes }: {
  settingsKey: string;
  focusMinutes: number;
  breakMinutes: number;
}) {
  const [snapshot, setSnapshot] = useLocalStorage<{ duration: number; paused: boolean; remaining: number }>(settingsKey, () => ({
    duration: focusMinutes * 60,
    paused: true,
    remaining: focusMinutes * 60,
  }));
  const finished = snapshot.remaining <= 0;

  useEffect(() => {
    if (snapshot.paused || finished) return;
    const timer = window.setInterval(() => {
      setSnapshot((prev) => {
        const next = Math.max(0, prev.remaining - 1);
        return { ...prev, paused: next === 0, remaining: next };
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [snapshot.paused, finished, setSnapshot]);

  useEffect(() => {
    if (!snapshot.paused) return;
    const duration = focusMinutes * 60;
    setSnapshot((prev) => prev.duration === duration ? prev : ({ ...prev, duration, remaining: duration }));
  }, [focusMinutes, snapshot.paused, setSnapshot]);

  const progress = snapshot.duration > 0 ? Math.min(1, Math.max(0, snapshot.remaining / snapshot.duration)) : 0;
  const display = `${String(Math.floor(snapshot.remaining / 60)).padStart(2, '0')}:${String(snapshot.remaining % 60).padStart(2, '0')}`;

  const toggle = () => setSnapshot((prev) => {
    if (!prev.paused) return { ...prev, paused: true };
    if (prev.remaining <= 0) {
      const duration = focusMinutes * 60;
      return { ...prev, duration, remaining: duration, paused: false };
    }
    return { ...prev, paused: false };
  });

  const reset = () =>
    setSnapshot((prev) => {
      const duration = focusMinutes * 60;
      return { ...prev, duration, paused: true, remaining: duration };
    });

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <p className={styles.title}>
          <Timer size={15} strokeWidth={2} /> Focus
        </p>
      </div>

      <div className={styles.dialWrap}>
        <svg viewBox="0 0 72 72" aria-hidden className={styles.dial}>
          <circle className={styles.track} cx="36" cy="36" r="31" fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="4" strokeLinecap="round" />
          <circle
            className={styles.progress}
            cx="36"
            cy="36"
            r="31"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 31}
            strokeDashoffset={(1 - progress) * 2 * Math.PI * 31}
            transform="rotate(-90 36 36)"
          />
        </svg>
        <span className={styles.time}>{display}</span>
      </div>

      <div className={styles.controls}>
        <button
          type="button"
          className={styles.icon}
          aria-label={snapshot.paused ? 'Start focus' : 'Pause focus'}
          onClick={toggle}
        >
          {snapshot.paused ? <Play size={14} /> : <Pause size={14} />}
        </button>
        <button type="button" className={styles.icon} onClick={reset} aria-label="Reset focus timer">
          <RotateCcw size={14} />
        </button>
      </div>

      <div className={styles.chips}>
        <span className={styles.break}>
          <Zap size={11} /> {Math.round(snapshot.duration / 60)}m focus · {breakMinutes}m break
        </span>
      </div>
    </div>
  );
}
