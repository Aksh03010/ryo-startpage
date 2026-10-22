import type { Task } from '../types';

export function dateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function weekdayOf(date = new Date()): 0 | 1 | 2 | 3 | 4 | 5 | 6 {
  return date.getDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6;
}

export function repeatsDay(task: Task, day: number): boolean {
  return task.repeatDays.includes(day as 0 | 1 | 2 | 3 | 4 | 5 | 6);
}

export function isTaskDone(task: Task, date: Date): boolean {
  return task.repeatDays.length === 0 ? task.done : task.completions.includes(dateKey(date));
}

export function isTaskForToday(task: Task, date: Date): boolean {
  if (task.repeatDays.length === 0) return true;
  return repeatsDay(task, weekdayOf(date));
}

export function sortTasks(tasks: Task[], date = new Date()): Array<{ task: Task; done: boolean }> {
  return tasks
    .map((task) => ({ task, done: isTaskDone(task, date) }))
    .sort((a, b) => {
      if (a.done !== b.done) return a.done ? 1 : -1;
      return a.task.createdAt - b.task.createdAt;
    });
}

export function todayKey(date = new Date()): string {
  return dateKey(date);
}

export function nextRepeatDay(task: Task): number | null {
  if (task.repeatDays.length === 0) return null;
  return Math.min(...task.repeatDays);
}
