# Decision log (ADRs)

## D-001 — New repository (accepted 2026-10-11)
Use existing empty public `Rzbck/FLUXCUE`, not a fork of ASLS, MoonLight, xLights or QLC+. Reason: independent UX, persistent cloud engine, modular integration and clear IP origin. We may revisit external adapters only after tests.

## D-002 — Browser is not the runtime show clock (accepted)
Editor/3D preview in browser; headless service owns time, cue transitions and output. Disconnecting a web client must not stop an unattended show.

## D-003 — Pixel-first 3D scene graph, output agnostic (accepted)
World-space fixtures/pixels/groups abstracted from patched controllers. Effect compositor creates a linear pixel frame; protocol adapter maps it to channels.

## D-004 — Cloud live plus optional autonomous site mode (accepted in design)
Support both cloud unicast Art-Net/sACN through private VPN and a local player with synced show artifacts. Production deployments should explicitly choose outage policy.

## D-005 — Initial original code MIT, external GPL not imported (accepted, subject to future review)
We own clean-room original code. GPLv3 apps may be separate optional integrations after documented license boundary check; direct copying requires compliance plan and may change licensing. Copyright owners retain theirs.

## D-006 — ASLS for UX, MoonLight for effect architecture (research direction only)
Do **not** mark either as selected dependency until code/API test and licensing review.

## D-007 — No public exposure of raw lighting UDP (accepted)
Private VPN and restricted site routes only; the system should not trust arbitrary user-configured targets.

## Pending decisions
- Vue 3 store solution and UI component system.
- Native core language / service framework.
- OLA daemon or native protocol sender.
- Exact per-pixel effect signature and cue overlap semantics.
- Audio features clock and mapping video format.

## D-008 — Public-only build/release, manual private operations (accepted 2026-10-11)
GitHub Actions run **only** in public FLUXCUE; private FLUXCUE-Deploy has no Actions. The public release pipeline builds the static SIMULATOR Studio only, with zero host/network secrets. Private operations are separately approved following a read-only Oracle audit. No public CI job may access VPS, Tailscale, SSH or real LED output. Use locked npm dependencies, read-only test credentials and a separate short-lived release-publisher job. See `docs/RELEASE_SECURITY.md`.

## D-009 — 3D editor controls, spatial transforms and undo (2026-10-11)
Use the existing Three.js TransformControls/OrbitControls for original FLUXCUE browser-only direct manipulation; world Y stays UP, floor grid XZ, strip orientation rotates around Z in the XY plane. Keep x/y/z/angle numeric transforms as canonical serializable fixture values; scene model remains independent of WebGL and future protocol adapter. Translation snap in meters and rotation in degrees, with explicit FREE mode and performance-capped visual grid. Capture scene snapshots on committed operations, not every drag frame. Preserve export schema v0.1.0 with optional editor fields. A later model version must formalize groups and patch IDs without silent data loss.

## D-010 — Multi-selection and world-space preview (2026-10-11)
Multi-object transforms are pure operations around the centroid of visible/unlocked selected fixtures. Locked or hidden fixtures can remain selected but do not move; editing uses one undo record per drag. Context actions are simulator-only UI, no privileged network calls. 3D waveform samples use actual pixel XYZ positions; never tie the show model to Three.js. Static Pages remains unprivileged/read-only build plus isolated publishing job.

## D-011 — Local working autosave vs authoritative show (2026-10-11)
Only a versioned, validated project snapshot is saved to browser localStorage for the public static simulator, with a visible storage error state and optional JSON backup. No account sync; do not put site credentials in local saves, and never treat it as a production authoritative show backup. The eventual headless engine must own authoritative clocks, show revisions and physical patch safety.

## D-012 — Concurrent cue layers and hardware fixture presets (2026-10-11)
Concurrent active cue layers persist until explicit STOP/retrigger or a 12-layer memory bound, composited as ADD (screen blend) or REPLACE. They have independent start time/speed and fixture ID targets. Auto NEXT uses configurable HOLD on browser show clock, not a deterministic server timeline. LED chip family presets are metadata for UI and derived LED count, not actual pixel bus drivers. Numeric meters and density are canonical fixture geometry; imported old count is retained during migration.

## D-013 — Groups are user-owned; strip scale does not move centres (2026-10-11)
Canonical group names are an explicit project-level array; UNGROUPED is represented by the empty string and cannot be a user-named group. New fixtures and layouts never implicitly create a named group. Deleting a group safely ungroups members; moving/group-renaming are atomic undoable transactions. Legacy snapshots infer names once, preserving custom names, and recognize only the four shipped sample fixtures for one-time demo group cleanup. SCALE changes physical strip length and derived pixel density, not group spacing. Translate/layout are distinct tools.

