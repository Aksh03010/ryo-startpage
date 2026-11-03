import type { Reminder, TaskRepeatDay } from '../types';
import { REPEAT_DAY_LABELS } from '../constants';

export function getReminderDays(reminder: Reminder): TaskRepeatDay[] {
  return reminder.repeatDays ?? [];
}

/** Next datetime that lands on one of the reminder's weekdays at the original time-of-day. */
function nextOccurrence(reminder: Reminder, nowMs: number): number | null {
  const base = reminder.dueAt;
  if (base === null) return null;
  const due = new Date(base);
  const start = new Date(Math.max(nowMs, base));
  for (let i = 0; i <= 7; i++) {
    const candidate = new Date(
      start.getFullYear(),
      start.getMonth(),
      start.getDate() + i,
      due.getHours(),
      due.getMinutes(),
      0,
      0,
    );
    if (candidate.getTime() < Math.max(base, nowMs)) continue;
    if (getReminderDays(reminder).includes(candidate.getDay() as TaskRepeatDay))
      return candidate.getTime();
  }
  return null;
}

export function formatReminderTime(dueAt: number | null) {
  if (dueAt === null) return 'No time';
  return new Date(dueAt).toLocaleString(undefined, {
    weekday: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function formatRepeatDays(days: TaskRepeatDay[]) {
  return days
    .slice()
    .sort((a, b) => a - b)
    .map((day) => REPEAT_DAY_LABELS[day])
    .join(' · ');
}

/** Resolve repeats to their next date and return the three nearest reminders. */
export function getUpcomingReminders(reminders: Reminder[], nowMs: number) {
  const rows = reminders.map((reminder) => {
    const repeatDays = getReminderDays(reminder);
    if (repeatDays.length) {
      const next = nextOccurrence(reminder, nowMs);
      return next === null ? null : { ...reminder, when: next, sortKey: next };
    }
    if (reminder.dueAt === null) return { ...reminder, when: null, sortKey: reminder.createdAt };
    if (reminder.dueAt <= nowMs) return null;
    return { ...reminder, when: reminder.dueAt, sortKey: reminder.dueAt };
  });
  return rows
    .filter((row): row is Reminder & { when: number | null; sortKey: number } => row !== null)
    .sort((a, b) => a.sortKey - b.sortKey)
    .slice(0, 3);
}
