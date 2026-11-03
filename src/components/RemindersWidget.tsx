import { useMemo, useState } from 'react';
import { MoreVertical, Plus, Repeat, Trash2 } from 'lucide-react';
import type { Reminder, TaskRepeatDay } from '../types';
import {
  getReminderDays,
  formatReminderTime,
  formatRepeatDays,
  getUpcomingReminders,
} from '../lib/reminders';
import { useNow } from '../hooks/useNow';
import { WeekdayPicker } from './ui/WeekdayPicker';
import styles from './RemindersWidget.module.css';

type RemindersWidgetProps = {
  reminders: Reminder[];
  onRemindersChange: (updater: (prev: Reminder[]) => Reminder[]) => void;
};

export function RemindersWidget({ reminders, onRemindersChange }: RemindersWidgetProps) {
  const now = useNow(30_000);
  const [manageOpen, setManageOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [draftWhen, setDraftWhen] = useState('');
  const [draftRepeat, setDraftRepeat] = useState<TaskRepeatDay[]>([]);

  const upcoming = useMemo(() => getUpcomingReminders(reminders, now.getTime()), [reminders, now]);

  const sortedAll = useMemo(
    () =>
      reminders
        .map((reminder) => ({ ...reminder, sortKey: reminder.dueAt ?? Number.MAX_SAFE_INTEGER }))
        .sort((a, b) => a.sortKey - b.sortKey),
    [reminders],
  );

  const toggleDraftDay = (day: TaskRepeatDay) => {
    setDraftRepeat((prev) =>
      prev.includes(day)
        ? prev.filter((value) => value !== day)
        : [...prev, day].sort((a, b) => a - b),
    );
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
            const repeatDays = getReminderDays(reminder);
            return (
              <li key={reminder.id}>
                <span className={styles.text}>{reminder.text}</span>
                {repeatDays.length > 0 && (
                  <span
                    className={styles.repeats}
                    title={`Repeats ${formatRepeatDays(repeatDays)}`}
                  >
                    <Repeat size={11} strokeWidth={2} /> {formatRepeatDays(repeatDays)}
                  </span>
                )}
                <span className={styles.when}>{formatReminderTime(reminder.when)}</span>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className={styles.empty}>A clear horizon. Add a reminder when you need one.</p>
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
            <button
              type="button"
              className={styles.add}
              aria-label="Add reminder"
              onClick={addReminder}
            >
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
          <WeekdayPicker
            selected={draftRepeat}
            onToggle={toggleDraftDay}
            className={styles.dayRow}
            buttonClassName={styles.dayButton}
            days={[0, 1, 2, 3, 4, 5, 6]}
          />
          <p className={styles.hint}>
            {draftRepeat.length > 0
              ? `Repeats ${formatRepeatDays(draftRepeat)}`
              : 'Pick days for a repeating reminder, or leave off for one-time.'}
          </p>
          {sortedAll.length > 0 && (
            <ul className={styles.manageList}>
              {sortedAll.map((reminder) => {
                const repeatDays = getReminderDays(reminder);
                return (
                  <li key={reminder.id}>
                    <span className={styles.text}>{reminder.text}</span>
                    {repeatDays.length > 0 && (
                      <span className={styles.repeats}>
                        <Repeat size={11} strokeWidth={2} /> {formatRepeatDays(repeatDays)}
                      </span>
                    )}
                    <span className={styles.when}>{formatReminderTime(reminder.dueAt)}</span>
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