## D-014 — Cue look authoring and shared undo (2026-10-11)
Cue editor selection is separate from active GO playback; each cue owns optional validated fixture-ID-to-hex colour overrides, immutable-ish for output until UPDATE/GO. Cue preview is explicit, target-scoped and never a live LED output. Fixture baseline colour is independent of cue colours, so editing a fixture or an in-progress cue cannot silently recolour all fixtures. Shared transaction history catches direct inputs, colours, groups and 3D pointers; native OS colour dialogs have keyboard handling beyond the web application's control. Existing static-only security boundary is unchanged.

## D-015 — Cue target lists survive arbitrary editor selection (2026-10-11)
Each edit-time cue draft has an explicit `targetIds` collection, not merely the *currently selected* outliner fixtures. Fixture-specific palette edits in CUSTOM TARGET mode add that fixture ID to the draft, preventing loss of previously coloured fixtures when clicking another strip. Target list operations are explicit and undoable; this draft, including colours/effect/speed, is saved locally before UPDATE or NEW. Native preview is scoped by the draft's target IDs. An empty target list in the serialized executed cue continues to mean ALL for backward compatibility. No production patch or network protocol output is implied.

## D-016 — Physical SMD proportions, directionality vs diffuser approximation (2026-10-11)
Make a small 5mm body and 3.8mm emissive surface the baseline, not visual spheres. A single forward-facing SMD emits only +Z in the preview; back-to-back faces enable opposite directions. Flat and circular opal diffusers are separate optional rendering layers and deliberately described as stylized scattering approximations; a tube can *look* 360° in the simulator but cannot guarantee omnidirectional illumination in real optics. Keep geometry units meters and optical design metadata independent from any hardware protocol/electrical output.

## D-017 — Internal clipboard, semantic global history and direct cue feedback (2026-10-11)
Copy and paste object fixtures within the editor's tab without intercepting native text clipboard input. History ignores selection-only actions; 3D drag uses an exact start/end transaction. Selecting fixture(s) then changing cue FX/colour activates a scoped, non-destructive preview immediately; UPDATE and NEW persist the authored cue with accumulated per-fixture colours and targets. GO is the only action to start actual cue simulation playback. Browser interactive acceptance remains pending.

## D-018 — Transactional history + Chrome pointer QA (2026-10-11)
Each editor operation commits its exact before snapshot. View changes (which fixture/cue was clicked) are not edits and must not consume Ctrl+Z. Capture-phase keyboard Undo is tested inside Chromium after a physically dispatched X gizmo press/drag/release. A smoke-only hook is compiled out of public Pages. Synthetic mouse-event tests alone are insufficient; additional manual Brave hardware acceptance is still required.

## D-019 — Bounded physically-lit simulator (2026-10-11)
Display SMD geometry and use up to 8 pooled dynamic directional SpotLights to illuminate three-dimensional surfaces and show shadow-caster occlusion; 2/4 spotlight shadows based on quality mode, ACES tonemapping and artistic UnrealBloomPass. This is a visually plausible PREVIEW, not IES/photometric raytracing, calibrated diffuser or per-LED GI. GPU/CPU at scale remain unmeasured and need acceptance tests.

## D-020 — Self-authored native FX, richer modular graph later (2026-10-11)
Add 11 deterministic self-authored patterns to the six original. Future signed-off work: parameter descriptors, palette/interpolation, modifiers, 3D masks, script/audio/media adapters, performance benchmarks. No GPL effect code has been transplanted.

## D-021 — Document history and per-fixture effects are owned by pure domain modules (2026-10-12)
After repeated user reports of Ctrl+Z not working and cue creation being incoherent, stop feature-patching the large Vue component. `src/core/document-history.mjs` is the **only** undo/redo authority: exact deep-copied pre/post document states, begin/commit, command push, immutable replay; selection or browsing a cue may update inspector navigation without consuming Undo. The App adapter maps input and 3D gestures to this core; the old `editor-history.mjs` must not coexist. This is foundation **phase 1**, not proof every DOM or native colour-picker interaction works.

A cue is an immutable-ish description of a look across multiple targets: each fixture can have its own effect and colour. `src/core/cue-authoring.mjs` validates/composes those values and persists in the project schema; preview and actual cue layer playback must consume the same per-fixture effect map. Editing a cue and triggering GO are separate actions. The project format still needs a new explicit version/migration and effect-program parameters before it is professional. Keep public Pages unchanged until final Chrome multi-axis/Brave tests.
