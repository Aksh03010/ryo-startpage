import { useEffect } from 'react';
import { Pause, Play, RotateCcw, Timer, Zap } from 'lucide-react';
import { useNow } from '../hooks/useNow';
import { pauseFocus, remainingSeconds, startFocus } from '../lib/focus';
import type { FocusSnapshot } from '../lib/focus';
import { useLocalStorage } from '../hooks/useLocalStorage';
import styles from './FocusWidget.module.css';

export default function FocusWidget({ settingsKey, focusMinutes, breakMinutes }: {
  settingsKey: string;
  focusMinutes: number;
  breakMinutes: number;
}) {
  const [snapshot, setSnapshot] = useLocalStorage<FocusSnapshot>(settingsKey, () => ({
    duration: focusMinutes * 60,
    paused: true,
    remaining: focusMinutes * 60,
  }));
  const phase = snapshot.phase ?? 'focus';
  const duration = (phase === 'focus' ? focusMinutes : breakMinutes) * 60;
  const now = useNow(snapshot.paused ? null : 1000);
  const remaining = remainingSeconds(snapshot, now.getTime());

  useEffect(() => {
    if (!snapshot.paused && !snapshot.endsAt) {
      setSnapshot((previous) => ({ ...previous, endsAt: Date.now() + previous.remaining * 1000 }));
    }
  }, [snapshot.paused, snapshot.endsAt, setSnapshot]);

  useEffect(() => {
    if (snapshot.paused || remaining > 0) return;
    setSnapshot((previous) => ({ ...previous, paused: true, remaining: 0, endsAt: null }));
  }, [remaining, snapshot.paused, setSnapshot]);

  useEffect(() => {
    if (!snapshot.paused || snapshot.duration === duration) return;
    setSnapshot((previous) => ({ ...previous, duration, remaining: duration, endsAt: null }));
  }, [duration, snapshot.paused, snapshot.duration, setSnapshot]);

  const progress = snapshot.duration > 0 ? Math.min(1, Math.max(0, remaining / snapshot.duration)) : 0;
  const display = `${String(Math.floor(remaining / 60)).padStart(2, '0')}:${String(remaining % 60).padStart(2, '0')}`;
  const toggle = () => setSnapshot((previous) => previous.paused ? startFocus(previous, Date.now()) : pauseFocus(previous, Date.now()));
  const reset = () => setSnapshot((previous) => ({ ...previous, duration, paused: true, remaining: duration, endsAt: null }));
  const changePhase = (next: 'focus' | 'break') => {
    const seconds = (next === 'focus' ? focusMinutes : breakMinutes) * 60;
    setSnapshot({ duration: seconds, remaining: seconds, paused: true, endsAt: null, phase: next });
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <p className={styles.title}>
          <Timer size={15} strokeWidth={2} /> A little focus
        </p>
        <div className={styles.tabs} role="group" aria-label="Timer mode"><button type="button" aria-pressed={phase === 'focus'} onClick={() => changePhase('focus')}>Focus</button><button type="button" aria-pressed={phase === 'break'} onClick={() => changePhase('break')}>Rest</button></div>
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
        <span className={styles.time}>{display}<small>{remaining === 0 ? 'A moment well spent.' : phase === 'focus' ? 'ONE THING AT A TIME' : 'TAKE A BREATH'}</small></span>
      </div>

      <div className={styles.controls}>
        <button
          type="button"
          className={styles.icon}
          aria-label={snapshot.paused ? 'Start focus' : 'Pause focus'}
          onClick={toggle}
        >
          {snapshot.paused ? <Play size={12} fill="currentColor" /> : <Pause size={12} />}<span>{snapshot.paused ? remaining === 0 ? 'Start again' : 'Begin session' : 'Pause session'}</span>
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
