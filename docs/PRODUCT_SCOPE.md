# FLUXCUE — Product and feature scope

## Audience and workflows
1. Designer creates one or multiple installations, imports a GLB/GLTF or builds LED strip lines and spatial positions, maps physical pixel addresses, saves reusable fixture profiles.
2. Operator programs scenes/cues/chases, layers, transitions, groups, palettes and BPM-timed timeline; sees 3D preview before output.
3. Technician validates universes, outputs, addressing, routing and channel order (RGB, GRB, RGBW, 8/16-bit where relevant).
4. Touring operator deploys a portable show file to another site's network and remaps fixture outputs without rewriting cues.
5. Maintenance operator sees real health, site heartbeat, dropped frames, output mode, current cue, last known good and emergency controls.
6. Installation can run unattended with remote scheduling and local fallback.

## P0 (first usable offline browser prototype)
- Projects/shows with import/export of documented JSON schema.
- Edit 1D strips + grid 2D + 3D placement; pixel indexing and direction.
- Dark compact editor with main viewport, outliner, inspector, cue panel.
- Demo procedural effects: solid, rainbow, chase, gradient; configurable speed/brightness.
- Cue list with GO/BACK/STOP and reproducible simple fade.
- Preview clearly tagged SIMULATOR; no network command without opt-in.
- Accessibility: shortcuts, keyboard focus, contrast, labels, undo of edits.

## P1 (real performance MVP)
- Persistent headless clock, deterministic cue engine, scheduling and reliable API.
- Reusable fixtures, overlapping pixel groups, override priorities.
- Art-Net unicast and sACN unicast, protocol fixtures and loopback tests.
- Patch conflict detector, packet counters, dropped frame telemetry.
- Auth, site restrictions and WireGuard routing.
- Show save/reload, crash recovery, version migration, backups.

## P2
- Independent site player; sync show artifacts and failover modes.
- Effect graph, masks, layers/blending, live parameters and macros.
- OSC/MIDI/Companion, WebSocket remote consoles, external triggers.
- Spatial mapping geometry import GLB and spline bend/angle.
- Timecode/BPM sync, audio reactive capture on local site.
- Multi-site show templates, template lock and permission roles.

## P3
- Video textures, TouchDesigner / Unreal bridge, external per-pixel streams.
- Programmable shaders/effects with trust boundary and sandboxing.
- Recording, offline rendering, per-fixture power/thermal budgets.

## Quality bar
- Every command has unambiguous ownership and audit trail.
- Blackout has priority over all effects, is latched until explicit release, and is tested end-to-end; hardwired safety systems must not rely on software alone.
- Project model portable and understandable, migration safe.
- Distinguish color science for preview vs physical LED (gamma, dithering, white balance, brightness/power cap).
