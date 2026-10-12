/**
 * Pure cue authoring and playback contracts.
 * One cue may contain different effects and colours for every target fixture.
 * The empty saved targetIds array retains legacy ALL semantics.
 */
export const FX_IDS=Object.freeze([
 'solid','rainbow','chase','gradient','spatial-wave','spatial-blocks',
 'breath','pulse','comet','scanner','theater','sparkle','fire','plasma',
 'spatial-ripple','spatial-orbit','strobe'
]);
export const isFx=fx=>FX_IDS.includes(fx);
export const isColor=x=>typeof x==='string'&&/^#[0-9a-f]{6}$/i.test(x);
export function initialCueDraft(cue){
 if(!cue)throw new TypeError('Missing cue');
 return {effect:cue.effect,color:cue.color,speed:cue.speed,
  targetMode:cue.targetIds?.length?'SELECTION':'ALL',
  targetIds:[...(cue.targetIds||[])],
  looks:{...(cue.looks||{})},
  fixtureEffects:{...(cue.fixtureEffects||{})}};
}
export function assignFixtureLook(draft,ids,{effect,color},knownIds){
 if(!Array.isArray(ids)||!draft||!isFx(effect)||!isColor(color))throw new TypeError('Invalid fixture look');
 const allowed=new Set(knownIds);
 const selected=[...new Set(ids)].filter(id=>allowed.has(id));
 if(!selected.length)return {...draft};
 const looks={...draft.looks},fixtureEffects={...draft.fixtureEffects};
 for(const id of selected){looks[id]=color;fixtureEffects[id]=effect;}
 return {...draft,targetMode:'SELECTION',
  targetIds:[...new Set([...(draft.targetIds||[]),...selected])],
  looks,fixtureEffects};
}
function appendTargets(draft,ids,knownIds){
 const allowed=new Set(knownIds);
 const selected=[...new Set(ids)].filter(id=>allowed.has(id));
 return {...draft,targetMode:'SELECTION',
  targetIds:[...new Set([...(draft.targetIds||[]),...selected])]};
}
export function assignFixtureEffect(draft,ids,effect,knownIds){
 if(!isFx(effect)||!draft)throw new TypeError('Invalid effect');
 const next=appendTargets(draft,ids,knownIds),fixtureEffects={...draft.fixtureEffects};
 for(const id of ids)if(next.targetIds.includes(id))fixtureEffects[id]=effect;
 return {...next,fixtureEffects};
}
export function assignFixtureColour(draft,ids,color,knownIds){
 if(!isColor(color)||!draft)throw new TypeError('Invalid colour');
 const next=appendTargets(draft,ids,knownIds),looks={...draft.looks};
 for(const id of ids)if(next.targetIds.includes(id))looks[id]=color;
 return {...next,looks};
}
export function cueEffectForFixture(source,id){
 return isFx(source?.fixtureEffects?.[id])?source.fixtureEffects[id]:source.effect;
}
export function cueColourForFixture(source,id){
 return isColor(source?.looks?.[id])?source.looks[id]:source.color;
}
export function finishCueDraft(cue,draft,knownIds){
 const known=new Set(knownIds);
 if(!isFx(draft.effect)||!isColor(draft.color))throw new TypeError('Invalid cue defaults');
 const targetIds=draft.targetMode==='ALL'?[]:[...new Set(draft.targetIds)].filter(id=>known.has(id));
 if(draft.targetMode==='SELECTION'&&!targetIds.length)throw new RangeError('Select at least one fixture');
 const target=new Set(targetIds.length?targetIds:known);
 return {...cue,effect:draft.effect,color:draft.color,speed:draft.speed,targetIds,
  looks:Object.fromEntries(Object.entries(draft.looks||{}).filter(([id,c])=>target.has(id)&&isColor(c))),
  fixtureEffects:Object.fromEntries(Object.entries(draft.fixtureEffects||{}).filter(([id,fx])=>target.has(id)&&isFx(fx)))};
}
