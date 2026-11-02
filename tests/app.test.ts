import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Window } from 'happy-dom';
import { h, render } from 'preact';
import { act } from 'preact/test-utils';
import { DEFAULT_SETTINGS } from '../src/constants';
import { applySpacePreset } from '../src/lib/spacePresets';

test('Preact app: minimal → workspace, task entry, timer controls, and arrange mode', async () => {
  const window = new Window({ url: 'http://localhost/' });
  for (const key of ['window', 'document', 'navigator', 'HTMLElement', 'HTMLInputElement', 'Node', 'Event', 'MouseEvent', 'KeyboardEvent', 'MutationObserver']) {
    Object.defineProperty(globalThis, key, { value: key === 'window' ? window : window[key], configurable: true });
  }
  globalThis.getComputedStyle = window.getComputedStyle.bind(window);
  globalThis.requestAnimationFrame = window.requestAnimationFrame.bind(window);
  globalThis.cancelAnimationFrame = window.cancelAnimationFrame.bind(window);
  globalThis.ResizeObserver = window.ResizeObserver;
  window.localStorage.setItem('ryo.settings.v2', JSON.stringify(applySpacePreset(DEFAULT_SETTINGS, 'minimal')));
  const { default: App } = await import('../src/App');
  const container = window.document.createElement('div');
  window.document.body.append(container);
  const until = async (check: () => unknown) => {
    for (let attempt = 0; attempt < 80; attempt++) {
      await act(async () => { await new Promise((resolve) => setTimeout(resolve, 10)); });
      if (check()) return;
    }
    assert.fail(`Condition did not resolve. Current text: ${container.textContent}`);
  };
  const button = (label: string) => [...container.querySelectorAll('button')].find((node) => node.getAttribute('aria-label') === label) as HTMLButtonElement;
  const click = async (node: Element) => { assert.ok(node); await act(() => node.dispatchEvent(new window.MouseEvent('click', { bubbles: true }))); };
  try {
    await act(() => render(h(App, {}), container));
    assert.ok(container.querySelector('[data-widget-id="clock"]'));
    assert.ok(container.querySelector('[role="search"]'));
    assert.equal(container.querySelector('[data-widget-id="tasks"]'), null);
    assert.equal(container.querySelector('[role="dialog"]'), null);
    for (const feature of ['TaskManager', 'FocusWidget', 'QuickLinks', 'RemindersWidget', 'ArrangeCanvas', 'CustomizePanel', 'SystemMonitorWidget']) {
      assert.equal([...globalThis.__loadedSources].some((url: string) => url.endsWith(`/${feature}.tsx`)), false, `${feature} loaded in minimal mode`);
    }

    await click(button('Open customize panel'));
    await until(() => container.querySelector('[role="dialog"]'));
    await click([...container.querySelectorAll('button')].find((node) => node.textContent === 'Workspace')!);
    await until(() => container.querySelector('input[aria-label="New task text"]'));
    await click(button('Close customize panel'));
    assert.equal(container.querySelector('[role="dialog"]'), null);

    const input = container.querySelector('input[aria-label="New task text"]') as HTMLInputElement;
    await act(() => { input.value = 'Make a little space'; input.dispatchEvent(new window.Event('input', { bubbles: true })); });
    await click(button('Add task'));
    assert.ok(container.textContent?.includes('Make a little space'));
    await click(button('Mark "Make a little space" as done'));
    const tasks = JSON.parse(window.localStorage.getItem('ryo.tasks.v2')!);
    assert.equal(tasks[0].done, true);

    await until(() => button('Start focus'));
    await click(button('Start focus'));
    const running = JSON.parse(window.localStorage.getItem('ryo.focus.v2')!);
    assert.equal(running.paused, false);
    assert.ok(running.endsAt > Date.now());
    await click(button('Pause focus'));
    assert.equal(JSON.parse(window.localStorage.getItem('ryo.focus.v2')!).paused, true);

    await click(button('Arrange widgets'));
    await until(() => button('Reposition Clock'));
    assert.ok(button('Reposition Tasks'));
    await click(button('Arrange widgets'));
    assert.equal(container.querySelector('[data-edit-mode]'), null);

    await act(() => window.wallpaperPropertyListener!.applyUserProperties({ minimal: { value: true }, accent: { value: '1 0.5 0' } }));
    assert.equal(container.querySelector('[data-widget-id="tasks"]'), null);
    assert.equal(JSON.parse(window.localStorage.getItem('ryo.settings.v2')!).appearance.widgets.tasks.visible, true);
    await act(() => window.wallpaperPropertyListener!.setPaused(true));
    assert.equal(window.document.documentElement.hasAttribute('data-host-paused'), true);
    await act(() => window.wallpaperPropertyListener!.setPaused(false));
  } finally {
    await act(() => render(null, container));
    await window.happyDOM.close();
  }
});
