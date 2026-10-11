/** Pure additive/replace layering. Cue lanes remain active until explicitly stopped. */
export function cueAppliesTo(cue,fixtureId){
 return !Array.isArray(cue.targetIds)||cue.targetIds.length===0||cue.targetIds.includes(fixtureId);
}
export function layerEnvelope(now,started,fade){
 if(![now,started,fade].every(Number.isFinite)||fade<0)throw new RangeError('Invalid cue envelope');
 if(fade===0)return now>=started?1:0;
 return Math.max(0,Math.min(1,(now-started)/fade));
}
export function composeRgb(base,layer,intensity,mode='ADD'){
 if(!Array.isArray(base)||!Array.isArray(layer)||base.length!==3||layer.length!==3||[...base,...layer,intensity].some(x=>!Number.isFinite(x)))throw new RangeError('Invalid layer RGB');
 const alpha=Math.max(0,Math.min(1,intensity));
 return base.map((v,i)=>{
   const a=Math.max(0,Math.min(1,v)),b=Math.max(0,Math.min(1,layer[i]));
   if(alpha===0 || (mode!=='REPLACE' && b===0))return a;
   if(mode==='REPLACE' && alpha===1)return b;
   const mixed=mode==='REPLACE'?a*(1-alpha)+b*alpha:1-(1-a)*(1-b*alpha);
   return mode==='REPLACE'?mixed:Math.max(a,Math.min(1,mixed));
 });
}
export function cueNextAt(start,hold){
 if(!Number.isFinite(start)||!Number.isFinite(hold)||hold<.1||hold>3600)throw new RangeError('Invalid cue hold');
 return start+hold;
}

/** Per-cue, per-fixture color lookup: no other fixture inherits an override. */
export function cueFixtureColor(layer,fixtureId){
 const custom=layer?.looks?.[fixtureId];
 return typeof custom==='string'&&/^#[0-9a-f]{6}$/i.test(custom)?custom:layer.color;
}
