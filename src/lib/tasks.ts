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

export function isTaskDone(task: Task, date: Date): boolean {
  return task.repeatDays.length === 0 ? task.done : task.completions.includes(dateKey(date));
}
