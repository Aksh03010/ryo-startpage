import type { ReactNode } from 'react';
import { REPEAT_DAY_LABELS } from '../../constants';
import type { TaskRepeatDay } from '../../types';

interface WeekdayPickerProps {
  selected: readonly TaskRepeatDay[];
  onToggle: (day: TaskRepeatDay) => void;
  className: string;
  buttonClassName: string;
  days?: readonly TaskRepeatDay[];
  children?: ReactNode;
}

export function WeekdayPicker({
  selected,
  onToggle,
  className,
  buttonClassName,
  days = [1, 2, 3, 4, 5, 6, 0],
  children,
}: WeekdayPickerProps) {
  return (
    <div className={className}>
      {days.map((day) => (
        <button
          key={day}
          type="button"
          className={buttonClassName}
          data-active={selected.includes(day) || undefined}
          aria-pressed={selected.includes(day)}
          onClick={() => onToggle(day)}
        >
          {REPEAT_DAY_LABELS[day]}
        </button>
      ))}
      {children}
    </div>
  );
}
