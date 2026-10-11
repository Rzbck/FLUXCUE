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
