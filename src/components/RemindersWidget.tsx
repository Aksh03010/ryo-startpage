import { useMemo, useState } from 'react';
import { MoreVertical, Plus, Repeat, Trash2 } from 'lucide-react';
import type { Reminder, TaskRepeatDay } from '../types';
import { REPEAT_DAY_LABELS } from '../constants';
import { useNow } from '../hooks/useNow';
import styles from './RemindersWidget.module.css';

type RemindersWidgetProps = {
  reminders: Reminder[];
  onRemindersChange: (updater: (prev: Reminder[]) => Reminder[]) => void;
};

function daysOf(reminder: Reminder): TaskRepeatDay[] {
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
    if (daysOf(reminder).includes(candidate.getDay() as TaskRepeatDay)) return candidate.getTime();
  }
  return null;
}

function formatWhen(dueAt: number | null) {
  if (dueAt === null) return 'No time';
  return new Date(dueAt).toLocaleString(undefined, {
    weekday: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function repeatLabel(days: TaskRepeatDay[]) {
  return days
    .slice()
    .sort((a, b) => a - b)
    .map((day) => REPEAT_DAY_LABELS[day])
    .join(' · ');
}

export default function RemindersWidget({ reminders, onRemindersChange }: RemindersWidgetProps) {
  const now = useNow(30_000);
  const [manageOpen, setManageOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [draftWhen, setDraftWhen] = useState('');
  const [draftRepeat, setDraftRepeat] = useState<TaskRepeatDay[]>([]);

  /** Next three reminders that are still ahead. Repeats roll to their next date. */
  const upcoming = useMemo(() => {
    const rows = reminders.map((reminder) => {
      const repeatDays = daysOf(reminder);
      if (repeatDays.length) {
        const next = nextOccurrence(reminder, now.getTime());
        return next === null ? null : { ...reminder, when: next, sortKey: next };
      }
      if (reminder.dueAt === null) return { ...reminder, when: null, sortKey: reminder.createdAt };
      if (reminder.dueAt <= now.getTime()) return null;
      return { ...reminder, when: reminder.dueAt, sortKey: reminder.dueAt };
    });
    return rows
      .filter((row): row is Reminder & { when: number | null; sortKey: number } => row !== null)
      .sort((a, b) => a.sortKey - b.sortKey)
      .slice(0, 3);
  }, [reminders, now]);

  const sortedAll = useMemo(
    () =>
      reminders
        .map((reminder) => ({ ...reminder, sortKey: reminder.dueAt ?? Number.MAX_SAFE_INTEGER }))
        .sort((a, b) => a.sortKey - b.sortKey),
    [reminders],
  );

  const toggleDraftDay = (day: TaskRepeatDay) => {
    setDraftRepeat((prev) => (prev.includes(day) ? prev.filter((value) => value !== day) : [...prev, day].sort((a, b) => a - b)));
  };

  const addReminder = () => {
    const text = draft.trim();
    if (!text) return;
    const dueAt = draftWhen ? new Date(draftWhen).getTime() : null;
    onRemindersChange((prev) => [
      ...prev,
      { id: crypto.randomUUID(), text, dueAt, repeatDays: draftRepeat, createdAt: Date.now() },
    ]);
    setDraft('');
    setDraftWhen('');
    setDraftRepeat([]);
  };

  const removeReminder = (id: string) => {
    onRemindersChange((prev) => prev.filter((reminder) => reminder.id !== id));
  };

  return (
    <div className={styles.wrap}>
      <header className={styles.header}>
        <p className={styles.kicker}>
          <span className={styles.dot} /> Next up
        </p>
        <button
          type="button"
          className={`${styles.menuButton} ${manageOpen ? styles.menuButtonActive : ''}`}
          aria-label={manageOpen ? 'Close reminder manager' : 'Manage reminders'}
          aria-expanded={manageOpen}
          onClick={() => setManageOpen(!manageOpen)}
        >
          <MoreVertical size={15} />
        </button>
      </header>

      {upcoming.length > 0 ? (
        <ul className={styles.list}>
          {upcoming.map((reminder) => {
            const repeatDays = daysOf(reminder);
            return (
              <li key={reminder.id}>
                <span className={styles.text}>{reminder.text}</span>
                {repeatDays.length > 0 && (
                  <span className={styles.repeats} title={`Repeats ${repeatLabel(repeatDays)}`}>
                    <Repeat size={11} strokeWidth={2} /> {repeatLabel(repeatDays)}
                  </span>
                )}
                <span className={styles.when}>{formatWhen(reminder.when)}</span>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className={styles.empty}>Nothing coming up. Use the ⋮ menu to add one.</p>
      )}

      {manageOpen && (
        <div className={styles.manage}>
          <div className={styles.addRow}>
            <input
              className={styles.input}
              value={draft}
              placeholder="Remind me to…"
              aria-label="Reminder text"
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  addReminder();
                }
              }}
            />
            <button type="button" className={styles.add} aria-label="Add reminder" onClick={addReminder}>
              <Plus size={15} />
            </button>
          </div>
          <input
            type="datetime-local"
            className={styles.whenInput}
            value={draftWhen}
            aria-label="Reminder time"
            onChange={(event) => setDraftWhen(event.target.value)}
          />
          <div className={styles.dayRow}>
            {([0, 1, 2, 3, 4, 5, 6] as TaskRepeatDay[]).map((day) => (
              <button
                key={day}
                type="button"
                className={styles.dayButton}
                aria-pressed={draftRepeat.includes(day)}
                data-active={draftRepeat.includes(day) || undefined}
                onClick={() => toggleDraftDay(day)}
              >
                {REPEAT_DAY_LABELS[day]}
              </button>
            ))}
          </div>
          <p className={styles.hint}>
            {draftRepeat.length > 0
              ? `Repeats ${repeatLabel(draftRepeat)}`
              : 'Pick days for a repeating reminder, or leave off for one-time.'}
          </p>
          {sortedAll.length > 0 && (
            <ul className={styles.manageList}>
              {sortedAll.map((reminder) => {
                const repeatDays = daysOf(reminder);
                return (
                  <li key={reminder.id}>
                    <span className={styles.text}>{reminder.text}</span>
                    {repeatDays.length > 0 && (
                      <span className={styles.repeats}>
                        <Repeat size={11} strokeWidth={2} /> {repeatLabel(repeatDays)}
                      </span>
                    )}
                    <span className={styles.when}>{formatWhen(reminder.dueAt)}</span>
                    <button
                      type="button"
                      className={styles.delete}
                      aria-label={`Delete reminder "${reminder.text}"`}
                      onClick={() => removeReminder(reminder.id)}
                    >
                      <Trash2 size={13} />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
