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
