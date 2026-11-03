import { useCallback, useState } from 'react';
import type { WallpaperState } from '../../types';
import type { UpdateSettings } from '../settings/types';

export function useWallpaperUpload(wallpaper: WallpaperState, onSettings: UpdateSettings) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const upload = useCallback(
    async (file: File) => {
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
        const previous = wallpaper;
        if (previous.kind === 'upload' && previous.mediaId && previous.mediaId !== record.id) {
          void deleteWallpaper(previous.mediaId).catch((error) =>
            console.error('Unable to remove the previous wallpaper', error),
          );
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
        setUploadError('Unable to store this wallpaper locally. Try a smaller file.');
        console.error(error);
      } finally {
        setUploading(false);
      }
    },
    [onSettings, wallpaper],
  );

  return { upload, uploading, uploadError };
}
