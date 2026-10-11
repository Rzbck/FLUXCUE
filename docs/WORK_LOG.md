# Work log

## 2026-10-11 — Foundation and first code
- Discovered existing public `Rzbck/FLUXCUE` repository; initially empty, account has admin/push permission.
- Initialized README in commit `1763755f46eafe0bf3d5d0b2561f63d9a8fda6c9`.
- Pushed detailed source software desk audit, UI/UX, headless architecture, portable show model, licensing policy and cross-session AGENTS/HANDOFF docs in commit `aabda21be3fc400eabd29459460a16e388a5b225`.
- Pushed first code (Vue 3, Vite, Three.js 3D LED preview, demo cues, scene inspector, JSON import/export and RGB/RGBW virtual patch) in commit `99d835f9b3b28b77d7027034ff0ed47dd9ed2ac9`.
- Opened GitHub Issues #1-#8 for upstream audit, ARM MoonLight, app smoke test, engine, protocols, licensing, routing and UX.
- Added CI and explicit TS module declaration. Initial CI failed before install because cache expected a missing lockfile; workflow fixed in commit `14089e846bf59d7a27d7a5ed1076d4b712c12ffa`.
- GitHub Actions run `38144922167`: Node 22, `npm install` PASS, `vue-tsc --noEmit && vite build` PASS, `npm test` **6/6 PASS**. Browser screenshot/smoke still pending.
- ChatGPT did not connect to Oracle, MikroTik or any lighting controller. Real packet output is disabled.

## 2026-10-11 — Public release preparation / issue #9
- Verified public `main` head `0f5ff463dc7c6064169ede0d1578022b6e1d3e22`, CI run 38145101303 SUCCESS (typecheck/build and 6/6 patch tests); releases empty.
- Opened PR #10 on branch `security/reproducible-alpha-release`. Bootstrap workflow run 38149724535 PASS: npm generated lockfile, `npm ci --ignore-scripts` PASS, build PASS, unit 6/6 PASS; only a one-time isolated writer committed `package-lock.json` to the branch.
- Replaced bootstrap workflow with final read-only CI and manual two-job release with exact source+CI verification, SHA256 manifest and no VPS credentials. Added scanned public-repo/distro safety checks and regression tests.
- **Final CI and publishing are not marked PASS until verified from GitHub.** No production SSH, no live output, no browser smoke.

- PR #10 merged to `main` (`8c0f954d70fbdbde477e03fbc45e08f6e0facf3c`). Public push CI 38150231964 SUCCESS. PR CI 38150116525 PASS: 12/12 tests, 36 tracked public files and 3 static dist files scanned. No release published yet; manual workflow not executed.
- Repo rulesets collection returned no rulesets; branch-protection endpoint was forbidden to connector. Do not claim protected `main`.

## 2026-10-11 — Alpha release verification
- GitHub release `v0.1.0-alpha.0` published; manual workflow run 38153698699 PASS for both build and publish. Exact source CI run 38150450518 SUCCESS.
- Downloaded workflow artifact 11706959644, inspected manifest/source/CI and archive; SHA256 `d2d0b31717fd587400183ea88892773294b087096b7a07cbff5af1885ad477c2` matched GitHub release asset metadata and SHA256SUMS. Metadata for manifest and checksums likewise matched independent bytes. Modified test archive fails SHA256 comparison. No direct asset download and no browser smoke.
- Confirmed `Protect main` active GitHub branch ruleset: PR required, no bypass, required `studio` check with strict up-to-date, deletion/non-fast-forward block.
- No private network, VPS, credentials, host audit, or live lighting output involved.

## 2026-10-11 — Two build warning fixes (PR pending CI)
- Recent `FLUXCUE Studio CI` run 38154004703 SUCCESS but Vite reported a 579.79 kB combined JS chunk and GitHub Actions warned that Node 20 based `checkout`, `setup-node`, `upload-artifact`, `download-artifact` actions are deprecated. A third-party `punycode` deprecation message also appeared in console, distinct from the 2 requested warnings.
- **Proposed**: SHA-pin verified upstream Node24 action versions: checkout v5, setup-node v5, upload-artifact v6, download-artifact v7; preserve no-secret build vs write-only publish job split.
- **Proposed**: Vite Rollup chunks separated for Three core / Three extras / Vue runtime, rather than hiding the size warning by raising the threshold. **Effect and CI NOT VERIFIED** until PR pipeline passes; no UI/browser smoke was performed.
- No VPS, SSH, Tailscale access, network lighting or deploy changes. Older GitHub run warnings remain historical.
- Next acceptance: PR CI green 12/12, actual output JS chunks below Vite threshold and zero Node20 GitHub warnings; then merge via protected PR.

