import { memo, useEffect, useRef, useState } from 'react';
import { isPageActive, subscribeActivity } from '../../lib/activity';
import { PRESETS } from '../../constants';
import type { BackgroundSettings } from '../../types';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { useWallpaperSource } from './useWallpaperSource';
import styles from './BackgroundManager.module.css';

function BackgroundManagerView({
  background,
  reduceMotion = false,
}: {
  background: BackgroundSettings;
  reduceMotion?: boolean;
}) {
  const { wallpaper } = background;
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const preset = PRESETS.find((item) => item.id === wallpaper.preset) ?? PRESETS[0];
  const { src, failed: sourceFailed } = useWallpaperSource(wallpaper);
  const [failure, setFailure] = useState<{
    selection: BackgroundSettings['wallpaper'];
    src: string;
  } | null>(null);
  const failedSource = failure?.selection === wallpaper ? failure.src : null;
  const setFailedSource = (src: string) => setFailure({ selection: wallpaper, src });
  const failed = sourceFailed || (src !== null && failedSource === src);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaFilter =
    background.brightness === 100 && background.saturation === 100 && background.blur === 0
      ? undefined
      : `brightness(${background.brightness}%) saturate(${background.saturation}%) blur(${background.blur}px)`;
  const scaleWithBlur = background.blur > 0 ? 1.02 + background.blur / 140 : 1;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = background.videoPlaybackRate;
    const syncPlayback = () => {
      if (background.videoPaused || reduceMotion || prefersReducedMotion || !isPageActive()) {
        video.pause();
        return;
      }
      void video.play().catch(() => undefined);
    };
    syncPlayback();
    const unsubscribe = subscribeActivity(syncPlayback);
    return () => {
      unsubscribe();
      video.pause();
    };
  }, [
    background.videoPlaybackRate,
    background.videoPaused,
    reduceMotion,
    prefersReducedMotion,
    src,
    failed,
  ]);

  const isPresetKind = wallpaper.kind === 'preset' || failed || !src;
  const presetImage = preset.id !== 'aurora' && preset.src ? preset.src : undefined;
  const showCustomMedia =
    !failed && src && (wallpaper.kind === 'url' || wallpaper.kind === 'upload');

  return (
    <>
      <div className={styles.scene} aria-hidden>
        {isPresetKind && (!presetImage || failedSource === presetImage) && (
          <div className={styles.dynamicWallpaper} style={{ filter: mediaFilter }}>
            <div className={styles.stars} />
            <svg className={styles.constellation} viewBox="0 0 500 400" fill="none">
              <path
                d="m52 260 98-98 108 43 72-121 95 37M150 162l35-90 145 12"
                stroke="currentColor"
                strokeWidth=".6"
              />
              {[
                [52, 260],
                [150, 162],
                [258, 205],
                [330, 84],
                [425, 121],
                [185, 72],
              ].map(([cx, cy]) => (
                <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="2" fill="currentColor" />
              ))}
            </svg>
          </div>
        )}

        {isPresetKind && presetImage && failedSource !== presetImage && (
          <img
            src={presetImage}
            alt=""
            className={styles.wallpaperMedia}
            style={{ filter: mediaFilter, transform: `scale(${scaleWithBlur})` }}
            draggable={false}
            decoding="async"
            onError={() => setFailedSource(presetImage)}
          />
        )}

        {showCustomMedia && wallpaper.mediaType === 'video' && (
          <video
            ref={videoRef}
            src={src}
            className={styles.wallpaperMedia}
            style={{ filter: mediaFilter, transform: `scale(${scaleWithBlur})` }}
            autoPlay
            muted
            loop={background.videoLoop}
            playsInline
            preload="metadata"
            onError={() => setFailedSource(src)}
          />
        )}

        {showCustomMedia && wallpaper.mediaType !== 'video' && (
          <img
            src={src}
            alt=""
            className={styles.wallpaperMedia}
            style={{ filter: mediaFilter, transform: `scale(${scaleWithBlur})` }}
            draggable={false}
            decoding="async"
            onError={() => setFailedSource(src)}
          />
        )}

        <div
          className={styles.dim}
          style={{ background: `rgba(4, 7, 14, ${background.dim / 100})` }}
        />
        {background.grain && <div className={styles.grain} />}
        <div className={styles.vignette} />
      </div>
      {failed && (
        <p className={styles.mediaError} role="status">
          This wallpaper couldn’t load. Showing your preset instead.
        </p>
      )}
    </>
  );
}

export const BackgroundManager = memo(BackgroundManagerView);
