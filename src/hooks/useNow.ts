import { useEffect, useState } from 'react';

export function useNow(interval = 1000) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    let timer = 0;
    const update = () => {
      const current = new Date();
      setNow(current);
      const remainder = current.getTime() % interval;
      timer = window.setTimeout(update, interval - remainder || interval);
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        window.clearTimeout(timer);
        update();
      }
    };

    const remainder = Date.now() % interval;
    timer = window.setTimeout(update, interval - remainder || interval);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [interval]);

  return now;
}
