import test from 'node:test';
import assert from 'node:assert/strict';
import {createDocumentHistory} from '../src/core/document-history.mjs';
const doc=(x=0,fx='solid',color='#ffffff')=>({
  fixtures:[{id:'a',x}],cues:[{id:'c',fixtureEffects:{a:fx},looks:{a:color}}],
  selectedId:'a',selectedIds:['a'],editIndex:0,activeIndex:0
});
test('an actual 3D drag is one atomic transaction with stable undo/redo',()=>{
  const h=createDocumentHistory(),a=doc(),b=doc(1.75);
  h.reset(a);h.begin(a,'Move LED');h.commit(b);
  assert.equal(h.depth,1);assert.equal(h.operations[0],'Move LED');
  assert.deepEqual(h.undo(b),a);assert.deepEqual(h.redo(a),b);
});
test('only selecting a fixture or browsing a cue does not create Undo steps',()=>{
  const h=createDocumentHistory(),a=doc();
  h.reset(a);
  h.observe({...a,selectedId:'b',selectedIds:['b'],editIndex:2,activeIndex:1});
  assert.equal(h.depth,0);
  const moved=doc(4);
  h.push({...a,selectedId:'b'},moved);
  assert.equal(h.undo(moved).fixtures[0].x,0);
});
test('nested pointer/input events are not committed until explicit transaction end',()=>{
  const h=createDocumentHistory(),a=doc();
  h.reset(a);h.begin(a,'Change cue');h.begin(doc(4),'ignored nested');
  h.observe(doc(10));assert.equal(h.depth,0);
  h.commit(doc(3,'comet','#ff0088'));assert.equal(h.depth,1);
  assert.deepEqual(h.undo(doc(3)),a);
});
test('colour and cue effects remain atomic; redo invalidated after replacement',()=>{
  const h=createDocumentHistory(),a=doc(),b=doc(0,'fire','#ff0000'),c=doc(0,'plasma','#00ccff');
  h.reset(a);h.push(a,b);assert.deepEqual(h.undo(b),a);
  h.push(a,c);assert.equal(h.redoDepth,0);
  assert.deepEqual(h.undo(c),a);
});
test('snapshots cannot be mutated through later reactive object writes',()=>{
  const h=createDocumentHistory(),a=doc(),b=doc(9);
  h.reset(a);h.push(a,b);a.fixtures[0].x=42;b.fixtures[0].x=55;
  assert.equal(h.undo(b).fixtures[0].x,0);
  assert.equal(h.redo(a).fixtures[0].x,9);
});
test('untracked legacy numeric input is observed exactly once',()=>{
  const h=createDocumentHistory(),a=doc(),b=doc(2);
  h.reset(a);assert.equal(h.observe(b),true);
  assert.equal(h.observe(b),false);assert.equal(h.depth,1);
  assert.equal(h.undo(b).fixtures[0].x,0);
});

test('switching the cue inspector skips phantom undo while preserving prior edits',()=>{
 const h=createDocumentHistory(),a=doc(),b=doc(4);
 h.reset(a);h.push(a,b,'Move fixture');
 h.navigate({...b,selectedId:'another',editIndex:2,cues:[{id:'other',fixtureEffects:{},looks:{}}]});
 assert.equal(h.depth,1);
 assert.equal(h.undo(b).fixtures[0].x,0);
});
