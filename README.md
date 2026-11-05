# Ryo - Home

Ryo - Home is a customizable start page for desktop browsers. It brings your clock, search, quick links, tasks, reminders, focus timer, and wallpaper together on one page. Mobile devices show a desktop-only notice; desktop windows have no minimum width requirement. The desktop page fits the viewport; long lists and settings scroll within their own panels.

**Open the live page:** <https://aksh03010.github.io/ryo-startpage/>

## Get started

Open the live page above, then use the customize icon in the top corner to choose a wallpaper, adjust the widget styles, and show or hide widgets. Add your own links in the Quick links widget. Press `Ctrl + ,` to open Customize and `Esc` to close it.

You can use the page in any modern desktop browser. To make it your home page, copy the live page address into the browser's home page settings.

### Google Chrome

1. Open **Settings > Appearance** and turn on **Show home button**.
2. Choose **Enter custom web address** and paste the live page address.

This sets the Home button. To replace Chrome's New Tab page, you will need a new-tab extension; Chrome's standard settings do not provide a custom New Tab URL. See [Google's homepage and startup page instructions](https://support.google.com/chrome/answer/95314).

### Mozilla Firefox

1. Open **Settings > Home**.
2. Beside **Homepage and new windows**, choose **Custom URLs…** and paste the live page address.

Firefox's regular **New tabs** setting offers Firefox Home or a blank page. To use Ryo - Home for every new tab, install a new-tab extension and set its page to the live page address. See [Mozilla's home page instructions](https://support.mozilla.org/en-US/kb/how-to-set-the-home-page).

### Other browsers

The site works as a regular web page in current desktop versions of **Microsoft Edge, Brave, Safari, Opera, Vivaldi, and Helium**, as well as Chrome and Firefox. Set it as the home page in that browser's settings. New-tab replacement options vary by browser; some require an extension. In Helium, you can enable its custom new-tab page option at `helium://flags/#custom-ntp` (if the option is available in your version) and enter the live page address.

Your settings, links, tasks, and reminders are saved in that browser on that device. Uploaded wallpapers are stored on that device too. Browser data is not automatically shared between devices.

## Features

- Built-in wallpaper scenes, plus image and video uploads or a wallpaper URL.
- Clock with 12/24-hour time, date, greeting, font, and animation settings.
- Search with Google, DuckDuckGo, Brave, and YouTube.
- Quick links, repeating tasks, reminders, and a focus timer.
- Draggable widgets, appearance controls, and keyboard shortcuts.
- Local-first storage: settings and lists use `localStorage`; uploaded wallpapers use IndexedDB.

## Choose your space

Open Customize and choose **Minimal** (clock and search), **Everyday** (adds quick links), or **Workspace** (adds tasks, focus, and reminders). You can still toggle and style every widget individually. Presets preserve your wallpaper and styling and return to the desktop grid.

Press `/` to focus search, `Ctrl + ,` to customize, and `Esc` to close the panel or finish arranging. Focus and Rest modes have independent durations. Running timers use deadlines, so they catch up after a sleeping or hidden tab.

## Experimental integrations

Wallpaper Engine support and the local system monitor live on the [experimental branch](https://github.com/Aksh03010/ryo-startpage/tree/experimental). They are excluded from `main` and the live site. Regular image/video wallpaper uploads and direct wallpaper URLs remain available here. See that branch’s README for setup and testing.

## Performance and architecture

Ryo uses **Vite + TypeScript + Preact**, with Preact's React compatibility layer for existing components, icons, and drag support. There is no server framework or background render loop.

- Each optional widget is a separate lazy-loaded module. Disabled widgets do not mount or download their code/styles. Customize, drag support, and IndexedDB media code load when needed.
- The default celestial background uses static SVG and CSS. Default widgets use solid surfaces without backdrop blur. Fonts use local system fallbacks, removing blocking font requests.
- Clock/reminder updates and wallpaper video playback stop while hidden.
- Focus timers persist start/pause/reset/completion changes instead of saving every second.

The original core JavaScript was approximately **103 KB gzip**; the new core is approximately **22 KB gzip**. Visible optional widgets add their own small chunks. These are build payload measurements, not an FPS or CPU benchmark. `npm run check:bundle` checks the current core JS/CSS budget. CI runs behavior tests and the bundle check before deploying.

## Project structure

```text
src/
  App.tsx                Page composition and widget rendering
  components/            Widgets, layout shells, and shared UI controls
  features/
    layout/              Arrange mode and persisted widget positions
    settings/            Settings ownership, migrations, and four UI tabs
    wallpapers/          Background rendering, uploads, media storage
  hooks/                 Shared storage, clock, and media-query hooks
  lib/                   Pure scheduling/search helpers and persisted key names
  types.ts               Shared application data contracts
  index.css              Global styles; components retain colocated CSS modules
tests/                   Behavior tests, DOM setup, and the TS/TSX loader
scripts/                 Bundle checks
```

Settings flow from `useStartpageState` to widgets and the settings tabs through typed update callbacks. Lists/settings use localStorage, and uploaded media uses IndexedDB. Clock ticks remain local to the clock component. The wallpaper renderer layers the selected media, dimming, grain, and vignette.

Read the [architecture guide](docs/architecture.md) for ownership and lifecycle details and [contributing guide](CONTRIBUTING.md) for coding, testing, and license rules. Application modules use named exports; optional features retain lazy imports.

## Run it on your computer

Requirements: Node.js 24+ (also used by the tests and CI).

```sh
git clone https://github.com/Aksh03010/ryo-startpage.git
cd ryo-startpage
npm ci
npm run dev
```

Open the local address printed by Vite, usually <http://localhost:5173>.

Useful commands:

```sh
npm run build    # type-check and create a production build in dist/
npm run preview  # preview the production build locally
npm run lint     # lint source, tests, and scripts with no warnings
npm run typecheck # strictly check source, config, and tests
npm run format:check # verify formatting
npm run format   # apply formatting
npm test         # test Preact interactions, timers, and presets
npm run check:bundle    # enforce a 40 KiB gzip budget for core JS + CSS
```

## Host your own copy

You can fork this repository and publish your copy with GitHub Pages. In your repository, open **Settings > Pages** and choose **GitHub Actions** as the build and deployment source. The included workflow deploys the site whenever you push to `main`.

The current build is configured for the repository path `/ryo-startpage/` in `vite.config.ts`. If you rename your fork or publish it under a different path, update Vite's `base` setting to match the path where the site will be hosted. For a domain hosted at the root, use `/`.

## License

MIT. See [LICENSE](LICENSE).
