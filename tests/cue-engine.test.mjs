import test from 'node:test';
import assert from 'node:assert/strict';
import { fadeFactor, blendChannel, advancePreviewClock } from '../src/core/cue-engine.mjs';

test('fade is deterministic at boundaries, 50%, zero duration and on seeking', () => {
  assert.equal(fadeFactor(9,10,2),0);
  assert.equal(fadeFactor(10,10,2),0);
  assert.equal(fadeFactor(11,10,2),0.5);
  assert.equal(fadeFactor(12,10,2),1);
  assert.equal(fadeFactor(20,10,2),1);
  assert.equal(fadeFactor(10,10,0),1);
  assert.equal(fadeFactor(9,10,0),0);
  assert.equal(fadeFactor(10.5,10,2),0.25);
});
test('fade rejects invalid timestamps and durations', () => {
  assert.throws(()=>fadeFactor(NaN,0,1),RangeError);
  assert.throws(()=>fadeFactor(1,0,-1),RangeError);
  assert.throws(()=>fadeFactor(Infinity,0,1),RangeError);
});
test('per-channel RGB interpolation is stable and clamps progress', () => {
  assert.equal(blendChannel(0,1,0.5),0.5);
  assert.equal(blendChannel(0.7,0.1,0),0.7);
  assert.equal(blendChannel(0.7,0.1,1),0.1);
  assert.equal(blendChannel(0,1,-1),0);
  assert.equal(blendChannel(0,1,3),1);
});
test('interrupted cue transition starts exactly at old displayed colour', () => {
  const sampleAt=10.8;
  const oldVisible=blendChannel(0.1,0.9,fadeFactor(sampleAt,10,2));
  // Snapshot before changing target: sample at the same time must be identical.
  assert.equal(blendChannel(oldVisible,0.2,fadeFactor(sampleAt,sampleAt,1)),oldVisible);
  assert.equal(blendChannel(oldVisible,0.2,fadeFactor(sampleAt+0.5,sampleAt,1)),(oldVisible+0.2)/2);
});
test('preview clock obeys pause, capped delta and input checks', () => {
  assert.equal(advancePreviewClock(10,0.1,false),10);
  assert.equal(advancePreviewClock(10,0.1,true),10.1);
  assert.equal(advancePreviewClock(10,30,true),10.1);
  assert.throws(()=>advancePreviewClock(2,-1,true),RangeError);
});
