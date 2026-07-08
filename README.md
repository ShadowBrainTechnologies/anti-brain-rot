# 🧠 Anti Brain Rot

**A collection of fast, focused mini-games to sharpen your mind — a deliberate antidote to the endless scroll.**

Anti Brain Rot is a free, open-source web app of 31 quick brain-training games across 8 cognitive categories. Every round takes a minute or two, works offline in your browser, and quietly builds a picture of how your mind performs across six dimensions of thinking.

---

## Why we built this

Modern feeds are engineered to hold your attention, not to reward it. Infinite scroll trades a few seconds of novelty for hours of passive consumption — the mental equivalent of junk food. We wanted the opposite: something you can open in the same idle moment you'd reach for a feed, that leaves you a little *sharper* instead of a little duller.

So the goals are simple, and they shape every decision in this repo:

- **Short, deliberate, and finite.** Games end. There is no infinite scroll, no autoplay, no "one more." You play a round, you see a result, you stop.
- **Actually good for you.** Each game targets a real cognitive skill — memory, mental math, attention, reaction time, pattern recognition, cognitive flexibility — not just engagement metrics.
- **No dark patterns.** No accounts, no ads, no tracking, no notifications begging you to come back. Your scores live in your own browser's `localStorage` and never leave your device.
- **Open and forkable.** It's MIT-licensed and easy to extend. Adding a game is a small, well-documented change. If you have an idea for a better exercise, contribute it.

We're open-sourcing it because a tool meant to *counter* attention-harvesting shouldn't itself be a black box. Anyone should be able to read exactly what it does, run it themselves, and make it better.

## Features

- **31 mini-games across 8 categories** — Reasoning, Memory, Flexibility, Math, Speed, Perception, Inhibition, and Logic.
- **The Brain Radar.** As you play, the home page builds a 6-axis profile of your cognitive strengths — **Speed, Judgement, Calculation, Accuracy, Observation, and Memory**. Each game feeds the dimensions it exercises, so your radar reflects your recent form, not just a single high score.
- **Runs entirely in your browser.** No backend, no login. All progress is stored locally.
- **Zero-asset feedback.** Sound is synthesized with the Web Audio API (no audio files shipped) plus optional haptics — both toggleable.
- **Fast and light.** React 19 + Vite, plain JavaScript, minimal dependencies.

## Getting started

Requires [Node.js](https://nodejs.org/) (18+ recommended).

```bash
git clone <your-fork-url>
cd anti-brain-rot
npm install
npm run dev      # start the dev server (Vite)
```

Then open the printed local URL. Other commands:

```bash
npm run build    # production build
npm run preview  # preview the production build
npm run lint     # Oxlint (not ESLint)
```

There is no `npm test` script — logic modules are unit-tested with Node's built-in runner:

```bash
node --test src/games/<Name>.logic.test.mjs
```

## How it's built

Plain JavaScript (ES modules, no TypeScript). React 19, Vite, and `react-router-dom` for routing.

- **`src/data/games.js`** — the source of truth for what games exist and how the sidebar/home page group them.
- **`src/games/`** — one game each: a `.jsx` UI shell, its `.css`, and (where there's real logic) a testable `<Name>.logic.js` + `<Name>.logic.test.mjs`.
- **`src/data/dimensions.js` + `src/data/calibration.js`** — the cognitive calibration engine that powers the Brain Radar.
- **`src/lib/feedback.js`** — synthesized audio + haptics.

For the full architecture and conventions, see [`AGENTS.md`](./AGENTS.md).

## Contributing

Contributions are very welcome — especially new games and improvements to the cognitive model. A new game is wired into a handful of places; the exact steps ("Adding a game") are documented in [`AGENTS.md`](./AGENTS.md).

Before opening a PR, please make sure the gate passes:

```bash
npm run lint
npm run build
node --test src/games/<Name>.logic.test.mjs   # for any game with a .logic.js
```

Keep logic testable (extract it into `<Name>.logic.js`), match the existing conventions, and — most importantly — keep the spirit: games should be short, finite, and genuinely good for the player.

## License

MIT — see [`LICENSE`](./LICENSE). Use it, fork it, ship it, improve it.
