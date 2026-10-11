/**
 * FLUXCUE pure patch utility — 1 based DMX slots, no pixel splitting across universes.
 * Note: protocol-specific universe encodings happen later, in output adapters.
 */
export function channelsPerPixel(format) {
  if (format === 'RGB') return 3;
  if (format === 'RGBW') return 4;
  throw new RangeError('Unsupported pixel channel format: ' + String(format));
}
export function patchFootprint(pixels, format, firstSlot = 1) {
  if (!Number.isSafeInteger(pixels) || pixels < 0 || pixels > 1000000) {
    throw new RangeError('Invalid pixel count');
  }
  const cpp = channelsPerPixel(format);
  if (!Number.isSafeInteger(firstSlot) || firstSlot < 1 || firstSlot > 512) {
    throw new RangeError('DMX start slot must be 1..512');
  }
  const slots = [];
  let universeOffset = 0;
  let slot = firstSlot;
  for (let i = 0; i < pixels; i++) {
    if (slot + cpp - 1 > 512) { universeOffset++; slot = 1; }
    slots.push({ pixel: i, universeOffset, slot, channels: cpp });
    slot += cpp;
  }
  return slots;
}
export function describePatch(pixels, format, firstSlot = 1) {
  const assignments = patchFootprint(pixels, format, firstSlot);
  return {
    pixels,
    format,
    channels: pixels * channelsPerPixel(format),
    universesUsed: assignments.length ? assignments.at(-1).universeOffset + 1 : 0,
    assignments
  };
}