### CI evidence — warning fixes (2026-10-11)
- Public PR #13: https://github.com/Rzbck/FLUXCUE/pull/13 ; head `bef0fa53410776c5707f864013f00b7abbe7f38a` passed public PR CI https://github.com/Rzbck/FLUXCUE/actions/runs/38154767747.
- Commands actually executed by PR CI: `node scripts/check-public-security.mjs --repo`, `npm ci --ignore-scripts --no-audit --no-fund`, `npm run build`, `npm test` (**12 PASS, 0 FAIL**), `node scripts/check-public-security.mjs --dist` (**6 distribution files PASS**).
- Vite output size: formerly combined JavaScript 579.79 kB (warning >500 kB). After splitting chunks: `three-core` 477.38 kB, `vue-runtime` 65.70 kB, `three-controls` 19.10 kB and app 17.12 kB. **Vite oversized-chunk warning absent in PR CI logs.** No browser runtime/smoke verification has occurred.
- SHA pinned Node24 action versions independently checked via official `action.yml`: checkout v5, setup-node v5, upload-artifact v6, download-artifact v7; PR CI has no GitHub `Node.js 20 is deprecated` annotation. **Updated release workflow itself NOT RUN**, and does not modify the previously published alpha. Third-party `punycode` console deprecation messages remain in PR CI logs; not a build failure.
- Oracle, VPS, SSH, Tailscale and LED outputs remain untouched.

## 2026-10-11 — Browser-only GitHub Pages Studio preview (proposed PR)
- Previous public `main` checked at `6101462073e71ef51db6bafc8ccaad79358134fc`; protected `main` requires reviewed PR and the `studio` CI check.
- Goal: serve only public Vue/Three.js **SIMULATOR** on `https://rzbck.github.io/FLUXCUE/` for Brave smoke testing, with **no local software installation**.
- Vite adds `base: '/FLUXCUE/'` only for `--mode pages`; ordinary root builds and previously published release remain unchanged.
- New `.github/workflows/pages.yml` builds/tests/scans in an unprivileged `contents:read` job; a separate `pages:write` + `id-token:write` job deploys only the GitHub Pages artifact. All external actions pinned to verified upstream commit SHAs. No Oracle, Tailscale, SSH, customer IP, credential or server configuration is read, injected or referenced.
- Added `scripts/check-pages-output.mjs` and four unit tests to reject wrong base paths and missing assets; standard `studio` CI also builds Pages mode before a merge.
- Real GitHub Pages availability and browser rendering **NOT VERIFIED** until Pages source is set to `GitHub Actions`, PR merges, deployment succeeds and user checks UI in Brave. The GitHub connector cannot change Pages settings; GitHub Pages requires owner setup via `Settings → Pages → Source → GitHub Actions`.
- This is a public online static preview only; no backend, authentication, live protocol or site access. Next proof: CI tests and `PAGES PASS` in PR, deployment job SUCCESS, then screenshot/console Brave and import/export test.

### GitHub Pages PR CI proof (2026-10-11)
- Public PR #14 on `feat/github-pages-studio-preview`, initial code HEAD `aee72389f3ad0b091c3f464ce6b572b3054f5b48`: https://github.com/Rzbck/FLUXCUE/actions/runs/38155300548 **SUCCESS**.
- Actual automated checks: `npm ci --ignore-scripts`, source-security scan **39 tracked files PASS**, typecheck and ordinary build PASS; `npm test` **16 PASS / 0 FAIL** (including 4 new Pages tests); ordinary dist scan **6 files PASS**; `npm run build -- --mode pages` PASS, Pages output scan **6 files PASS**, `PAGES PASS: /FLUXCUE/ static links resolve inside dist`.
- These tests prove build-time output paths, not a live browser visit. Pages enablement, deployment and actual Brave 3D smoke **NOT YET VERIFIED**. Public site URL is **EXPECTED** (not yet claimed live).
- Next: merge PR only after current head CI PASS; verify `FLUXCUE Studio Pages Preview` workflow; owner selects GitHub Pages Source = GitHub Actions in Settings > Pages if needed.

