# FLUXCUE

**Open-source browser-based 3D LED show design, pixel mapping and live control.**

> Project status: **V0.1 browser Studio simulation + source audit**. Vue/Three.js typecheck/build and 6 pure patch tests passed on GitHub Actions; interactive browser smoke test pending. Not production-ready: no Art-Net output or Oracle deployment.

FLUXCUE aims to combine a compact professional dark UI, interactive 3D LED layout, parameter-driven procedural effects, cues/timeline, and a headless always-on show engine. It will target Oracle Linux ARM64 and optional site-local playback through secure connections to MikroTik routers and Art-Net/sACN controllers.

## Run the prototype (SIMULATOR only)

```sh
git clone https://github.com/Rzbck/FLUXCUE.git
cd FLUXCUE
npm install
npm run dev
# http://127.0.0.1:5173
```

Run `npm run build` to typecheck/build, or `npm test` for virtual RGB/RGBW patch boundary tests. [GitHub Actions](https://github.com/Rzbck/FLUXCUE/actions) checks builds and tests on `main`. The browser demo emits **no Art-Net/sACN**.

## Start here

1. [CURRENT HANDOFF](docs/HANDOFF.md) — read first on every new conversation/session.
2. [Current state](docs/PROJECT_STATE.md) — what actually exists, what does not, next verified task.
3. [Source software audit](docs/AUDIT_OPEN_SOURCE.md) — comparative evaluation and direct links.
4. [UI/UX specification](docs/UI_UX.md) — workspace, layout, interaction, design rules.
5. [Architecture](docs/ARCHITECTURE.md) — responsibilities, headless renderer, transport and offline strategy.
6. [Roadmap](docs/ROADMAP.md), [decisions](docs/DECISIONS.md), [licenses](docs/LICENSE_POLICY.md), [acceptance tests](docs/TEST_PLAN.md).

## Core principles

- **Create once; preview, simulate and run anywhere.** Source of truth is a versioned, portable show/patch model.
- The browser is the **editor and 3D preview**, **not** the mandatory show clock.
- Pixel-first mapping (1D/2D/3D, RGB/RGBW), cues and timelines, reusable effects, transport adapters.
- Site controls isolated behind WireGuard/Tailscale, never expose raw lighting UDP to the public Internet.
- Multi-site safety and deterministic fallback: outage of cloud or browser must not leave an uncontrolled installation.
- Reuse software through documented APIs; **no third-party code copy until per-component license analysis**.

## Contributing / AI sessions

Read [AGENTS.md](AGENTS.md) and [docs/HANDOFF.md](docs/HANDOFF.md). Keep the handoff and project state updated in the **same commit** as relevant code changes. Never claim a feature works unless it was tested.

## Provenance

Independent FLUXCUE project. Inspiration is explicitly credited in [the audit](docs/AUDIT_OPEN_SOURCE.md). Source code and licences of cited upstream projects are not incorporated merely by citing them.

The new original code in this repository is MIT-licensed unless stated otherwise. See [LICENSE](LICENSE). Third-party modules, if added, retain their own separate licences and attribution.
