/** Design-space LED optics; not a calibrated lighting or electrical model. */
export const DIFFUSERS=[{id:'none',label:'Sans diffuseur'},{id:'flat',label:'Opale plat · frontal'},{id:'tube',label:'Opale 3D · vue 360° simulée'}];
export const EMITTERS=[{id:'front',label:'1 face · directionnel +Z'},{id:'dual',label:'2 faces · avant/arrière ±Z'}];
export function optics(f){
 return {diffuser:['none','flat','tube'].includes(f?.diffuser)?f.diffuser:'none',
  emitterMode:f?.emitterMode==='dual'?'dual':'front',
  ledSizeMm:Number.isFinite(f?.ledSizeMm)?Math.max(2,Math.min(8,f.ledSizeMm)):5};
}
export function copyFixtures(fixtures,ids,makeId,offset=0.2,max=500){
 if(!Array.isArray(fixtures)||!Array.isArray(ids)||typeof makeId!=='function'||!Number.isFinite(offset)||offset<=0||offset>5)throw new RangeError('Invalid copy');
 const known=new Set(fixtures.map(f=>f.id)),result=[];
 for(const f of fixtures){
  if(!ids.includes(f.id)||result.length>=max)continue;
  const id=makeId();if(!id||known.has(id))throw new RangeError('Copy id collision');
  known.add(id);result.push({...f,id,name:String(f.name).slice(0,90)+' COPY',x:Math.min(1000,Math.max(-1000,f.x+offset)),
    y:Math.min(1000,Math.max(-1000,f.y+offset)),locked:false,visible:true});
 }
 return result;
}
