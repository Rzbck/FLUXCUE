# Licensing / code provenance policy

**Original FLUXCUE code:** MIT License (`LICENSE`). This only covers code authored for FLUXCUE, not third-party work.

## Verified upstream project-level indicators (2026-10-11)
- ASLS Studio: GPL-3.0 — https://github.com/ASLS-org/studio
- MoonLight (MoonModules): GPL-3.0 — https://github.com/MoonModules/MoonLight
- xLights: GPL-3.0 — https://github.com/xLightsSequencer/xLights
- LedFx: GPL-3.0 — https://github.com/LedFx/LedFx
- QLC+: **Apache-2.0** — https://github.com/mcallegari/qlcplus
- GeoPix: MIT, but TouchDesigner runtime governed separately — https://github.com/EnviralDesign/GeoPix
- WLED: **EUPL-1.2** — https://github.com/wled/WLED
- OLA: mixed LGPL client library and GPL daemon/plugin source; file-level verification — https://github.com/OpenLightingProject/ola
- Falcon Player: mixed GPL/LGPL and components under other restrictions; per-file — https://github.com/FalconChristmas/fpp
- artnet_led_mapper: GPL-3.0 — https://github.com/cyberboy666/artnet_led_mapper
- LX/Chromatik: custom restrictive, **not open-source in the OSI sense** — https://github.com/heronarts/LX

## Rules
1. Do not paste external code, images, icons, layouts, bundled fixture data, shader snippets, or assets without source+license+attribution review.
2. "Inspired by interaction patterns" is different from wholesale UI/layout copying; reproduce behavior independently.
3. GPL services linked/combined/distributed with our code have nuanced compliance obligations. Separate-process architecture is not an automatic legal safe harbor; consider actual integration/distribution with counsel before release.
4. For any vendored package add `THIRD_PARTY_NOTICES.md`: URL, pinned commit, relevant SPDX and file-level exceptions, changes made, redistribution obligations.
5. Keep original FLUXCUE code separable from mixed-license adapters; technical capability does not authorize license bypass.
6. On public release, ensure notices, source offers when required, and dependency scans are part of CI.
7. Code shown only as a design reference is never automatically incorporated into repo.
