# FLUXCUE

**Open-source browser-based 3D LED show design and simulation, with future live-output milestones.**

> Project status: **Public browser SIMULATOR, not production-ready**. Typecheck, 81 unit tests and Chromium actual mouse-gizmo/Undo smoke tested in PR CI. Manual Brave acceptance, calibrated lighting, live Art-Net, hardware patch and Oracle deployment remain future gates.

FLUXCUE aims to combine a compact professional dark UI, interactive 3D LED layout, parameter-driven procedural effects, cues/timeline, and a headless always-on show engine. It will target Oracle Linux ARM64 and optional site-local playback through secure connections to MikroTik routers and Art-Net/sACN controllers.

## Run the prototype (SIMULATOR only)

```sh
git clone https://github.com/Rzbck/FLUXCUE.git
cd FLUXCUE
npm ci --ignore-scripts --no-audit --no-fund
npm run dev
# http://127.0.0.1:5173
```

Run `npm run build` to typecheck/build, or `npm test` for virtual RGB/RGBW patch boundary tests. [GitHub Actions](https://github.com/Rzbck/FLUXCUE/actions) checks builds and tests on `main`. The browser demo emits **no Art-Net/sACN**.

## Start here

1. [CURRENT HANDOFF](docs/HANDOFF.md) — read first on every new conversation/session.
2. [Current state](docs/PROJECT_STATE.md) — what actually exists, what does not, next verified task.
3. [Source software audit](docs/AUDIT_OPEN_SOURCE.md) — comparative evaluation and direct links.
4. [UI/UX specification](docs/UI_UX.md) — workspace, layout, interaction, design rules.
5. [Architecture](docs/ARCHITECTURE.md) — responsibilities, headless renderer, transport and offline strategy.
6. [Roadmap](docs/ROADMAP.md), [decisions](docs/DECISIONS.md), [licenses](docs/LICENSE_POLICY.md), [acceptance tests](docs/TEST_PLAN.md).

## Core principles

- **Create once; preview, simulate and run anywhere.** Source of truth is a versioned, portable show/patch model.
- The browser is the **editor and 3D preview**, **not** the mandatory show clock.
- Pixel-first mapping (1D/2D/3D, RGB/RGBW), cues and timelines, reusable effects, transport adapters.
- Site controls isolated behind WireGuard/Tailscale, never expose raw lighting UDP to the public Internet.
- Multi-site safety and deterministic fallback: outage of cloud or browser must not leave an uncontrolled installation.
- Reuse software through documented APIs; **no third-party code copy until per-component license analysis**.

## Contributing / AI sessions

Read [AGENTS.md](AGENTS.md) and [docs/HANDOFF.md](docs/HANDOFF.md). Keep the handoff and project state updated in the **same commit** as relevant code changes. Never claim a feature works unless it was tested.

## Provenance

Independent FLUXCUE project. Inspiration is explicitly credited in [the audit](docs/AUDIT_OPEN_SOURCE.md). Source code and licences of cited upstream projects are not incorporated merely by citing them.

The new original code in this repository is MIT-licensed unless stated otherwise. See [LICENSE](LICENSE). Third-party modules, if added, retain their own separate licences and attribution.

## Public alpha release and security boundary

The public build and CI have **NO** SSH/Tailscale/Oracle credentials, service endpoint configuration, private client topology or GitHub Actions private runners. The only build data is the checked-in npm lockfile. Dependency install is `npm ci --ignore-scripts`; third-party Actions are SHA-pinned and public CI has read-only repository permissions.

- `.github/workflows/ci.yml`: builds and unit-tests `main` / PRs, rejects prohibited secrets and private routing indicators before install and after generating `dist/`.
- `.github/workflows/release.yml`: **manual-only**, actor/repo/main restricted; verifies the exact public source SHA had successful public CI, rebuilds with locked dependencies, generates a static `tar.gz`, `SHA256SUMS` and `manifest.json`, and publishes an **alpha prerelease**. The write-token publish job has **no npm install/build**, no checkout and no remote host access.
- Release contains **only static Studio** (simulator; no Art-Net/sACN). Check `sha256sum -c SHA256SUMS` after download. A SHA-256 digest detects changes but is not itself a signature or independent proof that GitHub was not compromised.
- Never store secrets in PUBLIC or PRIVATE Git. If a credential is ever exposed, revoke/rotate immediately; deleting it from a commit does not remove it from Git history. Repository scanning is a defense-in-depth check, not a guarantee.
- No automated deployment to Oracle. Actual deployment is separately audited and approved through the private [FLUXCUE-Deploy](https://github.com/Rzbck/FLUXCUE-Deploy) runbooks.

The first release is deliberately **not marked production-ready**; browser smoke tests, remote access and real lighting output remain unverified.

## Public GitHub Pages preview
To test the browser Studio without installing Node or cloning a repository on your PC, enable **Settings → Pages → Build and deployment → Source: GitHub Actions** for this PUBLIC repository. Once `.github/workflows/pages.yml` has completed successfully on main, visit **https://rzbck.github.io/FLUXCUE/**. This runs a **software-only public SIMULATOR**, not a lighting controller. Never enter live credentials, customer config, private networking information or passwords in its import panel.

The preview is compiled with `--mode pages` to use the `/FLUXCUE/` asset base. The release archives remain built for root-path hosting. Public Pages require no VPS or local installation. Use Brave DevTools (F12) to report JavaScript errors; check orbit, GO/BACK, fixtures, colors, JSON export/import at 1920×1080 and 1366×768. Do not call the page browser-verified until tested.

## Studio CAD tools — 2026-10-11
This public browser preview has been extended with native Three.js XYZ translation and Z rotation gizmos, fine centimeter snapping and a dynamic visual grid, camera presets, direct LED line picking, grouped fixtures, show/hide/lock/duplicate/delete, and bounded scene edit undo/redo. The left and right panels preserve exact numeric values while the main view supports mouse editing. Build/unit checks have passed in PR #16, but actual drag interactions in Brave remain to be verified. This changes **only** the SIMULATOR; no live hardware or VPS link is implemented.

## Multiselect and spatial pixel map workflow (PR #17)
- Ctrl/Cmd-click toggles a fixture; Shift-click selects an outliner range; Ctrl+A selects all. Right-click a fixture in the outliner or 3D viewport to open the selection and editing menu.
- Drag the selected visible/unlocked objects together using the XYZ move gizmo or Z-axis rotation around their centroid. Locked/hidden objects are retained in selection but not transformed. The inspector adds batch group assignment and align X/Y/Z.
- New procedural world-space effect modes Wave and 3D Blocks use calculated XYZ meter positions rather than strip-local indices. Existing cue/fade effects continue to work.
- Pixel inspector: 0-based LED index, XYZ, fixture-local virtual universe offset and DMX slot; Pixel Map CSV downloads world-space positions and virtual slots for at most 100,000 pixels. No controller/network patch is implied.
- Scene array generator: ROW X, ROW Z or RING XY, 2-32 independent strips, metric spacing, with generated fixtures selected together.
- Prior 0.1.0 show JSON remains supported; only the scene/project data is saved, not transient selection/camera/menu state.
- Public Pages preview is still a static SIMULATOR. Visual/interactive Brave checks and final Pages deployment are required before claiming runtime verification.

## Current v0.2 editor workflow (2026-10-11; verify browser behaviour manually)
1. Open public [FLUXCUE simulator preview](https://rzbck.github.io/FLUXCUE/) in Brave and hard refresh with Ctrl+Shift+R after new deployment. Changes are autosaved locally in this browser's localStorage with status at top: PENDING/SAVED/RESTORED/ERROR. Do not depend on browser storage as your only backup; use **BACKUP JSON**, especially before browser cleanup. This does not sync between browsers/devices or store on Oracle.
2. Geometry: click or Ctrl/Shift select fixtures, drag MOVE / ROTATE / SCALE gizmos, use snapped grid. S scales the strip length/group layout and recomputes number of pixels from its LED-per-meter density; changes are undoable after releasing drag. Ctrl+Z / Ctrl+Shift+Z scene history.
3. Hardware panel: choose one chip family (WS2815 / APA102 / SK6812 RGBW etc), density (30 / 60 / 140 / 144 ... or custom), length in meters. The displayed pixel count is derived from length x density, with a capped simulator limit. Strip family choices are descriptive, not electrical wiring/voltage/DMX assurance.
4. Left outliner group header expands/collapses, click pencil to rename group, Collapse / Expand all. Inspector/array builder/cues/virtual patch sections collapse independently. In CUE DRAFT / COLOUR, **Selected LED filter** applies colour only to selected, unlocked fixtures; **Cue draft color** chooses colour for the selected/new cue.
5. Cue desk: choose FX/draft color in inspector, select target strips, choose TARGET: SELECTED or ALL, then NEW CUE or UPDATE CUE. GO adds an independent layer; another GO leaves prior layers running (up to 12, oldest retired after cap). ADD uses a screen-like mix, REPLACE overlays; hold seconds plus AUTO advances cues. Stop an individual layer with its square icon or use STOP ALL for blackout. UPDATE CUE refreshes the cue and its active layer parameters. Playback state and cue definitions are saved locally.
6. This is a static browser simulator. Browser runtime drag, responsiveness, cross-refresh state and real output have NOT yet been manually validated. No Art-Net, sACN, SSH, private server or actual LED chipset communication.

## Manually owned groups and cue looks (2026-10-11, PR #20)
- A **new scene** starts with all fixtures in UNGROUPED. Use the new group-name input + **+ GROUP** to create your own named (possibly empty) groups. Drag a fixture or a multiselection onto the desired group header; alternatively, choose the named group in the inspector's membership selector or the MOVE SELECTED TO control. Rename with the pencil. Delete a group with × to ungroup members without deleting fixtures. Groups are saved locally alongside the scene and JSON backups.
- Original 0.1 demo's four autogenerated STAGE and FLOOR fixture placements are migrated into UNGROUPED if still exactly recognizable; other previously user-made groups remain.
- SCALE now changes the **length of every selected LED strip**, leaving the strip centre and all spacing unchanged, including when grouped. Use MOVE to change spacing, or the parametric layout generator to build arrays.
- Use **Ctrl/Cmd+Z** and **Ctrl/Cmd+Shift+Z** (or Ctrl+Y) to undo/redo geometric edits, input and colour edits, group changes and cue looks. Release 3D mouse drag before using undo; OS-native colour dialogs may need closing first.
- In the cue stack, clicking the main row chooses **EDIT** (without playing), while its **GO** button starts that cue only. With a fixture selected, assign a *CUE LOOK · ACTIVE STRIP* colour; select another fixture and set a different colour. With PREVIEW DRAFT enabled, inspect the affected fixtures without running GO. Press UPDATE SELECTED CUE to store in the existing cue or SAVE AS NEW CUE to make a new one. ALL / SELECTED controls cue targets; previous independent cue layers continue running.
- Distinguish the *ACTIVE STRIP COLOUR* (fixture baseline, always individual, plus explicit multi-apply button) from the *CUE DEFAULT COLOUR* and *CUE LOOK · ACTIVE STRIP* (stored per cue and fixture, non-destructive until saved).
- Static, public **SIMULATOR** only, no controller wiring or real output; verify browser gestures manually before calling the workflow stable.

**v0.2.1 workflow:** manual groups and explicit cue target sets with fixture-specific colours, global project undo/redo, length-only SCALE, editable project title, local autosave including unfinished cue drafts. Latest pre-merge PR CI 38172445001 verified 71/71 pure tests; browser interactions still require manual Brave testing.

## Studio optical/clipboard/direct-cue update (2026-10-11; browser smoke pending)
1. **BACKUP JSON** before updating; reload https://rzbck.github.io/FLUXCUE/ using Ctrl+Shift+R once deployment is confirmed. Existing locally saved scenes should migrate, keeping names/groups/cue information.
2. In the 3D editor, select one or several LED strips. Ctrl+C copies fixtures **inside this tab**; Ctrl+V pastes offset copies (also context-menu and viewport toolbar). Text input clipboard is independent. Ctrl+Z reverses a completed gizmo drag or paste; Ctrl+Shift+Z/ Ctrl+Y redo. Browser interaction acceptance is pending.
3. Under fixture geometry, set SMD 3.5/5/8mm, emitter FRONT +Z or DUAL ±Z, and diffuser none/flat/tube. SMD front is directional; DUAL previews opposite rows. The flat opal has a front bias and 3D opal tube draws segments visible around the strip. This is an approximation for previsualization, not guaranteed true 360° photon distribution nor real hardware wiring.
4. For a cue, select strip(s), set EFFET DIRECT and COULEUR SÉLECTION; the result previews immediately for those strips without triggering live output or affecting other fixtures. Select another strip and set its colour to construct a multicolour cue. Press UPDATE CUE to overwrite the cue you are editing or NEW CUE for a new look. GO explicitly starts the chosen cue layer. Base fixture tint is separate inside geometry.
5. The public app remains a static, local-storage browser simulator. No live Art-Net, sACN, Oracle, controllers, 360°-accurate raytracing or hardware communication.

## 2026-10-11 Studio simulator expansion (PR #22)
The public PREVIEW source now has 17 original procedural effect modes (11 additional), 3D material surfaces receiving sampled dynamic LED lighting/shadows, bloom, spatial pixel-position caching and stronger exact-snapshot Undo. A headless Chromium test exercises a real Three gizmo pointer drag and actual Ctrl+Z/redo, alongside 81 Node regression tests. This is not calibrated real-LED photometry or live Art-Net/sACN/Oracle control. See [the 13-project product audit and backlog](docs/AUDIT_STUDIO_PRODUCT_GAPS_2026-10-11.md).
