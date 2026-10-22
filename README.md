# Ryo Startpage

A customizable browser start page with a live clock, search, tasks, reminders, quick links, a focus timer, and dynamic wallpapers. Widget positions and preferences stay in your browser.

## Features

- Animated and built-in wallpaper scenes, plus image and video uploads or a wallpaper URL.
- Clock with 12/24-hour time, date, greeting, font, and animation settings.
- Search with Google, DuckDuckGo, Brave, and YouTube.
- Quick links, repeating tasks, reminders, and a focus timer.
- Draggable widgets, appearance controls, and keyboard shortcuts. Press `Ctrl + ,` to customize and `Esc` to close.
- Local-first storage: settings and lists use `localStorage`; uploaded wallpapers use IndexedDB.

## Run locally

Requirements: Node.js 20.19+ or 22.12+.

```sh
npm ci
npm run dev
```

Vite prints the local address, usually `http://localhost:5173`.

Useful commands:

```sh
npm run build    # type-check and create dist/
npm run preview  # preview the production build
npm run lint     # run ESLint
```

## Publish with GitHub Pages

The workflow in `.github/workflows/deploy.yml` builds and deploys the site whenever `main` is updated. In the repository's **Settings → Pages**, choose **GitHub Actions** as the build and deployment source.

The Vite base path is set for this repository. The live site is:

<https://aksh03010.github.io/ryo-startpage/>

## Use with Helium

After the site is published, open `helium://flags/#custom-ntp` in Helium and enable its custom new-tab page option if available. Set the new-tab URL to the Pages URL above. You can also use that URL as Helium's home page.

## Tech

React, TypeScript, and Vite. Styles are kept in CSS Modules next to their components.

## License

MIT. See [LICENSE](LICENSE).