## 2026-10-11 — Milestone #4 cue editing / deterministic fade slice
- Public main before work: `f6b4b688465642f1b7f6e6fef594a63dc50815ff`, CI and Pages deployment green. USER checked initial Pages preview visually and approved continuing; formal 2-resolution screenshot/console validation still NOT RUN.
- New pure `src/core/cue-engine.mjs` handles time-based fade progress, RGB interpolation and capped browser-preview clock independently of the 3D scene; regression tests in `tests/cue-engine.test.mjs`.
- Simulator now snapshots pre-brightness LED pixel colours at each GO/BACK, enabling a new cue to begin from the **currently displayed** interpolated result even when the previous fade is unfinished. Speed/brightness remain preview controls; output still offline.
- Added visible transition progress, RESET clock, active cue name/fade editing, reordering and deletion to compact cue desk; imported project reinitializes cue runtime. Existing JSON prototype format stays `0.1.0`, no backend/server changes.
- Unchanged by this slice: actual deterministic headless clock, full validated project schema, patch collision checks, scene undo/redo, live Art-Net/sACN, browser performance proof and actual venue testing. Issue #4 remains OPEN until those acceptance conditions are covered.
- **Verification PENDING PR CI**: check typecheck, build, unit tests, security scan, Pages paths, and Pages deployment after merge. Tests must not be claimed green until run evidence is read.

### Verified cue-slice PR CI — 2026-10-11
- PR #15 code commit `9e4a90ee80669c6fe278b758613fc9031d38cb4e` passed GitHub Actions https://github.com/Rzbck/FLUXCUE/actions/runs/38159922632 (**SUCCESS**).
- Evidence from CI job logs: source security scan **41 tracked public files PASS**, Vue TypeScript check and Vite build PASS; `npm test` **21 PASS, 0 FAIL**; normal and GitHub Pages `dist/` scans **6 generated files PASS**, `PAGES PASS: /FLUXCUE/ static links resolve inside dist`.
- Previous PR attempt failed on a legitimate floating-point endpoint equality test (0.09999999999999998 vs 0.1); fixed by preserving exact RGB start/end values at progress 0/1. No invented success: 38159862698 FAIL, followed by 38159922632 PASS.
- CI does not prove human browser operation; formal Brave responsive/UI test still OPEN. Public Pages will rebuild only after protected PR merge and successful deployment.

## 2026-10-11 — Spatial CAD-style editor sprint (PR awaiting CI)
- Baseline public `main` `320f7886d48388908b191a8569cd195d78e7a475` and Pages CI 38160068436 SUCCESS; initial user/browser feedback requests **mouse-editable fixtures** instead of number-only transforms, adjustable centimeter grid precision and greater feature density per development cycle.
- Added **Three.js TransformControls** from the existing Three dependency: select visible fixture via widened 3D line raycast or outliner; drag X/Y/Z translation and Z-axis rotation handles. Orbit is disabled during manipulator drag. Tool buttons M MOVE and R ROTATE; camera preset ISO/FRONT/TOP/RIGHT (1/2/3 and F for ISO/focus); scene grid visual subdivisions capped for performance.
- Translation snap options FREE, 1 cm, 5 cm, 10 cm, 25 cm, 50 cm and 1 m; rotation FREE, 1°, 5°, 15°, 30°, 45°, 90°. Numeric XYZ/angle editing remains available; transforms are bounded and finite.
- Added fixture naming, group assignment (outliner grouped by name), per-fixture visibility/lock state, duplicate, delete, optimized persistent instanced meshes, wider invisible pick lines, undo/redo up to 80 scene snapshots (keyboard Ctrl/Cmd+Z, Ctrl/Cmd+Shift+Z, Ctrl/Cmd+Y). One undo record per completed gizmo drag; numeric changes record on change. Import supports legacy 0.1.0 JSON and new optional group/visibility/lock; file export retains legacy schema version 0.1.0.
- New pure `src/core/scene-editor.mjs` and tests `tests/scene-editor.test.mjs` cover fine snapping, wrap-around, XYZ/rotation conversions, duplication, scene snapshots, invalid input.
- **Not verified until PR CI and user Brave tests**: actual TransformControls drag behaviour, browser render, 1920×1080/1366×768 UI, imported old projects in the browser. No GLB, spline-based LED, advanced realtime pixel mapping, headless engine or LED protocol included yet.
- Public simulation only: no VPS/Tailscale/SSH/client IP/secret output, no new dependencies. After CI passes, merge via protected PR and confirm Pages deployment. Next: user browser validation + real schema/pixel layout/graph work.

