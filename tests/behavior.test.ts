import type { Task } from '../src/types';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { remainingSeconds, startFocus, pauseFocus } from '../src/lib/focus';
import { applySpacePreset } from '../src/lib/spacePresets';
import { DEFAULT_SETTINGS } from '../src/constants';
import { buildSearchUrl } from '../src/lib/search';
import { dateKey, isTaskDone } from '../src/lib/tasks';
import { formatClockParts } from '../src/lib/time';

test('base 24 converts each clock part and leaves ordinary formats unchanged', () => {
  const date = new Date(2026, 10, 4, 23, 59, 24);
  const base24 = formatClockParts(date, false, true, true);
  assert.deepEqual([base24.hour, base24.minute, base24.second], ['0N', '2B', '10']);
  assert.equal(base24.hour12, false);
  assert.equal(base24.suffix, '');
  for (let value = 0; value < 60; value++) {
    date.setMinutes(value);
    const { minute } = formatClockParts(date, true, false, true);
    assert.match(minute, /^[0-9A-N]{2}$/);
    assert.equal(parseInt(minute, 24), value);
  }
  date.setHours(0, 0, 0);
  assert.equal(formatClockParts(date, false, false, true).hour, '00');
  assert.equal(formatClockParts(date, false, false).hour, '12');
  date.setHours(13, 24, 59);
  assert.equal(formatClockParts(date, false, true).hour, '1');
  assert.equal(formatClockParts(date, false, true).suffix, 'PM');
  assert.equal(formatClockParts(date, true, true).hour, '13');
  assert.equal(formatClockParts(date, true, true).minute, '24');
});

const initial = { duration: 1500, remaining: 1500, paused: true };

test('focus catches up after background throttling and reload', () => {
  const running = startFocus(initial, 1000);
  const restored = JSON.parse(JSON.stringify(running));
  assert.equal(remainingSeconds(restored, 121_000), 1380);
  assert.equal(remainingSeconds(restored, 2_000_000), 0);
});

test('pause freezes time and resume preserves the remainder', () => {
  const paused = pauseFocus(startFocus(initial, 1000), 61_000);
  assert.equal(remainingSeconds(paused, 500_000), 1440);
  const resumed = startFocus(paused, 500_000);
  assert.equal(remainingSeconds(resumed, 560_000), 1380);
  assert.equal(paused.endsAt, null);
});

test('timer restarts after completion and clamps backward clock changes', () => {
  assert.equal(startFocus({ ...initial, remaining: 0 }, 100).remaining, 1500);
  const resumed = startFocus({ ...initial, remaining: 45 }, 10_000);
  assert.equal(remainingSeconds(resumed, 1000), 45);
});

test('minimal preset preserves user style choices and excludes optional widgets', () => {
  const settings = applySpacePreset(DEFAULT_SETTINGS, 'minimal');
  assert.deepEqual(
    Object.entries(settings.appearance.widgets)
      .filter(([, widget]) => widget.visible)
      .map(([id]) => id)
      .sort(),
    ['clock', 'search'],
  );
  assert.equal(settings.background, DEFAULT_SETTINGS.background);
  assert.equal(settings.clock, DEFAULT_SETTINGS.clock);
  assert.equal(
    settings.appearance.widgets.clock.style,
    DEFAULT_SETTINGS.appearance.widgets.clock.style,
  );
});

test('search handles URLs, encoded queries, and empty inputs', () => {
  assert.equal(buildSearchUrl('example.com', 'google'), 'https://example.com/');
  assert.equal(buildSearchUrl('  ', 'google'), '');
  assert.equal(
    buildSearchUrl('space & stars', 'duckduckgo'),
    'https://duckduckgo.com/?q=space%20%26%20stars',
  );
});

test('repeating task completion rolls over at the local date boundary', () => {
  const day = new Date(2026, 10, 2, 23, 59);
  const task: Task = {
    id: 'test',
    text: 'Read',
    createdAt: 0,
    repeatDays: [1],
    completions: [dateKey(day)],
    done: false,
  };
  assert.equal(isTaskDone(task, day), true);
  assert.equal(isTaskDone(task, new Date(2026, 10, 3, 0, 1)), false);
});
