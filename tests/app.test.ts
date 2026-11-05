import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createTestWindow, installTestGlobals } from './helpers/dom';
import type { FocusSnapshot } from '../src/lib/focus';
import type { Task, Settings } from '../src/types';
import { h, render } from 'preact';
import { act } from 'preact/test-utils';
import { DEFAULT_SETTINGS } from '../src/constants';
import { applySpacePreset } from '../src/lib/spacePresets';

test('Preact app: minimal → workspace, task entry, timer controls, and arrange mode', async () => {
  const window = createTestWindow({ url: 'http://localhost/' });
  installTestGlobals(window);
  const legacySettings = structuredClone(applySpacePreset(DEFAULT_SETTINGS, 'minimal'));
  delete legacySettings.clock.base24;
  // Existing browsers may still have an enabled widget from the experimental version.
  Object.assign(legacySettings.appearance.widgets, {
    system: { visible: true, size: 100, style: {} },
  });
  window.localStorage.setItem('ryo.settings.v2', JSON.stringify(legacySettings));
  const { App } = await import('../src/App');
  const container = window.document.createElement('div');
  window.document.body.append(container);
  const until = async (check: () => unknown) => {
    for (let attempt = 0; attempt < 80; attempt++) {
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
      });
      if (check()) return;
    }
    assert.fail(`Condition did not resolve. Current text: ${container.textContent}`);
  };
  const button = (label: string) =>
    [...container.querySelectorAll('button')].find(
      (node) => node.getAttribute('aria-label') === label,
    ) as HTMLButtonElement;
  const click = async (node: Element) => {
    assert.ok(node);
    await act(() => {
      node.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
    });
  };
  try {
    await act(() => render(h(App, {}), container));
    assert.ok(container.querySelector('[data-widget-id="clock"]'));
    assert.ok(container.querySelector('[role="search"]'));
    assert.equal(container.querySelector('[data-widget-id="tasks"]'), null);
    assert.equal(container.querySelector('[role="dialog"]'), null);
    assert.equal(container.querySelector('[data-widget-id="system"]'), null);
    assert.equal('wallpaperPropertyListener' in window, false);
    for (const feature of [
      'TaskManager',
      'FocusWidget',
      'QuickLinks',
      'RemindersWidget',
      'ArrangeCanvas',
      'CustomizePanel',
    ]) {
      assert.equal(
        [...globalThis.__loadedSources].some((url: string) => url.endsWith(`/${feature}.tsx`)),
        false,
        `${feature} loaded in minimal mode`,
      );
    }

    const clock = () => container.querySelector('[data-widget-id="clock"]')!;
    assert.equal(clock().querySelector('button'), null);
    assert.equal(clock().textContent?.includes('Base 24'), false);

    await click(button('Open customize panel'));
    await until(() => container.querySelector('[role="dialog"]'));
    const tab = (label: string) => {
      const match = [...container.querySelectorAll('button')].find(
        (node) => node.textContent?.trim() === label,
      );
      assert.ok(match, `Missing ${label} tab`);
      return match;
    };
    const urlInput = container.querySelector(
      'input[placeholder="https://example.com/sunset.jpg"]',
    ) as HTMLInputElement;
    await act(() => {
      urlInput.value = 'https://example.com/draft.jpg';
      urlInput.dispatchEvent(new window.Event('input', { bubbles: true }));
    });
    await click(tab('Appearance'));
    const radius = container.querySelector(
      'input[type="range"][aria-label="Corner roundness"]',
    ) as HTMLInputElement;
    assert.ok(radius);
    await act(() => {
      radius.value = '30';
      radius.dispatchEvent(new window.Event('input', { bubbles: true }));
    });
    assert.equal(
      (JSON.parse(window.localStorage.getItem('ryo.settings.v2')!) as Settings).appearance.radius,
      30,
    );
    await click(tab('Widgets'));
    assert.equal(container.textContent?.includes('System monitor'), false);
    assert.equal(button('blurb').getAttribute('aria-checked'), 'false');
    const switches = container.querySelectorAll('[role="switch"]');
    assert.equal(switches[switches.length - 1].getAttribute('aria-label'), 'blurb');
    await click(button('blurb'));
    assert.ok(clock().querySelector('time.blurb'));
    assert.match(clock().querySelector('.minute')!.textContent!, /^[0-7]{2}\.[0-7]{3}$/);
    assert.equal(
      (JSON.parse(window.localStorage.getItem('ryo.settings.v2')!) as Settings).clock.base24,
      true,
    );
    await click(button('Show seconds'));
    assert.match(clock().querySelector('.seconds')!.textContent!, /^[0-7]{2}\.[0-7]{3}$/);
    await click(button('blurb'));
    assert.equal(clock().querySelector('time.blurb'), null);
    assert.match(clock().querySelector('.minute')!.textContent!, /^\d{2}$/);
    assert.match(clock().querySelector('.seconds')!.textContent!, /^\d{2}$/);
    await click(button('blurb'));
    assert.equal(
      (JSON.parse(window.localStorage.getItem('ryo.settings.v2')!) as Settings).clock.showSeconds,
      true,
    );
    await click(tab('Layout'));
    assert.ok(tab('Restore default positions'));
    await click(tab('Background'));
    assert.equal(
      (
        container.querySelector(
          'input[placeholder="https://example.com/sunset.jpg"]',
        ) as HTMLInputElement
      ).value,
      'https://example.com/draft.jpg',
    );

    await click(
      [...container.querySelectorAll('button')].find((node) => node.textContent === 'Workspace')!,
    );
    await until(() => container.querySelector('input[aria-label="New task text"]'));
    await click(button('Close customize panel'));
    assert.equal(container.querySelector('[role="dialog"]'), null);

    const input = container.querySelector('input[aria-label="New task text"]') as HTMLInputElement;
    await act(() => {
      input.value = 'Make a little space';
      input.dispatchEvent(new window.Event('input', { bubbles: true }));
    });
    await click(button('Add task'));
    assert.ok(container.textContent?.includes('Make a little space'));
    await click(button('Mark "Make a little space" as done'));
    const tasks = JSON.parse(window.localStorage.getItem('ryo.tasks.v2')!) as Task[];
    assert.equal(tasks[0].done, true);

    await until(() => button('Start focus'));
    await click(button('Start focus'));
    const running = JSON.parse(window.localStorage.getItem('ryo.focus.v2')!) as FocusSnapshot;
    assert.equal(running.paused, false);
    assert.ok(running.endsAt && running.endsAt > Date.now());
    await click(button('Pause focus'));
    assert.equal(
      (JSON.parse(window.localStorage.getItem('ryo.focus.v2')!) as FocusSnapshot).paused,
      true,
    );

    await click(button('Arrange widgets'));
    await until(() => button('Reposition Clock'));
    assert.ok(button('Reposition Tasks'));
    await click(button('Arrange widgets'));
    assert.equal(container.querySelector('[data-edit-mode]'), null);
    assert.equal(container.querySelector('[data-widget-id="system"]'), null);
    await act(() => render(null, container));
    await act(() => render(h(App, {}), container));
    assert.ok(clock().querySelector('time.blurb'));
    assert.equal(clock().querySelector('button'), null);
    assert.match(clock().querySelector('.seconds')!.textContent!, /^[0-7]{2}\.[0-7]{3}$/);
  } finally {
    await act(() => render(null, container));
    await window.happyDOM.close();
  }
});
