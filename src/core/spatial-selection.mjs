/** FLUXCUE original pure selection and group-transform model (no WebGL or I/O). */
export function chooseSelection(existing, clicked, order, {toggle=false,range=false,anchor=''}={}) {
  if (!order.includes(clicked)) return existing.filter(id=>order.includes(id));
  const clean=existing.filter((id,i)=>order.includes(id)&&existing.indexOf(id)===i);
  if (range && order.includes(anchor)) {
    const a=order.indexOf(anchor),b=order.indexOf(clicked);
    const ids=order.slice(Math.min(a,b),Math.max(a,b)+1);
    return toggle ? [...new Set([...clean,...ids])] : ids;
  }
  if (toggle){
    const next=clean.includes(clicked)?clean.filter(id=>id!==clicked):[...clean,clicked];
    return next.length?next:[clicked];
  }
  return [clicked];
}
export function editableFixtures(fixtures,ids){
  return fixtures.filter(f=>ids.includes(f.id)&&f.visible&&!f.locked);
}
export function selectionPivot(fixtures){
  if (!fixtures.length) return null;
  return {x:fixtures.reduce((s,f)=>s+f.x,0)/fixtures.length,
    y:fixtures.reduce((s,f)=>s+f.y,0)/fixtures.length,
    z:fixtures.reduce((s,f)=>s+f.z,0)/fixtures.length};
}
const round=value=>Math.round(value*1e6)/1e6;
export function transformGroup(fixtures,ids,pivot,translation,rotationDegrees=0){
  if (!pivot || ![pivot.x,pivot.y,pivot.z,translation.x,translation.y,translation.z,rotationDegrees].every(Number.isFinite))
    throw new RangeError('Invalid group transform');
  const radians=rotationDegrees*Math.PI/180,cos=Math.cos(radians),sin=Math.sin(radians);
  return fixtures.map(f=>{
    if(!ids.includes(f.id)||f.locked||!f.visible)return {...f};
    const x=f.x-pivot.x,y=f.y-pivot.y;
    const nx=pivot.x + x*cos-y*sin+translation.x;
    const ny=pivot.y + x*sin+y*cos+translation.y;
    const nz=f.z+translation.z;
    if (![nx,ny,nz].every(n=>Number.isFinite(n)&&Math.abs(n)<=1000))throw new RangeError('Group out of bounds');
    return {...f,x:round(nx),y:round(ny),z:round(nz),
      angle:((f.angle+rotationDegrees+180)%360+360)%360-180};
  });
}
export function scenePixelPosition(f,index){
  if (!f||![f.x,f.y,f.z,f.angle,f.length,f.pixels].every(Number.isFinite)||!Number.isInteger(index)||index<0||index>=f.pixels)
    throw new RangeError('Invalid spatial pixel');
  const t=f.pixels<=1?0:(index/(f.pixels-1)-0.5)*f.length;
  const radians=f.angle*Math.PI/180;
  return {x:f.x+Math.cos(radians)*t,y:f.y+Math.sin(radians)*t,z:f.z};
}
export function spatialWave(point,time,speed=0.35){
  if(![point.x,point.y,point.z,time,speed].every(Number.isFinite))throw new RangeError('Invalid spatial wave');
  return (1+Math.sin((point.x*.37+point.y*.19+point.z*.28)*Math.PI*2-time*speed*3))/2;
}
export function spatialBlocks(point,time,speed=0.35){
  if(![point.x,point.y,point.z,time,speed].every(Number.isFinite))throw new RangeError('Invalid spatial blocks');
  const n=Math.floor(point.x*2)+Math.floor(point.y*2)+Math.floor(point.z*2)+Math.floor(time*speed*3);
  return ((n%2)+2)%2;
}
