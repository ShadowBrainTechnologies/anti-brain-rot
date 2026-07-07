# Anti Brain Rot — Claude Code guide

React 19 + Vite + react-router-dom mini-games app. Plain JavaScript (ES modules),
no TypeScript. See `AGENTS.md` for the full agent notes (adding a game, conventions,
tooling) — this file is the Claude-specific orientation and antarmy pointer.

## Base facts

- **Base branch:** `master` (not `main`).
- **No `npm test` script.** Logic modules are unit-tested with Node's built-in
  runner: `node --test src/games/<Name>.logic.test.mjs`.

## Gate / "done" commands

Run these before declaring any work complete (this is also the antarmy gate for
this repo):

```
npm run lint
npm run build
node --test src/games/<Name>.logic.test.mjs   # for any game with a .logic.js
```

## Adding a game

A game is wired in four places (`src/games/<Name>.jsx`, `src/data/games.js`,
`src/App.jsx`, `src/data/scores.js`). Full steps live in `AGENTS.md` → "Adding a game".

## antarmy (swarm) — allowed here, when asked

This repo opts in to `antarmy` (`~/Desktop/ShadowBrain Tech/antarmy`) for building
games via the swarm. Use it **only when I ask** ("use antarmy…", "swarm this",
`/antarmy`) — not automatically for every change. When asked:

1. Read `~/Desktop/ShadowBrain Tech/antarmy/ORCHESTRATOR.md`.
2. Write a task spec whose `acceptance.commands` are the gate commands above and
   whose `files_owned` lists the new game files + the four wiring files.
3. `antarmy dispatch <spec> --base master`, review the diff, then merge per the
   auto-merge policy (green gate + clean diff → merge; any risk → stop and report).
