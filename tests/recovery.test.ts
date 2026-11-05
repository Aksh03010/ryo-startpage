import { test } from 'node:test';
import assert from 'node:assert/strict';
import { h, render } from 'preact';
import { act } from 'preact/test-utils';
import { createTestWindow, installTestGlobals } from './helpers/dom';
import {
  normalizeSettings,
  normalizeLayout,
  normalizeLinks,
  normalizeTasks,
  normalizeReminders,
} from '../src/features/settings/normalizeSavedData';
import { DEFAULT_POSITIONS } from '../src/constants';

test('storage write failures leave the app usable and display dismissible feedback', async (context) => {
  const window = createTestWindow();
  installTestGlobals(window);
  context.mock.method(Object.getPrototypeOf(window.localStorage) as Storage, 'setItem', () => {
    throw new Error('Quota exceeded');
  });
  context.mock.method(console, 'error', () => {});
  const { App } = await import('../src/App');
  const container = window.document.createElement('div');
  window.document.body.append(container);
  try {
    await act(() => render(h(App, {}), container));
    assert.ok(container.querySelector('[data-widget-id="clock"]'));
    assert.match(container.textContent!, /Changes couldn’t be saved/);
    await act(() => {
      container
        .querySelector('[aria-label="Dismiss storage message"]')!
        .dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
    });
    assert.equal(container.textContent?.includes('Changes couldn’t be saved'), false);
  } finally {
    await act(() => render(null, container));
    await window.happyDOM.close();
  }
});

test('partial settings retain valid preferences and repair unsafe values before rendering', () => {
  for (const value of [null, [], 5, {}, { appearance: null, clock: [] }]) {
    const settings = normalizeSettings(value);
    assert.equal(settings.appearance.widgets.clock.visible, true);
    assert.equal(settings.clock.size, 150);
  }
  const settings = normalizeSettings({
    appearance: {
      accent: 'rose',
      customAccent: 'url(bad)',
      glassEnabled: true,
      widgets: { tasks: { visible: false, size: 999, style: { glass: 'off', opacity: -20 } } },
    },
    clock: { blorp: true, base24: true, size: 'big' },
    background: { wallpaper: { kind: 'url', url: 'javascript:alert(1)' } },
  });
  assert.equal(settings.appearance.accent, 'rose');
  assert.equal(settings.appearance.boxMode, 'glass');
  assert.equal(settings.appearance.widgets.tasks.visible, false);
  assert.equal(settings.appearance.widgets.tasks.size, 140);
  assert.equal(settings.appearance.widgets.tasks.style.boxMode, 'solid');
  assert.equal(settings.appearance.widgets.tasks.style.opacity, 0);
  assert.equal(settings.clock.blorp, true);
  assert.equal(settings.clock.base24, false);
  assert.equal(settings.background.wallpaper.kind, 'preset');
  assert.deepEqual(normalizeLayout(null), DEFAULT_POSITIONS);
  assert.deepEqual(normalizeTasks(null), []);
  assert.deepEqual(normalizeReminders({}), []);
  assert.deepEqual(normalizeLinks([{ id: 'bad', url: 'javascript:alert(1)' }]), []);
  assert.deepEqual(
    normalizeTasks([
      { id: 'kept', text: 'Keep me', repeatDays: [1, 1, 9], completions: [null, '2026-11-04'] },
    ])[0].repeatDays,
    [1],
  );
});

test('the app recovers malformed saves, preserves the original, and falls back from failed wallpaper media', async () => {
  const window = createTestWindow();
  installTestGlobals(window);
  window.happyDOM.setWindowSize({ width: 1280, height: 720 });
  const container = window.document.createElement('div');
  window.document.body.append(container);
  const { App } = await import('../src/App');
  const { BackgroundManager } = await import('../src/features/wallpapers/BackgroundManager');
  try {
    for (const raw of ['{broken', 'null', '{"appearance":{"accent":"rose"}}']) {
      window.localStorage.clear();
      window.localStorage.setItem('ryo.settings.v2', raw);
      window.localStorage.setItem('ryo.tasks.v2', 'null');
      window.localStorage.setItem('ryo.reminders.v2', '{}');
      window.localStorage.setItem('ryo.focus.v2', 'null');
      await act(() => render(h(App, {}), container));
      assert.ok(container.querySelector('[data-widget-id="clock"]'));
      assert.equal(window.localStorage.getItem('ryo.settings.v2.recovery'), raw);
      await act(() => render(null, container));
    }
    const background = normalizeSettings({
      background: {
        wallpaper: {
          kind: 'url',
          preset: 'aurora',
          url: 'https://example.com/missing.jpg',
          mediaType: 'image',
        },
      },
    }).background;
    await act(() => render(h(BackgroundManager, { background }), container));
    await act(() => {
      container.querySelector('img')!.dispatchEvent(new window.Event('error'));
    });
    assert.equal(container.querySelector('img'), null);
    assert.ok(container.querySelector('svg'));
    assert.match(container.querySelector('[role="status"]')!.textContent!, /couldn’t load/);
    // Reapplying the same URL creates a new selection and must permit a retry.
    await act(() =>
      render(
        h(BackgroundManager, {
          background: { ...background, wallpaper: { ...background.wallpaper } },
        }),
        container,
      ),
    );
    assert.ok(container.querySelector('img'));
    assert.equal(container.querySelector('[role="status"]'), null);
  } finally {
    await act(() => render(null, container));
    await window.happyDOM.close();
  }
});
