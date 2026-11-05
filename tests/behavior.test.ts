import type { Task } from '../src/types';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { remainingSeconds, startFocus, pauseFocus } from '../src/lib/focus';
import { applySpacePreset } from '../src/lib/spacePresets';
import { DEFAULT_SETTINGS } from '../src/constants';
import { buildSearchUrl } from '../src/lib/search';
import { dateKey, isTaskDone } from '../src/lib/tasks';
import { formatClockParts } from '../src/lib/time';

test('blorp decimal time follows the local day and rolls over at exact metric boundaries', () => {
  const cases: Array<[number, string, string, string]> = [
    [0, '0', '00', '00'],
    [863, '0', '00', '00'],
    [864, '0', '00', '01'],
    [86_399, '0', '00', '99'],
    [86_400, '0', '01', '00'],
    [8_639_999, '0', '99', '99'],
    [8_640_000, '1', '00', '00'],
    [43_200_000, '5', '00', '00'],
    [64_800_000, '7', '50', '00'],
    [86_399_999, '9', '99', '99'],
    [86_400_000, '0', '00', '00'],
  ];
  for (const [milliseconds, hour, minute, second] of cases) {
    const date = new Date(2026, 10, 4, 0, 0, 0, milliseconds);
    const parts = formatClockParts(date, false, true, false, true);
    assert.deepEqual([parts.hour, parts.minute, parts.second], [hour, minute, second]);
    assert.equal(parts.suffix, '');
    assert.equal(parts.hour12, false);
    // Decimal mode wins if a manually edited save enables both easter eggs.
    assert.deepEqual(formatClockParts(date, true, true, true, true), parts);
  }
});

test('blurb uses a unique symbol per hour, base-√60 minutes and seconds, and preserves ordinary time', () => {
  const date = new Date(2026, 10, 4, 23, 59, 24);
  const blurb = formatClockParts(date, false, true, true);
  assert.equal(blurb.hour, '◎');
  assert.equal(blurb.hour12, false);
  assert.equal(blurb.suffix, '');
  const symbols = new Set<string>();
  for (let hour = 0; hour < 24; hour++) {
    date.setHours(hour);
    const symbol = formatClockParts(date, false, false, true).hour;
    assert.equal([...symbol].length, 1);
    assert.doesNotMatch(symbol, /[\dA-Z]/);
    assert.equal(formatClockParts(date, true, false, true).hour, symbol);
    symbols.add(symbol);
  }
  assert.equal(symbols.size, 24);
  const representations = new Set<string>();
  for (let value = 0; value < 60; value++) {
    date.setMinutes(value, value);
    const { minute, second } = formatClockParts(date, true, true, true);
    assert.match(minute, /^[0-7]{2}\.[0-7]{3}$/);
    const reconstructed = [...minute.replace('.', '')].reduce(
      (sum, digit, index) => sum + Number(digit) * Math.sqrt(60) ** (1 - index),
      0,
    );
    // Truncating after three fractional places loses less than one unit in the last place.
    assert.ok(reconstructed <= value + 1e-10);
    assert.ok(value - reconstructed < Math.sqrt(60) ** -3 + 1e-10);
    if (value < 8) assert.equal(minute, `0${value}.000`);
    assert.equal(second, minute);
    representations.add(minute);
  }
  assert.equal(representations.size, 60);
  date.setHours(0, 0, 0);
  assert.deepEqual(
    [
      formatClockParts(date, false, false, true).minute,
      formatClockParts(date, false, true, true).second,
    ],
    ['00.000', '00.000'],
  );
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
