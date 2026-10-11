# Open-source landscape audit for FLUXCUE (2026-10-11)

**Scope:** Product/user-facing features, UI patterns, 3D, mapping, engine architecture, output protocols, deployment suitability, license risks. **Method:** project README / documentation, GitHub metadata/license declarations and selected source documentation; **NOT** yet a full line-by-line source audit, benchmark or tested ARM deployment. All claims should be confirmed against pinned commit SHAs before borrowing any code. Scores below are editorial fit scores, NOT measurements.

## Executive shortlist

| Upstream | UX/feature takeaway | Fit (1-5) | Primary caveat | License seen |
|---|---|---:|---|---|
| [ASLS Studio](https://github.com/ASLS-org/studio) | Compact show-control workflow, patch/groups/chases, central 3D WebGL, independent inspector | 5 | Browser execution, WSC gateway contract; beta; DMX-first semantics | GPL-3.0 |
| [MoonLight (active)](https://github.com/MoonModules/MoonLight) | Native 1D/2D/3D effects, effect layers/modifiers, module-declared controls, driver abstraction, Linux ARM64 | 5 | Integration/API + deterministic show clock require proof; GPL-3.0 | GPL-3.0 |
| [QLC+](https://github.com/mcallegari/qlcplus) | Show manager, patch, scenes/chases/virtual console, mature fixture data | 4 | Qt/C++ desktop code, complexity, light-fixture-oriented | **Apache-2.0** |
| [xLights](https://github.com/xLightsSequencer/xLights) | Model-based sequence design, effects and timeline | 4 | Sequencing-heavy desktop product; batch vs responsive live workflows | GPL-3.0 |
| [LedFx](https://github.com/LedFx/LedFx) | Real-time sound analysis, virtual devices, music patterns | 4 | Audio source resides at venue; Python/audio IO in cloud not suitable by default | GPL-3.0 |
| [GeoPix](https://github.com/EnviralDesign/GeoPix) | World-space pixel mapping, effects from texture/video, real 3D preview workflow | 5 | Built on TouchDesigner runtime; not headless browser/cloud portable | MIT for GeoPix; TD separate |
| [OLA](https://github.com/OpenLightingProject/ola) | Mature DMX transport abstraction, Art-Net and sACN implementation ecosystem | 4 | Daemon / plugin integration overhead, mixed LGPL/GPL by component | component-dependent |
| [Falcon Player (FPP)](https://github.com/FalconChristmas/fpp) | Site-side show player, sync, scheduler, lightweight SBC | 5 | Supported targets Raspberry Pi/BeagleBone, multi-license / exceptions | mixed |
| [WLED](https://github.com/wled/WLED) | Practical fixture interoperability, device config, realtime control | 4 | Primarily ESP firmware, not cloud show editor | **EUPL-1.2** |
| [artnet_led_mapper](https://github.com/cyberboy666/artnet_led_mapper) | Physical pixel placement, video/NDI map, config portability | 3 | openFrameworks deployment/style, not full show control | GPL-3.0 |
| [Chromatik/LX](https://github.com/heronarts/LX) | Spatial LED engine, modulation, blending, interactive parameter graph | 5 for inspiration | **NOT traditional open source; commercial constraints** | custom restrictive |
| [QLC+ docs](https://github.com/mcallegari/qlcplus-docs) | Documentation of multitrack show manager | 4 | No drop-in web timeline solution | n/a |

**Correction to previous conversation:** QLC+ repository declares Apache-2.0, not GPLv3. WLED currently declares EUPL-1.2, not MIT. FPP cannot be assigned a single broad "GPL" label: multiple licenses, including sections that restrict derivative use. These affect reuse decisions.

## Audit by product area

### A. Interface architecture (reference: ASLS)
Verified: Vue 3 + Vite, Three.js WebGL 2.0, Electron optional; universes/fixture patching, fixture groups, channel faders, scenes, effects, cue/chase timeline and 3D fixtures; uses **WSC** to an external gateway which translates to Art-Net, sACN, DMX512, OSC, MIDI etc. Browser can run as static site; output needs the appropriate gateway. [Upstream README](https://github.com/ASLS-org/studio#readme).

**Adopt UX ideas:** globally persistent navigation, compact high-density panel layout, selection/outliner+inspector, drag-and-drop cues, 3D manipulators, full screen show desk, live parameter feedback, keyboard navigation.
**Improve:** more strongly pixel-first strip editing, per-pixel indices, physical patch debugging, 3D point/group visualization, alert-driven layout, explicit preview LIVE/SIMULATOR separation, tiny low-noise status bar, reversible undo/redo.
**Avoid initially:** copying the whole ASLS Vue codebase: it is GPL-3.0 and its browser/WSC lifecycle is not our required always-on engine.
**Source-level followup:** audit editor store, scene serialization, cue ownership, WebGL performance with 10k+ instanced pixel geometries, fixture library license and WSC gateway authentication.

### B. Procedural engine (MoonLight)
Verified by [MoonLight README](https://github.com/MoonModules/MoonLight#readme): pipeline of layouts -> effects/layers/modifiers -> output drivers, native 3D, flexible module parameters, REST controls, live web preview, Art-Net/E1.31/DDP send and receive, RGB/RGBW/DMX, desktop builds including Linux ARM64, headless potential. **Important:** publicly posted upstream hardware performance figures are *their own benchmarks*, not FluxCue results.

**Adopt ideas:** common module lifecycle, descriptor-driven parameter UI, no hardwired 2D special-casing (1D/2D represented as degenerate 3D), compositing nodes, cached layout transforms, output drivers, effect previews.
**Integration option A:** external MoonLight service controlled through documented API, show engine sends parameter/state actions, receives frames where exposed (capability test needed).
**Option B:** native FLUXCUE effect renderer implementing independent effect algorithms; integrate GPL service as separate optional application when beneficial.
**No source transplant** without license obligations and legal review.
**Source-level followup:** headless Linux ARM64 startup/no-GPU; REST/auth contract; reentrancy; cross-process pixel transport; effect descriptor/export format; adjustable update rate; 60FPS measured with real output.

### C. Professional lighting/time editing (QLC+, xLights)
[QLC+](https://github.com/mcallegari/qlcplus) is Apache-2.0 (check individual files and third-party plugins); fixture patch, show manager, virtual console and chases translate naturally to FluxCue operator concepts. [Show Manager documentation](https://github.com/mcallegari/qlcplus-docs/blob/main/pages/06.show-manager/chapter.v4.md) details a multitrack time-driven workflow. [xLights](https://github.com/xLightsSequencer/xLights) offers model/pixel-first sequencing, effect layering and event schedules (GPL-3.0).
**Adopt:** cue data model separates timeline clips from scene/effect presets; editable absolute time/BPM, blackout and snap; stage model remains separate from DMX addresses.
**Avoid:** xLights' dense holiday-sequencer paradigm as sole UI; a live desk must work without a pre-rendered song.
**Source-level followup:** precise fade/easing interpolation semantics, priorities/ownership when cues overlap, undo/history and file schema migration.

### D. Sound-reactivity / generative cues (LedFx)
[LedFx](https://github.com/LedFx/LedFx): networked music-reactive LED effects, device/virtual-device architecture, open-source Python implementation (GPL-3.0).
**Adopt ideas:** local FFT/features provider + virtual pixel groups + effect parameters (sensitivity, smoothing, frequency bands), preset transitions.
**Caveat:** do **not** send uncompressed mic audio over the VPS by default; site captures locally and forwards controlled, timestamped features or runs local player.
**Test:** audio clock jitter, latency and effect determinism / silence behavior.

### E. Spatial mapping (GeoPix, artnet_led_mapper, Chromatik)
[GeoPix](https://github.com/EnviralDesign/GeoPix): real-time mapping and previz in TouchDesigner, open MIT project, but TD dependency is NOT MIT. [artnet_led_mapper](https://github.com/cyberboy666/artnet_led_mapper): manually placed pixels/video/NDI to Art-Net, human-readable mapping config, GPL-3.0. [LX/Chromatik](https://github.com/heronarts/LX) excels at irregular 3D point animation but explicitly denies conventional open-source status and requires commercial review.
**Adopt ideas only:** world coordinates `position: [x,y,z]`, indexed pixels with labels, model transforms, spatial queries, mask fields, coordinate origin guides, 3D gizmos, positional procedural patterns.
**Avoid copying LX/Chromatik implementation**. Legal compliance first for GPL mappers.

### F. Deployment, gateways and hardware (FPP, OLA, WLED)
[OLA](https://github.com/OpenLightingProject/ola) provides protocol bridges/drivers; [developer README](https://github.com/OpenLightingProject/ola/blob/master/README.developer) differentiates LGPL for client APIs and GPL for daemon/plugins. [FPP](https://github.com/FalconChristmas/fpp) is excellent inspiration for autonomous site playback and multisync but explicitly supports Raspberry Pi and BeagleBone targets; repository has component-specific licenses / exceptions including non-derivative portions. [WLED](https://github.com/wled/WLED) receives Art-Net, E1.31, DDP and exposes HTTP/JSON API; firmware license is EUPL-1.2.
**Adopt:** hardware abstraction, timed playlists, heartbeat, last-good artifacts, site-local schedule, mandatory fixture patch validation.
**Test:** Art-Net v4 unicast, sequence numbers, universe indexing, sACN priorities/sync/discovery, reconnect and deliberate stale-frame behavior on controllers; WLED practical pixel/universe limits vary by device/firmware.

## UI/UX scoring (editorial, independent of code quality)

| Product | 3D workflow | Cue/timeline | Pixel mapping | Effect depth | Site playback |
|---|---:|---:|---:|---:|---:|
| ASLS | 5 | 5 | 2 | 3 | 1 |
| MoonLight | 4 | 2 | 4 | 5 | 3 |
| QLC+ | 2 | 5 | 2 | 3 | 2 |
| xLights | 3 | 5 | 5 | 5 | 4 |
| LedFx | 1 | 2 | 3 | 5 | 2 |
| GeoPix | 5 | 3 | 5 | 4 | 1 |
| FPP | 1 | 4 | 2 | 1 | 5 |

Scale: 1 weak alignment to FLUXCUE requirement, 5 highly relevant. Based on documented capabilities, **not** hands-on UX trials.

## Ranked design sources
- **UI shell + fixture/cue pattern:** ASLS.
- **Procedural engine + descriptors + live effects:** MoonLight.
- **Spatial mapping and video-to-pixels concept:** GeoPix (+ Chromatik ideas only).
- **Linear editorial timeline / library:** xLights and QLC+.
- **Audio module:** LedFx.
- **Distributed player / fallback:** FPP.
- **Protocol edge:** OLA and targeted minimal Art-Net/sACN packet implementations (choose after testing).
- **Controller compatibility matrix:** WLED + commercial Art-Net controllers.

## Mandatory evidence-driven deep-audit backlog
1. Pin upstream SHAs (not just latest branches), record release/tag and date.
2. Inspect exact reusable modules, classes, dependencies, file-level license headers.
3. Render benchmark at 1k/10k/50k pixel instances on target browser/GPU; measure CPU+GPU.
4. Linux ARM64 MoonLight spike: REST state, headless mode, telemetry, fps, pure effect/no video.
5. ASLS data export/import, cue graph and gateway code integration spike; screenshots and keyboard task audit.
6. OLA vs pure native network sender: dependency size, headless stability, PTP-like timing, packet correctness.
7. GPL boundary review on **actual planned linking/deployment/distribution**. Avoid simplistic "separate process always avoids GPL" claims.
8. Run usability session on sample installation (fixture groups, 50 universes, network fault).
9. Record decisions and signed-off candidates in `docs/DECISIONS.md`.

## Citations / reference URLs
- https://github.com/ASLS-org/studio
- https://github.com/MoonModules/MoonLight
- https://github.com/mcallegari/qlcplus
- https://github.com/mcallegari/qlcplus-docs
- https://github.com/xLightsSequencer/xLights
- https://github.com/LedFx/LedFx
- https://github.com/EnviralDesign/GeoPix
- https://github.com/OpenLightingProject/ola
- https://github.com/FalconChristmas/fpp
- https://github.com/wled/WLED
- https://github.com/cyberboy666/artnet_led_mapper
- https://github.com/heronarts/LX
- https://github.com/heronarts/Chromatik

## Screenshot-level UX observations (2026-10-11)
Image references **linked, not copied into FLUXCUE** pending asset permission review:
- ASLS Studio UI image: https://threejsresources.com/tool/asls-studio — integrated cue grid, stage preview, low profile transport, footer controls. Strong horizontal density and context synchronization. Need improve labels/contrast and reduce unnecessary duplicated navigation.
- GeoPix reference: https://www.enviral-design.com/work/geopix.html — 3D stage as primary workspace with right-hand outliner/fixture attributes, timeline along bottom; ideal for spatial composition, but TouchDesigner runtime is a deployment constraint.
- MoonLight live effects reference: https://github.com/MoonModules/MoonLight — live output + modular controls are attractive; its UI is not the target UX for operator cue programming.

New source candidates to audit:
- https://github.com/ASLS-org/WSC — binary transport/gateway related to Studio; GPL-3.0.
- https://github.com/ASLS-org/cueOS — embedded C cue control project; GPL-3.0 and older, evaluate ideas only.
- https://github.com/KRUKMAN/swietlik — emerging ASLS fork with AI/MCP-oriented feature roadmap (GPL-3.0), inspiration only; maturity unverified.
For pinned research commits see [UPSTREAM_SNAPSHOT.md](UPSTREAM_SNAPSHOT.md).

**2026-10-11 update:** the full 13-alternative FLUXCUE functionality/engineering matrix and prioritized pro-readiness gaps are in [AUDIT_STUDIO_PRODUCT_GAPS_2026-10-11.md](AUDIT_STUDIO_PRODUCT_GAPS_2026-10-11.md). This complements the prior metadata/README audit; it is not a file-level license clearance or measured benchmark.
