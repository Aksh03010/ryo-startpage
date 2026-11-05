import { useEffect, useState } from 'react';
import type { WallpaperState } from '../../types';

export function useWallpaperSource(wallpaper: WallpaperState) {
  const [upload, setUpload] = useState<{ id: string; src: string | null; failed: boolean }>({
    id: '',
    src: null,
    failed: false,
  });

  useEffect(() => {
    if (wallpaper.kind !== 'upload' || !wallpaper.mediaId) return;
    const id = wallpaper.mediaId;
    let cancelled = false;
    let objectUrl: string | null = null;
    void import('./mediaStore')
      .then(({ getWallpaper }) => getWallpaper(id))
      .then((record) => {
        if (cancelled) return;
        if (record) objectUrl = URL.createObjectURL(record.blob);
        setUpload({ id, src: objectUrl, failed: !record });
      })
      .catch(() => {
        if (!cancelled) setUpload({ id, src: null, failed: true });
      });
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [wallpaper.kind, wallpaper.mediaId]);

  if (wallpaper.kind === 'url') return { src: wallpaper.url ?? null, failed: !wallpaper.url };
  const current = wallpaper.kind === 'upload' && upload.id === wallpaper.mediaId;
  return {
    src: current ? upload.src : null,
    failed: wallpaper.kind === 'upload' && (!wallpaper.mediaId || (current && upload.failed)),
  };
}