### Public CI proof — 3D spatial editor PR #16 (2026-10-11)
- Latest feature source `98bc2e67c000a915cd1bf912cb8079a1f78d9f40` passed GitHub PR CI https://github.com/Rzbck/FLUXCUE/actions/runs/38161826358 (**SUCCESS**).
- Exact CI observations: `vue-tsc --noEmit` and Vite production build PASS; `npm test` **28/28 PASS**; scan **43 tracked public files PASS**; normal and Pages 6-file static `dist` scans PASS; `PAGES PASS: /FLUXCUE/ static links resolve inside dist`.
- First run 38161512013 FAILED 1 of 27 tests on duplicate-grid rounding; later corrected. Recent source also fixes OrbitControls moving during gizmo drag, clamps transient invalid numeric input, keeps empty group labels visible, and adds a local 1cm precision grid over a coarse floor grid.
- Testing scope: pure helper tests, TypeScript typecheck, static builds/security and Pages paths. **No actual browser interaction automation or manual drag proof yet.** GitHub Pages deploy is pending merge.
- No Oracle/VPS/SSH/Tailscale/controller contact and no new dependencies.

## 2026-10-11 — Multi-select, context UI, group tools and spatial simulation (PR PENDING)
- GitHub main starting SHA `d95814c1f363611c0d4ea724d84327020e52773f`, green public CI and Pages, user explicitly requests much larger batches than single features.
- Multi-selection in outliner + raycast viewport: Ctrl/Cmd toggle, Shift range, Ctrl+A all, group/inverse select; single primary inspector, highlighted all selected, group gizmo translate XYZ / rotate Z about shared centroid, locked/hidden excluded from transform. Pure selection/transform helpers and unit tests.
- Context menu on right-click of viewport or fixture: select all/group/invert, MOVE, ROTATE, DUPLICATE, SHOW/HIDE, LOCK/UNLOCK, DELETE. Batch group assignment and align X/Y/Z; history single snapshot per operation and gizmo drag. Multiselect export stays legacy 0.1.0 schema (editor selectedIds intentionally transient).
- Two world-space preview effects `World-space Wave` / `3D Blocks` use physical positions for samples; original four effects unchanged. Import recognizes new cue types and rejects duplicate fixture IDs. No external libraries added.
- **NOT yet verified**: typecheck and tests (CI required), browser context pointer targeting, real gizmo group rotation, viewport performance/responsive usability. NO Art-Net, sACN, Oracle, VPN, server or network hardware code.
- Next: PR green CI; merge only if green; Pages release then interactive Brave manual check. Continue issue #4 portable validated model and #8 editor; research #1/#2 and license #6 separately.

### PR #17 feature-batch CI proof (2026-10-11)
- Public PR #17 head ff5129e7a717db8e7ff469938ad9afd5f734ca28 [CI 38163184921](https://github.com/Rzbck/FLUXCUE/actions/runs/38163184921) **SUCCESS**: TypeScript check/Vite default and Pages builds, **42/42 tests PASS**, scanner **49 tracked public files PASS**, each static distribution scan **6 files PASS**, Pages URL check PASS.
- Earlier attempt 38162905219 FAILED on TypeScript; the errors were corrected, with green PR CI at 38162969160, 38163078939 and 38163184921. No user browser interaction tested by those jobs.
- Batch contents: Ctrl/Cmd/Shift multi-selection in outliner and 3D, right-click menu, group XYZ translate/Z rotation around common centroid, duplicate/lock/show/hide/delete and group/align operations, world-space wave and blocks preview FX, virtual pixel XYZ inspector + per-fixture DMX slot/CSV, row and XY-ring parametric LED layout generation.
- Export CSV capped at 100,000 pixels and does not represent a real physical controller patch. The current prototype JSON import rejects duplicate fixture IDs. Output remains SIMULATOR with no Oracle, SSH, VPN, server or hardware connection.
- Pending: final protected merge, public Pages build/deploy and real Brave smoke on 1920x1080 and 1366x768 (mouse/gizmos/context menu/CSV).

