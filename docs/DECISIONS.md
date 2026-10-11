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
