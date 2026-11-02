import { useEffect, useState } from 'react';
import type { WallpaperState } from '../types';

export function useWallpaperSrc(wallpaper: WallpaperState) {
  const [upload, setUpload] = useState<{ id: string; src: string | null }>({ id: '', src: null });

  useEffect(() => {
    if (wallpaper.kind !== 'upload' || !wallpaper.mediaId) return;
    const id = wallpaper.mediaId;
    let cancelled = false;
    let objectUrl: string | null = null;
    void import('../lib/mediaStore').then(({ getWallpaper }) => getWallpaper(id)).then((record) => {
      if (cancelled) return;
      if (record) objectUrl = URL.createObjectURL(record.blob);
      setUpload({ id, src: objectUrl });
    }).catch(() => {
      if (!cancelled) setUpload({ id, src: null });
    });
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [wallpaper.kind, wallpaper.mediaId]);

  if (wallpaper.kind === 'url' || wallpaper.kind === 'native') return wallpaper.url ?? null;
  return wallpaper.kind === 'upload' && upload.id === wallpaper.mediaId ? upload.src : null;
}
