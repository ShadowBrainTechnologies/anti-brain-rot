# Agent Notes

## Project
Anti Brain Rot — React 19 + Vite + react-router-dom mini-games app. Plain JavaScript (ES modules), no TypeScript.

## Everyday commands
- `npm run dev` — start dev server.
- `npm run lint` — run Oxlint (config in `.oxlintrc.json`; not ESLint).
- `npm run build` — production build.
- `npm run preview` — preview the production build.
- `node --test src/games/<Name>.logic.test.mjs` — run a single Node built-in unit test. There is no `npm test` script.

Run `npm run lint && npm run build` (and any relevant `node --test` files) before declaring work complete.

## Adding a game
A new game must be wired in four places:
1. `src/games/<PascalCase>.jsx` and `.css` — default-exported game component.
2. `src/data/games.js` — add to `GAME_GROUPS` and import the component into `GAME_COMPONENTS`.
3. `src/App.jsx` — add a `<Route>` and update `titleFor(pathname)`.
4. `src/data/scores.js` — add `DIRECTION[gameId]` (`higher` or `lower`) and a `formatBest` branch if needed.

Game IDs are kebab-case and match the route path. Only `sudoku` uses `DIRECTION = 'lower'` (best time).

## Conventions
- Best scores are persisted in `localStorage` under `brain-rot:best:<gameId>[:<difficulty>]`. Keep this key unchanged to preserve existing scores.
- Extract testable game logic into `<Name>.logic.js` and import it from the JSX component. Unit-test helpers with `node --test`.
- Reusable UI goes in `src/components/`, marketing/landing pages in `src/pages/`.
- The desktop layout splits the sidebar and main content into independently scrollable panes; the mobile sidebar is a fixed drawer overlay.

## Tooling
- Lint: Oxlint with React plugin. `.oxlintrc.json` enables `react/rules-of-hooks` as error and `react/only-export-components` as warn (with `allowConstantExport: true`).
- Unknown routes redirect to `/` (`DEFAULT_PATH`).
- No CI workflows, pre-commit hooks, or formatter config.
