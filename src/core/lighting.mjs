/** Previsualisation budget: at most 8 representative lighting samples, not one GPU light per LED. */
export function lightSamples(fixtures,maxSources=8){
 if(!Number.isInteger(maxSources)||maxSources<0||maxSources>64||!Array.isArray(fixtures))throw new RangeError('Invalid light source budget');
 const out=[];
 for(const f of fixtures){
  if(!f?.visible||!Number.isFinite(f.length)||f.length<=0||!Number.isFinite(f.x)||!Number.isFinite(f.y)||!Number.isFinite(f.z))continue;
  const rad=(f.angle||0)*Math.PI/180;
  const dx=Math.cos(rad),dy=Math.sin(rad);
  const sides=f.emitterMode==='dual'||f.diffuser==='tube'?[1,-1]:[1];
  for(const along of [-.24,.24]){
   for(const side of sides){
    if(out.length>=maxSources)return out;
    out.push({id:f.id,side,x:f.x+dx*f.length*along,y:f.y+dy*f.length*along,z:f.z+side*.045,
      index:Math.max(0,Math.min(f.pixels-1,Math.round((along+.5)*(f.pixels-1)))),
      spread:f.diffuser==='tube'?1.25:f.diffuser==='flat'?.8:.55});
   }
  }
 }
 return out;
}
