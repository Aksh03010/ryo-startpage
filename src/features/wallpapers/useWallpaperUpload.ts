import { useCallback, useEffect, useRef, useState } from 'react';
import type { WallpaperState } from '../../types';
import type { UpdateSettings } from '../settings/types';
import { STORAGE_KEYS } from '../../lib/storageKeys';

export function useWallpaperUpload(wallpaper: WallpaperState, onSettings: UpdateSettings) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const pendingCleanup = useRef<{ oldId: string; newId: string } | null>(null);
  const requestId = useRef(0);
  useEffect(
    () => () => {
      requestId.current++;
    },
    [],
  );
  useEffect(() => {
    const pending = pendingCleanup.current;
    if (!pending || wallpaper.mediaId !== pending.newId) return;
    try {
      const persisted = JSON.parse(
        window.localStorage.getItem(STORAGE_KEYS.settings) ?? 'null',
      ) as { background?: { wallpaper?: { mediaId?: string } } } | null;
      if (persisted?.background?.wallpaper?.mediaId !== pending.newId) return;
      pendingCleanup.current = null;
      void import('./mediaStore')
        .then(({ deleteWallpaper }) => deleteWallpaper(pending.oldId))
        .catch(console.error);
    } catch {
      /* Keep the previous file whenever persistence cannot be confirmed. */
    }
  }, [wallpaper]);
  const upload = useCallback(
    async (file: File) => {
      const request = ++requestId.current;
      setUploading(true);
      setUploadError(null);
      try {
        if (
          ![
            'image/png',
            'image/jpeg',
            'image/webp',
            'image/gif',
            'image/avif',
            'video/mp4',
            'video/webm',
            'video/ogg',
          ].includes(file.type)
        ) {
          setUploadError('Use PNG, JPG, WebP, GIF, AVIF, MP4, WebM or OGV files.');
          return;
        }
        if (file.size > 180 * 1024 * 1024) {
          setUploadError('Media that large may still work, but try a smaller file first.');
          return;
        }
        const { deleteWallpaper, saveWallpaper } = await import('./mediaStore');
        const record = await saveWallpaper(file);
        if (request !== requestId.current) {
          void deleteWallpaper(record.id).catch(console.error);
          return;
        }
        const previous = wallpaper;
        if (previous.kind === 'upload' && previous.mediaId && previous.mediaId !== record.id) {
          pendingCleanup.current = { oldId: previous.mediaId, newId: record.id };
        }
        onSettings((draft) => ({
          ...draft,
          background: {
            ...draft.background,
            videoPaused: false,
            wallpaper: {
              kind: 'upload',
              preset: draft.background.wallpaper.preset,
              mediaId: record.id,
              mediaType: file.type.startsWith('video/') ? 'video' : 'image',
              name: file.name,
            },
          },
        }));
      } catch (error) {
        if (request === requestId.current)
          setUploadError('Unable to store this wallpaper locally. Try a smaller file.');
        console.error(error);
      } finally {
        if (request === requestId.current) setUploading(false);
      }
    },
    [onSettings, wallpaper],
  );

  return { upload, uploading, uploadError };
}
