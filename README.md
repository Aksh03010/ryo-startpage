# Ryo · Startpage

A modern, customizable browser startpage / homepage engine. Combines a wallpaper-engine style dynamic background with Rainmeter-like modular widgets: clock, tasks, quick links, web search, and a focus timer — all draggable on a grid and persisted locally.

![Ryo](https://img.shields.io/badge/React-19.x-61dafb?logo=react&logoColor=white) ![Vite](https://img.shields.io/badge/Vite-8.x-646cff?logo=vite&logoColor=white) ![TypeScript](https://img.shields.io/badge/TS-strict-3178c6?logo=typescript&logoColor=white)

---

## 🚀 Quick start

```bash
# from the project folder
npm install
npm run dev         # dev server with HMR (http://localhost:5173 by default)

npm run build       # production build (dist/)
npm run preview     # preview the production build
npm run lint        # eslint
```

> **Requires Node 20.11+** (Vite 8 requires the modern Node runtime).

---

## ✨ Features

### 🎨 Wallpaper Engine / dynamic background
- 4 built-in wallpapers — 1 **animated living-gradient** (`Aurora Drift`) plus 3 hand-crafted SVG scenes (Midnight, Ember, Glacier).
- Upload **PNG / JPG / WebP / GIF / AVIF** images or **MP4 / WebM** video from your device — stored in **IndexedDB** so they survive refreshes (no quota blow-out in localStorage).
- Point it at any **wallpaper URL** (auto-detects image vs. video by extension).
- Background controls: **dim overlay, blur, brightness, saturation, film grain**, plus per-video **playback speed / loop / paused**.
- Fully self-contained: everything looks great offline by default.

### 🕐 Clock widget
- Big typographic clock with date line + greeting.
- Settings: **12/24-hour toggle, seconds, date, greeting**, size slider (60–210px), and font choice (Space Grotesk, Instrument Serif, JetBrains Mono, Manrope).
- Tabular numerals — no layout jitter.

### 📝 Minimal task manager
- Text-first, no boxy cards — items sit right on the wallpaper with soft text shadow.
- **One-time** and **repeating weekly** tasks (e.g. `Mon · Wed · Fri`) with inline day-selector chips.
- Check off (repeat tasks complete per-day), delete on hover, add with Enter/Plus.
- Toggle “show completed” in Settings → Widgets → Tasks. Tasks persist in localStorage.

### 🔗 Quick links
- 6 defaults (GitHub, YouTube, Reddit, Figma, Notion, Gmail).
- Inline add form, hover-to-remove, letter tiles auto-colored from the domain.

### 🔍 Web search
- Google / DuckDuckGo / Brave / YouTube engine selector bubble.
- Type a URL and it opens directly; search otherwise.

### ⏱ Focus timer
- Simple 25-minute Pomodoro ring with play/pause/reset and auto-return at zero.

### 🧩 Customize panel (`Ctrl + ,`)
Right-side drawer with 4 tabs:
- **Background** — preset grid, upload, URL, atmosphere sliders, video controls.
- **Appearance** — 4 accent palettes, global **glass box toggle + opacity/blur/rounding sliders**, thin border, drop shadow, text scale, reduce-motion.
- **Widgets** — per-widget visibility, widget-specific options, **per-widget glass override** (inherit / on / off) with opacity + radius sliders.
- **Layout** — arrange mode toggle, snap-to-grid, grid overlay, reset layout, factory reset.

Shortcuts: `Ctrl + ,` opens the panel, `Esc` closes it / exits arrange mode.

### 🧲 Drag & drop layout
- **Arrange mode** (the grip button in the top bar) reveals drag handles.
- Uses `@dnd-kit/core` with a pointer + keyboard sensor (arrow keys move the focused handle).
- Percent-based positions survive window resizes; optional 40 pixel snap-to-grid with a visible overlay.
- Adaptive stacking on mobile — widgets become a static column.

---

## 🏗 Project structure

```
homepage-engine/
├── index.html                    # font link, meta, favicon
├── public/
│   ├── favicon.svg
│   └── wallpapers/               # midnight / ember / glacier art
│       ├── midnight.svg
│       ├── ember.svg
│       └── glacier.svg
└── src/
    ├── main.tsx
    ├── App.tsx                   # DnD context, layout persistence, widget wiring
    ├── App.module.css
    ├── index.css                 # tailwind-ish design tokens & base styles
    ├── types.ts
    ├── constants.ts
    ├── hooks/
    │   ├── useLocalStorage.ts
    │   ├── useMediaQuery.ts
    │   ├── useNow.ts
    │   └── useWallpaperSrc.ts
    ├── lib/
    │   ├── link.ts               # URL validation helpers
    │   ├── links.ts
    │   ├── mediaStore.ts         # IndexedDB wallpaper store
    │   ├── search.ts
    │   ├── tasks.ts              # repeat / completion logic
    │   └── time.ts
    └── components/
        ├── BackgroundManager.tsx  +  .module.css
        ├── ClockWidget.tsx        +  .module.css
        ├── CustomizePanel.tsx     +  .module.css
        ├── FocusWidget.tsx        +  .module.css
        ├── QuickLinks.tsx         +  .module.css
        ├── SearchWidget.tsx       +  .module.css
        ├── TaskManager.tsx        +  .module.css
        ├── TopBar.tsx             +  .module.css
        ├── WidgetShell.tsx        +  .module.css
        └── ui/
            ├── Controls.tsx       +  .module.css
            └── Range.tsx
```

Everything styling-wise is **CSS Modules** — small token system in `src/index.css`, functional/glass styles per component. Accent color, text scale and fonts arrive via CSS variables set from `App.tsx`.

---

## 💾 Persistence

| What                             | Where                   |
|----------------------------------|-------------------------|
| Tasks, quick links, layout, settings | `localStorage` (`ryo.*` keys) |
| Uploaded wallpapers              | IndexedDB (`ryo-wallpapers` db) |

Factory reset (Customize → Layout → *Factory reset*) restores the defaults and re-writes the built-in link set.

---

## 🛠 Tech

- **React 19** + **Vite 8** with TypeScript `strict` and ESLint.
- `@dnd-kit/core` — drag & drop for the widget layout.
- `lucide-react` — uniform line icons.
- No component library; every widget is hand-tuned CSS modules.

---

## 🧭 Using it as your browser start page

1. `npm run build && npm run preview` (or serve `dist/` with any static host).
2. Set the URL as your browser's **new tab page** via a new-tab override extension, or with Firefox / Chrome policy.

---

## 📄 License

MIT.
