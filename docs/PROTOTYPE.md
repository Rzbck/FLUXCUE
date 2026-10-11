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
