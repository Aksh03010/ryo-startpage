import { useCallback, useRef, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { DragEndEvent } from '@dnd-kit/core';
import { DEFAULT_POSITIONS, GRID_STEP, WIDGET_IDS } from '../../constants';
import type { LayoutState, WidgetId } from '../../types';

/** Own the transition from the desktop grid to a freely positioned canvas. */
export function useDashboardLayout(
  layout: LayoutState,
  setLayout: Dispatch<SetStateAction<LayoutState>>,
  snapToGrid: boolean,
) {
  const [arrange, setArrange] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const toggleArrange = useCallback(() => {
    if (!arrange && containerRef.current?.dataset.layout === 'flow') {
      const container = containerRef.current.getBoundingClientRect();
      const positions = { ...layout };
      containerRef.current.querySelectorAll<HTMLElement>('[data-widget-id]').forEach((node) => {
        const id = node.dataset.widgetId as WidgetId;
        const rect = node.getBoundingClientRect();
        positions[id] = {
          x: container.width ? ((rect.left - container.left) / container.width) * 100 : 0,
          y: container.height ? ((rect.top - container.top) / container.height) * 100 : 0,
        };
      });
      setLayout(positions);
    }
    setArrange((value) => !value);
  }, [arrange, layout, setLayout]);

  const handleDragEnd = (event: DragEndEvent) => {
    const widgetId = (event.active.data.current as { widgetId?: string }).widgetId;
    if (!widgetId) return;
    const translated = event.active.rect.current.translated;
    const container = containerRef.current?.getBoundingClientRect();
    if (!translated || !container) return;

    const widgetWidth = translated.width;
    const widgetHeight = translated.height;
    let left = translated.left - container.left;
    let top = translated.top - container.top;

    if (snapToGrid) {
      left = Math.round(left / GRID_STEP) * GRID_STEP;
      top = Math.round(top / GRID_STEP) * GRID_STEP;
    } else {
      left = Math.round(left);
      top = Math.round(top);
    }

    left = Math.max(0, Math.min(left, container.width - widgetWidth));
    top = Math.max(0, Math.min(top, container.height - widgetHeight));
    if (!container.width || !container.height) return;

    setLayout((prev) => ({
      ...prev,
      [widgetId]: {
        x: Number(((left / container.width) * 100).toFixed(2)),
        y: Number(((top / container.height) * 100).toFixed(2)),
      },
    }));
  };

  const isDefaultLayout = WIDGET_IDS.every(
    (id) =>
      !layout[id] ||
      (layout[id].x === DEFAULT_POSITIONS[id].x && layout[id].y === DEFAULT_POSITIONS[id].y),
  );
  return { arrange, setArrange, containerRef, toggleArrange, handleDragEnd, isDefaultLayout };
}
