# FLUXCUE — Proposed architecture (ADR candidate)

## Separation of responsibilities
```text
Browser Editor (Vue 3 + TypeScript + Three.js)
  ├── Scene/outliner/fixture geometry + validated JSON editor
  ├── Preview renderer (local simulation; not hardware clock)
  └── WebSocket/REST authenticated control interface
                          |
             Cloud control API (ARM64)
  ├── Auth / projects / immutable revisions / audit log
  ├── Show scheduler + authoritative cue clock
  ├── Patch validator + network/site registry
  ├── Effect engine adapter interface (native or MoonLight external)
  ├── Frame compositor (linear color -> physical color mapping)
  ├── Art-Net / sACN adapters (unicast, per output config)
  └── Telemetry/logging/health
                          |
                 WireGuard site VPN
                          |
                    MikroTik router
                          |
          LED controller(s) / DMX gateways
                          |
           Optional site player + watchdog
           (synced artifacts, local clock)
```

## Module contracts
- `Project`: sites, shows, models, palettes, effect presets, patch configurations; explicit schema version and migration.
- `FixtureModel`: local coordinate mesh/pixel points; labels, transform, channel layout; not inherently linked to a network endpoint.
- `Patch`: stable map `(fixtureId, pixelId, component) -> (siteId, controllerId, protocol, universe, slot)`. No implicit overlapping allocation; detect universe crossing; sACN 1-63999 vs Art-Net address handling by adapters.
- `Cue`: reference to one/more scenes/presets, timing, fade curve, trigger, priority, action; cue identity stable under reorder.
- `Effect`: declarative typed params + input context (time, positions, masks, audio features), per-pixel linear RGBA output; deterministic seeded random when needed.
- `Frame`: timestamp + revision + pixel color buffer, not an HTTP command. Buffers should be contiguous, batched and pooled.
- `Output`: per-controller multicast/unicast decision, sequence/priority, packet counts, delivery/errors. Browser cannot send Art-Net UDP directly.
- `LocalPlayer`: read-only signed show artifact with revision hash, watchdog and fallback state.

## Engine ownership and time
Engine maintains monotonic show clock and maps wallclock/schedules separately. UI can request CUE/GO/BACK but cannot set frames by pretending to be authoritative. Frame render loop at configurable 25/30/40/60FPS. Drop/skip late frames intentionally; never accumulate seconds of obsolete packet queue. Changes applied at frame boundaries; mixer has explicit LTP/HTP / priority rules and live overrides with separate scope.

## Spatial/color pipeline
Model world-space coordinates -> group/mask -> effect samples -> blends -> 0..1 linear color -> brightness/group power limit -> color correction/gamma/white extraction (RGBW configurable) -> quantization/dither as device supports -> DMX channel ordering -> protocol frames. Define preview tone mapping separately from physical output, never promise preview is photometrically accurate.

## Site modes
- `SIMULATOR`: no network IO, purely local/fake output with explicit badge.
- `CLOUD_LIVE`: cloud sends UDP packetized frames over private routed tunnel to on-site fixture endpoints (unicast).
- `LOCAL_SYNCED`: cloud sends show revisions/control events to an edge player; player runs local frame loop, watchdog remains at venue.
- `SAFE`: configured safe output/fade/blackout; on-site safety policy determines behavior when cloud goes away.

## Security and networks
Private control plane via VPN/Tailscale or hardened authenticated gateway. Art-Net = UDP 6454, sACN commonly UDP 5568; no WAN open ports. Roles editor/operator/admin; signed show changes, event logs; no public direct access to MikroTik admin. CSRF, auth on WebSocket handshake, payload size limits, rate-limits, safe abort. Isolate sites and prevent a configuration selecting unintended private-network hosts (SSRF/network-egress hardening). Secrets from environment/secret manager, NOT git.

## Deployment candidates, not implemented
- Browser: Vite static build, served from VPS or external.
- API: TypeScript/Node or Rust/C++ depending measured bottleneck; SQLite initially for config, no database in render hot path.
- Engine: C++20 native for deterministic performance vs separated MoonLight adapter; benchmark before choosing.
- process supervisor systemd/docker, non-root + least privilege.
- arm64 build/test pipeline, locally emulated first if hardware absent.

## Open design questions (spike required)
1. Effect ABI / MoonLight API: parameter/control only vs access to raw frames?
2. Cue timeline engine ownership (native vs Node control process) and audio-clock alignment.
3. Output module: OLA daemon vs minimal in-house Art-Net/sACN, performance and correctness.
4. Site clock: timestamps, drift under jitter, loss policy, exact blackout semantics.
5. GUI state: CRDT/multi-editor eventually or single-writer/leases initially.
6. Peak universe throughput and egress: packet capture on Oracle network.

Architecture is an intent, not evidence that these services currently exist.

## Foundation refactor in progress — 2026-10-12
See [FOUNDATION_REFACTOR_2026-10-12.md](FOUNDATION_REFACTOR_2026-10-12.md) and [issue #28](https://github.com/Rzbck/FLUXCUE/issues/28). Core data ownership is **DocumentStore → transactional CommandBus → Cue/Effect authoring → deterministic frame evaluation → PreviewRenderer → optional future output**. Vue panels observe controllers, and the WebGL stage cannot edit the project directly. A focused draft PR #27 starts implementing the history and cue boundaries; the giant App.vue and reactive edit fallback remain debt and **must not** be described as fully refactored. The current public GitHub Pages version is unchanged.
