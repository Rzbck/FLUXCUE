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
