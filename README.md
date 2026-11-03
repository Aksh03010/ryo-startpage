# Ryo - Home

Ryo - Home is a customizable start page for your browser. It brings your clock, search, quick links, tasks, reminders, focus timer, and wallpaper together on one page.

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

## Local system monitor (optional)

The System monitor widget is off by default. It reads sensor data only while the widget is enabled and the local helper is running. The helper supports Windows CPU and RAM usage and browser process CPU use. MSI Afterburner is needed for GPU and temperature sensors; those readings appear only when Afterburner exposes them.

You do not need to download or clone the Ryo - Home source code to use this feature.

1. Install Python 3.10 or newer for Windows. Install [MSI Afterburner](https://www.msi.com/Landing/afterburner/graphics-cards) too if you want GPU or temperature readings.
2. For Afterburner readings, open Afterburner and go to **Settings > Monitoring**. Enable the GPU usage and temperature sensors you want to see. Enable CPU temperature too if it is available on your system. The monitor can display up to two GPUs.
3. [Download the Windows monitor launcher](https://github.com/Aksh03010/ryo-startpage/raw/refs/heads/main/monitor/Start-RyoMonitor.bat), then double-click the downloaded `Start-RyoMonitor.bat` file. The launcher downloads the helper to `%LOCALAPPDATA%\RyoHome\Monitor` and starts it. A terminal window should say `Ryo Monitor listening on http://127.0.0.1:8765`. Keep that window open while using the widget.
4. In Ryo - Home, open **Customize > Widgets > System monitor**, turn on **Show on page**, and choose **Computer** or **Browser** in the widget. If your browser asks to allow the page to access devices on your local network, allow it so the page can reach the monitor on this computer.

The launcher needs an internet connection the first time it runs. It requires the Python Launcher (`py`), installed with Python for Windows, and `curl.exe` (included with Windows 10 and newer). If the launcher says `Python 3 is required`, install Python from [python.org](https://www.python.org/downloads/windows/) and run it again. If it says another monitor is already using the port, close any other Ryo Monitor terminal windows first. The **Browser** view and CPU usage do not need Afterburner; GPU or temperature readings can be unavailable when Afterburner is closed or a sensor is not enabled. To inspect the helper before running it, [view its source](https://github.com/Aksh03010/ryo-startpage/blob/main/monitor/ryo_monitor.py).

The helper listens only on this computer (`127.0.0.1`) and allows requests from the Ryo - Home site and local development page. It does not change hardware settings. Customize > Widgets > System monitor lets you independently show or hide CPU, GPU 1, GPU 2, and RAM. RAM usage is available directly from Windows; GPU usage and temperatures depend on the sensors enabled in Afterburner. Missing temperature sensors are shown as unavailable.

## Features

- Built-in wallpaper scenes, plus image and video uploads or a wallpaper URL.
- Clock with 12/24-hour time, date, greeting, font, and animation settings.
- Search with Google, DuckDuckGo, Brave, and YouTube.
- Quick links, repeating tasks, reminders, and a focus timer.
- Draggable widgets, appearance controls, and keyboard shortcuts.
- Local-first storage: settings and lists use `localStorage`; uploaded wallpapers use IndexedDB.

## Choose your space

Open Customize and choose **Minimal** (clock and search), **Everyday** (adds quick links), or **Workspace** (adds tasks, focus, and reminders). You can still toggle and style every widget individually. Presets preserve your wallpaper and styling and return to the responsive layout. System monitoring stays opt-in.

Press `/` to focus search, `Ctrl + ,` to customize, and `Esc` to close the panel or finish arranging. Focus and Rest modes have independent durations. Running timers use deadlines, so they catch up after a sleeping or hidden tab.

## Wallpaper Engine

### Use a Wallpaper Engine video as your startpage background

Right-click an installed **video** wallpaper in Wallpaper Engine and choose **Open in Explorer**. Upload its MP4 or WebM file through Ryo's **Customize > Background > Upload image / video**. Images, GIFs, AVIF, and OGV are supported too. Uploads stay in the browser's local IndexedDB. Direct image/video URLs also work.

A scene wallpaper's `.pkg` file is not a browser-playable video. To reuse a scene here, record it as a video first. See Wallpaper Engine's [file guide](https://help.wallpaperengine.io/en/functionality/editingwallpapers.html) and [scene export explanation](https://help.wallpaperengine.io/en/functionality/export.html).

### Run Ryo inside Wallpaper Engine

```sh
npm ci
npm run build:wallpaper
```

Import **dist-wallpaper/index.html** through Wallpaper Engine's **Create Wallpaper** button. Keep its `assets/`, `wallpapers/`, and `project.json` together; import the generated folder rather than the source repository. The build uses relative asset paths and includes its own fonts through system font fallbacks, so it needs no font CDN.

Wallpaper Engine's panel exposes accent color, Minimal mode, individual widget switches, reduced motion, an image picker, and a video picker. A selected video takes precedence over the selected image; clear the video to return to the image. Use **WebM** for video inside Wallpaper Engine. Browser playback supports MP4 as well.

The native adapter uses the documented [user properties](https://docs.wallpaperengine.io/en/web/customization/properties.html) and [pause callback](https://docs.wallpaperengine.io/en/web/api/propertylistener.html). Native overrides remain in memory and do not rewrite saved browser preferences. Pausing the host stops clock updates, monitor polling, and video playback. Local system monitoring is intended for browser mode: the optional helper retains its existing trusted-origin restrictions and rejects file-based origins.

The generated package and adapter are covered by build and DOM tests. Playback inside the installed Wallpaper Engine application still requires manual verification. This integration does not mirror another desktop wallpaper live into a normal browser tab.

## Performance and architecture

Ryo uses **Vite + TypeScript + Preact**, with Preact's React compatibility layer for existing components, icons, and drag support. There is no server framework or background render loop.

- Each optional widget is a separate lazy-loaded module. Disabled widgets do not mount or download their code/styles. Customize, drag support, and IndexedDB media code load when needed.
- The default celestial background uses static SVG and CSS. Default widgets use solid surfaces without backdrop blur. Fonts use local system fallbacks, removing blocking font requests.
- Clock/reminder updates and monitor polling stop while hidden. Monitoring aborts in-flight requests, times out after four seconds, and backs off to 30 seconds if the helper is offline.
- Focus timers persist start/pause/reset/completion changes instead of saving every second.

The original core JavaScript was approximately **103 KB gzip**; the new core is approximately **22 KB gzip**. Visible optional widgets add their own small chunks. These are build payload measurements, not an FPS or CPU benchmark. `npm run check:bundle` checks the current core JS/CSS budget. CI runs behavior tests and the bundle check before deploying.

## Project structure

```text
src/
  App.tsx                Page composition and widget rendering
  components/            Widgets, layout shells, and shared UI controls
  features/
    layout/              Arrange mode and persisted widget positions
    monitor/             Optional metrics polling, types, and rendering
    settings/            Settings ownership, migrations, and four UI tabs
    wallpapers/          Background rendering, uploads, media storage, native bridge
  hooks/                 Shared storage, clock, and media-query hooks
  lib/                   Pure scheduling/search helpers and persisted key names
  types.ts               Shared application data contracts
  index.css              Global styles; components retain colocated CSS modules
tests/                   Behavior tests, DOM setup, and the TS/TSX loader
scripts/                 Wallpaper Engine packaging and bundle checks
monitor/                 Optional Windows-only sensor helper
```

Settings flow from `useStartpageState` to widgets and the settings tabs through typed update callbacks. Lists/settings use localStorage, uploaded media uses IndexedDB, and native Wallpaper Engine preferences are merged in memory. Clock ticks remain local to the clock component. The wallpaper renderer layers the selected media, dimming, grain, and vignette.

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
npm test         # test Preact interactions, timers, presets, and native controls
npm run check:bundle    # enforce a 40 KiB gzip budget for core JS + CSS
npm run build:wallpaper # create a self-contained Wallpaper Engine project
```

## Host your own copy

You can fork this repository and publish your copy with GitHub Pages. In your repository, open **Settings > Pages** and choose **GitHub Actions** as the build and deployment source. The included workflow deploys the site whenever you push to `main`.

The current build is configured for the repository path `/ryo-startpage/` in `vite.config.ts`. If you rename your fork or publish it under a different path, update Vite's `base` setting to match the path where the site will be hosted. For a domain hosted at the root, use `/`.

## License

MIT. See [LICENSE](LICENSE).
