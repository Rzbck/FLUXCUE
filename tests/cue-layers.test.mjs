import test from 'node:test';import assert from 'node:assert/strict';
import {cueAppliesTo,layerEnvelope,composeRgb,cueNextAt} from '../src/core/cue-layers.mjs';
test('old all-fixture cues and new fixture-target cues',()=>{assert.equal(cueAppliesTo({},'a'),true);assert.equal(cueAppliesTo({targetIds:['b']},'a'),false);assert.equal(cueAppliesTo({targetIds:['b']},'b'),true);});
test('independent cue fades use own timebase',()=>{assert.equal(layerEnvelope(11,10,2),.5);assert.equal(layerEnvelope(20,10,2),1);assert.equal(layerEnvelope(11,12,2),0);});
test('add layer does not remove previous visible color',()=>{const a=[.2,.1,0],b=[0,.2,.2],c=composeRgb(a,b,.5,'ADD');assert.ok(c[0]>=a[0]);assert.ok(c[1]>a[1]);assert.equal(composeRgb(a,b,1,'REPLACE')[1],.2);});
test('autoplay threshold and malformed cues fail safe',()=>{assert.equal(cueNextAt(5,2),7);assert.throws(()=>cueNextAt(2,0),RangeError);});
