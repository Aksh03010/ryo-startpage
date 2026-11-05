import { useCallback, useId } from 'react';
import type { CSSProperties, HTMLAttributes } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { GripVertical } from 'lucide-react';
import styles from './WidgetShell.module.css';

export function DraggableFrame({
  widgetId,
  label,
  children,
  style,
  elementRef,
  ...props
}: HTMLAttributes<HTMLElement> & {
  widgetId: string;
  label: string;
  elementRef: (element: HTMLElement | null) => void;
}) {
  const id = useId();
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
    data: { widgetId },
  });
  const setRefs = useCallback(
    (element: HTMLElement | null) => {
      setNodeRef(element);
      elementRef(element);
    },
    [setNodeRef, elementRef],
  );
  const dragStyle: CSSProperties = {
    ...style,
    zIndex: isDragging ? 40 : style?.zIndex,
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
  };
  return (
    <section {...props} ref={setRefs} style={dragStyle} data-dragging={isDragging || undefined}>
      <button
        type="button"
        className={`${styles.handle} ${styles.handleVisible}`}
        {...listeners}
        {...attributes}
        aria-label={`Reposition ${label}`}
        title={`Drag to move ${label}`}
      >
        <GripVertical size={15} />
      </button>
      {children}
    </section>
  );
}
