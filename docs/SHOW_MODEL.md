# Project / scene / fixture / patch / cue schema — draft v0.1

## Rules
- IDs are stable UUID-like strings; no object identity by array index.
- Scene geometry defines **physical or design-space** positions (meters), not addresses.
- Fixture pixel indices are zero-based; DMX slots 1..512; channels per pixel RGB=3, RGBW=4.
- Art-Net universe numbering semantics must be explicit (Net/SubUni address, never assume UI zero/one base).
- Model immutable show revision + separate live runtime state.
- Events/timeline ref IDs, allowing reordering and undo.
- Changes to patch require validation and cannot take effect in live output without apply/confirm.
- Avoid schema coupling to MoonLight, ASLS or FPP internals.

## Illustrative JSON (NOT final schema)
```json
{
  "schemaVersion": "0.1.0",
  "project": { "id": "sample-project", "name": "Demo installation" },
  "sites": [{ "id": "site-a", "name": "Venue A", "outputMode": "SIMULATOR" }],
  "fixtures": [{
    "id": "strip-01", "siteId": "site-a", "name": "Linear strip",
    "type": "led-strip", "pixels": 60, "channelsPerPixel": 3,
    "colorOrder": "RGB", "lengthMeters": 1,
    "points": [[0,0,0],[1,0,0]]
  }],
  "patches": [{ "fixtureId": "strip-01", "controllerId": "sim-01",
    "protocol": "SIMULATOR", "startUniverse": 0, "startSlot": 1 }],
  "groups": [{ "id": "all", "fixtureIds": ["strip-01"] }],
  "effects": [{ "id": "rainbow", "kind": "rainbow", "parameters": { "speedHz": 0.25 } }],
  "cues": [{ "id": "cue-01", "name": "Intro", "effectRefs": ["rainbow"],
    "fadeInMs": 1000, "holdMs": 5000, "trigger": "GO" }]
}
```

## Patch boundary example
RGB 170 pixels use 510 DMX slots. A 171st pixel MUST move to a different universe under a strict no-split-pixel policy. RGBW 128 pixels consume 512 channels. Unpatched/invalid pixels must never silently wrap into another fixture's channels.

## Next validation
Implement TypeScript schemas (e.g., Zod/JSON Schema) and reproducible test fixtures including zero, 170, 171, 128 RGBW, and conflicting controllers.

## Simulator-only geometry/mapping slice (PR #17)
Original pure scenePixelPosition, virtualPixelRows and createFixtureArray functions project straight LED strips to XYZ meter coordinates and fixture-local virtual patch slots. No Three.js dependency in these pure modules. Actual physical controller patching, global channel collision prevention, validated project schema, and multi-point/spline fixtures remain unimplemented and separate. No real packets generated.

## v0.2 simulator extension (PR #19)
- Fixture metadata: `chip` family, independent positive `density` LED/m, derived `pixels`, per-fixture `tint`, group/visibility/lock. Legacy imported fixture `pixels` retained when density inferred; future edits calculate count from `length * density`.
- Cue model extension: `hold` for AUTO, `mode` ADD/REPLACE, `targetIds` (empty = all) and `speed`. Runtime `activeLayers` have independent `started`, speed, fade, targets; limited to 12 in public preview. This is NOT the final immutable versioned show schema nor a physical controller cue engine.
- Browser-local 0.1.0 persistence includes UI collapse and playback fields under same schema for compatibility; validated before applying. No cloud sync, production restoration or authoritative clock guarantees.

## PR #20 explicit editor model (2026-10-11)
- `groups: string[]` is the user-created named group list, including empty groups. A fixture `group: ''` is ungrouped. No automatic grouping by chip, type, fixture name or generated layout.
- `cue.looks: {[fixtureId]: '#RRGGBB'}` stores optional different colours per fixture within a single cue. `activeLayer.looks` is copied when GO starts; cue colour remains the fallback for fixtures without custom looks. This does not change physical device patching.
- Global editor history snapshots contain fixture data, group list, cue data and current editing draft (separate from the show clock). Geometry group scale is length-only, not a spatial scaling of fixture centre positions.
