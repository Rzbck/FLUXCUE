# FLUXCUE

**Open-source browser-based 3D LED show design, pixel mapping and live control.**

> Project status: **V0.1 browser Studio simulation + source audit**. Vue/Three.js typecheck/build and 6 pure patch tests passed on GitHub Actions; interactive browser smoke test pending. Not production-ready: no Art-Net output or Oracle deployment.

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
