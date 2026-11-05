# Contributing to Ryo

Use Node.js 24 or newer and install the locked development dependencies with `npm ci`.

```sh
npm run dev
npm run format:check
npm run lint
npm run typecheck
npm test
npm run build
npm run check:bundle
npm run build:wallpaper
```

Run `npm run format` to apply Prettier. Formatting covers source, tests, scripts, configuration, and documentation. Generated builds, wallpaper assets, the lockfile, and the Windows monitor helper are excluded. Text files use LF; the Windows launcher uses CRLF.

## Code organization

- Keep one component per file. Use named exports in application modules, hooks, and helpers; configuration files keep the default exports required by their tools.
- Put reusable controls in `src/components/ui/`. Keep stateful feature code and its types together in `src/features/`.
- Extract scheduling, migration, and source-selection rules into pure functions. Keep ticking state inside the clock or timer component.
- Preserve persisted keys in `src/lib/storageKeys.ts`. A file move must never reset browser data.
- Keep optional features behind their existing lazy imports. Avoid a barrel export that pulls settings or monitoring into the initial page bundle.
- Give non-obvious behavior a short doc comment describing its constraint or purpose.

Use small, focused commits. Preserve the current visual identity and feature behavior during refactors. Add tests for meaningful behavior and failure boundaries rather than component structure or implementation details.

## Verification boundaries

Type checking includes the application, Vite configuration, and tests. The test loader maps React imports to Preact and stubs CSS modules; Happy DOM exercises interactions and lifecycle behavior. These checks do not replace browser layout, accessibility, or codec testing.

`check:bundle` measures the initial JavaScript and CSS referenced by the production HTML, with a combined 40 KiB gzip budget. Optional widgets download their own chunks when enabled. Report the same measurement before and after a change.

## Dependencies and licensing

Ryo's code remains MIT-licensed. Explain any new runtime dependency and prefer the standard library or an existing dependency. Development tools do not ship in the browser bundle.

Before adapting external implementation code, check that its license is MIT, Apache-2.0, BSD, ISC, or public domain. Attribute non-trivial adaptations with the source URL and license. Do not incorporate GPL, AGPL, or unlicensed code into this project. Third-party wallpaper assets require their own permission or compatible license.
