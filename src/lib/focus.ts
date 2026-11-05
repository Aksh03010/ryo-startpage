export type FocusSnapshot = {
  duration: number;
  paused: boolean;
  remaining: number;
  endsAt?: number | null;
  phase?: 'focus' | 'break';
};

export function normalizeFocusSnapshot(value: unknown, fallback: FocusSnapshot): FocusSnapshot {
  if (!value || typeof value !== 'object') return fallback;
  const saved = value as Partial<FocusSnapshot>;
  const duration =
    typeof saved.duration === 'number' &&
    Number.isFinite(saved.duration) &&
    saved.duration > 0 &&
    saved.duration <= 86_400
      ? saved.duration
      : fallback.duration;
  const remaining =
    typeof saved.remaining === 'number' && Number.isFinite(saved.remaining)
      ? Math.max(0, Math.min(duration, Math.round(saved.remaining)))
      : duration;
  const endsAt =
    typeof saved.endsAt === 'number' && Number.isFinite(saved.endsAt) ? saved.endsAt : null;
  return {
    duration,
    remaining,
    endsAt,
    paused: typeof saved.paused === 'boolean' ? saved.paused : true,
    phase: saved.phase === 'break' ? 'break' : 'focus',
  };
}

export function remainingSeconds(snapshot: FocusSnapshot, now: number) {
  if (snapshot.paused || !snapshot.endsAt) return Math.max(0, snapshot.remaining);
  return Math.min(
    snapshot.duration,
    snapshot.remaining,
    Math.max(0, Math.ceil((snapshot.endsAt - now) / 1000)),
  );
}

export function startFocus(snapshot: FocusSnapshot, now: number): FocusSnapshot {
  const remaining = remainingSeconds(snapshot, now) || snapshot.duration;
  return { ...snapshot, remaining, paused: false, endsAt: now + remaining * 1000 };
}

export function pauseFocus(snapshot: FocusSnapshot, now: number): FocusSnapshot {
  return { ...snapshot, paused: true, remaining: remainingSeconds(snapshot, now), endsAt: null };
}
