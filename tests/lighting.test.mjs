import test from 'node:test';import assert from 'node:assert/strict';
import {lightSamples} from '../src/core/lighting.mjs';
const f={id:'1',visible:true,x:0,y:2,z:0,angle:0,length:2,pixels:60,emitterMode:'front',diffuser:'none'};
test('front emitter samples 2 positions, casts toward positive Z',()=>{
 const a=lightSamples([f]);assert.equal(a.length,2);assert.deepEqual(a.map(s=>s.side),[1,1]);
 assert.ok(a[0].x<0&&a[1].x>0);
});
test('dual emitter / tube uses opposed sampled light sources, hard capped',()=>{
 const dual=lightSamples([{...f,emitterMode:'dual'}],8);
 assert.deepEqual(dual.map(x=>x.side),[1,-1,1,-1]);
 assert.equal(lightSamples(Array.from({length:200},(_,i)=>({...f,id:String(i)}))).length,8);
 assert.equal(lightSamples([{...f,diffuser:'tube'}]).length,4);
});
test('invalid budget rejects and hidden emitters ignored',()=>{
 assert.equal(lightSamples([{...f,visible:false}]).length,0);
 assert.throws(()=>lightSamples([f],-1),RangeError);
});
