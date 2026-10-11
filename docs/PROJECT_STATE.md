# Project state — 2026-10-11

| Area | Current verified state | Next proof required |
|---|---|---|
| GitHub repo | Exists, public; docs and prototype source committed | Check `main` current SHA |
| Audit | Comparative desk audit of 11 projects + license links | Source-level and ARM integration spikes; issues #1, #2 and #6 |
| Browser Studio | Vue/Three.js prototype committed; **NOT YET BUILD-VERIFIED** | GitHub CI npm build + browser smoke #3 |
| Cues/timeline | Demo GO/BACK/preview fades coded; NO deterministic backend | Unit tested engine #4 |
| RGB/RGBW patch | Pure JS allocator and unit tests committed; real output is disabled | CI tests; real UDP capture #5 |
| Headless server | DESIGN only | Runnable ARM64 service and persisted show clock |
| Oracle and VPN | NOT CONNECTED | Private routed lab after local engine tests #7 |
| Site player/fallback | DESIGN only | Offline player proof |
| Security | Requirements documented | Auth + threat model + pen/contract tests |

## Clear status labels
`DESIGN` = documentation only; `CODED-UNVERIFIED` = source present but no proven build/runtime; `VERIFIED-CI` = validated automatically; `VERIFIED-ARM` = on Oracle ARM64; `VERIFIED-SITE` = on real installations.

## Next first actions
1. Inspect current GitHub Actions CI result.
2. Fix any type/build/test failure and visually inspect app in Brave/Chrome.
3. Pin upstream SHAs and audit ASLS 3D/cue architecture and MoonLight headless API.
4. Design validated project schema independent of browser.

No claims of Art-Net traffic, site connectivity, Oracle deployment, live hardware FPS or cloud reliability have been tested yet.
