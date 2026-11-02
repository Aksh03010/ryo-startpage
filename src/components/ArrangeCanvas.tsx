import { useId } from 'react';
import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import { DndContext, KeyboardSensor, PointerSensor, pointerWithin, useDraggable, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { GripVertical } from 'lucide-react';
import styles from './WidgetShell.module.css';

export default function ArrangeCanvas({ children, onDragEnd }: { children: ReactNode; onDragEnd: (event: DragEndEvent) => void }) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { keyboardCodes: { start: ['Enter', 'Space'], end: ['Enter', 'Space'], cancel: ['Escape'] } }),
  );
  return <DndContext sensors={sensors} onDragEnd={onDragEnd} collisionDetection={pointerWithin}>{children}</DndContext>;
}

export function DraggableFrame({ widgetId, label, children, style, ...props }: HTMLAttributes<HTMLElement> & { widgetId: string; label: string }) {
  const id = useId();
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id, data: { widgetId } });
  const dragStyle: CSSProperties = { ...style, zIndex: isDragging ? 40 : style?.zIndex, transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined };
  return (
    <section {...props} ref={setNodeRef} style={dragStyle} data-dragging={isDragging || undefined}>
      <button type="button" className={`${styles.handle} ${styles.handleVisible}`} {...listeners} {...attributes} aria-label={`Reposition ${label}`} title={`Drag to move ${label}`}><GripVertical size={15} /></button>
      {children}
    </section>
  );
}
