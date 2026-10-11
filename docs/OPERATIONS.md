# Operations, Oracle ARM + remote MikroTik (planned, NOT deployed)

## Intended secure topology
VPS (Linux ARM64) runs control API and optional headless engine. MikroTik hosts a WireGuard tunnel to the VPS. Controllers sit on separated routed venue LAN. Use outbound-initiated VPN with restricted IP allowlisting; never expose UDP 6454/5568 publicly. A local site player may deliver frames directly to hardware on LAN for resilience.

## Outbound traffic budget
Compute by observed wire bytes, not only 512 DMX slots: `bytes/month = packets/s × measured_bytes_on_wire × uptime_seconds` summed over outputs, tunnels and services. Track Oracle outbound billing monthly. Inputs include Art-Net 18+payload bytes, IPv4/UDP, Ethernet on site, WireGuard+outer IPv4/UDP and non-light API/telemetry. Protocol adapters may packetize smaller universes, impacting overhead.

## Operating states
SIMULATOR (explicitly no physical outputs), LIVE_CLOUD, LIVE_LOCAL, SAFE/BLACKOUT. Report last frame output, packet errors, render deadline misses, signed revision, cue and heartbeat. If data is missing mark UNMEASURED rather than fabricated.

## Deployment gates
1. Config and backing store backups, secrets external to git.
2. Running as dedicated non-root user.
3. Authn/Authz for editor and operator, CSRF/WebSocket auth.
4. Firewall/egress allowlist by site, private network segmentation.
5. NTP monitored (clock schedule), monotonic rendering.
6. Disaster recovery + rollback signed artifacts.
7. Hardware failsafe rehearsed with installer.
