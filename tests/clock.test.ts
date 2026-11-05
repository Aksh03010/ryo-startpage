import { test } from 'node:test';
import assert from 'node:assert/strict';
import { h, render } from 'preact';
import { act } from 'preact/test-utils';
import { ClockWidget } from '../src/components/ClockWidget';
import { DEFAULT_SETTINGS } from '../src/constants';
import { createTestWindow, installTestGlobals } from './helpers/dom';

test('decimal clock aligns to local midnight, changes cadence, pauses hidden, and catches up', async (context) => {
  const window = createTestWindow();
  installTestGlobals(window);
  const midnight = new Date(2026, 10, 4).getTime();
  context.mock.timers.enable({ apis: ['Date'], now: midnight });
  const timers = new Map<number, { callback: () => void; delay: number }>();
  let timerId = 0;
  window.setTimeout = ((callback: () => void, delay: number) => {
    const id = ++timerId;
    timers.set(id, { callback, delay });
    return id;
  }) as typeof window.setTimeout;
  window.clearTimeout = ((id: number) => {
    timers.delete(id);
  }) as typeof window.clearTimeout;
  const container = window.document.createElement('div');
  const clock = { ...DEFAULT_SETTINGS.clock, blorp: true, showSeconds: true };
  const pending = () => {
    assert.equal(timers.size, 1);
    return [...timers.entries()][0];
  };
  const fireAt = async (time: number) => {
    const [id, timer] = pending();
    timers.delete(id);
    context.mock.timers.setTime(time);
    await act(() => timer.callback());
  };
  try {
    await act(() => render(h(ClockWidget, { clock, accent: '#ffffff' }), container));
    assert.equal(pending()[1].delay, 864);
    assert.equal(container.querySelector('.hour')!.textContent, '0');
    await fireAt(midnight + 864);
    assert.equal(container.querySelector('.seconds')!.textContent, '01');
    assert.equal(pending()[1].delay, 864);

    clock.showSeconds = false;
    await act(() => render(h(ClockWidget, { clock: { ...clock }, accent: '#ffffff' }), container));
    assert.equal(pending()[1].delay, 86_400 - 864);
    assert.equal(container.querySelector('.seconds'), null);
    await fireAt(midnight + 86_400);
    assert.equal(container.querySelector('.minute')!.textContent, '01');

    Object.defineProperty(window.document, 'visibilityState', {
      value: 'hidden',
      configurable: true,
    });
    await act(() => {
      window.document.dispatchEvent(new window.Event('visibilitychange'));
    });
    assert.equal(timers.size, 0);
    context.mock.timers.setTime(midnight + 43_200_000);
    Object.defineProperty(window.document, 'visibilityState', {
      value: 'visible',
      configurable: true,
    });
    await act(() => {
      window.document.dispatchEvent(new window.Event('visibilitychange'));
    });
    assert.equal(container.querySelector('.hour')!.textContent, '5');
    assert.equal(container.querySelector('.minute')!.textContent, '00');
    assert.equal(pending()[1].delay, 86_400);

    // A mode switch must refresh immediately, even when no tick has fired in the old mode.
    context.mock.timers.setTime(midnight + 43_320_000);
    clock.blorp = false;
    await act(() => render(h(ClockWidget, { clock: { ...clock }, accent: '#ffffff' }), container));
    assert.equal(pending()[1].delay, 60_000);
    assert.equal(container.querySelector('.hour')!.textContent, '12');
    assert.equal(container.querySelector('.minute')!.textContent, '02');
  } finally {
    await act(() => render(null, container));
    assert.equal(timers.size, 0);
    await window.happyDOM.close();
  }
});
