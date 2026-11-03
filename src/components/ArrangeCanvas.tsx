import type { ReactNode } from 'react';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  pointerWithin,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';

export function ArrangeCanvas({
  children,
  onDragEnd,
}: {
  children: ReactNode;
  onDragEnd: (event: DragEndEvent) => void;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      keyboardCodes: { start: ['Enter', 'Space'], end: ['Enter', 'Space'], cancel: ['Escape'] },
    }),
  );
  return (
    <DndContext sensors={sensors} onDragEnd={onDragEnd} collisionDetection={pointerWithin}>
      {children}
    </DndContext>
  );
}
