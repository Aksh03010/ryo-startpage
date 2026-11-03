export type FocusSnapshot = {
  duration: number;
  paused: boolean;
  remaining: number;
  endsAt?: number | null;
  phase?: 'focus' | 'break';
};

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
