import { isPageActive, subscribeActivity } from '../lib/activity';
import { useEffect, useState } from 'react';

export function useNow(interval: number | null = 1000) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    if (interval === null) return;
    let timer = 0;
    const update = () => {
      window.clearTimeout(timer);
      if (!isPageActive()) return;
      const current = new Date();
      setNow(current);
      const remainder = current.getTime() % interval;
      timer = window.setTimeout(update, interval - remainder || interval);
    };

    const handleVisibility = () => {
      window.clearTimeout(timer);
      if (isPageActive()) update();
    };

    const remainder = Date.now() % interval;
    if (isPageActive()) timer = window.setTimeout(update, interval - remainder || interval);
    const unsubscribe = subscribeActivity(handleVisibility);
    return () => {
      window.clearTimeout(timer);
      unsubscribe();
    };
  }, [interval]);

  return now;
}
