# FLUXCUE — LIVE HANDOFF
Updated: 2026-10-11. Canonical repo: https://github.com/Rzbck/FLUXCUE

> **Important:** This document is a persistent *human/agent handoff*, not automatic memory or a live sync mechanism. Re-read current GitHub `main` and this file on every new conversation. A later session must verify the HEAD SHA rather than assume it.

## Product intent
Independent open-source browser-based 3D design, patching and live show programming for addressable LED strips, volumes and conventional fixtures. Effects, cues, multi-track timeline, groups, layers, realtime 3D preview, Art-Net/sACN outputs, and optional local site player; cloud orchestrator planned on Oracle Linux ARM64, site router MikroTik via secure VPN. Build a cohesive product, not a bundle of unrelated UIs.

## Critical UX preferences
Very compact professional dark interface; useful density; comprehensive parameter access without giant menus; 3D central; patch/groups/effects/cues all visible; multi-selection; precise numeric editing, drag/drop, snapshots, live safety controls, keyboard shortcuts. ASLS is a reference for the overall UX, not a requirement to fork.

## Verified repository state
- Existing public repository `Rzbck/FLUXCUE` was found empty on 2026-10-11.
- Documentation initialization began; refer to current `main` for the latest commit and concrete files.
- Source software research captured in `docs/AUDIT_OPEN_SOURCE.md`.
- **No tested Oracle deployment, real network device, authenticated site router or Art-Net output** at initial handoff.
- Last known setup commit before audit-document package: `1763755f46eafe0bf3d5d0b2561f63d9a8fda6c9`; this is a historical bootstrap reference, not an assertion of current HEAD.
- Current phase: architecture, interaction contracts, evidence-based upstream survey, then runnable browser prototype and engine spike.

## Core design decisions
- New independent repo. Avoid unreviewed source copy.
- Browser = editing and 3D preview (Three.js); browser NOT mission-critical show executor.
- Versioned show/fixture/patch data independent of editor and outputs.
- Headless engine must operate on ARM64 without GPU. Native MoonLight evaluated as optional separate engine/adapter, not yet selected as a dependency.
- Cloud LIVE over secure routed unicast VPN; local autonomous playback after sync is preferred for production reliability.
- No Internet-facing unauthenticated UDP, WebSocket or routing control.
- First output = virtual simulator; then measured hardware tests and controlled WAN tunnel.

## Work order / next objective
1. Finish static source audit and rank UI patterns, effects, licenses and integration effort.
2. Deliver/verify **MVP browser Studio**: simple patch, LED strip in 3D, configurable pixels, sample cues and mock playback. Simulated output must be labelled.
3. Validate full data model and deterministic sample fixture serialization.
4. Implement headless server with tests; first Art-Net loopback test on localhost; only then real MikroTik/site integration.
5. Profile 30/60 FPS and latency on actual Oracle ARM before scale commitments.

## Updating this file
Every implementation session append a short entry to `docs/WORK_LOG.md` and refresh this summary:
- branch / SHA / UTC date
- delivered and genuinely tested (commands + results)
- outstanding issue, risk, next goal
Keep older major decisions in `docs/DECISIONS.md`. Avoid handoff claiming UI/API/infra exists without checking files and tests.
