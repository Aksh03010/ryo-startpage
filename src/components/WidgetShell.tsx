import { useEffect, useId } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { GripVertical } from 'lucide-react';
import styles from './WidgetShell.module.css';
import type { BoxMode } from '../types';

type WidgetShellProps = {
  id: string;
  label: string;
  position: { x: number; y: number };
  editMode: boolean;
  boxMode: BoxMode;
  opacity: number;
  radius: number;
  border?: boolean;
  shadow: boolean;
  glassBlur: number;
  zIndex?: number;
  onDraggingChange?: (dragging: boolean) => void;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
};

export default function WidgetShell({
  id,
  label,
  position,
  editMode,
  boxMode,
  opacity,
  radius,
  border,
  shadow,
  glassBlur,
  zIndex = 1,
  onDraggingChange,
  children,
  className = '',
  contentClassName = '',
}: WidgetShellProps) {
  const dragId = useId();
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: dragId,
    data: { widgetId: id },
    disabled: !editMode,
  });

  useEffect(() => {
    onDraggingChange?.(isDragging);
  }, [isDragging, onDraggingChange]);

  const glass = boxMode === 'glass';
  const bordered = border ?? true;
  const shellStyle = {
    left: `${position.x}%`,
    top: `${position.y}%`,
    zIndex: isDragging ? 40 : zIndex,
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    borderRadius: `${Math.max(0, Math.min(radius, 999))}px`,
    backdropFilter: glass ? `blur(${glassBlur}px)` : undefined,
    WebkitBackdropFilter: glass ? `blur(${glassBlur}px)` : undefined,
    boxShadow: shadow && boxMode !== 'none' ? '0 30px 90px -40px rgba(5, 10, 30, 0.75)' : undefined,
    borderColor: editMode && boxMode === 'none' ? undefined : border && boxMode !== 'none' ? undefined : 'transparent',
    '--box-alpha': Math.max(0, Math.min(100, opacity)) / 100,
  } as CSSProperties;

  return (
    <section
      id={`widget-${id}`}
      ref={setNodeRef}
      aria-label={label}
      data-widget-id={id}
      data-edit-mode={editMode ? 'true' : undefined}
      data-dragging={isDragging ? 'true' : undefined}
      data-border={bordered ? 'on' : undefined}
      className={`${styles.shell} ${glass ? styles.glass : boxMode === 'solid' ? styles.solid : styles.none} ${className}`}
      style={shellStyle}
    >
      <div
        className={`${styles.handle} ${editMode ? styles.handleVisible : ''}`}
        {...listeners}
        {...attributes}
        aria-label={`Reposition ${label}`}
        role="button"
        tabIndex={editMode ? 0 : -1}
        title={`Drag to move ${label}`}
      >
        <GripVertical size={15} strokeWidth={2.2} />
      </div>
      <div className={`${styles.body} ${contentClassName}`}>{children}</div>
    </section>
  );
}