### Public merge + Pages deployed (2026-10-11)
- PR [#17](https://github.com/Rzbck/FLUXCUE/pull/17) merged through protected `main` at exact SHA `8eb486a913da700da3dba8878d947022d327e54e`; CI on main https://github.com/Rzbck/FLUXCUE/actions/runs/38163376238 **SUCCESS**.
- Public Pages workflow https://github.com/Rzbck/FLUXCUE/actions/runs/38163376412 **SUCCESS**, separate read-only build and Pages write-only deploy. Deployment log confirms exact source SHA `8eb486a913da700da3dba8878d947022d327e54e` and URL https://rzbck.github.io/FLUXCUE/ .
- Prior matching PR run 38163333179 **SUCCESS 42/42 unit tests**, TypeScript build, two output scans and Pages asset link checks. Actual interactive multi-select/right-click/gizmo/camera/CSV and 1920×1080 / 1366×768 Brave smoke **NOT RUN** by assistant; awaiting user hands-on testing.
- Current scene and effects only in public static SIMULATOR. No Oracle/VPS/Tailscale/private or lighting-output connection. No new runtime dependencies.
- Remaining open priority order: issue #8 real browser UX + spline/GLB, issue #4 fully validated portable schema + global virtual patch conflicts + headless clock; issue #1 ASLS deep source audit, #2 MoonLight ARM64 feasibility, #6 actual license boundary review, #5 local-only protocol packets. Issue #7 private site routing/deployment only after explicit private hardware review, and never from public CI.

## 2026-10-11 — Studio v0.2 operator workflow overhaul, PR #19
- Started from protected public `main` commit `1b1677dd5a6e34ab7b1889117ae28a94f965ac27`. Branch `feat/studio-v02-workflow-overhaul`. The previous released Pages project was a public software SIMULATOR only.
- Implemented: browser-local autosave/restore with debounce (~650ms), periodic preview state checkpoint (~8 show-clock seconds), backup JSON and strict 2MB migration validation. Restores fixtures, groups, cues, selection, collapsed group/panels, LED specs, per-fixture filter, cue playback stack and clock, simulator pause and blackout. Storage is **per browser/profile and origin only**, no cloud account sync. Storage failure is visible; corrupted existing backup is not silently deleted.
- Hardware-aware fixtures (informational, NOT hardware safety validation): WS2812B, WS2813, WS2815, SK6812 RGBW, APA102, SK9822, generic RGB/RGBW. LED density presets 30/60/72/96/120/140/144/160/240 LEDs/m and custom 1..600; LED pixel count calculated from meters x LED/m, with 2,000-pixel fixture cap. Old imported 0.1.0 shows preserve prior LED counts and infer compatible density. Scale XYZ gizmo uses a uniform length/group spacing factor from the X/uniform control; normalized editing updates pixel count and virtual patch in real time.
- UI: black/neutral interface, custom dark scrollbars, group collapse/expand all, group rename and selected-group per-strip tint (does not recolor unrelated fixtures); inspector geometry/effect/pixel subsections, cue desk, array generator and patch metrics can collapse. UI group collapse state persists.
- Show simulation: concurrent cue layers (ADD/REPLACE) with independent phase and speed, each targeted at selected fixture IDs or all; new GO no longer automatically stops other cue layers. Layer count capped at 12; repeated same cue retriggers its one instance. Editable name, fade, hold, mix, target with explicit UPDATE CUE and NEW CUE; auto advance using HOLD, per-layer stop, STOP ALL with real preview blackout, pause/play/reset. Cue draft appearance separated from per-fixture colour tint. No server-authoritative timeline or live network effect engine.
- Editing: undo/redo snapshots across geometry, groups, fixture tints/chip/density, and cue edits; pointer-up/cancel/blur fallback commits mouse gizmo drags as one history action. Scene undo preserves existing running cue layers. Does not claim browser interaction acceptance before manual test.
- Pure new modules: `src/core/hardware.mjs`, `src/core/cue-layers.mjs`, `src/core/project-store.mjs`; regression tests `tests/hardware.test.mjs`, `tests/cue-layers.test.mjs`, `tests/project-store.test.mjs`. Original Three.js / Vue libraries only, no new npm deps. Read-only CI and Pages flow remain separated from private systems.
- Proof before final doc commit: [PR CI 38165937115](https://github.com/Rzbck/FLUXCUE/actions/runs/38165937115) **SUCCESS**, existing + new **55 unit tests PASS**, Vue typecheck/build, source/dist security scanner and Pages asset-path check PASS. Later current-head build and deployment must be checked before claiming publication. Previous failed intermediate CI attempts included type and RGB equality mistakes and were fixed, not hidden.
- Still OPEN: manual Brave tests at 1920x1080 and 1366x768 of browser persistence, actual 3D scale and undo, color targeting, grouped collapse, cue UPDATE and simultaneous playback/autoplay. Full portable project schema, true spatial spline fixtures, cross-fixture patch collisions, real controller-level chip ordering, GLB import, cross-device cloud backup, Art-Net/sACN transport and headless Oracle ARM renderer NOT IMPLEMENTED. Public site never gets Oracle/VPN/SSH credentials or live output.
- Next gate: latest PR CI green, protected merge, main CI + GitHub Pages green, then ask user for real Brave smoke of autosave/scale/cue and screenshot/console findings.
