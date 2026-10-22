import { useEffect, useState } from 'react';
import type { WallpaperState } from '../types';
import { getWallpaper } from '../lib/mediaStore';

const REMOTE_RE = /^https?:\/\//i;

export function videoRemoteSrc(wallpaper: WallpaperState) {
  if (!wallpaper.url || !REMOTE_RE.test(wallpaper.url)) return undefined;
  return wallpaper.url;
}

export function useWallpaperSrc(wallpaper: WallpaperState) {
  const [src, setSrc] = useState<string | null>(() => {
    if (wallpaper.kind === 'upload' || !wallpaper.mediaId) return null;
    return wallpaper.url ?? null;
  });

  useEffect(() => {
    let cancelled = false;
    let objectUrl: string | null = null;

    if (wallpaper.kind === 'upload' && wallpaper.mediaId) {
      void getWallpaper(wallpaper.mediaId).then((record) => {
        if (cancelled) return;
        if (record) {
          objectUrl = URL.createObjectURL(record.blob);
          setSrc(objectUrl);
        } else {
          setSrc(null);
        }
      });
    } else if (wallpaper.kind === 'url' && wallpaper.url) {
      const url = wallpaper.url;
      // Queue this update off the sync path so effects stay side-effect-opt-in.
      window.setTimeout(() => {
        if (cancelled) return;
        setSrc(url);
      }, 0);
    } else if (!cancelled) {
      window.setTimeout(() => {
        if (cancelled) return;
        setSrc(null);
      }, 0);
    }

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [wallpaper.kind, wallpaper.mediaId, wallpaper.url]);

  return src;
}
