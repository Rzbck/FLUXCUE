import test from 'node:test';
import assert from 'node:assert/strict';
import { channelsPerPixel, patchFootprint, describePatch } from '../src/core/patch.mjs';

test('RGB fixture fits 170 pixels in universe at slot 1', () => {
  const p = describePatch(170, 'RGB');
  assert.equal(p.channels, 510);
  assert.equal(p.universesUsed, 1);
  assert.deepEqual(p.assignments.at(-1), { pixel: 169, universeOffset: 0, slot: 508, channels: 3 });
});
test('RGB pixel 171 begins next universe without channel split', () => {
  const p = patchFootprint(171, 'RGB');
  assert.deepEqual(p.at(-1), { pixel: 170, universeOffset: 1, slot: 1, channels: 3 });
});
test('RGBW 128 pixels fills 512 channels exactly', () => {
  const p = describePatch(128, 'RGBW');
  assert.equal(p.channels, 512);
  assert.equal(p.universesUsed, 1);
  assert.equal(p.assignments.at(-1).slot, 509);
});
test('RGBW 129th pixel starts next universe', () => {
  assert.deepEqual(patchFootprint(129, 'RGBW').at(-1), { pixel: 128, universeOffset: 1, slot: 1, channels: 4 });
});
test('respects arbitrary starting slot without splitting pixel', () => {
  assert.deepEqual(patchFootprint(2, 'RGB', 511).map(x => [x.universeOffset, x.slot]), [[1, 1], [1, 4]]);
});
test('invalid inputs rejected', () => {
  assert.throws(() => patchFootprint(-1, 'RGB'), RangeError);
  assert.throws(() => patchFootprint(1, 'RG'), RangeError);
  assert.throws(() => patchFootprint(1, 'RGB', 0), RangeError);
  assert.equal(channelsPerPixel('RGBW'), 4);
});
