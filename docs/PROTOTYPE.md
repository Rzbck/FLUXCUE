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
