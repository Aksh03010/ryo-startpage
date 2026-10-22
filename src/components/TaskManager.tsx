import { useMemo, useState } from 'react';
import { Check, Circle, Plus, Repeat, X } from 'lucide-react';
import type { Task, TaskRepeatDay, TaskSettings } from '../types';
import { REPEAT_DAY_LABELS } from '../constants';
import { dateKey, isTaskDone, weekdayOf } from '../lib/tasks';
import styles from './TaskManager.module.css';

type TaskManagerProps = {
  tasks: Task[];
  settings: TaskSettings;
  onTasksChange: (updater: (prev: Task[]) => Task[]) => void;
};

function updateOrRemove(tasks: Task[], id: string, updater: (task: Task) => Task | null) {
  const next: Task[] = [];
  for (const task of tasks) {
    if (task.id !== id) {
      next.push(task);
      continue;
    }
    const replacement = updater(task);
    if (replacement) next.push(replacement);
  }
  return next;
}

export default function TaskManager({ tasks, settings, onTasksChange }: TaskManagerProps) {
  const today = dateKey();
  const [draft, setDraft] = useState('');
  const [repeatOpen, setRepeatOpen] = useState(false);
  const [draftRepeat, setDraftRepeat] = useState<TaskRepeatDay[]>([]);
  const todayDay = weekdayOf(new Date());

  const visible = useMemo(
    () =>
      tasks
        .map((task) => ({ task, done: isTaskDone(task, new Date()) }))
        .filter(({ task, done }) => {
          const scheduledToday = task.repeatDays.length === 0 || task.repeatDays.includes(todayDay);
          if (task.repeatDays.length > 0 && !scheduledToday) return false;
          return done ? settings.showCompleted : true;
        }),
    [tasks, settings.showCompleted, todayDay],
  );

  const totalToday = visible.length;
  const remaining = visible.filter(({ done }) => !done).length;

  const addTask = () => {
    const value = draft.trim();
    if (!value) return;
    const task: Task = {
      id: crypto.randomUUID(),
      text: value,
      createdAt: Date.now(),
      repeatDays: draftRepeat,
      completions: [],
      done: false,
    };
    onTasksChange((prev) => [...prev, task]);
    setDraft('');
    setDraftRepeat([]);
    setRepeatOpen(false);
  };

  const nearestUpcoming = draftRepeat
    .map((day) => REPEAT_DAY_LABELS[day])
    .slice()
    .sort((a, b) => a.localeCompare(b))
    .join(' · ');

  return (
    <div className={styles.wrap}>
      <header className={styles.header}>
        <p className={styles.kicker}>
          <span className={styles.dot} /> {remaining === 0 ? 'All clear' : `${remaining}/${totalToday} left`}
        </p>
      </header>

      <ul className={styles.list}>
        {visible.map(({ task, done }) => (
          <li
            key={task.id}
            data-done={done || undefined}
            className={task.repeatDays.length ? styles.repeating : undefined}
          >
            <button
              type="button"
              className={styles.check}
              data-checked={done || undefined}
              aria-pressed={done}
              aria-label={done ? `Mark "${task.text}" as pending` : `Mark "${task.text}" as done`}
              onClick={() =>
                onTasksChange((prev) =>
                  updateOrRemove(
                    prev,
                    task.id,
                    (current) => {
                      if (current.repeatDays.length) {
                        const completions = current.completions.includes(today)
                          ? current.completions.filter((date) => date !== today)
                          : [...current.completions, today];
                        return { ...current, completions };
                      }
                      return { ...current, done: !current.done };
                    },
                  ),
                )
              }
            >
              <Check size={14} strokeWidth={3} />
            </button>
            <span className={styles.text}>{task.text}</span>
            {task.repeatDays.length > 0 && (
              <span className={styles.repeats} title={`Repeats ${task.repeatDays.map(day => REPEAT_DAY_LABELS[day]).join(', ')}`}>
                <Repeat size={11} strokeWidth={2} /> {task.repeatDays.map(day => REPEAT_DAY_LABELS[day]).join(' · ')}
              </span>
            )}
            <button
              type="button"
              className={styles.delete}
              aria-label={`Delete "${task.text}"`}
              title="Delete task"
              onClick={() => onTasksChange((prev) => updateOrRemove(prev, task.id, () => null))}
            >
              <X size={13} strokeWidth={2.5} />
            </button>
          </li>
        ))}
        {visible.length === 0 && (
          <li className={styles.empty} data-empty="true">
            <Circle size={13} strokeWidth={2} />
            No tasks for today.
          </li>
        )}
      </ul>

      <div className={styles.addPane}>
        {repeatOpen && (
          <div className={styles.repeatRow}>
            {([1, 2, 3, 4, 5, 6, 0] as TaskRepeatDay[]).map((day) => {
              const active = draftRepeat.includes(day);
              return (
                <button
                  key={day}
                  type="button"
                  className={styles.dayButton}
                  data-active={active || undefined}
                  aria-pressed={active}
                  onClick={() =>
                    setDraftRepeat((prev) =>
                      prev.includes(day)
                        ? prev.filter((value) => value !== day)
                        : [...prev, day],
                    )
                  }
                >
                  {REPEAT_DAY_LABELS[day]}
                </button>
              );
            })}
            {draftRepeat.length === 0 && (
              <span className={styles.hint}>One-time task</span>
            )}
          </div>
        )}
        <div className={styles.addRow}>
          <button type="button" className={styles.repeatsButton} onClick={() => setRepeatOpen((o) => !o)}>
            <Repeat size={15} strokeWidth={2.2} data-toggled={draftRepeat.length ? true : undefined} />
          </button>
          <input
            type="text"
            className={styles.input}
            placeholder="Add a task…"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') addTask();
            }}
            aria-label="New task text"
          />
          <button type="button" className={styles.add} aria-label="Add task" onClick={addTask}>
            <Plus size={16} strokeWidth={2.6} />
          </button>
        </div>
        {draftRepeat.length > 0 && nearestUpcoming && (
          <p className={styles.currentRepeat}>Repeats on · {nearestUpcoming}</p>
        )}
      </div>
    </div>
  );
}
