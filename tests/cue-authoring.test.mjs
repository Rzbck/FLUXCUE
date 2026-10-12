import test from 'node:test';import assert from 'node:assert/strict';
import {initialCueDraft,assignFixtureLook,finishCueDraft,cueEffectForFixture,cueColourForFixture} from '../src/core/cue-authoring.mjs';
const cue={id:'c',effect:'solid',color:'#ffffff',speed:.35,targetIds:[],looks:{},fixtureEffects:{}};
test('A red fire, then B blue plasma, without losing the first target or effect',()=>{
 let draft=initialCueDraft(cue);
 draft=assignFixtureLook(draft,['a'],{effect:'fire',color:'#ff0000'},['a','b','c']);
 draft=assignFixtureLook(draft,['b'],{effect:'plasma',color:'#0000ff'},['a','b','c']);
 const result=finishCueDraft(cue,draft,['a','b','c']);
 assert.deepEqual(result.targetIds,['a','b']);
 assert.equal(cueEffectForFixture(result,'a'),'fire');
 assert.equal(cueEffectForFixture(result,'b'),'plasma');
 assert.equal(cueColourForFixture(result,'a'),'#ff0000');
 assert.equal(cueColourForFixture(result,'b'),'#0000ff');
 assert.equal(cueEffectForFixture(result,'c'),'solid');
 assert.deepEqual(cue,{id:'c',effect:'solid',color:'#ffffff',speed:.35,targetIds:[],looks:{},fixtureEffects:{}});
});
test('cue save never targets deleted fixtures or invalid effects',()=>{
 const dirty={...initialCueDraft(cue),targetMode:'SELECTION',targetIds:['a','deleted'],
 looks:{a:'#ff0000',deleted:'#ff0000'},fixtureEffects:{a:'scanner',deleted:'strobe'}};
 const clean=finishCueDraft(cue,dirty,['a','b']);
 assert.deepEqual(clean.targetIds,['a']);
 assert.deepEqual(clean.fixtureEffects,{a:'scanner'});
 assert.deepEqual(clean.looks,{a:'#ff0000'});
 assert.throws(()=>finishCueDraft(cue,{...dirty,targetIds:[]},['a']),RangeError);
});
test('selecting a fixture does not implicitly change any cue',()=>{
 const draft=initialCueDraft({...cue,fixtureEffects:{a:'comet'},looks:{a:'#ffff00'}});
 const result=assignFixtureLook(draft,[],{effect:'fire',color:'#ff0000'},['a']);
 assert.deepEqual(result.fixtureEffects,{a:'comet'});
});
