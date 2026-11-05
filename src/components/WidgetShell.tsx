import { lazy, Suspense } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import styles from './WidgetShell.module.css';
import type { BoxMode } from '../types';
import { useWidgetBounds } from '../features/layout/useWidgetBounds';

const DraggableFrame = lazy(() =>
  import('./DraggableFrame').then((module) => ({ default: module.DraggableFrame })),
);

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
  size: number;
  zIndex?: number;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
};

export function WidgetShell({
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
  size,
  zIndex = 1,
  children,
  className = '',
  contentClassName = '',
}: WidgetShellProps) {
  const glass = boxMode === 'glass';
  const bordered = border ?? true;
  const elementRef = useWidgetBounds(position, size, editMode);
  const left = Math.max(0, Math.min(100, position.x));
  const top = Math.max(0, Math.min(100, position.y));
  const shellStyle = {
    left: `${left}%`,
    top: `${top}%`,
    zIndex,
    borderRadius: `${Math.max(0, Math.min(radius, 999))}px`,
    backdropFilter: glass ? `blur(${glassBlur}px)` : undefined,
    WebkitBackdropFilter: glass ? `blur(${glassBlur}px)` : undefined,
    boxShadow: shadow && boxMode !== 'none' ? '0 12px 40px -24px rgba(0, 0, 0, 0.65)' : undefined,
    borderColor:
      editMode && boxMode === 'none'
        ? undefined
        : border && boxMode !== 'none'
          ? undefined
          : 'transparent',
    '--box-alpha': Math.max(0, Math.min(100, opacity)) / 100,
    zoom: Math.max(60, Math.min(140, size)) / 100,
  } as CSSProperties;

  const sectionProps = {
    id: `widget-${id}`,
    'aria-label': label,
    'data-widget-id': id,
    'data-edit-mode': editMode ? 'true' : undefined,
    'data-border': bordered ? 'on' : undefined,
    className: `${styles.shell} ${glass ? styles.glass : boxMode === 'solid' ? styles.solid : styles.none} ${className}`,
    style: shellStyle,
  };
  const body = <div className={`${styles.body} ${contentClassName}`}>{children}</div>;
  if (editMode)
    return (
      <Suspense
        fallback={
          <section {...sectionProps} ref={elementRef}>
            {body}
          </section>
        }
      >
        <DraggableFrame {...sectionProps} elementRef={elementRef} widgetId={id} label={label}>
          {body}
        </DraggableFrame>
      </Suspense>
    );
  return (
    <section {...sectionProps} ref={elementRef}>
      {body}
    </section>
  );
}
