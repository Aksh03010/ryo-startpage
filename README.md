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

## Run it on your computer

Requirements: Node.js 20.19+ or 22.12+.

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
npm run lint     # check the code with ESLint
```

## Host your own copy

You can fork this repository and publish your copy with GitHub Pages. In your repository, open **Settings > Pages** and choose **GitHub Actions** as the build and deployment source. The included workflow deploys the site whenever you push to `main`.

The current build is configured for the repository path `/ryo-startpage/` in `vite.config.ts`. If you rename your fork or publish it under a different path, update Vite's `base` setting to match the path where the site will be hosted. For a domain hosted at the root, use `/`.

## License

MIT. See [LICENSE](LICENSE).
