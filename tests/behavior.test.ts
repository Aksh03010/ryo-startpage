import type { Task } from '../src/types';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { remainingSeconds, startFocus, pauseFocus } from '../src/lib/focus';
import { parseEngineProperties, applyWallpaperOverrides } from '../src/lib/wallpaperEngine';
import { applySpacePreset } from '../src/lib/spacePresets';
import { DEFAULT_SETTINGS } from '../src/constants';
import { buildSearchUrl } from '../src/lib/search';
import { dateKey, isTaskDone } from '../src/lib/tasks';

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

test('engine colors require three valid normalized channels', () => {
  assert.equal(parseEngineProperties({ accent: { value: '1 0.5 0' } }).accent, '#ff8000');
  assert.equal(parseEngineProperties({ accent: { value: '255 0 0' } }).accent, undefined);
  assert.equal(parseEngineProperties({ accent: { value: 'nope' } }).accent, undefined);
});

test('engine paths preserve drive letters, spaces, and filename punctuation', () => {
  const result = parseEngineProperties({
    backgroundfile: { value: 'C:\\Wallpapers\\moon #1.jpg' },
  });
  assert.equal(result.media?.url, 'file:///C:/Wallpapers/moon%20%231.jpg');
  assert.equal(result.media?.mediaType, 'image');
});

test('engine video takes precedence over image and clearing restores the image', () => {
  const image = { value: 'C:/moon.jpg' };
  assert.equal(
    parseEngineProperties({ backgroundfile: image, backgroundvideo: { value: 'C:/orbit.webm' } })
      .media?.mediaType,
    'video',
  );
  assert.equal(
    parseEngineProperties({ backgroundfile: image, backgroundvideo: { value: '' } }).media
      ?.mediaType,
    'image',
  );
  assert.equal(parseEngineProperties({ backgroundfile: { value: '' } }).media, null);
});

test('native overrides remain in memory and minimal mode wins over widget toggles', () => {
  const original = JSON.stringify(DEFAULT_SETTINGS);
  const settings = applyWallpaperOverrides(DEFAULT_SETTINGS, {
    minimal: true,
    accent: '#ffffff',
    widgets: { tasks: true },
    media: { url: 'file:///C:/orbit.webm', mediaType: 'video' },
  });
  assert.equal(settings.appearance.widgets.tasks.visible, false);
  assert.equal(settings.appearance.widgets.clock.visible, true);
  assert.equal(settings.background.wallpaper.kind, 'native');
  assert.equal(JSON.stringify(DEFAULT_SETTINGS), original);
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

test('workspace leaves system monitoring opt-in', () => {
  assert.equal(
    applySpacePreset(DEFAULT_SETTINGS, 'workspace').appearance.widgets.system.visible,
    false,
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
