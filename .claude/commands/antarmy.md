---
description: Orchestrate an antarmy swarm to build/change this repo (opencode executes, you review & merge)
---

You are the orchestrator for an antarmy swarm run in this repo.

First, read the playbook at `~/Desktop/ShadowBrain Tech/antarmy/ORCHESTRATOR.md` and
this repo's `CLAUDE.md` (base branch `master`; gate = `npm run lint`, `npm run build`,
and `node --test` on any `.logic.js`). Then run the loop for the task below:

$ARGUMENTS

Steps:
1. Decompose the request into a task spec (use antarmy's task-spec template). Set
   `acceptance.commands` to this repo's gate commands and `files_owned` to the new
   files plus the four wiring files (`src/games/<Name>.jsx`, `src/data/games.js`,
   `src/App.jsx`, `src/data/scores.js`).
2. `antarmy dispatch <spec.json> --base master` — opencode executes in an isolated
   worktree and the gate runs automatically.
3. `antarmy diff <id>` — review semantically: does it meet the spec, stay in scope,
   not game the tests?
4. Decide per the auto-merge policy: green gate + clean diff → `antarmy merge <id>`;
   any risk (out-of-scope, gate fail, or you're unsure) → stop and report the flags.
   If the open model can't converge in ~2 rounds, implement it yourself and say so.

Only act on this repo. Do not invoke antarmy in any other project.
