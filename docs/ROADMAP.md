# FLUXCUE roadmap — verifiable goals

## Milestone 0: audit and repo hygiene
- [x] Public repository identified, README initialized.
- [ ] Commit verified documentation: handoff, architecture, sources, UX, license policy, show schema.
- [ ] Pin upstream SHA/release; perform source-level suitability and licensing audit.
- [ ] Independent app license policy decided per component; add third-party notices when necessary.

## Milestone 1: browser studio (SIMULATED)
- [ ] Bootstrap Vite + Vue 3 + Three.js + TypeScript.
- [ ] Dark 1080p editor with outliner, inspector, viewport, cue controls.
- [ ] Add 1-1000 pixel strip; edit length, number of pixels and transforms.
- [ ] Four real preview effects (solid, rainbow, chase, gradient) driven by independent time.
- [ ] Save/load sample show, cue GO/BACK, fade. Unit tests.
- [ ] No claim of network output; clear SIMULATOR status.

## Milestone 2: headless core
- [ ] Validated JSON format, patch compiler and warning diagnostics.
- [ ] Implement deterministic timebase, cues and frame mixing.
- [ ] Art-Net 4 unicast sender; localhost capture asserts headers/universes/rate.
- [ ] sACN sender with E1.31 priorities, universe bounds, packet validation.
- [ ] Authenticated control API and telemetry.
- [ ] C++ MoonLight integration spike: API/frames, ARM64 feasibility, GPL assessment.

## Milestone 3: physical deployment
- [ ] Test on Oracle ARM64; real resource and egress measurements.
- [ ] Private routed MikroTik VPN lab and unicast output test.
- [ ] Site heartbeat, reconnection policy and locally testable safe mode.
- [ ] Documentation hardware channels/RGBW/power/network.
- [ ] Test 1/10/50 universes at 30 and 60 FPS; record jitter and drop metrics.

## Milestone 4: reliable pro operator release
- [ ] Local backup player and synced artifact revisions.
- [ ] Multi-site isolation and rehearsal mode.
- [ ] Effect graph/spatial masks, GLB import and advanced timeline.
- [ ] MIDI/OSC/audio feature adapters.
- [ ] Incident logs, watchdog, disaster recovery drills.

No dates promised until milestones' acceptance tests pass.

## 2026-10-11 spatial editor batch — proof pending
- [ ] Drag-and-select 3D editor: Translate/rotate gizmos, per-axis snapping, grid, camera presets, mouse raycast, efficient mesh updates.
- [ ] Scene operations: duplicate/delete/rename/group, show/lock, undo/redo, persistent editable export/import.
- [x] PR feature code CI 38161826358 **28/28 PASS**; Pages deployment and manual Brave interaction proof still pending.

## Editor batch: multi-select, context commands and spatial look development (2026-10-11)
- [ ] PR multi-object move/rotate, Ctrl/Shift and context menu, batch groups/visibility/locking, align, history tests PASS.
- [ ] Spatial pure pixel coordinates and two 3D preview effects PASS.
- [ ] Site published with green deployment and verified by user in Brave.

## PR #17 integrated editor sprint (2026-10-11)
- [x] Green CI 38163184921: multiselect/context menu group editor, world-space effects, virtual pixel CSV inspector and parametric generator; 42/42 tests.
- [ ] Public Pages deploy and manual Brave smoke.

## Completed delivery gate (2026-10-11)
- [x] Multi-select / right-click / spatial preview / array generator PR #17 merged, main CI 38163376238 and public Pages 38163376412 both SUCCESS at SHA 8eb486a9.
- [ ] Complete hands-on Brave smoke before declaring runtime/UX verified; no production network output.

## Studio v0.2 - integrated operator workflow (PR #19, 2026-10-11)
- [x] Code+unit evidence on PR CI 38165937115 (55 PASS): local save and migration, chip density, scene scale, group editing/collapse, black UI, layered cues, UPDATE/AUTO/STOP, pointerup undo.
- [ ] Latest PR head green, merged main, Pages deploy green and manual Brave regression.
- [ ] Backlog: validated project model, spline fixtures, complete physical patch engine, remote/cloud persisted projects, actual backend/headless and output protocols.

## PR #20 user-reported editor defects (2026-10-11)
- [x] Code and tests: universal undo/redo transactions, in-place group strip scaling, user-owned groups and legacy migration, cue edit/GO separation and independent per-fixture cue colour.
- [ ] Final PR CI, protected merge and Pages deployment; hands-on Brave interaction proof.
- [ ] Follow-on: more comprehensive graphical history/interaction automation, fixture hierarchy, cue playback compositor editing, spline/GLB and real protocol testing.

## v0.2.1 cue target composition and editable project name (2026-10-11)
- [x] Cue multi-fixture target lists persist while selecting other fixtures; uncommitted draft autosave, user-named shows, neutral default fixture names; PR CI 38172445001 71 PASS.
- [ ] Protected PR merge, public Pages deploy and manual Brave regression before closing #8 or #4.

## Optical realism and instant cue workflow (PR #21, 2026-10-11)
- [x] SMD 5mm-scale directional emitters instead of oversized balls; optional dual-sided and diffuse optics, persisted fixture settings.
- [x] Internal Ctrl+C/V fixtures, drag undo history semantics, single selected cue look edit with instant local preview. PR CI 38176316520 green 75/75.
- [ ] Full branch/docs gate, merged deployment and real Brave optical/Undo acceptance.
- [ ] Later: physically calibrated lens/spatial photometry, real emitter normals per fixture, advanced bloom, spline/GLB geometry, performance benchmark.
