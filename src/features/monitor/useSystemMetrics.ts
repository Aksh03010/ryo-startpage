import { useEffect, useState } from 'react';
import { isPageActive, subscribeActivity } from '../../lib/activity';
import { STORAGE_KEYS } from '../../lib/storageKeys';
import { loadMode } from './monitorHelpers';
import type { Mode, Snapshot } from './types';

const ENDPOINT = 'http://127.0.0.1:8765/api/metrics';
const HISTORY_LIMIT = 36;

/** Poll only while active; abort obsolete requests and back off when the helper is offline. */
export function useSystemMetrics() {
  const [mode, setMode] = useState<Mode>(loadMode);
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [error, setError] = useState(false);
  const [history, setHistory] = useState<
    Record<string, { usage: number[]; temperature: number[] }>
  >({});

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEYS.monitorMode, mode);
    } catch {
      /* Storage can be disabled. */
    }
  }, [mode]);

  useEffect(() => {
    let active = true;
    let timer = 0;
    let controller: AbortController | null = null;
    let retryDelay = 1500;
    const poll = async () => {
      if (!active || !isPageActive()) return;
      const request = new AbortController();
      controller = request;
      const timeout = window.setTimeout(() => request.abort(), 4000);
      try {
        const response = await fetch(`${ENDPOINT}?mode=${mode}`, {
          cache: 'no-store',
          signal: request.signal,
        });
        if (!response.ok) throw new Error('Monitor helper is unavailable');
        const next = (await response.json()) as Snapshot;
        if (!active || request.signal.aborted || !isPageActive() || controller !== request) return;
        retryDelay = 1500;
        setSnapshot(next);
        setError(false);
        const metrics =
          mode === 'computer'
            ? [next.cpu, ...next.gpus, ...(next.ram ? [next.ram] : [])]
            : [next.browser];
        setHistory((previous) => {
          const updated = { ...previous };
          const activeKeys = new Set(metrics.map((metric) => metric.name));
          for (const key of Object.keys(updated)) if (!activeKeys.has(key)) delete updated[key];
          for (const metric of metrics) {
            const entry = updated[metric.name] ?? { usage: [], temperature: [] };
            updated[metric.name] = {
              usage:
                metric.usage !== null
                  ? [...entry.usage, metric.usage].slice(-HISTORY_LIMIT)
                  : entry.usage,
              temperature:
                metric.temperature !== null
                  ? [...entry.temperature, metric.temperature].slice(-HISTORY_LIMIT)
                  : entry.temperature,
            };
          }
          return updated;
        });
      } catch {
        if (active && isPageActive() && controller === request) {
          setError(true);
          retryDelay = Math.min(30_000, retryDelay * 2);
        }
      } finally {
        window.clearTimeout(timeout);
        if (active && isPageActive() && controller === request) {
          controller = null;
          timer = window.setTimeout(poll, retryDelay);
        }
      }
    };
    const syncActivity = () => {
      window.clearTimeout(timer);
      controller?.abort();
      controller = null;
      if (isPageActive()) void poll();
    };
    const unsubscribe = subscribeActivity(syncActivity);
    void poll();
    return () => {
      active = false;
      window.clearTimeout(timer);
      controller?.abort();
      unsubscribe();
    };
  }, [mode]);

  return { mode, setMode, snapshot, error, history };
}
