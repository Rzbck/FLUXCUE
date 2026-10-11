import test from 'node:test';import assert from 'node:assert/strict';
import {parseStudioProject,stringifyStudioProject} from '../src/core/project-store.mjs';
const fixture={id:'s1',name:'TEST',pixels:120,length:2,x:0,y:0,z:0,angle:0,format:'RGB',group:'STAGE',visible:true,locked:false};
const cue={id:'c1',name:'Intro',effect:'rainbow',fade:1,color:'#abcdef'};
test('roundtrip persisted fixtures/cues and UI state',()=>{const s=stringifyStudioProject({fixtures:[fixture],cues:[cue],selectedId:'s1',autoPlay:true,collapsedGroups:['STAGE']});const p=parseStudioProject(s);assert.equal(p.fixtures[0].density,60);assert.equal(p.cues[0].hold,5);assert.equal(p.autoPlay,true);assert.deepEqual(p.collapsedGroups,['STAGE']);assert.ok('geometry' in p.collapsedPanels);});
test('legacy project is migrated without replacing its physical LED count',()=>{const p=parseStudioProject(JSON.stringify({schemaVersion:'0.1.0',fixtures:[fixture],cues:[cue]}));assert.equal(p.fixtures[0].pixels,120);assert.equal(p.fixtures[0].chip,'GENERIC_RGB');assert.equal(p.fixtures[0].tint,'#ffffff');});
test('invalid and duplicate projects reject before any partial write',()=>{const source={schemaVersion:'0.1.0',fixtures:[fixture,{...fixture}],cues:[cue]};assert.throws(()=>parseStudioProject(JSON.stringify(source)),RangeError);assert.throws(()=>parseStudioProject('{}'),RangeError);});
test('malformed cue or invalid color is rejected',()=>{const raw={schemaVersion:'0.1.0',fixtures:[fixture],cues:[{...cue,color:'javascript:alert(1)'}]};assert.throws(()=>parseStudioProject(JSON.stringify(raw)),RangeError);});

test('valid restored show includes bounded running cue layers and blackout',()=>{
 const fixture={id:'f',name:'strip',pixels:60,length:1,x:0,y:0,z:0,angle:0,format:'RGB'};
 const cue={id:'c',name:'loop',effect:'rainbow',fade:1,color:'#ffffff',speed:.7};
 const d={schemaVersion:'0.1.0',fixtures:[fixture],cues:[cue],showTime:10,running:false,blackout:true,
  collapsedPanels:{cues:true,arrays:true},
  activeLayers:[{id:'a',cueId:'c',effect:'rainbow',color:'#ffffff',fade:1,started:8,mode:'ADD',targetIds:['f'],speed:.7}]};
 const p=parseStudioProject(JSON.stringify(d));
 assert.equal(p.showTime,10);assert.equal(p.running,false);assert.equal(p.blackout,true);
 assert.equal(p.collapsedPanels.cues,true);assert.equal(p.activeLayers[0].speed,.7);
});

test('legacy group migration retains old explicitly named STAGE fixtures',()=>{
 const p=parseStudioProject(JSON.stringify({schemaVersion:'0.1.0',fixtures:[fixture],cues:[cue]}));
 assert.deepEqual(p.groups,['STAGE']);assert.equal(p.fixtures[0].group,'STAGE');
});
test('empty manually managed groups are preserved, and ungrouped fixtures remain ungrouped',()=>{
 const data={schemaVersion:'0.1.0',fixtures:[{...fixture,group:''}],cues:[cue],groups:['MY GROUP','EMPTY GROUP']};
 const p=parseStudioProject(JSON.stringify(data));
 assert.deepEqual(p.groups,['MY GROUP','EMPTY GROUP']);assert.equal(p.fixtures[0].group,'');
});
test('unknown fixture group in explicit model is ungrouped, no auto-created groups',()=>{
 const p=parseStudioProject(JSON.stringify({schemaVersion:'0.1.0',fixtures:[fixture],cues:[cue],groups:[]}));
 assert.deepEqual(p.groups,[]);assert.equal(p.fixtures[0].group,'');
});

test('individual fixture colours are stored per cue and safely restored',()=>{
 const f2={...fixture,id:'s2'};
 const cueA={...cue,looks:{s1:'#ff0000',s2:'#0000ff',missing:'#abcdef'}};
 const p=parseStudioProject(JSON.stringify({schemaVersion:'0.1.0',fixtures:[fixture,f2],cues:[cueA]}));
 assert.deepEqual(p.cues[0].looks,{s1:'#ff0000',s2:'#0000ff'});
 assert.equal(p.cues[0].color,'#abcdef');
});

test('old automatic STAGE/FLOOR demo fixtures migrate to UNGROUPED',()=>{
 const defaults=[
  {...fixture,id:'s1',name:'STAGE / TOP',group:'STAGE'},
  {...fixture,id:'s2',name:'LEFT / VERTICAL',group:'STAGE'},
  {...fixture,id:'s3',name:'RIGHT / VERTICAL',group:'STAGE'},
  {...fixture,id:'s4',name:'FLOOR / FRONT',group:'FLOOR'}
 ];
 const result=parseStudioProject(JSON.stringify({schemaVersion:'0.1.0',fixtures:defaults,cues:[cue]}));
 assert.deepEqual(result.groups,[]);
 assert.ok(result.fixtures.every(f=>f.group===''));
});

test('uncommitted cue look draft and multiple target fixtures survive autosave',()=>{
 const second={...fixture,id:'s2'};
 const s=stringifyStudioProject({fixtures:[fixture,second],cues:[cue],
  editorDraft:{cueIndex:0,targetMode:'SELECTION',targetIds:['s1','s2'],looks:{s1:'#ff0000',s2:'#0000ff'},
    effect:'solid',color:'#ffffff',speed:.9}});
 const p=parseStudioProject(s);
 assert.deepEqual(p.editorDraft.targetIds,['s1','s2']);
 assert.equal(p.editorDraft.looks.s1,'#ff0000');
 assert.equal(p.editorDraft.looks.s2,'#0000ff');
 assert.equal(p.editorDraft.effect,'solid');
});

test('editable project title survives a JSON backup without leaking other metadata',()=>{
 const p=parseStudioProject(stringifyStudioProject({project:{name:'Stage Research'},
  fixtures:[fixture],cues:[cue],groups:[]}));
 assert.equal(p.projectName,'Stage Research');
 assert.equal(p.fixtures[0].id,'s1');
});

test('diffuser and directional emitter configuration survive project backup',()=>{
 const f={...fixture,diffuser:'tube',emitterMode:'dual',ledSizeMm:3.5};
 const result=parseStudioProject(stringifyStudioProject({fixtures:[f],cues:[cue],groups:[]}));
 assert.equal(result.fixtures[0].diffuser,'tube');
 assert.equal(result.fixtures[0].emitterMode,'dual');
 assert.equal(result.fixtures[0].ledSizeMm,3.5);
 const legacy=parseStudioProject(stringifyStudioProject({fixtures:[fixture],cues:[cue]}));
 assert.equal(legacy.fixtures[0].ledSizeMm,5);
 assert.equal(legacy.fixtures[0].emitterMode,'front');
});
