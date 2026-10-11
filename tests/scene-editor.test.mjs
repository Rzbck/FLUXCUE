import test from 'node:test';
import assert from 'node:assert/strict';
import {snapPosition,snapAngle,editorTransform,duplicateFixture,sameScene,sanitizeFixture} from '../src/core/scene-editor.mjs';
test('fine movement grid supports 1cm, 5cm, 10cm and FREE without floating drift',()=>{
  assert.equal(snapPosition(1.234,0.01),1.23);
  assert.equal(snapPosition(-1.238,0.05),-1.25);
  assert.equal(snapPosition(0.28,0.1),0.3);
  assert.equal(snapPosition(0.1234567,0),0.123457);
  assert.equal(snapPosition(0.47,0.25),0.5);
});
test('rotation snap handles 1°, 15°, negative angles and wrap-around',()=>{
  assert.equal(snapAngle(14.6,1),15);
  assert.equal(snapAngle(22,15),15);
  assert.equal(snapAngle(-17,15),-15);
  assert.equal(snapAngle(365,0),5);
  assert.equal(snapAngle(181,0),-179);
});
test('transform always maps XYZ and Z rotation, rejects non-finite and out of bounds',()=>{
  const a=editorTransform({id:'a'},{x:1.2324,y:0.33,z:-1.2},Math.PI/2);
  assert.deepEqual(a,{x:1.2324,y:0.33,z:-1.2,angle:90});
  assert.throws(()=>editorTransform({id:'a'},{x:Infinity,y:0,z:0},0),RangeError);
  assert.throws(()=>editorTransform({id:'a'},{x:1001,y:0,z:0},0),RangeError);
});
test('duplicate retains geometry and group but produces an unlocked, visible new ID',()=>{
  const src={id:'old',name:'LED',x:0.25,y:1,z:0,angle:45,length:2,pixels:80,format:'RGBW',group:'FLOOR',visible:false,locked:true};
  const dst=duplicateFixture(src,'new',0.1);
  assert.equal(dst.id,'new');assert.equal(dst.name,'LED COPY');assert.equal(dst.x,0.4);
  assert.equal(dst.group,'FLOOR');assert.equal(dst.pixels,80);
  assert.equal(dst.visible,true);assert.equal(dst.locked,false);assert.equal(src.id,'old');
});
test('scene snapshots distinguish edits and preserve exact duplicates for undo/redo',()=>{
  const a={fixtures:[{id:'a',x:1}],selectedId:'a'};
  const b={fixtures:[{id:'a',x:1}],selectedId:'a'};
  assert.equal(sameScene(a,b),true);
  b.fixtures[0].x=2;
  assert.equal(sameScene(a,b),false);
});
test('invalid snap and duplicate arguments fail closed',()=>{
  assert.throws(()=>snapPosition(NaN,0.01),RangeError);
  assert.throws(()=>snapPosition(0,-1),RangeError);
  assert.throws(()=>snapAngle(0,Infinity),RangeError);
  assert.throws(()=>duplicateFixture({id:'old'},'old',0.1),RangeError);
});

test('transient empty or invalid number fields cannot corrupt patch or scene transforms',()=>{
  const raw={id:'p',pixels:'',length:Infinity,x:NaN,y:1.3,z:2000,angle:Infinity,group:'',visible:true};
  const clean=sanitizeFixture(raw);
  assert.equal(clean.pixels,1);
  assert.equal(clean.length,2);
  assert.equal(clean.x,0);
  assert.equal(clean.y,1.3);
  assert.equal(clean.z,1000);
  assert.equal(clean.angle,0);
  assert.equal(clean.group,'');
  assert.equal(raw.group,'');
});
