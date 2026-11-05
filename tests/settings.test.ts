import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_SETTINGS } from '../src/constants';
import { normalizeSettings } from '../src/features/settings/normalizeSavedData';
import { getUpcomingReminders } from '../src/lib/reminders';
import type { Reminder } from '../src/types';

test('current settings normalization preserves user choices', () => {
  const settings = structuredClone(DEFAULT_SETTINGS);
  settings.appearance.widgets.tasks.visible = false;
  settings.appearance.widgets.clock.size = 120;
  assert.deepEqual(normalizeSettings(settings), settings);
});

test('legacy widget and glass migrations preserve overrides and do not mutate the save', () => {
  const legacy = {
    ...structuredClone(DEFAULT_SETTINGS),
    appearance: {
      ...DEFAULT_SETTINGS.appearance,
      boxMode: undefined,
      glassEnabled: false,
      widgets: {
        clock: { visible: true, size: 115, style: { glass: 'on', opacity: 25 } },
        tasks: { visible: false, style: { boxMode: 'none', glass: 'off' } },
      },
    },
  };
  const before = structuredClone(legacy);
  const result = normalizeSettings(legacy);
  assert.equal(result.appearance.boxMode, 'solid');
  assert.equal(result.appearance.widgets.clock.style.boxMode, 'glass');
  assert.equal(result.appearance.widgets.clock.style.opacity, 25);
  assert.equal(result.appearance.widgets.clock.size, 115);
  assert.equal(result.appearance.widgets.tasks.visible, false);
  assert.equal(result.appearance.widgets.tasks.style.boxMode, 'none');
  assert.equal(result.appearance.widgets.reminders.visible, true);
  assert.deepEqual(legacy, before);
  assert.deepEqual(normalizeSettings(result), result);
});

test('reminders exclude expired one-time entries and roll repeating entries to the next week', () => {
  const now = new Date(2026, 10, 2, 12, 0).getTime();
  const base: Reminder = {
    id: 'weekly',
    text: 'Read',
    dueAt: new Date(2026, 10, 2, 9, 0).getTime(),
    repeatDays: [1],
    createdAt: now,
  };
  const upcoming = getUpcomingReminders(
    [
      base,
      { ...base, id: 'expired', repeatDays: [] },
      { ...base, id: 'note', dueAt: null, repeatDays: [] },
    ],
    now,
  );
  assert.deepEqual(
    upcoming.map((reminder) => reminder.id),
    ['note', 'weekly'],
  );
  assert.equal(upcoming[1].when, new Date(2026, 10, 9, 9, 0).getTime());
});

test('upcoming reminders are ordered without mutating the collection and limited to three', () => {
  const reminders: Reminder[] = [4, 1, 3, 2].map((id) => ({
    id: String(id),
    text: 'Read',
    dueAt: id * 1000,
    repeatDays: [],
    createdAt: 0,
  }));
  const before = structuredClone(reminders);
  assert.deepEqual(
    getUpcomingReminders(reminders, 0).map((reminder) => reminder.id),
    ['1', '2', '3'],
  );
  assert.deepEqual(reminders, before);
});
