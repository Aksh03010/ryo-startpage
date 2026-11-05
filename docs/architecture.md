# Architecture

Ryo is a static Vite application using Preact's React compatibility layer. It has no application server.

## Ownership and settings flow

`src/main.tsx` mounts `App`. `App` composes the widgets, keyboard shortcuts, appearance variables, and lazy customization panel.

`features/settings/useStartpageState.ts` owns persisted tasks, links, reminders, layout, focus preferences, and settings. Components receive the values and typed update callbacks. `createSettingsActions` applies immutable section updates without replacing unrelated preferences.

The existing migrations are pure functions in `migrateSettings.ts`. They add missing widget slots and translate legacy glass settings while preserving explicit user choices. Only supported widget IDs are rendered, so older saves with experimental widgets remain usable. Complete validation and recovery for corrupt stored schemas remain a separate hardening task.

The settings UI consists of a dialog shell and four tab components. Draft wallpaper URLs and the selected widget belong to the shell so tab changes do not discard them. Shared controls each have their own component file.

## Persistence

`hooks/useLocalStorage.ts` reads saved JSON, supports the previous `aura.*` key prefix, and persists committed changes. Canonical keys live in `lib/storageKeys.ts`; the refactor preserves their exact existing values.

Uploaded media is stored as a Blob in IndexedDB through `features/wallpapers/mediaStore.ts`, including migration from the older database. `useWallpaperSource` creates an object URL only for the selected upload and revokes it when the selection changes or the component unmounts. URL sources resolve directly.

Focus state stores a deadline and updates persistent state when a session starts, pauses, resets, or finishes. Each visible tick is calculated locally rather than saved every second. Pure deadline calculations live in `lib/focus.ts`; reminder scheduling lives in `lib/reminders.ts`.

## Wallpaper composition

`features/wallpapers/BackgroundManager.tsx` composes the selected preset, image, or video with dimming, optional grain, and a vignette. The default celestial preset uses static CSS and SVG. The upload hook owns file acceptance, storage, and upload feedback.

The current model supports a single selected background. Wallpaper Engine integration and the system monitor are maintained on the [experimental branch](https://github.com/Aksh03010/ryo-startpage/tree/experimental).

## Layout and resource use

`App` uses mobile device hints to show a plain desktop-only notice without mounting widgets, storage owners, or background media. Window width is not a device signal, and desktop windows have no minimum width requirement. Device identification uses available browser hints and user-agent fallbacks, so browsers disguising their device can be misclassified. There are no alternate mobile layouts.

`features/layout/useDashboardLayout.ts` owns the desktop grid versus free-position layout, arrange mode, and drag completion. The page is bounded to the viewport, with overflow confined to widget content and settings panels. Drag coordinates are relative to the available dashboard. `WidgetShell` owns widget appearance. Drag context and draggable frames load only when arrange mode is enabled.

`lib/activity.ts` tracks page visibility. Clock/reminder ticks and video playback subscribe to that state. The clock's ticking state stays in its own component rather than rerendering `App`.

## Tests and delivery

The strict TypeScript project covers source and tests. Node's test runner uses `tests/register.mjs` to load TS/TSX with Preact aliases and CSS stubs. Shared Happy DOM setup is isolated in `tests/helpers/dom.ts`.

GitHub Actions checks formatting, lint, types, behavior tests, and the initial bundle budget before deploying `dist/` to GitHub Pages.
