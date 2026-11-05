import { useCallback, useRef } from 'react';
import type { WidgetPosition } from '../../types';

/** Keep a free-positioned widget inside the canvas without shrinking it at the edges. */
export function useWidgetBounds(position: WidgetPosition, size: number, editMode: boolean) {
  const cleanup = useRef<(() => void) | null>(null);
  return useCallback(
    (element: HTMLElement | null) => {
      cleanup.current?.();
      cleanup.current = null;
      const canvas = element?.closest('main');
      if (!element || !canvas) return;
      const fit = () => {
        if (!editMode && canvas.dataset.layout !== 'free') {
          for (const name of ['left', 'top', 'max-width', 'max-height'])
            element.style.removeProperty(name);
          return;
        }
        const bounds = canvas.getBoundingClientRect();
        if (!bounds.width || !bounds.height) return;
        const zoom = Math.max(60, Math.min(140, size)) / 100;
        element.style.maxWidth = `${bounds.width / zoom}px`;
        element.style.maxHeight = `${bounds.height / zoom}px`;
        const rect = element.getBoundingClientRect();
        const left = Math.max(
          0,
          Math.min((position.x / 100) * bounds.width, bounds.width - rect.width),
        );
        const top = Math.max(
          0,
          Math.min((position.y / 100) * bounds.height, bounds.height - rect.height),
        );
        element.style.left = `${left / zoom}px`;
        element.style.top = `${top / zoom}px`;
      };
      fit();
      const observer = new ResizeObserver(fit);
      observer.observe(canvas);
      observer.observe(element);
      cleanup.current = () => observer.disconnect();
    },
    [position.x, position.y, size, editMode],
  );
}
