import test from 'node:test';import assert from 'node:assert/strict';
import {CHIP_PROFILES,pixelCountFor,inferredDensity,chipFormat,scaleSelected} from '../src/core/hardware.mjs';
test('addressable chip profiles have RGB/RGBW and density is independent of chip',()=>{assert.ok(CHIP_PROFILES.length>=7);assert.equal(chipFormat('SK6812'),'RGBW');assert.equal(pixelCountFor(2,60),120);assert.equal(pixelCountFor(1,144),144);});
test('old fixtures infer density but preserve exact pixels',()=>{assert.equal(inferredDensity({pixels:125,length:2.5}),50);assert.equal(inferredDensity({pixels:60,length:1}),60);});
test('scale group maintains density and skips locked objects',()=>{const a={id:'a',x:0,y:0,z:0,length:2,pixels:120,density:60,visible:true,locked:false};const b={...a,id:'b',x:4,locked:true};const v=scaleSelected([a,b],['a','b'],{x:1,y:0,z:0},2);assert.equal(v[0].length,4);assert.equal(v[0].pixels,240);assert.equal(v[0].x,0);assert.equal(v[1].x,4);});
test('invalid density, scale and bounds rejected',()=>{assert.throws(()=>pixelCountFor(0,60),RangeError);assert.throws(()=>scaleSelected([],[],{x:0,y:0,z:0},0),RangeError);});

test('scaling several spaced strips never spreads them or changes their orientations',()=>{
 const base={y:1,z:2,angle:90,length:2,density:60,pixels:120,locked:false,visible:true};
 const strips=[{...base,id:'left',x:-3},{...base,id:'right',x:3}];
 const next=scaleSelected(strips,['left','right'],{x:0,y:1,z:2},1.5);
 assert.deepEqual(next.map(s=>[s.x,s.y,s.z,s.angle,s.length,s.pixels]),[[-3,1,2,90,3,180],[3,1,2,90,3,180]]);
});
