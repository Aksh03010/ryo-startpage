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

The System monitor widget is off by default. It reads sensor data only while the widget is enabled and the local helper is running. The helper currently supports Windows and reads CPU load from Windows, GPU sensors from MSI Afterburner, and browser process CPU use from Windows. Temperature sensors appear only when Afterburner exposes them.

1. Install Python 3.10 or newer for Windows and MSI Afterburner.
2. In Afterburner, open **Settings > Monitoring** and enable the GPU usage and temperature sensors you want to see. Enable CPU temperature too if it is available on your system.
3. From this project's folder, run `py -3 monitor/ryo_monitor.py`. Keep its terminal window open while using the widget.
4. In Ryo - Home, open **Customize > Widgets > System monitor**, turn on **Show on page**, and choose **Computer** or **Browser** in the widget.

The helper listens only on this computer (`127.0.0.1`) and allows requests from the Ryo - Home site and local development page. It does not change hardware settings. The widget can show CPU and up to two detected GPU cards; missing temperature sensors are shown as unavailable.

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
