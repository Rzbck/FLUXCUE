# Project state — 2026-10-11

| Area | Current verified state | Next proof required |
|---|---|---|
| GitHub repo | Exists, public, write access established | Read HEAD after each change |
| Product/UI UX specifications | First audit/spec available | User usability review on running prototype |
| ASLS, MoonLight and peer audit | Desk research (README/license, upstream documentation) | Code-level spikes, integration tests |
| Browser 3D editor | Not verified running in initial foundation stage | Vite build + visual smoke test |
| Cues/timeline | Product spec only initially | Deterministic cue evaluator unit tests |
| Headless engine | Planned | Linux ARM64 build, memory/FPS measurements |
| Art-Net/sACN | Protocol plan only | Local UDP receiver captures correct frames |
| Oracle deployment | Not performed | Provision, security hardening, health check |
| MikroTik/site tunnel | Not connected | Routed unicast test and failure recovery |
| Local fallback | Planned | Offline player rehearsal and blackouts |
| Security | Requirements documented | Threat model / auth / input validation implementation |

## Explicit non-goals for initial MVP
Production launch, Internet-exposed show execution, automatic remote deployment, audio capture, Unreal integration, pixel video mapping at scale, 50 universes at 60fps claimed as guaranteed.

## Test labeling
- DESIGN: specified but no implementation.
- SIMULATED: browser preview only.
- VERIFIED-LOCAL: test command passes on dev machine.
- VERIFIED-ARM: tests reproduced on actual Oracle ARM.
- VERIFIED-SITE: on real venue hardware across VPN.

The next agent must inspect git SHA and test output before changing any of these statuses.
