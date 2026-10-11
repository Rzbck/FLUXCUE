# Acceptance and test plan

## Stage 1 — offline simulation
- Scene test: add RGB strip (60px/m x 5m = 300 pixels), edit geometry, save+reload, compare 3D points and pixel count.
- Color test: 100% red/green/blue, RGBW white, brightness 0 and 1, gamma known reference.
- Cue test: GO at t=0, crossfade exactly 2s to new effect, rewind/restart identical results, BACK restores correct state; no hidden dependency on browser tab visibility.
- Patch tests: RGB 170 and 171 pixels, RGBW 128 and 129, slots 1..512, zero pixels, duplicate channel allocation, invalid universe IDs.
- UI: keyboard and mouse workflows, 1080p compact, undo/redo, no accidental LIVE mode.
- JSON: schema version migrations, malicious/unbounded payload rejection, invalid show no partial apply.

## Stage 2 — engine/protocol locally
- Capture UDP Art-Net/sACN packets on test receiver, assert header/format/universe/channel count/color order/sequence.
- Fixed deterministic clock: 25/30/40/60FPS, frame deadline tracking; slow consumer drops late frames rather than unbounded backlog.
- Disconnect UI in middle of show: engine keeps running, state reconnects.
- Conflicting two-source semantics tested per protocol/priority.
- Emergency stop and blackout priority checked; safety policy not dependent on UI browser.
- Crash/restart persists last good config; no auto output until explicit site authorization.
- Unit, integration, contract test commands documented with actual stdout.

## Stage 3 — Oracle and real site
- 1, 10, 50 universes; 30/60FPS; monitor CPU/RAM/egress, late frames, jitter p50/p95/p99, packet loss and current cycle.
- Test WAN outage 1s/10s/60s and reconnection. Verify local player/failsafe policy.
- Test unicast through MikroTik/WireGuard; destination allowlist and isolation other sites.
- Show patch on real RGB and RGBW fixture. Verify LED indexing and byte channel order, frame transitions, strobe limits.
- Operators recover from stalled show without SSH.

## Record each benchmark
Host, platform, CPU, compiler, kernel, commit, universe count, pixels, frame rate target, protocol, packet size, egress bytes, duration, observed FPS, p95 and p99, drop count, network latency, profile evidence, date. Unmeasured values must remain 'NOT MEASURED'.

## Hypotheses
50 universes continuous over VPN can be significant traffic; derive actual volume from packet captures and use Oracle billing metrics. Do not rely on a blanket promise that any transport/overhead stays below the provider quota.
