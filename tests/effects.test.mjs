import test from 'node:test';import assert from 'node:assert/strict';
import {ADVANCED_EFFECTS,effectSample} from '../src/core/effects.mjs';
const w={x:1,y:2,z:3};
test('all 11 patterns finite and bounded at 0, 1 and many seconds',()=>{
 assert.equal(ADVANCED_EFFECTS.length,11);
 for(const fx of ADVANCED_EFFECTS)for(const t of [0,.2,1,7.5,500]){
  const a=effectSample(fx,.45,w,t,.7);
  assert.ok(Number.isFinite(a.level)&&a.level>=0&&a.level<=1,fx);
 }
});
test('same time/position yields same value; spatial effects respond to XYZ',()=>{
 for(const fx of ADVANCED_EFFECTS)assert.deepEqual(effectSample(fx,.25,w,1.3,1),effectSample(fx,.25,w,1.3,1));
 assert.notEqual(effectSample('spatial-ripple',.5,w,1,1).level,
  effectSample('spatial-ripple',.5,{x:4,y:3,z:2},1,1).level);
});
test('fire marks warm palette, unknown effects fail closed',()=>{
 assert.equal(effectSample('fire',.2,w,2,1).fire,true);
 assert.throws(()=>effectSample('unknown',.1,w,1,1),RangeError);
});
