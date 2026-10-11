import test from 'node:test';import assert from 'node:assert/strict';
import {CHIP_PROFILES,pixelCountFor,inferredDensity,chipFormat,scaleSelected} from '../src/core/hardware.mjs';
test('addressable chip profiles have RGB/RGBW and density is independent of chip',()=>{assert.ok(CHIP_PROFILES.length>=7);assert.equal(chipFormat('SK6812'),'RGBW');assert.equal(pixelCountFor(2,60),120);assert.equal(pixelCountFor(1,144),144);});
test('old fixtures infer density but preserve exact pixels',()=>{assert.equal(inferredDensity({pixels:125,length:2.5}),50);assert.equal(inferredDensity({pixels:60,length:1}),60);});
test('scale group maintains density and skips locked objects',()=>{const a={id:'a',x:0,y:0,z:0,length:2,pixels:120,density:60,visible:true,locked:false};const b={...a,id:'b',x:4,locked:true};const v=scaleSelected([a,b],['a','b'],{x:1,y:0,z:0},2);assert.equal(v[0].length,4);assert.equal(v[0].pixels,240);assert.equal(v[0].x,-1);assert.equal(v[1].x,4);});
test('invalid density, scale and bounds rejected',()=>{assert.throws(()=>pixelCountFor(0,60),RangeError);assert.throws(()=>scaleSelected([],[],{x:0,y:0,z:0},0),RangeError);});
