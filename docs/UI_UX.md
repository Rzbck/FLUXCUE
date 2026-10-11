# FLUXCUE — UI/UX contract

## Visual direction
Dense professional **dark** interface: near-black background, low-contrast seams, restrained accents, precise compact input controls and numeric values; no rounded oversized cards, no glowing neon gimmicks. Visually closer to an editor (ASLS/Blender/Ableton) than a marketing dashboard. Distinguish LIVE and SIMULATOR unmistakably with text in addition to color.

## Main workspace (target 1920x1080, adaptable)
- Top 40px toolbar: project/show selector, undo/redo, save, monitor badge, PLAY / STOP, GO, blackout (safety confirm/latch), network mode, time/BPM.
- Left 230px Outliner: Site > Installation > Groups > Fixtures > Segments > Pixels. Search, solo, hide, lock, colors, assignment conflict indicator.
- Center >=45% width Three.js viewport: pixel points and lines, GLB geometry, grid/gizmos, camera presets, orbit/fly, orthographic views, 3D placement/transform, visual quality toggles.
- Right 300px Inspector: selected object + physical patch, effect chain, grouping, data properties, parameter automation, numeric keyboard input, reset to default.
- Bottom adjustable timeline/cue deck (240px default): GO stack, cue time, fades and easing, chases, timeline lanes, per-lane priority; tab into Effect Graph, Patch Debug and Event Log.
- Micro status bar: rendered FPS, network packet/s, real/estimated latency, active site and cue, error count. Hide metrics that have not been measured (show UNMEASURED).

## Control discipline
- All controls live-update a shared in-memory draft; persisted state only on explicit save/autosave with visible timestamp.
- Undo/redo for editing; **live override/blackout** is not silently reversed by undo.
- Drag/drop reordering with keyboard alternative; panel resize, docking later, saved workspace presets.
- Hide/show grouping; one fixture may belong to multiple groups; patch address must remain unique by universe/output ownership except intentional overlaps.
- Complex per-effect controls generated from typed descriptors (float min/max/step/unit, enum, bool, color, curve, time, 3D vector, link/expression).
- Continuous feedback for unsupported controller, address overflow, overcurrent estimate, network issue.
- Inspect all selected pixels/fixtures with bulk editing.
- Filter by effect, protocol, physical site, tag, cue, color, power budget.

## Core journeys with max intended interaction steps
1. Add one 5m strip at 60 pixel/m → viewport line, 300 pixels, patch auto-allocated, editable RGB vs RGBW.
2. Attach a "chase" effect → select group → set direction/speed/palette → preview and save preset.
3. Create Cue 1 solid → Cue 2 sweep with 2s fade → GO → verify transition is deterministic.
4. Inspect all patch universes to find collisions, per-device RGB channel order and ports.
5. Simulate loss of site connection and choose freeze, black or local show policy (user-configurable and tested).

## Keyboard MVP
Space play/pause preview; G GO; Shift+G BACK; Escape cancel modal/selection; Ctrl/Cmd+S save; Ctrl/Cmd+Z undo; Del remove selection with confirmation for patched fixture; F focus selection; 1/2/3 viewport presets. Live hotkeys must not run while typing in input. Blackout requires configurable guarded shortcut, never a one-key surprise.

## Accessibility & performance
Keyboard-tab accessible; strong focus ring; not rely on red/green alone; undo edits; resizable font density; hot-reload not drop show. InstancedMesh/points renderer; cap pixel preview LOD; avoid React/Vue rerender per pixel per frame. Visualization remains a viewer of engine state, never the authoritative clock.

## UX acceptance
- 300 pixels created/modified in <= 90s by first-time technical tester.
- Live/operator state understandable without opening settings.
- Pixel indices and their channel allocation displayed in one click.
- At 1080p, main controls remain visible while 3D viewport usable.
- Same saved project produces identical physical address mapping after reload.

See `docs/TEST_PLAN.md`.

## Direct spatial editing controls (implementation sprint, browser check pending)
- M = translate selected LED strip with 3D XYZ gizmo; R = rotate around Z axis, independent orbit camera. Click strip pixels/line to select; left outliner remains alternative.
- Snap menu exposes FREE, 1/5/10/25/50 cm, 1 m; degrees FREE, 1/5/15/30/45/90; visible floor grid can be hidden separately.
- ISO/front/top/right camera preset buttons; F and 1/2/3 keyboard. Ctrl/Cmd+Z/Y and Shift+Z scene history; Ctrl/Cmd+S downloads JSON; Delete removes selected if unlocked. Inputs are exempt from global editor hotkeys.
- Grouped outliner, visible/locked fixtures and duplicate/delete actions. Numerical inspector remains for exact engineering edits. Mouse 3D and responsive view acceptance require real browser test.
