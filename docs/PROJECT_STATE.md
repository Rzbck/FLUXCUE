# Project state — 2026-10-11

| Area | Current verified state | Next proof required |
|---|---|---|
| GitHub repo | Exists, public; docs and prototype source committed | Check `main` current SHA |
| Audit | Comparative desk audit of 11 projects + license links | Source-level and ARM integration spikes; issues #1, #2 and #6 |
| Browser Studio | Vue/Three.js prototype committed; **VERIFIED-CI build+typecheck PASS** (run 38144922167); real browser visual smoke pending | GitHub CI npm build + browser smoke #3 |
| Cues/timeline | Demo GO/BACK/preview fades coded; NO deterministic backend | Unit tested engine #4 |
| RGB/RGBW patch | Pure JS allocator, **6/6 unit tests PASS in CI**; real output disabled | CI tests; real UDP capture #5 |
| Headless server | DESIGN only | Runnable ARM64 service and persisted show clock |
| Oracle and VPN | NOT CONNECTED | Private routed lab after local engine tests #7 |
| Site player/fallback | DESIGN only | Offline player proof |
| Security | Requirements documented | Auth + threat model + pen/contract tests |

## Clear status labels
`DESIGN` = documentation only; `CODED-UNVERIFIED` = source present but no proven build/runtime; `VERIFIED-CI` = validated automatically; `VERIFIED-ARM` = on Oracle ARM64; `VERIFIED-SITE` = on real installations.

## Next first actions
1. Review successful CI run 38144922167 and repeat after changes.
2. Visually inspect app in Brave/Chrome and fix browser-only issues.
3. Pin upstream SHAs and audit ASLS 3D/cue architecture and MoonLight headless API.
4. Design validated project schema independent of browser.

No claims of Art-Net traffic, site connectivity, Oracle deployment, live hardware FPS or cloud reliability have been tested yet.

## Release hardening status — 2026-10-11
- GitHub public PR #10 prepares lockfile (`npm ci --ignore-scripts`), read-only CI, static-output scanning and manual-release workflow. This is **PROPOSED**, not production.
- Bootstrap PR CI 38149724535: lockfile generation, locked install, build/typecheck, patch tests 6/6 PASS. New security tests/release job require their own PR CI proof.
- PUBLIC release assets: NONE at start of change. No VPS, Tailscale, SSH or external IPs used.
- `docs/RELEASE_SECURITY.md` records hard boundary, validations and incomplete hardening work.

## Verified after public merge (2026-10-11)
- Public `main` at merge SHA `8c0f954d70fbdbde477e03fbc45e08f6e0facf3c` passed public push CI 38150231964; PR final CI 38150116525 passed **12/12 tests** and security scans.
- Manual GitHub release workflow is committed to `main`, but no manual workflow dispatch, tagged release asset or digest validation has occurred. Release=DESIGN/READY-TO-DISPATCH, not PUBLISHED.
- Rulesets list empty; classic branch protection inaccessible with connector (403). Strong repository policy enforcement requires owner-side confirmation.
- No Oracle/Tailscale/SSH access, deployment or real lighting output.

## Alpha release verification (2026-10-11)
- `v0.1.0-alpha.0`: PUBLISHED GitHub prerelease; source `e97260dcf50563df4d8e958e3bd485c8b89508c2`, CI run 38150450518 SUCCESS, release run 38153698699 SUCCESS.
- SHA256 archive `d2d0b31717fd587400183ea88892773294b087096b7a07cbff5af1885ad477c2` independently recomputed from downloaded workflow build artifact; matches release asset API digest, manifest and checksums. Actual release asset bytes themselves were not downloaded independently.
- Ruleset `Protect main` ACTIVE targeting default branch, PR+studio required with strict up-to-date check; API verification complete. Browser simulation NOT SMOKE TESTED; no Oracle/SSH/deployment.

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
