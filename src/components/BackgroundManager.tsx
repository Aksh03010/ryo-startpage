import { memo, useEffect, useRef } from 'react';
import { isPageActive, subscribeActivity } from '../lib/activity';
import { PRESETS } from '../constants';
import type { BackgroundSettings } from '../types';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { useWallpaperSrc } from '../hooks/useWallpaperSrc';
import styles from './BackgroundManager.module.css';

export function BackgroundManager({ background, reduceMotion = false }: { background: BackgroundSettings; reduceMotion?: boolean }) {
  const { wallpaper } = background;
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const preset = PRESETS.find((item) => item.id === wallpaper.preset) ?? PRESETS[0];
  const src = useWallpaperSrc(wallpaper);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaFilter = background.brightness === 100 && background.saturation === 100 && background.blur === 0 ? undefined : `brightness(${background.brightness}%) saturate(${background.saturation}%) blur(${background.blur}px)`;
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
    return subscribeActivity(syncPlayback);
  }, [background.videoPlaybackRate, background.videoPaused, reduceMotion, prefersReducedMotion, src]);

  const isPresetKind = wallpaper.kind === 'preset';
  const presetImage = preset.id !== 'aurora' && preset.src ? preset.src : undefined;
  const showCustomMedia =
    !isPresetKind && src && (wallpaper.kind === 'url' || wallpaper.kind === 'upload' || wallpaper.kind === 'native');

  return (
    <div className={styles.scene} aria-hidden>
      {isPresetKind && !presetImage && (
        <div className={styles.dynamicWallpaper} style={{ filter: mediaFilter }}>
          <div className={styles.stars} />
          <svg className={styles.constellation} viewBox="0 0 500 400" fill="none">
            <path d="m52 260 98-98 108 43 72-121 95 37M150 162l35-90 145 12" stroke="currentColor" strokeWidth=".6" />
            {[ [52,260], [150,162], [258,205], [330,84], [425,121], [185,72] ].map(([cx,cy]) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="2" fill="currentColor" />)}
          </svg>
        </div>
      )}

      {isPresetKind && presetImage && (
        <img
          src={presetImage}
          alt=""
          className={styles.wallpaperMedia}
          style={{ filter: mediaFilter, transform: `scale(${scaleWithBlur})` }}
          draggable={false}
          decoding="async"
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
        />
      )}

      <div
        className={styles.dim}
        style={{ background: `rgba(4, 7, 14, ${background.dim / 100})` }}
      />
      {background.grain && <div className={styles.grain} />}
      <div className={styles.vignette} />
    </div>
  );
}

export default memo(BackgroundManager);
