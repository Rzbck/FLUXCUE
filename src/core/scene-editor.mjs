/** Original FLUXCUE spatial editor helpers; no browser, controller or network dependency. */
export function snapPosition(value, step) {
  if (!Number.isFinite(value) || !Number.isFinite(step) || step < 0) throw new RangeError('Invalid position or snap');
  // Treat half-grid boundaries consistently despite binary float representations.
  const scaled=step===0?value:value/step;
  const rounded=step===0?value:Math.round(scaled+Math.sign(scaled)*Number.EPSILON*8)*step;
  return Math.round(rounded*1e6)/1e6;
}
export function snapAngle(degrees, step) {
  if (!Number.isFinite(degrees) || !Number.isFinite(step) || step<0)throw new RangeError('Invalid angle or snap');
  const angle=step===0?degrees:Math.round(degrees/step)*step;
  const normalized=((angle+180)%360+360)%360-180;
  return Math.round(normalized*1e6)/1e6;
}
export function editorTransform(fixture, position, rotationZRadians) {
  if (!fixture || !position || ![position.x,position.y,position.z,rotationZRadians].every(Number.isFinite)) {
    throw new RangeError('Invalid 3D transform');
  }
  if ([position.x,position.y,position.z].some(n=>Math.abs(n)>1000))throw new RangeError('Transform outside editor bounds');
  return {
    x:snapPosition(position.x,0),y:snapPosition(position.y,0),z:snapPosition(position.z,0),
    angle:snapAngle(rotationZRadians*180/Math.PI,0)
  };
}
export function duplicateFixture(source,id,step) {
  if (!source || typeof id!=='string' || !id || source.id===id)throw new RangeError('Invalid duplicate');
  return {...source,id,name:String(source.name).slice(0,90)+' COPY',x:snapPosition(source.x+(step || 0.5),step),locked:false,visible:true};
}
export function sameScene(a,b) {
  return JSON.stringify(a)===JSON.stringify(b);
}

/** Clamp transient number-field edits before they can poison rendering or patch calculations. */
export function sanitizeFixture(f) {
  const finite=(v,fallback,min,max)=>{
    const n=Number(v);
    return Number.isFinite(n)?Math.max(min,Math.min(max,n)):fallback;
  };
  return {...f,
    pixels:Math.round(finite(f.pixels,1,1,2000)),
    length:finite(f.length,2,0.1,100),
    x:finite(f.x,0,-1000,1000),
    y:finite(f.y,0,-1000,1000),
    z:finite(f.z,0,-1000,1000),
    angle:snapAngle(finite(f.angle,0,-360000,360000),0),
    group:typeof f.group==='string'&&f.group.trim()?f.group.trim().slice(0,40):'STAGE'
  };
}
