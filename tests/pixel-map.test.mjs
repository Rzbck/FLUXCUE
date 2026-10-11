import test from 'node:test';
import assert from 'node:assert/strict';
import {virtualPixelRows} from '../src/core/pixel-map.mjs';
const one={id:'a',name:'LED',pixels:3,length:2,x:1,y:0,z:0,angle:0,format:'RGB'};
test('CSV maps world-space 3D pixel points into local virtual per-fixture slots',()=>{
 const rows=virtualPixelRows([one]).trim().split('\n');
 assert.equal(rows.length,4);
 assert.equal(rows[1],'a,0,0.0000,0.0000,0.0000,RGB,0,1');
 assert.equal(rows[3],'a,2,2.0000,0.0000,0.0000,RGB,0,7');
});
test('virtual pixel map handles exact universe boundaries for RGBW',()=>{
 const data=virtualPixelRows([{...one,pixels:129,format:'RGBW',length:2}]).trim().split('\n');
 assert.ok(data[128].endsWith(',RGBW,0,509'));
 assert.ok(data[129].endsWith(',RGBW,1,1'));
});
test('CSV prevents formula injection in IDs, limits export and rejects malformed fixture',()=>{
 const csv=virtualPixelRows([{...one,id:'=HYPERLINK(0)'}]);
 assert.equal(csv.trim().split('\n')[1].split(',')[0],'_HYPERLINK_0_');
 assert.throws(()=>virtualPixelRows([one],2),RangeError);
 assert.throws(()=>virtualPixelRows([{...one,pixels:0}]),RangeError);
});
