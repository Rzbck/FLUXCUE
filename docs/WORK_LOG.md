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
