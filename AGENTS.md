# AGENTS — FLUXCUE contribution / ChatGPT / Codex contract

Every new AI session MUST:
1. Read `README.md`, `docs/HANDOFF.md`, `docs/PROJECT_STATE.md`, `docs/DECISIONS.md`, `docs/ARCHITECTURE.md`, `docs/AUDIT_OPEN_SOURCE.md`, then inspect current Git HEAD and open issues.
2. Treat **GitHub** as the source of truth, NOT old chat summaries. Check `main` before proposing work.
3. Report last verified SHA, actual status, remaining risks, and one concrete next goal. Never imply untested code is deployed.
4. Work in a focused branch/PR when practical; small, understandable commits, no unrelated refactors.
5. Test changes at their layer. No fake success, simulated Art-Net labelled "LIVE", invented FPS, or hard-coded telemetry.
6. Update HANDOFF, PROJECT_STATE, decisions, tests and documentation **in the same PR/commit** that changes the facts. Date all external audits.
7. Preserve privacy: no VPS credentials, addresses, tokens, private Tailscale IPs, installation client data or signing keys in this PUBLIC repo.
8. Honor third-party licenses. Do not copy upstream GPL/EUPL code into FLUXCUE without explicit documented compliance decision. Ideas and concepts are not source code.
9. Keep the UI **compact, dark, professional, dense but legible**; usable at 1080p, with keyboard-first live operation and accessible focus states.
10. Design for an unattended cloud engine; the browser must be optional after show launch. For production, support a defined site-side fallback.

## Definition of done
Code + tests + docs + user-facing state + failure-mode notes. A task is not done when there is no reliable verification.

## Handoff checklist (required when ending a coding session)
- UTC date, HEAD SHA, branch, work committed/pushed
- what changed + exact file paths
- commands run + PASS/FAIL/NOT RUN
- what is live vs simulated, deployment status
- blockers and why
- next single goal with acceptance checks
- references to issues/PRs and dependency/license impacts

## Session bootstrap request
"Open https://github.com/Rzbck/FLUXCUE and read AGENTS.md, docs/HANDOFF.md, docs/PROJECT_STATE.md, docs/DECISIONS.md, docs/AUDIT_OPEN_SOURCE.md and current issues before making changes. Summarize the verified state, then propose and execute the top roadmap task. Update handoff with the real final commit."

## Architecture discipline
Model → timeline/effect graph → frame compositor → renderer output → protocol adapter → installation.
Services must have explicit resource ceilings, cancellation, clean shutdown and safe startup defaults.
