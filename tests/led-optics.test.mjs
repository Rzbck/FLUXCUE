import test from 'node:test';import assert from 'node:assert/strict';
import {optics,copyFixtures} from '../src/core/led-optics.mjs';
test('LED defaults 5mm, bare front-facing; two rows distinct from tube optics',()=>{
 assert.deepEqual(optics({}),{diffuser:'none',emitterMode:'front',ledSizeMm:5});
 assert.equal(optics({diffuser:'tube',emitterMode:'dual'}).diffuser,'tube');
 assert.equal(optics({ledSizeMm:20}).ledSizeMm,8);
});
test('clipboard duplicates entire selected fixtures but not original IDs',()=>{
 const a={id:'1',name:'LED',x:0,y:1,group:'G',diffuser:'tube',emitterMode:'dual',pixels:60};
 const c=copyFixtures([a],['1'],()=>'2');
 assert.equal(c[0].x,.2);assert.equal(c[0].diffuser,'tube');assert.equal(c[0].group,'G');assert.equal(a.id,'1');
 assert.throws(()=>copyFixtures([a],['1'],()=>'1'),RangeError);
});
