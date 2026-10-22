import { useEffect, useRef } from 'react';
import { PRESETS } from '../constants';
import type { BackgroundSettings } from '../types';
import { useWallpaperSrc } from '../hooks/useWallpaperSrc';
import styles from './BackgroundManager.module.css';

export function BackgroundManager({ background }: { background: BackgroundSettings }) {
  const { wallpaper } = background;
  const preset = PRESETS.find((item) => item.id === wallpaper.preset) ?? PRESETS[0];
  const src = useWallpaperSrc(wallpaper);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaFilter = `brightness(${background.brightness}%) saturate(${background.saturation}%) blur(${background.blur}px)`;
  const scaleWithBlur = 1.06 + background.blur / 140;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = background.videoPlaybackRate;
    if (background.videoPaused) {
      video.pause();
    } else {
      void video.play().catch(() => undefined);
    }
  }, [background.videoPlaybackRate, background.videoPaused, src]);

  const isPresetKind = wallpaper.kind === 'preset';
  const presetImage = preset.id !== 'aurora' && preset.src ? preset.src : undefined;
  const showCustomMedia =
    !isPresetKind && src && (wallpaper.kind === 'url' || wallpaper.kind === 'upload');

  return (
    <div className={styles.scene} aria-hidden>
      {isPresetKind && !presetImage && (
        <div className={styles.dynamicWallpaper}>
          <span className={`${styles.orb} ${styles.orbBlue}`} />
          <span className={`${styles.orb} ${styles.orbGreen}`} />
          <span className={`${styles.orb} ${styles.orbViolet}`} />
          <span className={styles.auroraBand} />
        </div>
      )}

      {isPresetKind && presetImage && (
        <img
          src={presetImage}
          alt=""
          className={styles.wallpaperMedia}
          style={{ filter: mediaFilter, transform: `scale(${scaleWithBlur})` }}
          draggable={false}
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
          preload="auto"
        />
      )}

      {showCustomMedia && wallpaper.mediaType === 'image' && (
        <img
          src={src}
          alt=""
          className={styles.wallpaperMedia}
          style={{ filter: mediaFilter, transform: `scale(${scaleWithBlur})` }}
          draggable={false}
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

export default BackgroundManager;