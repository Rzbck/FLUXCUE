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
