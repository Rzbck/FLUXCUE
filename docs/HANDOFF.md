# FLUXCUE — LIVE HANDOFF
Updated: 2026-10-11. Repo: https://github.com/Rzbck/FLUXCUE

> Read the current branch and HEAD SHA every session. This document is a maintained snapshot; it does **not** update itself. GitHub is the source of truth, not conversational memory.

## Vision
Professional compact dark browser Studio to create and preview LED strips, spatial pixels, fixture groups, layers, procedural effects and timed cues. Server side headless show engine on Oracle ARM64; Art-Net/sACN through a private routed WireGuard/MikroTik installation; optional local autonomous playback.

## What is actually in git
- `README.md`, `AGENTS.md`, `docs/AUDIT_OPEN_SOURCE.md`, `docs/UI_UX.md`, `docs/ARCHITECTURE.md`, `docs/SHOW_MODEL.md`, `docs/LICENSE_POLICY.md`, `docs/DECISIONS.md`, `docs/TEST_PLAN.md`, `docs/ROADMAP.md`, `docs/OPERATIONS.md`.
- Vue 3 + Vite + Three.js proof-of-concept: `src/App.vue`, `src/styles.css`, `src/main.ts`, `src/core/patch.mjs`.
- Unit tests for fixture patch: `tests/patch.test.mjs`.
- CI workflow in `.github/workflows/ci.yml`.
- Prototype run instructions: `docs/PROTOTYPE.md`.
- Issues #1–#8 opened with clear acceptance objectives.

## Verified historical commit trail
- `1763755`: bootstrap README.
- `aabda21`: docs/agents/audit.
- `99d835f`: prototype Studio source.
- Current HEAD **must be fetched** from GitHub; do not rely on the SHA above for newest content.

## Status and limits
- Visual Studio **CODED-UNVERIFIED** until CI+browser smoke confirms.
- Pure patch tests written but CI result must be inspected.
- No real live outputs; preview is SIMULATOR.
- No server, user auth, database, Oracle deployment or MikroTik connection.
- The first comparative audit is documented, but per-component code audit/benchmark/licensing review remains **OPEN** (issues #1, #2, #6).

## Next single goal
**Issue #3**: check GitHub CI; make `npm run build` and `npm test` pass, inspect actual UI in Brave/Chrome 1920x1080 + 1366x768, fix regressions, refresh state/handoff. After that do #1 and #2 upstream code-level evaluations.

## User preferences / product intent
- UX takes ASLS' compact dark show layout and 3D preview as its primary reference; deeper pixel editor/UX inspired by GeoPix, MoonLight effect graph, QLC+/xLights cues, LedFx audio ideas and FPP failover.
- Must remain own software, not blindly fork or copy upstream GPLv3/EUPL materials.
- Editor controls dense but clean; no fake metrics. Working modes visibly distinguish SIMULATOR vs LIVE. Full patch/fixtures/cues/effects groups and editable world-space geometry.
- Eventually OSC/MIDI/Bitfocus Companion, TouchDesigner and Unreal LightLab interoperability; these are later extensions, not MVP blockers.

## AI handoff protocol (mandatory)
1. Read `AGENTS.md` then this file, PROJECT_STATE, DECISIONS, audit and issues.
2. Check latest GitHub `main`, CI and open issues; report factual current state and SHA.
3. Work focused; test; do not invent successes.
4. In the same change update `docs/WORK_LOG.md`, `docs/PROJECT_STATE.md`, `docs/HANDOFF.md` with exact verified tests and next task.
5. No secrets, tokens, public router admin ports, private network details in this public repo.

Suggested new-conversation first message:
"Reprends https://github.com/Rzbck/FLUXCUE : lis AGENTS.md, docs/HANDOFF.md, docs/PROJECT_STATE.md, docs/DECISIONS.md et l'audit, récupère main/CI/issues, puis reprends issue #3 (ou la première non terminée). Mets à jour le handoff à la fin."
