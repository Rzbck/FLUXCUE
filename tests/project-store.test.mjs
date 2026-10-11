import test from 'node:test';import assert from 'node:assert/strict';
import {parseStudioProject,stringifyStudioProject} from '../src/core/project-store.mjs';
const fixture={id:'s1',name:'TEST',pixels:120,length:2,x:0,y:0,z:0,angle:0,format:'RGB',group:'STAGE',visible:true,locked:false};
const cue={id:'c1',name:'Intro',effect:'rainbow',fade:1,color:'#abcdef'};
test('roundtrip persisted fixtures/cues and UI state',()=>{const s=stringifyStudioProject({fixtures:[fixture],cues:[cue],selectedId:'s1',autoPlay:true,collapsedGroups:['STAGE']});const p=parseStudioProject(s);assert.equal(p.fixtures[0].density,60);assert.equal(p.cues[0].hold,5);assert.equal(p.autoPlay,true);assert.deepEqual(p.collapsedGroups,['STAGE']);});
test('legacy project is migrated without replacing its physical LED count',()=>{const p=parseStudioProject(JSON.stringify({schemaVersion:'0.1.0',fixtures:[fixture],cues:[cue]}));assert.equal(p.fixtures[0].pixels,120);assert.equal(p.fixtures[0].chip,'GENERIC_RGB');assert.equal(p.fixtures[0].tint,'#ffffff');});
test('invalid and duplicate projects reject before any partial write',()=>{const source={schemaVersion:'0.1.0',fixtures:[fixture,{...fixture}],cues:[cue]};assert.throws(()=>parseStudioProject(JSON.stringify(source)),RangeError);assert.throws(()=>parseStudioProject('{}'),RangeError);});
test('malformed cue or invalid color is rejected',()=>{const raw={schemaVersion:'0.1.0',fixtures:[fixture],cues:[{...cue,color:'javascript:alert(1)'}]};assert.throws(()=>parseStudioProject(JSON.stringify(raw)),RangeError);});
