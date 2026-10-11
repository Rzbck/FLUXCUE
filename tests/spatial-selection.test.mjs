import test from 'node:test';
import assert from 'node:assert/strict';
import {chooseSelection,editableFixtures,selectionPivot,transformGroup,scenePixelPosition,spatialWave,spatialBlocks} from '../src/core/spatial-selection.mjs';

const order=['a','b','c','d','e'];
test('plain, Ctrl toggle and Shift range; never empty, always unique',()=>{
  assert.deepEqual(chooseSelection(['a'],'c',order),['c']);
  assert.deepEqual(chooseSelection(['a'],'c',order,{toggle:true}),['a','c']);
  assert.deepEqual(chooseSelection(['a','c'],'c',order,{toggle:true}),['a']);
  assert.deepEqual(chooseSelection(['a'],'a',order,{toggle:true}),['a']);
  assert.deepEqual(chooseSelection(['a'],'d',order,{range:true,anchor:'b'}),['b','c','d']);
  assert.deepEqual(chooseSelection(['a'],'d',order,{toggle:true,range:true,anchor:'b'}),['a','b','c','d']);
});
const f=(id,x,y,locked=false,visible=true)=>({id,x,y,z:0,angle:0,locked,visible});
test('group centroid excludes locked, hidden, nonselected objects',()=>{
  const all=[f('a',0,1),f('b',10,3),f('c',100,100,true),f('d',40,40,false,false)];
  assert.deepEqual(selectionPivot(editableFixtures(all,['a','b','c','d'])),{x:5,y:2,z:0});
});
test('group translation works for selected fixtures and refuses locked',()=>{
  const all=[f('a',0,0),f('b',2,0),f('c',10,0,true)];
  const moved=transformGroup(all,['a','b','c'],{x:1,y:0,z:0},{x:1,y:2,z:.5});
  assert.deepEqual(moved.map(x=>[x.x,x.y,x.z]),[[1,2,.5],[3,2,.5],[10,0,0]]);
  assert.deepEqual(all.map(x=>x.x),[0,2,10]);
});
test('group rotation about centroid preserves relative geometry and individual angles',()=>{
  const src=[f('a',0,0),f('b',2,0)];
  const dst=transformGroup(src,['a','b'],{x:1,y:0,z:0},{x:0,y:0,z:0},90);
  assert.deepEqual(dst.map(x=>[x.x,x.y,x.angle]),[[1,-1,90],[1,1,90]]);
});
test('world positions for all pixels cover rotated endpoints, 1px centered',()=>{
  const bar={x:0,y:1,z:2,angle:90,length:2,pixels:3};
  assert.deepEqual(scenePixelPosition(bar,0),{x:-6.123233995736766e-17,y:0,z:2});
  assert.equal(scenePixelPosition(bar,1).y,1);
  assert.equal(scenePixelPosition({...bar,pixels:1},0).y,1);
  assert.throws(()=>scenePixelPosition(bar,3),RangeError);
});
test('spatial patterns depend on 3D placement and time, are bounded/repeatable',()=>{
 const p={x:2,y:3,z:4};assert.equal(spatialWave(p,2),spatialWave(p,2));
 assert.ok(spatialWave(p,2)>=0&&spatialWave(p,2)<=1);
 assert.notEqual(spatialWave(p,2),spatialWave({...p,x:3},2));
 assert.equal(spatialBlocks({x:0,y:0,z:0},0),0);
 assert.equal(spatialBlocks({x:.5,y:0,z:0},0),1);
});
test('invalid group operations and positions fail closed',()=>{
 assert.throws(()=>transformGroup([f('a',0,0)],['a'],{x:0,y:0,z:0},{x:Infinity,y:0,z:0}),RangeError);
 assert.throws(()=>spatialWave({x:NaN,y:0,z:0},0),RangeError);
});
