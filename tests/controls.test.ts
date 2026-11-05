import { test } from 'node:test';
import assert from 'node:assert/strict';
import { h, render } from 'preact';
import { useState } from 'preact/hooks';
import { act } from 'preact/test-utils';
import { Slider } from '../src/components/ui/Slider';
import { Segmented } from '../src/components/ui/Segmented';
import { createTestWindow, installTestGlobals } from './helpers/dom';
import { readableAccent } from '../src/lib/theme';
import { normalizeFocusSnapshot } from '../src/lib/focus';

test('sliders avoid repeated values, honor step sizes, and radio controls support arrow keys', async () => {
  const window = createTestWindow();
  installTestGlobals(window);
  const container = window.document.createElement('div');
  window.document.body.append(container);
  function Probe() {
    const [value, setValue] = useState(25);
    const [selection, select] = useState('one');
    return h(
      'div',
      {},
      h(Slider, {
        label: 'Size',
        value,
        min: 0,
        max: 100,
        step: 5,
        display: (value) => `${value}%`,
        onChange: setValue,
      }),
      h(Segmented, {
        label: 'Mode',
        value: selection,
        options: [
          { id: 'one', label: 'One' },
          { id: 'two', label: 'Two' },
        ],
        onChange: select,
      }),
    );
  }
  try {
    await act(() => render(h(Probe, {}), container));
    assert.equal(container.querySelector('span[aria-hidden="true"]')!.textContent, '%');
    const number = container.querySelector('input[type="number"]') as HTMLInputElement;
    await act(() => {
      number.value = '29';
      number.dispatchEvent(new window.Event('input', { bubbles: true }));
    });
    await act(() => {
      number.dispatchEvent(new window.Event('blur', { bubbles: true }));
    });
    assert.equal((container.querySelector('input[type="range"]') as HTMLInputElement).value, '30');
    const radio = container.querySelector('[role="radio"]')!;
    await act(() => {
      radio.dispatchEvent(
        new window.KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }),
      );
    });
    assert.equal(container.querySelector('[aria-checked="true"]')!.textContent, 'Two');
    assert.equal(window.document.activeElement?.textContent, 'Two');
    assert.equal(container.querySelector('[aria-checked="true"]')!.getAttribute('tabindex'), '0');
  } finally {
    await act(() => render(null, container));
    await window.happyDOM.close();
  }
});

test('dark accents keep readable foregrounds and malformed focus timers recover safely', () => {
  const luminance = (hex: string) =>
    hex
      .slice(1)
      .match(/../g)!
      .map((part) => {
        const value = parseInt(part, 16) / 255;
        return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
      })
      .reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0);
  for (const accent of ['#000000', '#0000ff', '#120010', '#c0e3cb', '#f7a8c4', '#ffffff']) {
    const ink = readableAccent(accent);
    assert.ok((luminance(ink) + 0.05) / (luminance('#121419') + 0.05) >= 4.5);
  }
  const fallback = { duration: 1500, paused: true, remaining: 1500 };
  assert.equal(normalizeFocusSnapshot(null, fallback), fallback);
  assert.deepEqual(
    normalizeFocusSnapshot({ duration: -1, remaining: 'NaN', phase: 'oops' }, fallback),
    { ...fallback, endsAt: null, phase: 'focus' },
  );
});
