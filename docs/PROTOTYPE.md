# Running the browser simulator — unverified on deployment

**Current prototype phase:** V0.1 alpha; CI build + 6 patch unit tests PASS (2026-10-11, [run 38144922167](https://github.com/Rzbck/FLUXCUE/actions/runs/38144922167)); actual 3D browser smoke not yet performed. No live Art-Net, server, VPN or persistence beyond manual JSON export/import. Three.js preview is a software previsualization only.

## Quickstart (Node 22+)
```sh
git clone https://github.com/Rzbck/FLUXCUE.git
cd FLUXCUE
npm install
npm run dev
# open http://127.0.0.1:5173
```
Build: `npm run build`. Pure patch tests: `npm test`.

## Current prototype functions
- Vue 3/Vite/Three.js dark compact scene editor layout.
- Four demo strips in a 3D scene, instanced pixels and orbit camera.
- Select/add strips; change pixel number, strip length, positions, angle, RGB/RGBW.
- Four preview patterns and brightness/speed/color controls.
- Demo cue stack with GO/BACK/PLAY/PAUSE/fade.
- Import/export lightweight JSON prototype data.
- Patch footprint diagnostics for selected fixture (virtual addresses; no real packets).

## Limitations (intentional)
- Demo browser clock is **not** production deterministic; UI may pause when tab is throttled.
- Fade handling preview only; no real cross-fader or LTP/HTP priorities.
- No saving to backend/database; export/import JSON only.
- No WebSocket, Art-Net/sACN or deployment; fake universes are per-fixture counts, not global deduplicated allocations.
- TypeScript check and Vite production build pass in GitHub CI; runtime 3D behavior requires actual browser smoke test.
- Imported JSON is prototype-specific, not the final versioned full Project schema from `docs/SHOW_MODEL.md`.

## Next step
Verify `npm install && npm run build && npm test`; inspect 3D UI at 1920x1080 and 1366x768, file an issue for any errors, then build validated schema and persistent API.

## Public GitHub Pages preview
To test the browser Studio without installing Node or cloning a repository on your PC, enable **Settings → Pages → Build and deployment → Source: GitHub Actions** for this PUBLIC repository. Once `.github/workflows/pages.yml` has completed successfully on main, visit **https://rzbck.github.io/FLUXCUE/**. This runs a **software-only public SIMULATOR**, not a lighting controller. Never enter live credentials, customer config, private networking information or passwords in its import panel.

The preview is compiled with `--mode pages` to use the `/FLUXCUE/` asset base. The release archives remain built for root-path hosting. Public Pages require no VPS or local installation. Use Brave DevTools (F12) to report JavaScript errors; check orbit, GO/BACK, fixtures, colors, JSON export/import at 1920×1080 and 1366×768. Do not call the page browser-verified until tested.

## FLUXCUE 3D editing workflow (2026-10-11, browser check pending)
- Recommended: use [public Studio preview](https://rzbck.github.io/FLUXCUE/) in Brave; no npm installation required. If updating after a merge, hard refresh with Ctrl+Shift+R.
- Click a strip in 3D to select, or select it in the grouped left outliner. A coloured XYZ gizmo appears on visible, unlocked fixtures.
- **M** = move XYZ by dragging the gizmo; **R** = rotate about Z. The grid snap selector controls the interval (FREE, 1/5/10/25/50 cm or 1m); rotation selector offers FREE, 1/5/15/30/45/90°. Toggle GRID to hide/show both the 1m floor grid and local precision grid.
- Use **ISO / FRONT / TOP / RIGHT** camera controls (shortcuts F / 1 / 2 / 3). Orbit/zoom uses the mouse outside the gizmo. The camera is disabled while a gizmo is dragged.
- Right inspector: edit name, assign group, show/hide, lock/unlock, duplicate/delete, exact length/pixel count, x/y/z and Z-angle. Left outliner groups fixtures by label.
- **Ctrl+Z / Ctrl+Shift+Z / Ctrl+Y** undo/redo completed geometry/history steps; **Ctrl+S** downloads local JSON. Lock prevents direct transform/deletion. Hiding removes a fixture from viewport picking; it remains in your model/export.
- Old schemaVersion 0.1.0 JSON remains importable; new optional group, visible and locked fields are included on export.
- No real Art-Net, sACN, network LED packet emission or server connection. Do not put confidential site/device information into a public browser preview. Formal 1920x1080 and 1366x768 Brave smoke tests of 3D gestures and history are still needed.

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
