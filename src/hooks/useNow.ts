import { isPageActive, subscribeActivity } from '../lib/activity';
import { useEffect, useState } from 'react';

export function useNow(interval: number | null = 1000, alignToLocalDay = false) {
  const [tick, setTick] = useState(() => ({ now: new Date(), interval, alignToLocalDay }));
  // Refresh before committing a new cadence instead of showing the last mode's stale tick.
  if (tick.interval !== interval || tick.alignToLocalDay !== alignToLocalDay) {
    setTick({ now: new Date(), interval, alignToLocalDay });
  }

  useEffect(() => {
    if (interval === null) return;
    let timer = 0;
    const delayFrom = (date: Date) => {
      const timestamp = date.getTime() - (alignToLocalDay ? date.getTimezoneOffset() * 60_000 : 0);
      return interval - (timestamp % interval) || interval;
    };
    const update = () => {
      window.clearTimeout(timer);
      if (!isPageActive()) return;
      const current = new Date();
      setTick({ now: current, interval, alignToLocalDay });
      timer = window.setTimeout(update, delayFrom(current));
    };

    const handleVisibility = () => {
      window.clearTimeout(timer);
      if (isPageActive()) update();
    };

    if (isPageActive()) timer = window.setTimeout(update, delayFrom(new Date()));
    const unsubscribe = subscribeActivity(handleVisibility);
    return () => {
      window.clearTimeout(timer);
      unsubscribe();
    };
  }, [interval, alignToLocalDay]);

  return tick.now;
}
