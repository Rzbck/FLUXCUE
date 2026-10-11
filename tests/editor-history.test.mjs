import test from 'node:test';
import assert from 'node:assert/strict';
import {commitHistory,stepHistory,sameUndoableState} from '../src/core/editor-history.mjs';
const state=(x,color,groups=[])=>({fixtures:[{id:'s1',x,tint:color}],groups,cues:[{id:'c1',looks:{s1:color}}]});
test('one full drag is one history item regardless of intermediate pointer frames',()=>{
 const before=state(0,'#ffffff');
 const after=state(2,'#ffffff');
 const h=commitHistory([],[],before,after);
 assert.equal(h.undo.length,1);
 const undo=stepHistory(h.undo,h.redo,after,'undo');
 assert.equal(undo.current.fixtures[0].x,0);
 const redo=stepHistory(undo.undo,undo.redo,undo.current,'redo');
 assert.equal(redo.current.fixtures[0].x,2);
});
test('colour edits, groups and cue looks can all be undone in order',()=>{
 const a=state(0,'#ffffff');
 const b=state(0,'#ff0000');
 const c=state(0,'#ff0000',['My group']);
 const h1=commitHistory([],[],a,b);
 const h2=commitHistory(h1.undo,h1.redo,b,c);
 const u1=stepHistory(h2.undo,h2.redo,c,'undo');
 assert.deepEqual(u1.current.groups,[]);
 const u2=stepHistory(u1.undo,u1.redo,u1.current,'undo');
 assert.equal(u2.current.cues[0].looks.s1,'#ffffff');
 assert.equal(u2.current.fixtures[0].tint,'#ffffff');
});
test('new edit invalidates redo and history is capped',()=>{
 const a=state(0,'#ffffff'),b=state(1,'#ffffff');
 const h=commitHistory([],[],a,b,2);
 const u=stepHistory(h.undo,h.redo,b,'undo');
 const next=commitHistory(u.undo,u.redo,a,state(4,'#00ff00'),2);
 assert.equal(next.redo.length,0);
 assert.equal(commitHistory(next.undo,[],a,a).changed,false);
});

test('selecting objects and browsing cues does not use Ctrl+Z',()=>{
 const a={fixtures:[{id:'a',x:0}],selectedId:'a',selectedIds:['a'],activeIndex:0,editIndex:0};
 const b={...a,selectedId:'b',selectedIds:['b'],activeIndex:1,editIndex:1};
 assert.equal(sameUndoableState(a,b),true);
 assert.equal(sameUndoableState(a,{...b,fixtures:[{id:'a',x:1}]}),false);
});
