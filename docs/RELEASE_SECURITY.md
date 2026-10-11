# Public release security gates — 2026-10-11

## Hard line between public and private
Public GitHub receives only original Studio source, lockfile, tests, CI, static `dist` release archive, digest and provenance. No Oracle/IP/SSH key, customer details, Tailscale auth/identity, secret variables, private workflow, credentials or live lighting outputs. Private `Rzbck/FLUXCUE-Deploy` is operator docs, NOT a GitHub Actions pipeline. A GitHub plugin connection does not imply VPS connectivity.

## Threat model and guardrails
- **Malicious npm dependency/postinstall:** lockfile fixes resolved URLs and SHA-512 integrity; scan requires public registry; install uses `--ignore-scripts`, jobs have no private secrets or write token. Dependencies can still execute during build; therefore no privileged build job.
- **Workflow supply-chain compromise:** each third-party action pinned to a verified full 40-char upstream commit. Read-only CI token. Manual-release `publish` job has `contents:write` only, does not run npm, checkout project source or touch Oracle.
- **Public leak by accidental commit:** check tracked paths and high-confidence private keys/tokens/hostnames/IP patterns before install; fail CI without printing the secret. Binary tracked files are rejected pending review. Historical commits require separate scanning/rotation.
- **Leak inside built JS:** scan built `dist/` for prohibited identifiers; reject hidden assets and `.map` sourcemaps. No `VITE_*` secrets injected into job environment; public front-end must never hold a server credential.
- **Artifact substitution:** publication downloads exact build job artifact, verifies source SHA, CI URL, expected asset filename and SHA256 digest before release; GitHub release tag must not pre-exist. Digest detects corruption, not a signing identity.
- **Unexpected release:** manually triggered only by repository owner from `main`; no tag push or automatic deployment. The GitHub publishing permission is ephemeral to a single release job.

## Provenance and operator verification
1. Inspect release `manifest.json` (exact `source_sha`, tag, CI URL, mode SIMULATOR).
2. Verify CI link points to successful `FLUXCUE Studio CI` push run for the exact `source_sha` on `main`.
3. Download archive and `SHA256SUMS` from the same verified GitHub release and run `sha256sum --check SHA256SUMS`; verify manifest's SHA256 also matches.
4. Do not treat a draft/tag or source archive as a deployed or smoke-tested build. Never run `npm install` on the Oracle VPS as part of release promotion.
5. First perform reviewed Oracle inventory in read-only mode through an approved separate operator channel. Do not open SSH/UDP to the internet.

## Known limits
This is a basic credential/pattern scan, not a full secret-history, malware or dependency security audit. Third-party dependency updates and upstream Actions SHA pins require review. Production SLSA provenance/signing, branch protections, review requirements, artifact attestations and independent client smoke tests remain future upgrades, not claimed.
