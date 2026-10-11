import test from 'node:test';
import assert from 'node:assert/strict';
import {createFixtureArray} from '../src/core/layouts.mjs';
const base={id:'a',name:'LED',x:0,y:2,z:0,angle:0,pixels:60,length:1,group:'STAGE',visible:false,locked:true};
test('row X generates centered, separate, editable fixtures',()=>{
 let i=0;const a=createFixtureArray(base,'ROW X',5,.5,()=>String(i++));
 assert.deepEqual(a.map(f=>f.x),[-1,-.5,0,.5,1]);
 assert.equal(a[0].group,'STAGE');assert.equal(a[0].visible,true);assert.equal(a[0].locked,false);
 assert.equal(base.visible,false);
});
test('row Z generates parallel depth fixtures',()=>{
 let i=0;const a=createFixtureArray(base,'ROW Z',2,2,()=>String(i++));
 assert.deepEqual(a.map(f=>f.z),[-1,1]);
});
test('XY ring has uniform radial spacing, varied tangent orientation',()=>{
 let i=0;const a=createFixtureArray(base,'RING XY',4,1,()=>String(i++));
 assert.equal(a[0].group,'STAGE');assert.equal(a[0].angle,90);assert.equal(a[1].angle,180);
 assert.ok(Math.abs(a[0].x-a[1].x)>.3);
});
test('template does not allow huge layout, invalid spacings, duplicate ids',()=>{
 assert.throws(()=>createFixtureArray(base,'ROW X',500,.5,()=>'x'),RangeError);
 assert.throws(()=>createFixtureArray(base,'RING XY',5,0,()=>'x'),RangeError);
 assert.throws(()=>createFixtureArray(base,'ROW X',5,1,()=>'dup'),RangeError);
});
