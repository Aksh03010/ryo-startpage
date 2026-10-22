import { useEffect } from 'react';
import { Pause, Play, RotateCcw, Timer, Zap } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { DEFAULT_FOCUS } from '../constants';
import styles from './FocusWidget.module.css';

export default function FocusWidget({ settingsKey }: { settingsKey: string }) {
  const [snapshot, setSnapshot] = useLocalStorage<{ duration: number; paused: boolean; remaining: number }>(settingsKey, () => ({
    duration: DEFAULT_FOCUS.focusMinutes * 60,
    paused: true,
    remaining: DEFAULT_FOCUS.focusMinutes * 60,
  }));

  useEffect(() => {
    if (snapshot.paused || snapshot.remaining <= 0) return;
    const timer = window.setInterval(() => {
      setSnapshot((prev) => {
        const next = Math.max(0, prev.remaining - 1);
        return { ...prev, paused: next === 0 ? true : false, remaining: next };
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [snapshot.paused, snapshot.remaining, setSnapshot]);

  const progress = snapshot.remaining / snapshot.duration;
  const display = `${String(Math.floor(snapshot.remaining / 60)).padStart(2, '0')}:${String(snapshot.remaining % 60).padStart(2, '0')}`;

  const toggle = () => setSnapshot((prev) => ({ ...prev, paused: !prev.paused }));

  const reset = () =>
    setSnapshot((prev) => ({ ...prev, paused: true, remaining: prev.duration }));

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
          <Zap size={11} /> {Math.round(snapshot.duration / 60)}m focus · {DEFAULT_FOCUS.breakMinutes}m break
        </span>
      </div>
    </div>
  );
}
