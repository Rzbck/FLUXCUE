# FLUXCUE — rebuild the foundations instead of piling on patches
Date: 2026-10-12 · Working PR: [#27](https://github.com/Rzbck/FLUXCUE/pull/27) **DRAFT** · Public baseline: `918afa1b752288ae92cc08350eb90c2eb33f6e59`

## Why the previous implementation was not professionally reliable
The original `src/App.vue` combined project scene state, mutable fixture transforms, cue drafts, cue playback, reactive autosave, undo stacks, input focus handling, DOM shortcuts and the WebGL renderer into one large component (~90 kB). Mutations occurred by at least three different routes: direct `v-model`, action functions calling `rememberScene`, and a deep reactive watcher trying to infer changes after the fact. Meanwhile cue effect `effect` was **global** to a cue, with only per-fixture colour overrides. Tests verified isolated snapshots and one pointer gesture, not the complete editing workflow. The user repeatedly reported broken Undo and unintuitive effect creation, so unit PASS alone does **not** establish acceptance.

## Target architecture (source of truth / seams)
1. **Document schema:** typed, versioned project model for fixtures, reusable FX programs, cue tracks, groups, lighting patch. No DOM, Vue or Three dependencies. Validated import, migration and limits.
2. **Document command transactions:** one command bus owns mutation, before/after snapshots, bounded Undo/Redo, coalesced gestures and explicit document revisions. Browsing a cue or selecting another fixture is *navigation*, not a document edit.
3. **Effect program registry:** parameter descriptors, presets, RGB/RGBW colors, 1D/2D/3D fields, masks and reusable modifiers. Effect programs are data; renderer evaluates them independently of UI.
4. **Cue composer and show state:** independent per-fixture/group effect programs and colours, explicit UPDATE vs NEW and separate GO, deterministic layer weights/clock. Draft state must survive cue navigation/reload without changing live playback.
5. **Rendering adapters:** convert fixture world XYZ + current cue frame into WebGL pixel visuals, approximate stage illumination and output frames; no cue business logic in WebGL. Stage geometry/shadows independent of fixtures.
6. **Patch/output adapters:** validated DMX universes, protocol senders, hardware power/calibration, service clock and site failover, explicitly separate from public simulator.
7. **UI shell/controllers:** compact black Vue UI, keyboard mapping and panels. Actions dispatch commands; UI does not own business rules, and no deep watcher silently invents a transaction.

## Foundation PR #27 — implemented in branch, NOT deployed
- `src/core/document-history.mjs`: pure bounded transaction engine replacing two competing stack/reactive history paths; `begin`, `commit`, `push`, `observe`, `undo`, `redo`, `navigate`, `reset`. Before/after state is deep-copied. Navigation of selected fixtures and cue inspector does not consume Undo.
- Removed superseded `src/core/editor-history.mjs` and its tests; App uses one history authority. Focused property-edit gestures, explicit menu operations, gizmo before/after drag, keyboard undo/redo and legacy reactive field observation converge on that authority. `history.reset` is explicit on restore/import; UI undo counts mirror history depth.
- `src/core/cue-authoring.mjs`: pure independent per-fixture effect and colour operations, cue draft creation/commit and lookup. Per-strip `fixtureEffects` added to Cue, ActiveLayer, editor draft and validated project JSON; backward-compatible missing maps default to `{}`.
- Editor dropdown effect and colour independently update the selected strip(s) in **draft**; the selection switches without erasing previous strip programs. Shared cue commit function persists both FX and colours in UPDATE or NEW. GO copies exactly the saved per-strip FX maps into its live layer; the preview sampler and running compositor read those same per-fixture values.
- Browser smoke expanded from gizmo/keyboard to real Vue event dispatch: fixture A Fire/red, fixture B Plasma/blue, UPDATE → Ctrl+Z → Redo → GO. Tests also validate JSON round-trip, legacy migration, navigation-only Undo exclusions and independent FX/color mutations. This is a browser workflow assertion, not proof every UI gesture in Brave behaves correctly.
- Existing actual Chrome pointer X gizmo/Undo proof remains. **Do not assert** Y/Z/rotate/scale, every context-menu action, colour-dialog keyboard, real Brave hardware or custom effect graph are solved.
- No new dependencies, copied upstream code, private server or live Art-Net/sACN output. `main`/GitHub Pages intentionally unchanged pending acceptance.

## Explicit debt after foundation stage 1
- App.vue still mixes geometry construction, render loop, group commands, fields and cue transport. **Phase 2 must split** `useSceneEditor`, `useCueComposer`, `useDocumentStore`, `PreviewRenderer`, and a transport controller; eliminate the legacy inferred-history watcher after all command paths are migrated.
- Per-strip `fixtureEffects` stores a built-in mode ID, not a fully parametric reusable effect definition. This is a reliable composition step, **not** a professional visual FX generator. Next: named effect programs, parameter registry, editable source/transform/colour palettes, modular mask/FX chain and per-fixture parameter snapshot.
- The project still serializes `schemaVersion:0.1.0`; design v0.3 migrations before removing legacy fields. Do NOT corrupt existing local saves.
- Cue editing still needs a per-cue persistent draft session so switching between cues does not discard unsaved work; this requires a clear explicit lifecycle and tests.
- A single actual mouse X drag and synthetic other-axis drags are insufficient for Brave acceptance. Expand Chrome E2E across X/Y/Z/rotate/scale/multiselection/input focus, and measure performance before publishing to main.

## Release gate and explicit user acceptance
The PR remains DRAFT and **must not be merged** until exact HEAD CI is green, real browser interactivity cases pass including UPDATE→GO, project save/load and Undo/Redo, no regression at 1366×768/1920×1080, and user-visible draft/legacy behavior is clearly explained. Ask the user to validate the resulting preview before describing the foundation as complete.

## References
- [PR #27](https://github.com/Rzbck/FLUXCUE/pull/27)
- [Audit of 13 upstream solutions](AUDIT_STUDIO_PRODUCT_GAPS_2026-10-11.md)
- [Current project architecture](ARCHITECTURE.md)
- [Issue #23: parameterized effect library](https://github.com/Rzbck/FLUXCUE/issues/23)
- [Issue #25: browser pointer/Undo and performance](https://github.com/Rzbck/FLUXCUE/issues/25)
- [Issue #26: cue tracks and deterministic timeline](https://github.com/Rzbck/FLUXCUE/issues/26)
