# Architecture

Ryo is a static Vite application using Preact's React compatibility layer. It has no application server. The optional Python monitor is a separate, user-run service for read-only Windows metrics.

## Ownership and settings flow

`src/main.tsx` registers the Wallpaper Engine bridge before mounting `App`. `App` composes the widgets, keyboard shortcuts, appearance variables, and lazy customization panel.

`features/settings/useStartpageState.ts` owns persisted tasks, links, reminders, layout, focus preferences, and settings. Components receive the values and typed update callbacks. `createSettingsActions` applies immutable section updates without replacing unrelated preferences.

The existing migrations are pure functions in `migrateSettings.ts`. They add missing widget slots, translate legacy glass settings, and fill missing monitor switches while preserving explicit user choices. They retain the previous migration behavior. Complete validation and recovery for corrupt stored schemas remain a separate hardening task.

The settings UI consists of a dialog shell and four tab components. Draft wallpaper URLs and the selected widget belong to the shell so tab changes do not discard them. Shared controls each have their own component file.

## Persistence

`hooks/useLocalStorage.ts` reads saved JSON, supports the previous `aura.*` key prefix, and persists committed changes. Canonical keys live in `lib/storageKeys.ts`; the refactor preserves their exact existing values.

Uploaded media is stored as a Blob in IndexedDB through `features/wallpapers/mediaStore.ts`, including migration from the older database. `useWallpaperSource` creates an object URL only for the selected upload and revokes it when the selection changes or the component unmounts. URL and native sources resolve directly.

Focus state stores a deadline and updates persistent state when a session starts, pauses, resets, or finishes. Each visible tick is calculated locally rather than saved every second. Pure deadline calculations live in `lib/focus.ts`; reminder scheduling lives in `lib/reminders.ts`.

## Wallpaper composition

`features/wallpapers/BackgroundManager.tsx` composes the selected preset, image, or video with dimming, optional grain, and a vignette. The default celestial preset uses static CSS and SVG. The upload hook owns file acceptance, storage, and upload feedback.

`wallpaperEngine.ts` registers native property and pause callbacks at module scope. It keeps native overrides in memory; `useWallpaperEngine` merges them with saved settings. Native file URLs are supplied by the host callback, while normal browser URL inputs accept HTTP(S) sources.

The current model supports a single selected background. Wallpaper Engine project discovery, directory permissions, playlists, preview fallback, and crossfades are not implemented by this structural refactor. The README documents the existing browser and native workflows.

## Layout and resource use

`features/layout/useDashboardLayout.ts` owns responsive-flow versus free-position layout, arrange mode, and drag completion. `WidgetShell` owns widget appearance. Drag context and draggable frames load only when arrange mode is enabled.

`lib/activity.ts` combines page visibility with Wallpaper Engine's host pause state. Clock/reminder ticks, monitor polling, and video playback subscribe to that state. The clock's ticking state stays in its own component rather than rerendering `App`.

Monitoring lives in `features/monitor/`: the polling hook handles timeouts, aborts, and retry backoff, while metric cards and sparklines render snapshots. Monitoring remains disabled by default. The existing helper's localhost binding and trusted-origin checks are unchanged.

## Tests and delivery

The strict TypeScript project covers source and tests. Node's test runner uses `tests/register.mjs` to load TS/TSX with Preact aliases and CSS stubs. Shared Happy DOM setup is isolated in `tests/helpers/dom.ts`.

GitHub Actions checks formatting, lint, types, behavior tests, and the initial bundle budget before deploying `dist/` to GitHub Pages. `npm run build:wallpaper` creates a separate `dist-wallpaper/` with relative paths and Wallpaper Engine project metadata.
