import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createTestWindow, installTestGlobals } from './helpers/dom';
import { h, render } from 'preact';
import { act } from 'preact/test-utils';
import { useNow } from '../src/hooks/useNow';

test('clock cancels all scheduled ticks while hidden and resumes when visible', async () => {
  const window = createTestWindow();
  installTestGlobals(window);
  const schedule = window.setTimeout.bind(window);
  const cancel = window.clearTimeout.bind(window);
  const timers = new Set<number>();
  window.setTimeout = ((callback: () => void, delay: number) => {
    const id = schedule(() => {
      timers.delete(id);
      callback();
    }, delay);
    timers.add(id);
    return id;
  }) as typeof window.setTimeout;
  window.clearTimeout = ((id: number) => {
    timers.delete(id);
    cancel(id);
  }) as typeof window.clearTimeout;
  const container = window.document.createElement('div');
  function Probe() {
    return h('span', {}, useNow(1000).toISOString());
  }
  try {
    await act(() => render(h(Probe, {}), container));
    assert.equal(timers.size, 1);
    Object.defineProperty(window.document, 'visibilityState', {
      value: 'hidden',
      configurable: true,
    });
    await act(() => {
      window.document.dispatchEvent(new window.Event('visibilitychange'));
    });
    assert.equal(timers.size, 0);
    Object.defineProperty(window.document, 'visibilityState', {
      value: 'visible',
      configurable: true,
    });
    await act(() => {
      window.document.dispatchEvent(new window.Event('visibilitychange'));
    });
    assert.equal(timers.size, 1);
    await act(() => render(null, container));
    assert.equal(timers.size, 0);
  } finally {
    await act(() => render(null, container));
    await window.happyDOM.close();
  }
});
